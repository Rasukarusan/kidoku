import { Container } from '@/components/layout/Container'
import Link from 'next/link'
import Lottie from 'lottie-react'
import Inchworm from '../lottie_inchworm.json'

import { InstantSearch, SearchBox, Hits, Highlight } from 'react-instantsearch'
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'

const searchClient = instantMeiliSearch(
  process.env.NEXT_PUBLIC_HOST + '/api/meilisearch',
  'hoge'
)

interface Props {
  users: {
    name: string
    image: string
    books: { total: number; categories: { name: string; percent: number }[] }
    url: string
  }[]
}

export const Row = ({ label, value }) => {
  return (
    <tr className="border">
      <td className="w-1/4 border bg-gray-100 p-2">{label}</td>
      <td className="border p-2">{value}</td>
    </tr>
  )
}

const Hit = ({ hit }) => {
  console.log(hit)
  return (
    <div key={hit.id} className="m-4 flex items-center border p-4">
      <Link
        href={`/${hit.user}/sheets/${hit.sheet}`}
        className="mr-4 min-w-[50px] text-center"
      >
        <img className="" src={hit.image} width="50" />
      </Link>
      <div>
        <Link href={`/${hit.user}/sheets/${hit.sheet}`}>
          <Highlight attribute="title" hit={hit} className="mb-1" />
        </Link>
        <div className="mb-1 text-xs">{hit.author}</div>
        <Highlight attribute="memo" hit={hit} className="mb-1 text-xs" />
      </div>
    </div>
  )
}

export const IndexPage = ({ users }) => {
  return (
    <Container className="p-6">
      <InstantSearch indexName="books" searchClient={searchClient}>
        <SearchBox className="border" />
        <Hits hitComponent={Hit} />
      </InstantSearch>
      <div className="sm:flex sm:items-start">
        <div>
          {users.map((user, i) => (
            <div key={user.name} className="sm:flex sm:items-center">
              <Link href={user.url} className="m-4 flex justify-center sm:m-10">
                <div className="mr-4 hover:underline hover:brightness-90">
                  <img
                    src={user.image}
                    alt=""
                    className="mb-2 h-[100px] w-[100px] rounded-full"
                  />
                  <div className="text-center font-bold">{user.name}</div>
                </div>
              </Link>
              <table className="mb-4 w-96 border">
                <tbody>
                  <Row label="Total" value={`${user.books.total}冊`} />
                  <Row
                    label="Category"
                    value={
                      user.books.categories.length === 0
                        ? '-'
                        : user.books.categories.map((category) => (
                            <div key={`${category.name}-${category.percent}`}>
                              {`${category.name}: ${category.percent}% `}
                            </div>
                          ))
                    }
                  />
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <Lottie animationData={Inchworm} />
      </div>
    </Container>
  )
}
