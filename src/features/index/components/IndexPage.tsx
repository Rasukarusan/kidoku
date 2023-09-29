import { Container } from '@/components/layout/Container'
import Link from 'next/link'
import Lottie from 'lottie-react'
import Inchworm from '../lottie_inchworm.json'
import Inchworm2 from '../lottie_inchworm2.json'
import { useState } from 'react'

interface Props {
  users: {
    name: string
    image: string
    books: { total: number; categories: { name: string; percent: number }[] }
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
export const IndexPage = ({ users }) => {
  const [hover, setHover] = useState(false)
  return (
    <Container className="p-6">
      <div className="sm:flex sm:items-start">
        <div>
          {users.map((user, i) => (
            <div key={user.name} className="sm:flex sm:items-center">
              <Link
                href={`/${user.name}/sheets`}
                className="m-4 sm:m-10 flex justify-center"
              >
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
        <div
          onMouseEnter={() => {
            setHover(true)
          }}
          onMouseLeave={() => {
            setHover(false)
          }}
        >
          <Lottie
            animationData={Inchworm}
            style={{ display: hover ? 'none' : 'block', cursor: 'pointer' }}
          />
          <Lottie
            animationData={Inchworm2}
            style={{ display: hover ? 'block' : 'none', cursor: 'pointer' }}
          />
        </div>
      </div>
    </Container>
  )
}
