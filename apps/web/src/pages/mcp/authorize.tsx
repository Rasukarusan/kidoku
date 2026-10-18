import type { GetServerSideProps } from 'next'
import type { NextPageWithLayout } from '@/types/page'
import { getServerSession } from 'next-auth/next'
import { signIn, signOut } from 'next-auth/react'
import { Check, Plug } from 'lucide-react'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { Logo } from '@/components/icon/Logo'
import { SignInWithGoogleButton } from '@/components/button/SignInWithGoogleButton'
import {
  createConsent,
  OAuthError,
  validateAuthorization,
} from '@/libs/mcp/oauth'

type Account = {
  name: string | null
  email: string | null
  image: string | null
}

type Props = {
  clientName?: string
  consent?: string
  account?: Account
  redirectOrigin?: string
  callbackUrl?: string
  error?: string
}

const permissions = [
  {
    title: '読書記録の一覧・検索',
    detail: 'タイトル・著者・メモで検索した結果',
  },
  {
    title: '読書記録の詳細',
    detail: '非公開を含むメモ全文・感想・読了日',
  },
]

const ConnectionIcons: React.FC = () => (
  <div className="mb-6 flex items-center justify-center gap-3">
    <Logo className="h-14 w-14" />
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full bg-gray-300" />
      ))}
    </div>
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-600">
      <Plug className="h-7 w-7" />
    </div>
  </div>
)

const AccountCard: React.FC<{ account: Account }> = ({ account }) => (
  <div className="mb-6 flex items-center gap-3 rounded-xl border border-gray-200 p-4">
    {account.image ? (
      <img
        src={account.image}
        alt=""
        referrerPolicy="no-referrer"
        className="h-10 w-10 rounded-full"
      />
    ) : (
      <div className="h-10 w-10 rounded-full bg-gray-200" />
    )}
    <div className="min-w-0">
      <div className="truncate font-bold text-gray-800">{account.name}</div>
      <div className="truncate text-sm text-gray-500">{account.email}</div>
    </div>
  </div>
)

const McpAuthorize: NextPageWithLayout<Props> = ({
  clientName,
  consent,
  account,
  redirectOrigin,
  callbackUrl,
  error,
}) => {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12 text-gray-800">
      <ConnectionIcons />
      {error ? (
        <>
          <h1 className="mb-6 text-center text-xl font-bold">
            接続を確認できませんでした
          </h1>
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        </>
      ) : callbackUrl ? (
        <>
          <h1 className="mb-2 text-center text-xl font-bold">Kidoku に接続</h1>
          <p className="mb-8 text-center text-sm text-gray-500">
            接続を確認するため、Google でログインしてください。
          </p>
          <SignInWithGoogleButton
            className="mx-auto"
            onClick={() => signIn('google', { callbackUrl })}
          />
        </>
      ) : (
        <>
          <h1 className="mb-6 text-center text-xl font-bold">
            <span className="block break-all text-gray-500">{clientName}</span>
            に読み取りを許可しますか？
          </h1>
          {account && <AccountCard account={account} />}
          <p className="mb-3 text-sm font-bold">
            次のデータへのアクセスを求めています
          </p>
          <div className="mb-6 rounded-xl border border-gray-200">
            <ul className="space-y-3 p-4">
              {permissions.map((permission) => (
                <li key={permission.title} className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  <div>
                    <div className="text-sm font-bold">{permission.title}</div>
                    <div className="text-sm text-gray-500">
                      {permission.detail}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <p className="border-t border-gray-200 p-4 text-xs leading-relaxed text-gray-500">
              本の追加・変更・削除はできません。接続は「設定 → MCP
              接続」からいつでも解除できます。
            </p>
          </div>
          <form
            method="post"
            action="/api/mcp/oauth/authorize"
            className="mb-6 grid grid-cols-2 gap-3"
          >
            <input type="hidden" name="consent" value={consent} />
            <button
              name="decision"
              value="deny"
              className="rounded-lg border border-gray-300 py-3 font-bold text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              name="decision"
              value="allow"
              className="rounded-lg bg-gray-800 py-3 font-bold text-white hover:bg-gray-700"
            >
              許可する
            </button>
          </form>
          <p className="mb-4 text-center text-xs text-gray-500">
            許可すると次の URL に戻ります
            <br />
            <span className="font-bold text-gray-700">{redirectOrigin}</span>
          </p>
          <p className="text-center text-sm text-gray-500">
            別のアカウントで接続しますか？{' '}
            <button
              className="font-bold text-gray-800 underline"
              onClick={() => signOut({ callbackUrl: window.location.href })}
            >
              アカウントを切り替える
            </button>
          </p>
        </>
      )}
    </main>
  )
}

// The consent screen stands alone so the decision is not mixed with app navigation.
McpAuthorize.getLayout = (page) => page

export default McpAuthorize

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
    const redirectOrigin = new URL(authorization.redirectUri).origin
    // form-action also applies to the redirect after submit, so allow the registered callback origin.
    res.setHeader(
      'Content-Security-Policy',
      `frame-ancestors 'none'; form-action 'self' ${redirectOrigin}`
    )
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.id) return { props: { callbackUrl: resolvedUrl } }
    return {
      props: {
        clientName,
        consent: createConsent(session.user.id, authorization),
        account: {
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          image: session.user.image ?? null,
        },
        redirectOrigin,
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
