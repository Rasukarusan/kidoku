import { useEffect, useState } from 'react'
import { toggleNoScrollBody } from '@/utils/element'
import { useSession } from 'next-auth/react'
import { useMutation, useQuery } from '@apollo/client'
import { aiSummariesQuery, deleteAiSummaryMutation } from '../../api'
import { migrateAnalysis } from './migrator'
/** バックエンドが生成失敗をストリーム本文で伝えるときのマーカー */
const AI_SUMMARY_ERROR_PREFIX = 'ERROR:'
import type { AiSummariesJson } from './types'

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

      let json = ''
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (!value) continue
        const text = decoder.decode(value)
        if (text === 'COMPLETE') {
          setLoading(false)
        } else if (text.startsWith(AI_SUMMARY_ERROR_PREFIX)) {
          setError(text.slice(AI_SUMMARY_ERROR_PREFIX.length))
        } else {
          json = json + text
          try {
            const newJson = JSON.parse(json + '"}')
            setJson(newJson)
          } catch (e) {
            //
          }
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
