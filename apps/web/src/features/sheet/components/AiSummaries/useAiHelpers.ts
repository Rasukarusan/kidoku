import { useEffect, useState } from 'react'
import { toggleNoScrollBody } from '@/utils/element'
import { useSession } from 'next-auth/react'
import { useMutation } from '@apollo/client'
import { deleteAiSummaryMutation } from '../../api'
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

  useEffect(() => {
    if (!isMine) return

    const controller = new AbortController()
    const fetchSummaries = async () => {
      try {
        const response = await fetch(
          `/api/ai-summary?sheetName=${encodeURIComponent(sheet)}`,
          { signal: controller.signal }
        )
        if (!response.ok) return
        const { summaries } = await response.json()
        if (!controller.signal.aborted) {
          setSummaries(summaries)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('AI分析結果の取得に失敗しました', error)
        }
      }
    }

    fetchSummaries()
    return () => controller.abort()
  }, [isMine, sheet])

  const generateSummary = async (sheetName, months, categories) => {
    if (loading || !session) return
    toggleNoScrollBody(false)
    setLoading(true)
    setJson(null)
    try {
      const userId = session.user.id

      const response = await fetch(`/api/ai-summary`, {
        method: 'POST',
        body: JSON.stringify({ sheetName, months, categories, userId }),
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
