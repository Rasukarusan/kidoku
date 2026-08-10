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
});
