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

@Injectable()
export class AskReadingChatUseCase {
  constructor(
    private readonly bookRepository: IBookRepository,
    private readonly aiChatGateway: IAiChatGateway,
  ) {}

  async execute(userId: string, question: string): Promise<string> {
    const normalizedQuestion = question.trim();
    if (
      !normalizedQuestion ||
      normalizedQuestion.length > MAX_QUESTION_LENGTH
    ) {
      throw new BadRequestException('質問は1〜500文字で入力してください');
    }

    // The small planner sees only the question. Its safe parameters are applied
    // by the database before any reading data reaches the answer model.
    const query = await this.planQuery(userId, normalizedQuestion);
    const books = await this.bookRepository.findForReadingChat(userId, query);
    const safeBooks = books.map((book) => ({
      ...book,
      ...(book.memo
        ? { memo: book.memo.replace(/\*.*?\*/g, '***').slice(0, 1200) }
        : {}),
    }));

    const prompt = `あなたは読書記録アプリKidokuのアシスタントです。以下は質問に合わせてデータベースで絞り込んだ利用者本人の読書記録です。記録に基づいて日本語で簡潔かつ親しみやすく答えてください。検索結果が0件の場合や記録にない事実は推測せず、その旨を伝えてください。返答は {"answer":"返答本文"} のJSONだけにしてください。\n\n質問: ${normalizedQuestion}\n\n適用した検索条件: ${JSON.stringify(query)}\n\n該当件数: ${safeBooks.length}\n\n読書記録: ${JSON.stringify(safeBooks)}`;
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
  ): Promise<ReadingChatBookQuery> {
    const today = new Date().toISOString().slice(0, 10);
    const prompt = `読書記録への質問をDB検索条件に変換してください。今日は${today}です。返すJSONは searchText(string|null), authors(string[]), categories(string[]), finishedFrom(YYYY-MM-DD|null), finishedTo(YYYY-MM-DD|null), finishedOnly(boolean), includeMemo(boolean), orderBy("recent"|"oldest"|"title"), limit(1〜100) だけです。メモ・感想の内容を尋ねる場合だけincludeMemo=trueにしてください。全体傾向・集計はフィルタなし、limit=100にしてください。質問: ${question}`;
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
