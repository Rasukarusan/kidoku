import { Container } from '@/components/layout/Container'
import Link from 'next/link'
import Lottie from 'lottie-react'
import Inchworm from '../lottie_inchworm.json'
import { truncate } from '@/utils/string'
import dayjs from 'dayjs'

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

interface CommentProps {
  comment: {
    title: string
    text: string
    updated: string
    user: {
      name: string
      image: string
    }
  }
}
export const Comment: React.FC<CommentProps> = ({ comment }) => {
  comment.title = '7つの習慣'
  comment.text = `[期待]
          ずっと読まないとなと思っていた。要約や動画の知識でこれからも語っていくのは限界が来ていた。
          まこなり社長の3大読んだほうがいい本の最後の本。
          [感想]
          2023年ベスト1本になりそう。以下は5％ルールのために書いた第一章分。`
  comment.updated =
    dayjs().diff(dayjs().subtract(2, 'day'), 'day', false) + '日前'
  const { text, user } = comment
  return (
    <div className="flex max-w-[400px] items-center p-4">
      <div>
        <img
          className="mb-1 w-[82px] min-w-[82px] pr-4"
          src="https://ne0h3gml3ggcpadq.public.blob.vercel-storage.com/23-LglOJLt5MmX7aOjxdhj3SmBPORucjC.webp"
          alt=""
        />
        <div className="text-sm text-gray-700">{comment.title}</div>
      </div>
      <div>
        <div className="mb-2 text-sm font-bold text-gray-600">
          {truncate(comment.text, 120)}
        </div>
        <div className="flex items-center">
          <img className="mr-2 h-8 w-8 rounded-full" src={user.image} alt="" />
          <div>
            <Link
              className="text-sm text-gray-500 hover:underline"
              href={`/${user.name}/sheets`}
            >
              {user.name}
            </Link>
            <div className="text-sm text-gray-500">{comment.updated}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const IndexPage = ({ users }) => {
  return (
    <Container className="p-6">
      <section>
        <h2 className="p-2 text-2xl font-bold">Comments</h2>
        <div className="flex">
          {/* <Comment */}
          {/* comment={{ */}
          {/* user: { */}
          {/* name: 'Rasukarusan', */}
          {/* image: */}
          {/* 'https://lh3.googleusercontent.com/a/ACg8ocJT-LCACb3glXijA-jQa27gYGIy3yRnsSo1TenXA833urs=s96-c', */}
          {/* }, */}
          {/* }} */}
          {/* /> */}
        </div>
      </section>
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
