import { useQuery } from '@apollo/client'
import { AiSummaries } from '@/features/sheet/components/AiSummaries'
import { aiSummariesQuery } from '@/features/sheet/api/queries'
import { migrateAnalysis } from '@/features/sheet/components/AiSummaries/migrator'
import type { Book } from '@/types/book'
import { Item } from './types'

/** Adapter for the existing reading analysis while storage and targeting use items/logs. */
export function ReadingAnalysis({
  items,
  username,
  collectionName,
}: {
  items: Item[]
  username: string
  collectionName: string
}) {
  const { data, error } = useQuery(aiSummariesQuery, {
    variables: { sheetName: collectionName },
    fetchPolicy: 'no-cache',
  })
  const books: Book[] = items
    .filter((item) => item.itemTypeId === 'book')
    .map((item) => ({
      id: item.id,
      userId: item.userId,
      title: item.title,
      author:
        (item.attributes.authors as string[] | undefined)?.join('、') ?? '',
      category: item.category,
      image: item.imageUrl,
      impression: item.rating,
      memo: item.memo,
      isPublicMemo: item.isPublicMemo,
      isPurchasable: item.isPurchasable,
      month: '1月',
      finished:
        item.logs.find((log) => log.kind === 'read' && log.occurredAt)
          ?.occurredAt ?? null,
    }))
  if (!books.length) return null
  const summaries = (data?.aiSummaries ?? []).map((summary) => ({
    id: summary.id,
    ...migrateAnalysis(
      typeof summary.analysis === 'string'
        ? JSON.parse(summary.analysis)
        : summary.analysis
    ),
  }))
  return (
    <section className="mt-12 rounded-xl border bg-white p-5">
      <h2 className="mb-4 text-xl font-bold">本の読書分析</h2>
      <p className="mb-4 text-sm text-gray-500">
        このコレクションの本の読了履歴を分析します。
      </p>
      {error ? (
        <p role="alert">分析結果を取得できませんでした。</p>
      ) : (
        <AiSummaries
          aiSummaries={summaries}
          username={username}
          bookCount={books.length}
          sheet={collectionName}
          isMine
          books={books}
        />
      )}
    </section>
  )
}
