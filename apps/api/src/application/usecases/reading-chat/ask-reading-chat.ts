import { BadRequestException, Injectable } from '@nestjs/common';
import { IAiChatGateway } from '../../../domain/gateways/ai-chat';
import {
  IBookRepository,
  ReadingChatBookQuery,
} from '../../../domain/repositories/book';

const MAX_QUESTION_LENGTH = 500;
const DEFAULT_LIMIT = 40;
const MAX_LIMIT = 100;

type QueryPlan = Record<
  | 'searchText'
  | 'authors'
  | 'categories'
  | 'finishedFrom'
  | 'finishedTo'
  | 'finishedOnly'
  | 'includeMemo'
  | 'orderBy'
  | 'limit',
  unknown
>;

export type ReadingChatPageContext = {
  type: 'book' | 'sheet' | 'report' | 'search' | 'other';
  label: string;
  path: string;
  bookId?: number;
  sheetName?: string;
  year?: number;
};

@Injectable()
export class AskReadingChatUseCase {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly aiChatGateway: IAiChatGateway,
  ) {}

  async execute(
    userId: string,
    question: string,
    pageContext?: ReadingChatPageContext,
  ): Promise<string> {
    const normalizedQuestion = question.trim();
    if (
      !normalizedQuestion ||
      normalizedQuestion.length > MAX_QUESTION_LENGTH
    ) {
      throw new BadRequestException('質問は1〜500文字で入力してください');
    }

    // The small planner sees only the question. Its safe parameters are applied
    // by the database before any reading data reaches the answer model.
    const context = this.normalizePageContext(pageContext);
    const query = await this.planQuery(userId, normalizedQuestion, context);
    const books = await this.bookRepository.findForReadingChat(userId, query);
    const pageBooks = context?.bookId
      ? await this.bookRepository.findForReadingChat(userId, {
          ids: [context.bookId],
          finishedOnly: false,
          includeMemo: true,
          orderBy: 'recent',
          limit: 1,
        })
      : [];
    const safeBooks = books
      .map((book) => this.sanitizeBook(book))
      .filter((book) => {
        if (!query.searchText || !query.includeMemo) return true;
        const needle = query.searchText.toLocaleLowerCase('ja');
        // Search only the already-redacted representation. A query matching
        // solely inside *hidden text* cannot affect which records reach the AI.
        return [book.title, book.author, book.category, book.memo ?? ''].some(
          (value) => value.toLocaleLowerCase('ja').includes(needle),
        );
      });

    const safePageBooks = pageBooks.map((book) => this.sanitizeBook(book));

    const prompt = `あなたは読書記録アプリKidokuのアシスタントです。利用者が現在開いているページの情報と、質問に合わせてDBで絞り込んだ本人の読書記録を使って回答してください。「この本」「このページ」などは現在のページを指します。記録にない事実は推測しないでください。返答は {"answer":"返答本文"} のJSONだけにしてください。\n\n質問: ${normalizedQuestion}\n\n現在のページ: ${JSON.stringify(context ?? null)}\n\n現在のページの本: ${JSON.stringify(safePageBooks)}\n\n適用した検索条件: ${JSON.stringify(query)}\n\n検索結果: ${JSON.stringify(safeBooks)}`;
    const result = await this.collectJson<{ answer?: unknown }>(
      userId,
      prompt,
      'answer',
    );
    if (typeof result.answer !== 'string' || !result.answer.trim()) {
      throw new Error('Reading chat returned an invalid response');
    }
    return result.answer.trim();
  }

  private async planQuery(
    userId: string,
    question: string,
    pageContext?: ReadingChatPageContext,
  ): Promise<ReadingChatBookQuery> {
    const today = new Date().toISOString().slice(0, 10);
    const prompt = `読書記録への質問をDB検索条件に変換してください。今日は${today}です。現在のページ情報も質問の文脈として使ってください。返すJSONは searchText(string|null), authors(string[]), categories(string[]), finishedFrom(YYYY-MM-DD|null), finishedTo(YYYY-MM-DD|null), finishedOnly(boolean), includeMemo(boolean), orderBy("recent"|"oldest"|"title"), limit(1〜100) だけです。メモ・感想の内容を尋ねる場合だけincludeMemo=trueにしてください。全体傾向・集計はフィルタなし、limit=100にしてください。現在のページ: ${JSON.stringify(pageContext ?? null)} 質問: ${question}`;
    try {
      return this.normalizePlan(
        await this.collectJson<QueryPlan>(userId, prompt, 'planning'),
      );
    } catch {
      // Planner outages never fall back to sending the complete library.
      return {
        finishedOnly: false,
        includeMemo: false,
        orderBy: 'recent',
        limit: DEFAULT_LIMIT,
      };
    }
  }

  private normalizePlan(plan: QueryPlan): ReadingChatBookQuery {
    const strings = (value: unknown) =>
      Array.isArray(value)
        ? value
            .filter((item): item is string => typeof item === 'string')
            .slice(0, 10)
        : undefined;
    const parseDate = (value: unknown) => {
      if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
        return undefined;
      const result = new Date(`${value}T00:00:00.000Z`);
      return Number.isNaN(result.getTime()) ? undefined : result;
    };
    const authors = strings(plan.authors);
    const categories = strings(plan.categories);
    const from = parseDate(plan.finishedFrom);
    const to = parseDate(plan.finishedTo);
    const requestedLimit =
      typeof plan.limit === 'number' && Number.isFinite(plan.limit)
        ? Math.floor(plan.limit)
        : DEFAULT_LIMIT;
    return {
      ...(typeof plan.searchText === 'string' && plan.searchText.trim()
        ? { searchText: plan.searchText.trim().slice(0, 120) }
        : {}),
      ...(authors?.length ? { authors } : {}),
      ...(categories?.length ? { categories } : {}),
      ...(from ? { finishedFrom: from } : {}),
      ...(to ? { finishedTo: new Date(to.getTime() + 86_399_999) } : {}),
      finishedOnly: plan.finishedOnly === true,
      includeMemo: plan.includeMemo === true,
      orderBy:
        plan.orderBy === 'oldest' || plan.orderBy === 'title'
          ? plan.orderBy
          : 'recent',
      limit: Math.min(MAX_LIMIT, Math.max(1, requestedLimit)),
    };
  }

  private normalizePageContext(
    context?: ReadingChatPageContext,
  ): ReadingChatPageContext | undefined {
    if (!context) return undefined;
    const validTypes: ReadingChatPageContext['type'][] = [
      'book',
      'sheet',
      'report',
      'search',
      'other',
    ];
    if (!validTypes.includes(context.type)) return undefined;
    return {
      type: context.type,
      label: String(context.label || '').slice(0, 80),
      path: String(context.path || '').slice(0, 200),
      ...(Number.isInteger(context.bookId) && context.bookId! > 0
        ? { bookId: context.bookId }
        : {}),
      ...(typeof context.sheetName === 'string'
        ? { sheetName: context.sheetName.slice(0, 120) }
        : {}),
      ...(Number.isInteger(context.year) ? { year: context.year } : {}),
    };
  }

  private sanitizeBook<T extends { memo?: string }>(book: T): T {
    if (!book.memo) return book;
    return {
      ...book,
      // [\s\S] also protects masked sections spanning multiple lines.
      memo: book.memo.replace(/\*[\s\S]*?\*/g, '***').slice(0, 1200),
    };
  }

  private async collectJson<T>(
    userId: string,
    prompt: string,
    purpose: 'answer' | 'planning',
  ): Promise<T> {
    let text = '';
    for await (const chunk of this.aiChatGateway.streamJsonCompletion(
      userId,
      prompt,
      { purpose, reasoningEffort: 'low' },
    )) {
      if (chunk.delta) text += chunk.delta;
    }
    return JSON.parse(text) as T;
  }
}
