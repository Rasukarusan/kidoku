import { Container } from '@/components/layout/Container'
import Link from 'next/link'
import Lottie from 'lottie-react'
import Inchworm from '../lottie_inchworm.json'
import { MeiliSearch } from '@/components/input/MeiliSearch'

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

export const IndexPage = ({ users }) => {
  return (
    <Container className="p-6">
      <MeiliSearch />
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
