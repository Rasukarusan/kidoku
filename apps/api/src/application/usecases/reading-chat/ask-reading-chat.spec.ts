import { IAiChatGateway } from '../../../domain/gateways/ai-chat';
import {
  IBookRepository,
  ReadingChatBookQuery,
} from '../../../domain/repositories/book';
import { AskReadingChatUseCase } from './ask-reading-chat';

describe('AskReadingChatUseCase', () => {
  const repository = {
    findForReadingChat: jest.fn(),
  } as unknown as jest.Mocked<IBookRepository>;

  beforeEach(() => jest.clearAllMocks());

  it('質問を軽量モデルで分解してからDB検索結果だけを回答モデルへ渡す', async () => {
    repository.findForReadingChat.mockResolvedValue([
      {
        title: '雪国',
        author: '川端康成',
        category: '文学',
        impression: '5',
        finished: new Date('2026-01-10'),
      },
    ]);
    const calls: Array<{ prompt: string; purpose?: string }> = [];
    const gateway = {
      async *streamJsonCompletion(
        _userId: string,
        prompt: string,
        options?: { purpose?: string },
      ) {
        await Promise.resolve();
        calls.push({ prompt, purpose: options?.purpose });
        yield {
          delta:
            options?.purpose === 'planning'
              ? '{"searchText":null,"authors":[],"categories":["文学"],"finishedFrom":"2026-01-01","finishedTo":"2026-01-31","finishedOnly":true,"includeMemo":false,"orderBy":"recent","limit":20}'
              : '{"answer":"1月に読んだ文学は『雪国』です。"}',
        };
      },
    } as IAiChatGateway;

    const result = await new AskReadingChatUseCase(repository, gateway).execute(
      'user-1',
      '1月に読んだ文学は？',
    );

    expect(result).toBe('1月に読んだ文学は『雪国』です。');
    expect(repository.findForReadingChat).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining<Partial<ReadingChatBookQuery>>({
        categories: ['文学'],
        finishedOnly: true,
        includeMemo: false,
        limit: 20,
      }),
    );
    expect(calls.map((call) => call.purpose)).toEqual(['planning', 'answer']);
    expect(calls[0].prompt).not.toContain('雪国');
    expect(calls[1].prompt).toContain('雪国');
  });

  it('質問分解に失敗しても全件やメモを送らない', async () => {
    repository.findForReadingChat.mockResolvedValue([]);
    const gateway = {
      async *streamJsonCompletion(
        _userId: string,
        _prompt: string,
        options?: { purpose?: string },
      ) {
        await Promise.resolve();
        yield {
          delta:
            options?.purpose === 'planning'
              ? 'invalid json'
              : '{"answer":"該当する記録はありません。"}',
        };
      },
    } as IAiChatGateway;

    await new AskReadingChatUseCase(repository, gateway).execute(
      'user-1',
      'おすすめは？',
    );

    expect(repository.findForReadingChat).toHaveBeenCalledWith('user-1', {
      finishedOnly: false,
      includeMemo: false,
      orderBy: 'recent',
      limit: 40,
    });
  });

  it('本のページではその本を本人のDBから取得して回答モデルへ渡す', async () => {
    repository.findForReadingChat
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          title: '雪国',
          author: '川端康成',
          category: '文学',
          impression: '5',
          finished: null,
          memo: '再読したい',
        },
      ]);
    const prompts: string[] = [];
    const gateway = {
      async *streamJsonCompletion(
        _userId: string,
        prompt: string,
        options?: { purpose?: string },
      ) {
        await Promise.resolve();
        prompts.push(prompt);
        yield {
          delta:
            options?.purpose === 'planning'
              ? '{"searchText":null,"authors":[],"categories":[],"finishedFrom":null,"finishedTo":null,"finishedOnly":false,"includeMemo":false,"orderBy":"recent","limit":20}'
              : '{"answer":"この本は『雪国』です。"}',
        };
      },
    } as IAiChatGateway;

    await new AskReadingChatUseCase(repository, gateway).execute(
      'user-1',
      'この本について教えて',
      { type: 'book', label: '雪国', path: '/books/42', bookId: 42 },
    );

    expect(repository.findForReadingChat).toHaveBeenNthCalledWith(2, 'user-1', {
      ids: [42],
      finishedOnly: false,
      includeMemo: true,
      orderBy: 'recent',
      limit: 1,
    });
    expect(prompts[0]).toContain('"label":"雪国"');
    expect(prompts[1]).toContain('再読したい');
  });

  it('マスキング部分だけに一致する本を回答モデルへ渡さない', async () => {
    repository.findForReadingChat.mockResolvedValue([
      {
        title: '非公開部分だけに一致',
        author: '',
        category: '文学',
        impression: '3',
        finished: null,
        memo: '公開文\n*秘密の\nキーワード*',
      },
      {
        title: '公開部分に一致',
        author: '',
        category: '文学',
        impression: '4',
        finished: null,
        memo: '秘密のキーワードについての公開メモ',
      },
    ]);
    const prompts: string[] = [];
    const gateway = {
      async *streamJsonCompletion(
        _userId: string,
        prompt: string,
        options?: { purpose?: string },
      ) {
        await Promise.resolve();
        prompts.push(prompt);
        yield {
          delta:
            options?.purpose === 'planning'
              ? '{"searchText":"秘密のキーワード","authors":[],"categories":[],"finishedFrom":null,"finishedTo":null,"finishedOnly":false,"includeMemo":true,"orderBy":"recent","limit":40}'
              : '{"answer":"公開メモが1件あります。"}',
        };
      },
    } as IAiChatGateway;

    await new AskReadingChatUseCase(repository, gateway).execute(
      'user-1',
      '秘密のキーワードについて書いた本は？',
    );

    expect(prompts[1]).not.toContain('非公開部分だけに一致');
    expect(prompts[1]).not.toContain('秘密の\nキーワード');
    expect(prompts[1]).toContain('公開部分に一致');
  });

  it('感想の長さを比較するときは全候補の本文を取得する', async () => {
    repository.findForReadingChat.mockResolvedValue([
      {
        title: '長い感想の本',
        author: '',
        category: '',
        impression: '5',
        finished: null,
        memo: 'とても長い感想本文',
      },
    ]);
    const prompts: string[] = [];
    const gateway = {
      async *streamJsonCompletion(
        _userId: string,
        prompt: string,
        options?: { purpose?: string },
      ) {
        await Promise.resolve();
        prompts.push(prompt);
        yield {
          delta:
            options?.purpose === 'planning'
              ? '{"searchText":"感想","authors":[],"categories":[],"finishedFrom":null,"finishedTo":null,"finishedOnly":true,"includeMemo":false,"orderBy":"recent","limit":1}'
              : '{"answer":"『長い感想の本』です。"}',
        };
      },
    } as IAiChatGateway;

    const answer = await new AskReadingChatUseCase(repository, gateway).execute(
      'user-1',
      '今までで一番感想が長い本は？',
    );

    expect(answer).toBe('『長い感想の本』です。');
    expect(repository.findForReadingChat).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        searchText: undefined,
        includeMemo: true,
        limit: 100,
      }),
    );
    expect(prompts[1]).toContain('とても長い感想本文');
  });
});
