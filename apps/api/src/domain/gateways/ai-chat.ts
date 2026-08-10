export type AiChatStreamChunk = {
  /** 生成テキストの増分 */
  delta?: string;
  /** ストリーム完了時に判明する総トークン数 */
  totalTokens?: number;
};

export type AiChatOptions = {
  /** Planning uses a smaller configurable model instead of the answer model. */
  purpose?: 'answer' | 'planning';
  reasoningEffort?: 'low' | 'medium' | 'high';
};

/**
 * LLMチャット補完のゲートウェイ。
 * 生成はユーザー自身が接続したLLMアカウントで行うため、対象ユーザーを受け取る。
 * JSON形式の応答をストリーミングで返す。
 */
export abstract class IAiChatGateway {
  abstract streamJsonCompletion(
    userId: string,
    prompt: string,
    options?: AiChatOptions,
  ): AsyncIterable<AiChatStreamChunk>;
}
