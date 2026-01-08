import React, { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { Virtuoso } from 'react-virtuoso'
import { Container } from '@/components/layout/Container'
import { BookComment, Comment } from '@/components/layout/BookComment'
import { GET_COMMENTS } from '../api'
import { NextSeo } from 'next-seo'

interface CommentsData {
  comments: {
    comments: Comment[]
    hasMore: boolean
    total: number
  }
}

interface CommentsVariables {
  input: {
    limit: number
    offset: number
  }
}

const ITEMS_PER_PAGE = 20

export const InfiniteCommentsPage: React.FC = () => {
  const [allComments, setAllComments] = useState<Comment[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const { loading, error, fetchMore } = useQuery<
    CommentsData,
    CommentsVariables
  >(GET_COMMENTS, {
    variables: {
      input: {
        limit: ITEMS_PER_PAGE,
        offset: 0,
      },
    },
    onCompleted: (data) => {
      setAllComments(data.comments.comments)
      setHasMore(data.comments.hasMore)
    },
    onError: (error) => {
      console.error('コメント取得エラー:', error)
    },
  })

  const loadMoreComments = useCallback(async () => {
    if (isLoadingMore || !hasMore) return

    setIsLoadingMore(true)

    try {
      const result = await fetchMore({
        variables: {
          input: {
            limit: ITEMS_PER_PAGE,
            offset: allComments.length,
          },
        },
      })

      if (result.data) {
        const newComments = result.data.comments.comments
        setAllComments((prev) => [...prev, ...newComments])
        setHasMore(result.data.comments.hasMore)
      }
    } catch (error) {
      console.error('追加コメント取得エラー:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [allComments.length, hasMore, isLoadingMore, fetchMore])

  const endReached = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadMoreComments()
    }
  }, [hasMore, isLoadingMore, loadMoreComments])

  // 2列表示のため、2つずつグループ化
  const groupedComments = useMemo(() => {
    const groups: Comment[][] = []
    for (let i = 0; i < allComments.length; i += 2) {
      groups.push(allComments.slice(i, i + 2))
    }
    return groups
  }, [allComments])

  const itemRenderer = useCallback(
    (index: number) => {
      const commentGroup = groupedComments[index]
      if (!commentGroup) return <div>Loading...</div>

      return (
        <div className="grid grid-cols-1 gap-4 p-2 sm:grid-cols-2">
          {commentGroup.map((comment) => (
            <BookComment key={comment.id} comment={comment} />
          ))}
        </div>
      )
    },
    [groupedComments]
  )

  const components = useMemo(
    () => ({
      Footer: () => {
        if (isLoadingMore) {
          return (
            <div className="flex justify-center py-4">
              <div className="text-gray-500">読み込み中...</div>
            </div>
          )
        }
        if (!hasMore && allComments.length > 0) {
          return (
            <div className="flex justify-center py-4">
              <div className="text-gray-500">
                すべてのコメントを読み込みました
              </div>
            </div>
          )
        }
        return null
      },
    }),
    [isLoadingMore, hasMore, allComments.length]
  )

  if (loading && allComments.length === 0) {
    return (
      <Container className="p-6">
        <NextSeo title="コメント一覧 | kidoku" />
        <h2 className="p-2 text-2xl font-bold">Comments</h2>
        <div className="flex justify-center py-8">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="p-6">
        <NextSeo title="コメント一覧 | kidoku" />
        <h2 className="p-2 text-2xl font-bold">Comments</h2>
        <div className="flex justify-center py-8">
          <div className="text-red-500">
            コメントの読み込みに失敗しました: {error.message}
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="p-6">
      <NextSeo title="コメント一覧 | kidoku" />
      <h2 className="p-2 text-2xl font-bold">Comments</h2>
      <div className="h-[calc(100vh-200px)]">
        <Virtuoso
          data={groupedComments}
          endReached={endReached}
          itemContent={itemRenderer}
          components={components}
          overscan={5}
        />
      </div>
    </Container>
  )
}
