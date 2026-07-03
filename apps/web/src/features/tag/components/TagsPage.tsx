import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useQuery } from '@apollo/client'
import { Container } from '@/components/layout/Container'
import { TagWithCount, TaggedBook, myTagsQuery, booksByTagQuery } from '../api'

// タグで横断する自分だけの本棚
export const TagsPage: React.FC = () => {
  const router = useRouter()
  const [selectedTag, setSelectedTag] = useState('')

  // URLの ?tag= を初期選択に反映
  useEffect(() => {
    const tag = router.query.tag
    if (typeof tag === 'string' && tag) {
      setSelectedTag(tag)
    }
  }, [router.query.tag])

  const { data: tagsData, loading: tagsLoading } = useQuery<{
    myTags: TagWithCount[]
  }>(myTagsQuery)
  const { data: booksData, loading: booksLoading } = useQuery<{
    booksByTag: TaggedBook[]
  }>(booksByTagQuery, {
    variables: { input: { tagName: selectedTag } },
    skip: !selectedTag,
  })

  const tags = tagsData?.myTags ?? []
  const books = booksData?.booksByTag ?? []

  const onSelect = (tag: string) => {
    setSelectedTag(tag)
    router.replace(
      { pathname: '/tags', query: tag ? { tag } : {} },
      undefined,
      { shallow: true }
    )
  }

  return (
    <Container className="px-4 py-8 sm:px-10 sm:py-10">
      <NextSeo title="タグ本棚 | kidoku" noindex />
      <h2 className="mb-2 text-2xl font-bold">タグ本棚</h2>
      <p className="mb-6 text-sm text-gray-500">
        タグでシートを跨いだ自分だけの本棚を作れます。タグは本の詳細画面からつけられます。あなただけに表示されます。
      </p>

      {tagsLoading && <p className="text-sm text-gray-400">読み込み中...</p>}

      {!tagsLoading && tags.length === 0 && (
        <p className="text-sm text-gray-400">
          まだタグがありません。本の詳細画面の「タグ」から追加できます。
        </p>
      )}

      <div className="mb-8 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onSelect(tag.name === selectedTag ? '' : tag.name)}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              tag.name === selectedTag
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-gray-700 hover:bg-slate-200'
            }`}
          >
            #{tag.name}
            <span className="ml-1 text-xs opacity-70">{tag.bookCount}</span>
          </button>
        ))}
      </div>

      {selectedTag && (
        <section>
          <h3 className="mb-4 text-sm font-bold text-gray-700">
            「#{selectedTag}」の本 {books.length > 0 && `（${books.length}冊）`}
          </h3>
          {booksLoading && (
            <p className="text-sm text-gray-400">読み込み中...</p>
          )}
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {books.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                className="text-center"
              >
                <img
                  className="mx-auto mb-2 h-32 w-24 rounded object-cover shadow-sm"
                  src={book.image}
                  alt={book.title}
                />
                <div className="line-clamp-2 text-xs text-gray-700">
                  {book.title}
                </div>
                <div className="mt-0.5 text-[10px] text-gray-400">
                  {book.sheetName}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Container>
  )
}
