import { ConfigService } from '@nestjs/config';
import { MeiliSearch } from 'meilisearch';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';

const createMeiliSearchClient = (configService: ConfigService): MeiliSearch => {
  const host =
    configService.get<string>('MEILI_HOST') || 'http://localhost:7700';
  const apiKey = configService.get<string>('MEILI_MASTER_KEY') || '';

  return new MeiliSearch({
    host,
    apiKey,
  });
};

export const MeiliSearchProvider = {
  provide: INJECTION_TOKENS.MEILISEARCH,
  useFactory: createMeiliSearchClient,
  inject: [ConfigService],
};
