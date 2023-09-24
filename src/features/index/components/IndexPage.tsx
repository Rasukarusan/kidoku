import { Container } from '@/components/layout/Container'
import Link from 'next/link'

interface Props {
  users: { name: string; image: string }[]
}
export const IndexPage = ({ users }) => {
  return (
    <Container className="p-6">
      {users.map((user, i) => (
        <Link
          key={user.name}
          href={`/${user.name}/sheets`}
          className="m-10 flex"
        >
          <div className="mr-4">
            <img
              src={user.image}
              alt=""
              className="rounded-full w-[100px] h-[100px] mb-2"
            />
            <div className="font-bold text-center">{user.name}</div>
          </div>
          <div className="p-4">
            <div className="font-bold mb-2">
              累計：
              <span className={`${i === 0 ? 'text-red-600' : 'text-gray-700'}`}>
                366
              </span>
              冊
            </div>
            <div className="font-bold mb-2">
              カテゴリ：ビジネス35%、哲学30%、技術20%
            </div>
            <div className="font-bold mb-2">年間平均読書数：46冊</div>
          </div>
        </Link>
      ))}
    </Container>
  )
}
