import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  IAiChatGateway,
  AiChatStreamChunk,
} from '../../domain/gateways/ai-chat';

@Injectable()
export class OpenAiChatGateway implements IAiChatGateway {
  // APIキー未設定でもアプリ全体の起動は通すため、クライアントは初回利用時に生成する
  private client: OpenAI | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): OpenAI {
    if (!this.client) {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not configured');
      }
      this.client = new OpenAI({ apiKey });
    }
    return this.client;
  }

  async *streamJsonCompletion(
    prompt: string,
  ): AsyncIterable<AiChatStreamChunk> {
    const response = await this.getClient().chat.completions.create({
      model: 'gpt-5.4-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      stream: true,
      stream_options: { include_usage: true },
    });

    for await (const chunk of response) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield { delta };
      }
      if (chunk.usage) {
        yield { totalTokens: chunk.usage.total_tokens };
      }
    }
  }
}
