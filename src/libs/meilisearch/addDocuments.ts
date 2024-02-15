import { DocumentOptions, EnqueuedTask } from 'meilisearch'
import client from '@/libs/meilisearch'

export const addDocuments = async (
  index: string,
  /* eslint-disable @typescript-eslint/no-explicit-any */
  documents: Record<string, any>[],
  options?: DocumentOptions
): Promise<EnqueuedTask> => {
  return await client.index(index).addDocuments(documents, options)
}
