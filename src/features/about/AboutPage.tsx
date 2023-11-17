import { Container } from '@/components/layout/Container'
import { NextSeo } from 'next-seo'
import { Logo } from '@/components/icon/Logo'

const Row = ({ title, description }) => {
  return (
    <div className="py-4 text-center">
      <div className="mb-2 text-2xl font-bold">{title}</div>
      <div className="px-4 text-gray-500 sm:px-48">{description}</div>
    </div>
  )
}

export const AboutPage: React.FC = () => {
  return (
    <Container>
      <NextSeo title="kidokuについて | kidoku" />
      <div className="p-4 text-center">
        <Logo className="mx-auto h-10 w-10 text-gray-700" />
        <h2 className="p-4 text-[24px] font-normal text-black">
          ようこそkidokuへ！
        </h2>
        <div>
          「kidoku」では、単なる読書記録以上の体験を。あなたの読書ライフが豊かで充実したものに変わる瞬間を。
        </div>
      </div>
      <div className="py-10">
        <Row
          title="あなたの感想を大切に"
          description="本を読み終えた後の感動や考えを、感想として残すことで、その瞬間瞬間をより深く味わうことができます。"
        />
        <Row
          title="思考を整理、共有"
          description="読書中に浮かんだアイデアや気づきをメモとして記録し、それを公開して共有することで、新たな交流や発見が生まれるかもしれません。"
        />
        <Row
          title="手軽に記録、整理"
          description="本のタイトルを入力するだけで簡単に本棚に追加し、あなたの読書履歴を手軽に整理できます。"
        />
        <Row
          title="コミュニティと繋がる"
          description="他の読書愛好者の本棚をのぞいたり、感想をチェックすることで、新しい本と出会う機会が広がります。
            あなたのプロフィールを設定し、あなただけの読書空間を作成してみましょう。
            "
        />
      </div>
    </Container>
  )
}
