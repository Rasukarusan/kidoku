import useSWR from 'swr'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Container } from '@/components/layout/Container'
import { fetcher } from '@/libs/swr'

export const SearchPage: React.FC = () => {
  const router = useRouter()
  const { q } = router.query
  const { data } = useSWR(`/api/search/shelf?q=${q}`, fetcher)
  if (!q) return null
  return (
    <Container>
      <div className="text-2xl">
        「<span className="font-bold">{q}</span>」の検索結果
      </div>
      {!data && <div>loading...</div>}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data &&
          data.map((v) => {
            const { id, title, memo, image, username, userImage, sheet } = v
            console.log(id)
            return (
              <div className="flex items-center p-4" key={id}>
                <div className="pr-4 text-center">
                  <Link href={`/${username}/sheets/${sheet}?book=${id}`}>
                    <img
                      className="mb-1 w-[82px] min-w-[82px]"
                      src={image}
                      alt=""
                    />
                  </Link>
                </div>
                <div>
                  <Link href={`/${username}/sheets/${sheet}?book=${id}`}>
                    <div
                      className="mb-2 text-sm font-bold text-gray-600 sm:text-base"
                      dangerouslySetInnerHTML={{ __html: title }}
                    ></div>
                  </Link>
                  <div
                    className="mb-2 text-xs font-bold text-gray-600 sm:text-sm"
                    dangerouslySetInnerHTML={{ __html: memo }}
                  ></div>
                  <div className="flex items-center text-xs text-gray-500 sm:text-sm ">
                    <img
                      className="mr-2 h-8 w-8 rounded-full"
                      src={userImage}
                      alt=""
                    />
                    <Link
                      className="hover:underline"
                      href={`/${username}/sheets/${sheet}`}
                    >
                      {username}
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    </Container>
  )
}
