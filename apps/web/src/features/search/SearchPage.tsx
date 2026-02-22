import Link from 'next/link'
import { useRouter } from 'next/router'
import { Container } from '@/components/layout/Container'
import { SkeltonView } from './SkeltonView'
import { gql, useQuery } from '@apollo/client'
import { mask } from '@/utils/string'

const SEARCH_BOOKS_QUERY = gql`
  query SearchBooks($input: SearchBooksInput!) {
    searchBooks(input: $input) {
      hits {
        id
        title
        author
        image
        memo
        username
        userImage
        sheet
      }
      hasMore
    }
  }
`

export const SearchPage: React.FC = () => {
  const router = useRouter()
  const { q } = router.query
  const page = Number(router.query.page as string) || 1
  const { data: queryData } = useQuery(SEARCH_BOOKS_QUERY, {
    variables: { input: { query: q as string, page } },
    skip: !q,
    fetchPolicy: 'no-cache',
  })
  const data = queryData?.searchBooks
    ? {
        hits: queryData.searchBooks.hits.map(
          (hit: {
            id: string
            title: string
            author: string
            image: string
            memo: string
            username: string
            userImage: string | null
            sheet: string
          }) => ({
            ...hit,
            memo: mask(hit.memo),
          })
        ),
        next: queryData.searchBooks.hasMore,
      }
    : undefined
  if (!q) return null
  return (
    <Container>
      <div className="py-2 text-2xl sm:py-4">
        「<span className="font-bold">{q}</span>」の検索結果
      </div>
      {!data && <SkeltonView />}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data &&
          data.hits.map((v) => {
            const { id, title, memo, image, username, userImage, sheet } = v
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
                    className="mb-2 text-xs text-gray-400 sm:text-sm"
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
      <div className="mb-4 text-center">
        {page > 1 && (
          <Link
            href={`/search?q=${q}&page=${page - 1}`}
            className="pr-4 text-gray-400 hover:text-gray-700"
          >
            ← {page - 1} ページへ
          </Link>
        )}
        {data?.next && (
          <Link
            href={`/search?q=${q}&page=${page + 1}`}
            className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 shadow-md hover:bg-gray-200"
          >
            次のページへ →
          </Link>
        )}
      </div>
    </Container>
  )
}
