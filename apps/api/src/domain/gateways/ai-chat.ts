export type AiChatStreamChunk = {
  /** 生成テキストの増分 */
  delta?: string;
  /** ストリーム完了時に判明する総トークン数 */
  totalTokens?: number;
};

/**
 * LLMチャット補完のゲートウェイ。
 * JSON形式の応答をストリーミングで返す。
 */
export abstract class IAiChatGateway {
  abstract streamJsonCompletion(
    prompt: string,
  ): AsyncIterable<AiChatStreamChunk>;
}
