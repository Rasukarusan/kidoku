import { Container } from '@/components/layout/Container'
export const PrivacyPage = () => {
  return (
    <Container className="text-gray-700">
      <div className="mx-auto max-w-screen-md py-8 px-4">
        <h1 className="mb-6 text-3xl font-bold">プライバシーポリシー</h1>
        <section className="mb-6">
          <h2 className="mb-4 text-2xl font-semibold">1. 個人情報の定義</h2>
          <p>
            「個人情報」とは、生存する個人に関する情報であり、当該情報に含まれる氏名、生年月日その他の記述等により特定の個人を識別できる情報を指します。
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-4 text-2xl font-semibold">2. 個人情報の収集方法</h2>
          <p>
            当社は、お客様がサービスを利用する際、お名前、住所、電話番号、メールアドレスなどの個人情報をお聞きすることがあります。また、お客様とのお取引の過程で個人情報が生成されることがあります。
          </p>
        </section>

        <section className="mb-6">
          <h2 className="mb-4 text-2xl font-semibold">
            3. 個人情報を収集・利用する目的
          </h2>
          <p>当社が個人情報を収集・利用する目的は以下のとおりです。</p>
          <ol className="list-decimal pl-6">
            <li className="mb-2">お客様からのお問い合わせに対応するため</li>
            <li className="mb-2">お客様が利用されるサービスの提供のため</li>
          </ol>
        </section>

        <section className="mb-6">
          <h2 className="mb-4 text-2xl font-semibold">4. 個人情報の安全管理</h2>
          <p>
            当社は、お客様の個人情報を安全に管理するため、必要かつ適切な監視体制を整え、個人情報への不正なアクセス、個人情報の紛失、破壊、改ざんおよび漏洩防止のための適切な対策を講じます。
          </p>
        </section>
      </div>
    </Container>
  )
}
