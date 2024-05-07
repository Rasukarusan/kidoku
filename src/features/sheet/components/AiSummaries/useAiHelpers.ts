import { useEffect, useState } from 'react'
import { toggleNoScrollBody } from '@/utils/element'
import { useSession } from 'next-auth/react'

const useAiHelpers = (sheet, aiSummaries) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [json, setJson] = useState(null)
  const [error, setError] = useState(null)
  const [summaryIndex, setSummaryIndex] = useState(0)
  const { data: session } = useSession()
  const [messages, setMessages] = useState('')

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
    try {
      const userId = session.user.id

      const response = await fetch(`/api/ai-summary`, {
        method: 'POST',
        body: JSON.stringify({ sheetName, months, categories, userId }),
      })
      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      // eslint-disable-next-line
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (!value) continue
        const text = decoder.decode(value)
        // console.log(text)
        if (text === 'COMPLETE') {
          setLoading(false)
        } else {
          setMessages((prev) => prev + text)
          try {
            setJson(JSON.parse(text))
          } catch (e) {
            //
          }
        }
      }
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
    messages,
  }
}

export default useAiHelpers
