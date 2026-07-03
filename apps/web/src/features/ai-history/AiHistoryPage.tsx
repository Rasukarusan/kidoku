import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { NextSeo } from 'next-seo'
import { Container } from '@/components/layout/Container'
import { migrateAnalysis } from '@/features/sheet/components/AiSummaries/migrator'
import {
  AI_SUMMARY_FIELDS,
  AiSummaryFieldKey,
} from '@/features/sheet/components/AiSummaries/fields'
import type { AiSummariesJson } from '@/features/sheet/components/AiSummaries/types'

interface HistoryEntry {
  id: number
  sheetId: number
  sheetName: string
  sheetOrder: number
  analysis: Record<string, unknown>
  created: string | null
}

interface YearAnalysis {
  sheetId: number
  sheetName: string
  sheetOrder: number
  json: AiSummariesJson
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('failed')
    return res.json()
  })

const FIELD_KEYS = Object.keys(AI_SUMMARY_FIELDS) as AiSummaryFieldKey[]

// 自分のAI分析を年(シート)を跨いで見返す・くらべるページ
export const AiHistoryPage: React.FC = () => {
  const { data, isLoading } = useSWR<{ summaries: HistoryEntry[] }>(
    '/api/me/ai-summary-history',
    fetcher
  )

  // シートごとに最新の分析を採用し、シート順に並べる
  const yearAnalyses: YearAnalysis[] = useMemo(() => {
    const bySheet = new Map<number, HistoryEntry>()
    for (const entry of data?.summaries ?? []) {
      bySheet.set(entry.sheetId, entry) // created昇順なので後勝ち=最新
    }
    return Array.from(bySheet.values())
      .sort((a, b) => a.sheetOrder - b.sheetOrder)
      .map((entry) => ({
        sheetId: entry.sheetId,
        sheetName: entry.sheetName,
        sheetOrder: entry.sheetOrder,
        json: migrateAnalysis(entry.analysis),
      }))
  }, [data])

  const [leftId, setLeftId] = useState<number | null>(null)
  const [rightId, setRightId] = useState<number | null>(null)

  const left =
    yearAnalyses.find((y) => y.sheetId === leftId) ??
    yearAnalyses[yearAnalyses.length - 2]
  const right =
    yearAnalyses.find((y) => y.sheetId === rightId) ??
    yearAnalyses[yearAnalyses.length - 1]

  return (
    <Container className="px-4 py-8 sm:px-10 sm:py-10">
      <NextSeo title="AI分析の歩み | kidoku" noindex />
      <h2 className="mb-2 text-2xl font-bold">AI分析の歩み</h2>
      <p className="mb-8 text-sm text-gray-500">
        年(シート)ごとのAI読書分析を振り返り、読書人生の変化をたどれます。あなただけに表示されます。
      </p>

      {isLoading && <p className="text-sm text-gray-400">読み込み中...</p>}

      {!isLoading && yearAnalyses.length === 0 && (
        <p className="text-sm text-gray-400">
          まだAI分析がありません。本棚ページでAI分析を実行すると、ここに履歴が積み上がっていきます。
        </p>
      )}

      {/* 年表: 一言でいうとこんな人 の変遷 */}
      {yearAnalyses.length > 0 && (
        <section className="mb-10">
          <h3 className="mb-4 text-sm font-bold text-gray-700">
            「一言でいうとこんな人」の変遷
          </h3>
          <div className="space-y-2">
            {yearAnalyses.map((year) => (
              <div
                key={year.sheetId}
                className="flex items-baseline gap-4 rounded-lg border border-slate-200 bg-white px-5 py-3"
              >
                <span className="w-16 shrink-0 text-sm font-bold text-gray-500">
                  {year.sheetName}
                </span>
                <span className="text-sm font-bold text-gray-800">
                  {year.json.character_summary || '—'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2年比較 */}
      {yearAnalyses.length >= 2 && left && right && (
        <section>
          <h3 className="mb-4 text-sm font-bold text-gray-700">
            2つの年をくらべる
          </h3>
          <div className="mb-4 grid grid-cols-2 gap-4">
            {[
              { value: left, set: setLeftId },
              { value: right, set: setRightId },
            ].map(({ value, set }, i) => (
              <select
                key={i}
                value={value.sheetId}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
                onChange={(e) => set(Number(e.target.value))}
              >
                {yearAnalyses.map((year) => (
                  <option key={year.sheetId} value={year.sheetId}>
                    {year.sheetName}
                  </option>
                ))}
              </select>
            ))}
          </div>
          <div className="space-y-4">
            {FIELD_KEYS.map((key) => (
              <div key={key}>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {AI_SUMMARY_FIELDS[key].title}
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[left, right].map((year, i) => (
                    <div
                      key={`${year.sheetId}-${i}`}
                      className="rounded-lg bg-ai-summary px-5 py-4"
                    >
                      <div className="mb-1 text-xs font-bold text-gray-400">
                        {year.sheetName}
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
                        {(year.json[key] as string) || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </Container>
  )
}
