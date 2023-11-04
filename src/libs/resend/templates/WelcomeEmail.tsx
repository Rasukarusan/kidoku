import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Tailwind,
  Text,
  Link,
  Img,
} from '@react-email/components'
import * as React from 'react'

interface Props {
  email?: string
}

export const WelcomeEmail = ({ email = 'example@exmaple.com' }: Props) => {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="my-auto mx-auto bg-white font-sans">
          <Container className="my-[40px] rounded border border-solid border-[#eaeaea] p-[20px]">
            <Img
              src="https://app.rasukarusan.com/logo.png"
              width="66"
              alt="Kidoku"
              style={{ margin: 'auto' }}
            />
            <Heading className="my-[30px] mx-0 p-0 text-center text-[24px] font-normal text-black">
              ようこそKidokuへ！
            </Heading>
            <Text className="">
              こんにちわ！読書の新しい章を「kidoku」と共に開始いただき、嬉しく思います！
            </Text>
            <Text className="">
              「kidoku」では、単なる読書記録以上の体験をご提供いたします。私たちのサービスを通じて、あなたの読書ライフが豊かで充実したものに変わる瞬間を、一緒に楽しみましょう。
            </Text>
            <Text className="font-bold">あなたの感想を大切に:</Text>
            <Text className="">
              本を読み終えた後の感動や考えを、感想として残すことで、その瞬間瞬間をより深く味わうことができます。
            </Text>
            <Text className="font-bold">思考を整理、共有:</Text>
            <Text className="">
              読書中に浮かんだアイデアや気づきをメモとして記録し、それを公開して共有することで、新たな交流や発見が生まれるかもしれません。
            </Text>
            <Text className="font-bold">手軽に記録、整理:</Text>
            <Text className="">
              本のタイトルを入力するだけで簡単に本棚に追加し、あなたの読書履歴を手軽に整理できます。
            </Text>
            <Text className="font-bold">コミュニティと繋がる:</Text>
            <Text className="">
              他の読書愛好者の本棚をのぞいたり、感想をチェックすることで、新しい本と出会う機会が広がります。
              あなたの<Link href="/account/settings">プロフィールを設定</Link>
              し、あなただけの読書空間を作成してみましょう。
            </Text>
            <Text className="">
              ご質問やお困りのことがあれば、いつでも サポートチーム までお気軽に
              <Link href="/account/settings">お問い合わせ</Link>ください。
            </Text>
            <Text className="">
              読書という素晴らしい旅を、一緒に楽しんでいきましょう。
              <br />
              「kidoku」チームより
            </Text>
            <Hr className="my-[26px] mx-0 w-full border border-solid border-[#eaeaea]" />
            <Text className="text-gray-400">
              ※ このメッセージは {email} に送られました。
              <br />
              登録されていない方は、このメールを無視してください。
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default WelcomeEmail
