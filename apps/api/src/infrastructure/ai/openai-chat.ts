import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  IAiChatGateway,
  AiChatStreamChunk,
} from '../../domain/gateways/ai-chat';

@Injectable()
export class OpenAiChatGateway implements IAiChatGateway {
  private readonly client: OpenAI;

  constructor(configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async *streamJsonCompletion(
    prompt: string,
  ): AsyncIterable<AiChatStreamChunk> {
    const response = await this.client.chat.completions.create({
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
