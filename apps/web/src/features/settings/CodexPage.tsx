import Link from 'next/link'
import { NextSeo } from 'next-seo'
import { Container } from '@/components/layout/Container'
import { CodexConnectPanel } from '@/features/codex/CodexConnectPanel'

/**
 * AI分析で使うChatGPTアカウントの接続ページ。
 * 分析は各ユーザー自身のChatGPTのプラン枠で実行される。
 */
export const CodexPage: React.FC = () => {
  return (
    <Container className="px-4 py-8 sm:px-10 sm:py-10">
      <NextSeo title="ChatGPT連携 | kidoku" />
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">ChatGPT連携</h2>
        <Link
          href="/settings/profile"
          className="text-sm text-blue-500 hover:underline"
        >
          設定に戻る
        </Link>
      </div>
      <p className="mb-6 text-sm text-gray-500">
        自分のChatGPTアカウントを接続すると、AI読書分析をそのプラン枠で実行できます。トークンは暗号化して保存され、あなたの分析にのみ使われます。
      </p>
      <CodexConnectPanel />
    </Container>
  )
}
