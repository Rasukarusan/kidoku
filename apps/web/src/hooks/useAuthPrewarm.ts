import { useEffect } from 'react'

/**
 * 認証APIをプリウォームするフック
 * アプリ起動時にバックグラウンドで認証エンドポイントをpingして
 * コールドスタートを防ぐ
 */
export const useAuthPrewarm = () => {
  useEffect(() => {
    // アプリ起動時にセッションエンドポイントをプリウォーム
    const prewarmAuth = async () => {
      try {
        // セッションエンドポイントに軽量リクエストを送信
        await fetch('/api/auth/session', {
          method: 'HEAD', // HEADリクエストで軽量化
          credentials: 'include'
        })
      } catch {
        // エラーは無視（プリウォームは補助的な機能）
      }
    }

    // ページ表示後にプリウォーム実行
    const timer = setTimeout(prewarmAuth, 100)

    // 定期的にキープアライブ
    const keepAlive = setInterval(prewarmAuth, 5 * 60 * 1000) // 5分ごと

    return () => {
      clearTimeout(timer)
      clearInterval(keepAlive)
    }
  }, [])
}