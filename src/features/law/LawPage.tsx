import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { SUPPORT_URL } from '@/libs/constants'
import { NextSeo } from 'next-seo'

const Title = ({ text }) => {
  return <h3 className="mb-2 text-xl font-bold">{text}</h3>
}

const Text = ({ children }) => {
  return <div className="mb-6 text-sm">{children}</div>
}

export const LawPage: React.FC = () => {
  return (
    <Container>
      <NextSeo title="特定商取引法に基づく表記 | Kidoku" />
      <div className="p-4">
        <h2 className="mb-4 text-center text-2xl font-bold">
          特定商取引法に基づく表記
        </h2>
        <hr className="mb-4" />
        <Title text="事業者" />
        <Text>田中直登</Text>

        <Title text="事業者の所在 " />
        <Text>
          <div className="mb-2">
            〒001-0045 北海道札幌市北区麻生町3-2-4-206 GTS内
          </div>
          <div>※お問い合わせはフォームからのみ受け付けています。</div>
        </Text>

        <Title text="お問合せ先 " />
        <Text>
          <Link
            href={SUPPORT_URL}
            className="text-blue-600 hover:underline"
            target="_blank"
          >
            こちらのページ
          </Link>
          よりお問い合わせください。
        </Text>

        <Title text="販売価格と手数料" />
        <Text>
          <div className="mb-4">
            デジタルギフトの価格や手数料は消費税を含む価格で表示されています。投稿者が投稿する有料コンテンツの価格は、投稿ページに表示されています。有料コンテンツの販売者に対して以下の手数料が課されます。
          </div>
          <li>
            <span className="font-bold">決済手数料: </span>
            有料コンテンツの販売対価の3.6％
          </li>
          <li className="mb-4">
            <span className="font-bold">プラットフォーム手数料: </span>
            有料コンテンツの販売対価から決済手数料を差し引いた額の10％
          </li>
          <div className="mb-4">
            サービス中で販売されるコンテンツの販売価格と手数料の詳細は、{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              利用規約
            </Link>
            や有料コンテンツの販売者による表示内容をご参照ください。
          </div>
        </Text>

        <Title text="お支払方法" />
        <Text>
          クレジットカード（Visa/Master/American Express/Diners Club）
        </Text>

        <Title text="個人情報の取扱いについて " />
        <Text>
          <Link href="/privacy" className="text-blue-600 hover:underline">
            プライバシーポリシー
          </Link>
          をご参照ください。
        </Text>

        <Title text="キャンセルについて" />
        <Text>
          コピー可能なデジタルコンテンツであるため、ご購入者様の都合による返品・返金・キャンセルは一切できません。商品違いであっても、返金は致し兼ねますので、予めご了承ください。
        </Text>

        <Title text="コンテンツの閲覧保証ブラウザ " />
        <Text>
          Chrome/Safari/FireFox/Edge/iOS Safari/Android Chromeの各最新版
        </Text>

        <Title text="商品の引き渡し時期" />
        <Text>
          有料コンテンツを購入した場合、決済手続き完了後、すぐに閲覧できるようになります。
        </Text>

        <Title text="その他" />
        <Text>
          有料コンテンツの販売者が販売事業者に該当する場合、販売者の特定商取引法に基づく表記はコンテンツの販売ページに表示されます。
        </Text>
      </div>
    </Container>
  )
}
