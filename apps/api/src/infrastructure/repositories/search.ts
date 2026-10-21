import { Inject, Injectable } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import {
  ISearchRepository,
  BookSearchDocument,
  SearchResult,
  SearchHit,
} from '../../domain/repositories/search';

const INDEX_NAME = 'books';

@Injectable()
export class SearchRepository implements ISearchRepository {
  constructor(
    @Inject(INJECTION_TOKENS.MEILISEARCH)
    private readonly client: MeiliSearch,
  ) {}

  async addDocuments(documents: BookSearchDocument[]): Promise<void> {
    const index = this.client.index(INDEX_NAME);
    await index.addDocuments(documents);
  }

  async updateDocument(document: BookSearchDocument): Promise<void> {
    const index = this.client.index(INDEX_NAME);
    await index.addDocuments([document]);
  }

  async search(query: string, page = 1): Promise<SearchResult> {
    const index = this.client.index(INDEX_NAME);
    const response = await index.search(query, {
      attributesToHighlight: ['title', 'memo'],
      highlightPreTag: '<span class="highlight">',
      highlightPostTag: '</span>',
      attributesToCrop: ['title', 'memo'],
      cropLength: 15,
      page,
    });

    const hits: SearchHit[] = response.hits.map((hit) => {
      const formatted = hit._formatted as Record<string, string> | undefined;
      return {
        id: String(hit.id),
        title: formatted?.title || String(hit.title || ''),
        author: String(hit.author || ''),
        category: String(hit.category || ''),
        image: String(hit.image || ''),
        memo: this.maskMemo(formatted?.memo || String(hit.memo || '')),
        username: String(hit.username || ''),
        userImage: hit.userImage ? String(hit.userImage) : null,
        sheet: String(hit.sheet || ''),
      };
    });

    const totalHits = response.totalHits || 0;
    const hitsPerPage = response.hitsPerPage || 20;

    return {
      hits,
      totalHits,
      hitsPerPage,
      page,
      hasMore: totalHits / hitsPerPage > page,
    };
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const index = this.client.index(INDEX_NAME);
      const queued = await index.deleteDocument(id);
      const task = await this.client.waitForTask(queued.taskUid, {
        timeOutMs: 10000,
      });
      if (task.status === 'failed' && task.error?.code === 'index_not_found')
        return;
      if (task.status !== 'succeeded')
        throw new Error(
          '検索データを更新できませんでした。もう一度お試しください',
        );
    } catch (error) {
      // An absent index already satisfies deletion. Authentication, transport
      // and other failures must still prevent publishing stale private data.
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'index_not_found'
      )
        return;
      throw error;
    }
  }

  private maskMemo(memo: string): string {
    const pattern = /\[\[MASK:\s*(.*?)\]\]/g;
    const escapedPattern = /\\\[\\\[MASK:\s*(.*?)\\\]\\\]/g;
    return memo.replace(pattern, '*****').replace(escapedPattern, '*****');
  }
}
