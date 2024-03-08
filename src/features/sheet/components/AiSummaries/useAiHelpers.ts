import { useEffect, useState } from 'react'
import { toggleNoScrollBody } from '@/utils/element'

const useAiHelpers = (sheet, aiSummaries) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [json, setJson] = useState(null)
  const [error, setError] = useState(null)
  const [summaryIndex, setSummaryIndex] = useState(0)

  useEffect(() => {
    setSummaryIndex(0)
  }, [sheet])

  useEffect(() => {
    setJson(aiSummaries[summaryIndex])
  }, [sheet, summaryIndex])

  const generateSummary = async (sheetName, isTotal) => {
    if (loading) return
    toggleNoScrollBody(false)
    setLoading(true)
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        body: JSON.stringify({ sheetName, isTotal }),
      }).then((res) => res.json())
      setLoading(false)
      if (!res.result) {
        setError('AI分析に失敗しました')
        return
      }
      setJson(res.data)
    } catch (error) {
      setError('通信中にエラーが発生しました')
    }
  }

  return {
    generateSummary,
    loading,
    setLoading,
    error,
    json,
    setJson,
    open,
    setOpen,
    summaryIndex,
    setSummaryIndex,
  }
}

export default useAiHelpers
