import { Container } from '@/components/layout/Container'
import Link from 'next/link'
import Lottie from 'lottie-react'
import Inchworm from '../lottie_inchworm.json'

import { InstantSearch, SearchBox, Hits, Highlight } from 'react-instantsearch'
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'

const searchClient = instantMeiliSearch(
  'http://localhost:7700',
  'YourMasterKey'
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
      <td className="border w-1/4 p-2 bg-gray-100">{label}</td>
      <td className="border p-2">{value}</td>
    </tr>
  )
}

const Hit = ({ hit }) => {
  console.log(hit)
  return (
    <div className="flex items-center border m-4 p-4">
      <img className="mr-4" src={hit.image} width="50" />
      <div>
        <Highlight attribute="title" hit={hit} className="mb-1" />
        <div className="text-xs mb-1">{hit.author}</div>
        <div className="text-xs mb-1">{hit.memo}</div>
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
              <Link href={user.url} className="m-4 sm:m-10 flex justify-center">
                <div className="mr-4 hover:brightness-90 hover:underline">
                  <img
                    src={user.image}
                    alt=""
                    className="rounded-full w-[100px] h-[100px] mb-2"
                  />
                  <div className="font-bold text-center">{user.name}</div>
                </div>
              </Link>
              <table className="border w-96 mb-4">
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
