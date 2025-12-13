import { useEffect, useState } from 'react'
import { toggleNoScrollBody } from '@/utils/element'
import { useSession } from 'next-auth/react'

const useAiHelpers = (sheet, aiSummaries) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [json, setJson] = useState(null)
  const [error, setError] = useState(null)
  const [summaryIndex, setSummaryIndex] = useState(0)
  const { data: session } = useSession()

  useEffect(() => {
    setSummaryIndex(0)
  }, [sheet])

  useEffect(() => {
    setJson(aiSummaries[summaryIndex])
  }, [sheet, summaryIndex])

  const generateSummary = async (sheetName, months, categories) => {
    if (loading || !session) return
    toggleNoScrollBody(false)
    setLoading(true)
    setJson(null)
    try {
      const userId = session.user.id

      const response = await fetch(`/api/ai-summary/exec`, {
        method: 'POST',
        body: JSON.stringify({ sheetName, months, categories, userId }),
      })
      const reader = response.body?.getReader()
      if (!reader) return

      let json = ''
      const decoder = new TextDecoder()
      // eslint-disable-next-line
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

  const deleteSummary = async (sheetName: string) => {
    if (deleting || !session) return
    setDeleting(true)
    setError(null)
    try {
      const userId = session.user.id
      const response = await fetch(`/api/ai-summary/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sheetName, userId }),
      })
      const data = await response.json()
      if (data.result) {
        setJson(null)
        setSummaryIndex(0)
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
  }
}

export default useAiHelpers
