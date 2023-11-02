import { Logo } from '@/components/icon/Logo'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

interface ColumnProps {
  title: string
  items: {
    title: string
    href: string
    target: string
  }[]
}
const Column: React.FC<ColumnProps> = ({ title, items }) => {
  return (
    <div>
      <h2 className="tuppercase mb-6 text-sm font-semibold text-white">
        {title}
      </h2>
      <ul className="font-medium text-gray-500 dark:text-gray-400">
        {items.map((item) => (
          <li key={item.title} className="mb-4">
            <a
              href={item.href}
              className="hover:underline"
              target={item.target}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export const Footer: React.FC = () => {
  const { data: session } = useSession()
  const router = useRouter()
  if (router.asPath.startsWith('/auth/init')) {
    return null
  }
  return (
    <footer className="bg-[#263238]">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <a href="/" className="flex items-center">
              <Logo className="mr-2 w-8 text-white" />
              <span className="self-center whitespace-nowrap text-2xl font-semibold text-white">
                Kidoku
              </span>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3 sm:gap-6">
            <Column
              title="About"
              items={[
                { title: 'Kidokuについて', href: '#', target: '_self' },
                { title: '運営会社', href: '#', target: '_self' },
              ]}
            />
            <Column
              title="Links"
              items={[
                {
                  title: 'Github',
                  href: 'https://github.com/Rasukarusan/kidoku',
                  target: '_blank',
                },
                {
                  title: 'Twitter',
                  href: 'https://twitter.com/rasukarusan2',
                  target: '_blank',
                },
              ]}
            />
            <Column
              title="Legal"
              items={[
                {
                  title: 'プライバシーポリシー',
                  href: '/privacy',
                  target: '_self',
                },
                {
                  title: '利用規約',
                  href: '/terms',
                  target: '_self',
                },
                {
                  title: 'お問い合わせ',
                  href: '/support',
                  target: '_self',
                },
                {
                  title: '特商法表記',
                  href: '/law',
                  target: '_self',
                },
              ]}
            />
            {session && session.user.admin && (
              <Column
                title="Admin"
                items={[
                  {
                    title: 'シート',
                    href: 'https://docs.google.com/spreadsheets/d/1AgAMtzU1xFYfV5OueYkA6MDSNIgjVOHG39CRdKYcVFA/edit#gid=932576471',
                    target: '_blank',
                  },
                  {
                    title: 'Vercel',
                    href: 'https://vercel.com/rasukarusan/kidoku',
                    target: '_blank',
                  },
                  {
                    title: 'Fly.io',
                    href: 'https://fly.io/apps/kidoku-search',
                    target: '_blank',
                  },
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
