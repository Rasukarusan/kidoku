import Link from 'next/link'
import { InstantSearch, SearchBox, Hits, Highlight } from 'react-instantsearch'
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch'

const searchClient = instantMeiliSearch(
  process.env.NEXT_PUBLIC_HOST + '/api/meilisearch',
  'hoge'
)

const Hit = ({ hit }) => {
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

export const MeiliSearch: React.FC = () => {
  return (
    <InstantSearch indexName="books" searchClient={searchClient}>
      <SearchBox className="border" />
      <Hits hitComponent={Hit} />
    </InstantSearch>
  )
}
