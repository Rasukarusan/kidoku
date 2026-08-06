import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import {
  AiChatStreamChunk,
  IAiChatGateway,
} from '../../../domain/gateways/ai-chat';
import { JsonObjectStream } from '../../../shared/ai/json-object-stream';
import { CodexAccessTokenProvider } from './codex-access-token.provider';
import { DEFAULT_MODEL, ORIGINATOR, RESPONSES_URL, USER_AGENT } from './config';

/**
 * Responses APIはresponse_formatを受け付けないため、指示文でJSONのみの出力を要求する。
 * 前後に混ざった説明文はJsonObjectStreamで除去する。
 */
const JSON_INSTRUCTIONS =
  'あなたはJSONのみを返すAPIです。前置き・後書き・マークダウンのコードフェンスを一切付けず、単一のJSONオブジェクトだけを出力してください。';

type ResponsesEvent = {
  type?: string;
  delta?: string;
  response?: { usage?: { total_tokens?: number } };
};

/**
 * ChatGPTサブスクリプションのCodexバックエンド（Responses API）でJSON生成を行うゲートウェイ。
 * 課金はChatGPTのプラン枠から消費される。
 */
@Injectable()
export class CodexChatGateway implements IAiChatGateway {
  constructor(
    private readonly configService: ConfigService,
    private readonly accessTokenProvider: CodexAccessTokenProvider,
  ) {}

  async *streamJsonCompletion(
    userId: string,
    prompt: string,
  ): AsyncIterable<AiChatStreamChunk> {
    const auth = await this.accessTokenProvider.get(userId);
    const model =
      this.configService.get<string>('CODEX_MODEL') ?? DEFAULT_MODEL;

    const response = await fetch(RESPONSES_URL, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'chatgpt-account-id': auth.accountId ?? '',
        'content-type': 'application/json',
        accept: 'text/event-stream',
        'openai-beta': 'responses=experimental',
        originator: ORIGINATOR,
        session_id: randomUUID(),
        'user-agent': USER_AGENT,
      },
      body: JSON.stringify({
        model,
        instructions: JSON_INSTRUCTIONS,
        input: [
          {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text: prompt }],
          },
        ],
        tools: [],
        tool_choice: 'auto',
        parallel_tool_calls: false,
        reasoning: { effort: 'low', summary: 'auto' },
        store: false,
        stream: true,
        include: ['reasoning.encrypted_content'],
        prompt_cache_key: randomUUID(),
      }),
    });

    if (!response.ok || !response.body) {
      const body = await response.text().catch(() => '');
      throw new Error(`Codex backend error (${response.status}): ${body}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const json = new JsonObjectStream();
    let buffer = '';

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSEはイベント単位（空行区切り）で届くため、末尾の未完成分は次回に回す
      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';
      for (const event of events) {
        const chunk = this.parseEvent(event, json);
        if (chunk) yield chunk;
      }
    }
  }

  private parseEvent(
    event: string,
    json: JsonObjectStream,
  ): AiChatStreamChunk | null {
    const line = event.split('\n').find((l) => l.startsWith('data:'));
    if (!line) return null;
    const data = line.slice('data:'.length).trim();
    if (!data || data === '[DONE]') return null;

    let parsed: ResponsesEvent;
    try {
      parsed = JSON.parse(data) as ResponsesEvent;
    } catch {
      // JSONでない行は無視する
      return null;
    }

    if (parsed.type === 'response.output_text.delta' && parsed.delta) {
      const delta = json.push(parsed.delta);
      return delta ? { delta } : null;
    }
    if (parsed.type === 'response.completed') {
      const totalTokens = parsed.response?.usage?.total_tokens;
      return totalTokens ? { totalTokens } : null;
    }
    return null;
  }
}
