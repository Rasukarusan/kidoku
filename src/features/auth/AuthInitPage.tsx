import { Container } from '@/components/layout/Container'
import { BuiltInProviderType } from 'next-auth/providers'
import { ClientSafeProvider, LiteralUnion, useSession } from 'next-auth/react'
import { NextSeo } from 'next-seo'

interface Props {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  >
}

export const AuthInitPage: React.FC<Props> = ({ providers }) => {
  const onClick = async () => {
    const body = {}
    const res = await fetch(`/api/auth/init`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Accept: 'application/json',
      },
    }).then((res) => res.json())
    console.log(res)
    location.href = '/'
  }
  return (
    <Container>
      <NextSeo title="Welcome! | Kidoku" />
      <div className="p-4 text-center">
        <h2 className="mb-8 text-3xl font-bold">Welcome</h2>
        <img
          src="/welcome_header.png"
          alt=""
          width="400"
          className="mx-auto mb-8 rounded-lg"
        />
        <button
          className="rounded-md bg-blue-600 px-4 py-2 font-bold text-white"
          onClick={onClick}
        >
          confirm
        </button>
      </div>
    </Container>
  )
}
