export type AiChatStreamChunk = {
  /** 生成テキストの増分 */
  delta?: string;
  /** ストリーム完了時に判明する総トークン数 */
  totalTokens?: number;
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
  ): AsyncIterable<AiChatStreamChunk>;
}
