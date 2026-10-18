import type { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { signIn } from 'next-auth/react'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import {
  createConsent,
  OAuthError,
  validateAuthorization,
} from '@/libs/mcp/oauth'

type Props = {
  clientName?: string
  consent?: string
  callbackUrl?: string
  error?: string
}

export default function McpAuthorize({
  clientName,
  consent,
  callbackUrl,
  error,
}: Props) {
  return (
    <main className="mx-auto max-w-lg px-6 py-12">
      <h1 className="mb-6 text-2xl font-bold">Kidoku への接続</h1>
      {error ? (
        <p role="alert">{error}</p>
      ) : callbackUrl ? (
        <>
          <p className="mb-6">
            読書記録への接続を確認するため、Google でログインしてください。
          </p>
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white"
            onClick={() => signIn('google', { callbackUrl })}
          >
            Google でログイン
          </button>
        </>
      ) : (
        <>
          <p className="mb-4">
            <strong>{clientName}</strong>{' '}
            に、自分の読書記録とメモの読み取りを許可しますか？
          </p>
          <p className="mb-6">
            非公開のメモも含まれます。本の追加・変更・削除はできません。接続は設定からいつでも解除できます。
          </p>
          <form
            method="post"
            action="/api/mcp/oauth/authorize"
            className="flex gap-4"
          >
            <input type="hidden" name="consent" value={consent} />
            <button
              name="decision"
              value="deny"
              className="rounded border px-4 py-2"
            >
              キャンセル
            </button>
            <button
              name="decision"
              value="allow"
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              読み取りを許可
            </button>
          </form>
        </>
      )}
    </main>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
  resolvedUrl,
}) => {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors 'none'; form-action 'self'"
  )
  try {
    const params = new URL(resolvedUrl, 'http://localhost').searchParams
    const { clientName, authorization } = await validateAuthorization(params)
    // form-action also applies to the redirect after submit, so allow the registered callback origin.
    res.setHeader(
      'Content-Security-Policy',
      `frame-ancestors 'none'; form-action 'self' ${new URL(authorization.redirectUri).origin}`
    )
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) return { props: { callbackUrl: resolvedUrl } }
    return {
      props: {
        clientName,
        consent: createConsent(session.user.id, authorization),
      },
    }
  } catch (error) {
    res.statusCode = error instanceof OAuthError ? error.status : 500
    return {
      props: {
        error:
          error instanceof OAuthError
            ? error.message
            : '接続を確認できませんでした。もう一度お試しください。',
      },
    }
  }
}
