import { useEffect, useState } from 'react'
import { toggleNoScrollBody } from '@/utils/element'
import { useSession } from 'next-auth/react'
import { useMutation, useQuery } from '@apollo/client'
import { aiSummariesQuery, deleteAiSummaryMutation } from '../../api'
import { migrateAnalysis } from './migrator'
import type { AiSummariesJson } from './types'

// バックエンドがストリーム本文に混ぜて送る制御メッセージ。
// apps/api/src/presentation/controllers/ai-summary.ts と同期を保つこと。
const AI_SUMMARY_CONTROL_SEPARATOR = '\u0000'
const AI_SUMMARY_COMPLETE = 'COMPLETE'
const AI_SUMMARY_ERROR_PREFIX = 'ERROR:'

/**
 * 生成中の途中までのJSONと、完成したJSONの両方を読めるようにする。
 * プロキシがストリームをまとめて返す環境では全文が一度に届くため、
 * 途中までのJSONを補完する方法だけでは解釈できない。
 */
const parseAnalysis = (text: string): Record<string, string> | null => {
  if (!text) return null
  // 完成したJSON → 文字列の途中で切れたJSON の順に試す
  for (const candidate of [text, `${text}"}`]) {
    try {
      const parsed = JSON.parse(candidate)
      if (parsed && typeof parsed === 'object') return parsed
    } catch {
      // 次の候補を試す
    }
  }
  return null
}

const useAiHelpers = (
  sheet: string,
  aiSummaries: AiSummariesJson[],
  isMine: boolean
) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [json, setJson] = useState(null)
  const [summaries, setSummaries] = useState(aiSummaries)
  const [error, setError] = useState(null)
  const [summaryIndex, setSummaryIndex] = useState(0)
  const { data: session } = useSession()
  const [deleteAiSummary] = useMutation(deleteAiSummaryMutation)

  useEffect(() => {
    setSummaryIndex(0)
  }, [sheet])

  useEffect(() => {
    setSummaries(aiSummaries)
  }, [aiSummaries])

  useEffect(() => {
    setJson(summaries[summaryIndex] ?? null)
  }, [summaries, summaryIndex])

  const { data: aiSummariesData, error: aiSummariesError } = useQuery(
    aiSummariesQuery,
    {
      variables: { sheetName: sheet },
      skip: !isMine,
      fetchPolicy: 'cache-and-network',
    }
  )

  useEffect(() => {
    if (aiSummariesError) {
      console.error('AI分析結果の取得に失敗しました', aiSummariesError)
      return
    }
    if (!aiSummariesData?.aiSummaries) return
    setSummaries(
      aiSummariesData.aiSummaries.map(({ id, analysis }) => ({
        id,
        ...migrateAnalysis(
          typeof analysis === 'string' ? JSON.parse(analysis) : analysis
        ),
      }))
    )
  }, [aiSummariesData, aiSummariesError])

  const generateSummary = async (sheetName, months, categories) => {
    if (loading || !session) return
    toggleNoScrollBody(false)
    setLoading(true)
    setJson(null)
    try {
      const response = await fetch(`/api/ai-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetName, months, categories }),
      })
      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let received = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (!value) continue
        // マルチバイト文字がチャンク境界で切れても壊れないようstreamで復号する
        received += decoder.decode(value, { stream: true })

        // 制御メッセージは本文の後ろに区切り文字付きで届く
        const [body, ...control] = received.split(AI_SUMMARY_CONTROL_SEPARATOR)
        const controlMessage = control.join('')

        if (controlMessage.startsWith(AI_SUMMARY_ERROR_PREFIX)) {
          setError(controlMessage.slice(AI_SUMMARY_ERROR_PREFIX.length))
          return
        }
        const analysis = parseAnalysis(body)
        if (analysis) setJson(analysis)
        if (controlMessage.startsWith(AI_SUMMARY_COMPLETE)) {
          setLoading(false)
        }
      }
    } catch (error) {
      setError('通信中にエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const deleteSummary = async (id: number) => {
    if (deleting || !session) return
    setDeleting(true)
    setError(null)
    try {
      const { data } = await deleteAiSummary({
        variables: { input: { id } },
      })
      if (data?.deleteAiSummary) {
        // 削除したアイテムをリストから除外
        const newSummaries = summaries.filter((s) => s.id !== id)
        setSummaries(newSummaries)
        if (newSummaries.length === 0) {
          setJson(null)
        } else {
          const newIndex = Math.min(summaryIndex, newSummaries.length - 1)
          setSummaryIndex(newIndex)
          setJson(newSummaries[newIndex])
        }
      } else {
        setError('削除に失敗しました')
      }
    } catch (error) {
      setError('通信中にエラーが発生しました')
    } finally {
      setDeleting(false)
    }
  }

  return {
    generateSummary,
    deleteSummary,
    loading,
    deleting,
    setLoading,
    error,
    json,
    setJson,
    open,
    setOpen,
    summaryIndex,
    setSummaryIndex,
    summaries,
  }
}

export default useAiHelpers
