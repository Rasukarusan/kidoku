import { Container } from '@/components/layout/Container'

export const LawPage: React.FC = () => {
  return (
    <Container>
      <div className="p-4">
        <h2 className="mb-4 text-lg font-semibold">特定商取引法に基づく表記</h2>
        <div className="space-y-2">
          <h3 className="font-bold">運営統括責任者名</h3>
          <p>田中直登</p>
          <h3 className="font-bold">販売価格と手数料</h3>
          <p>
            デジタルギフトの価格や手数料は消費税を含む価格で表示されています。
            <br />
            投稿者が投稿する有料コンテンツの価格は、投稿ページに表示されています。有料コンテンツの販売者に対して以下の手数料が課されます。
            <br />
            <br />
            ・決済手数料: 有料コンテンツの販売対価の3.6％ <br />
            ・プラットフォーム手数料:
            有料コンテンツの販売対価から決済手数料を差し引いた額の10％
            <br />
            <br />
            サービス中で販売されるコンテンツの販売価格と手数料の詳細は、利用規約や有料コンテンツの販売者による表示内容をご参照ください。
          </p>
          <h3 className="font-bold">お支払方法</h3>
          <p>クレジットカード（Visa/Master/American Express/Diners Club） </p>
          <h3 className="font-bold">個人情報の取扱いについて</h3>
          <p>プライバシーポリシーをご参照ください。</p>
          <h3 className="font-bold">キャンセルについて</h3>
          <p>
            コピー可能なデジタルコンテンツであるため、ご購入者様の都合による返品・返金・キャンセルは一切できません。商品違いであっても、返金は致し兼ねますので、予めご了承ください。
          </p>
          <h3 className="font-bold">商品の引き渡し時期</h3>
          <p>
            有料コンテンツを購入した場合、決済手続き完了後、すぐに閲覧できるようになります。
          </p>
          <h3 className="font-bold">その他</h3>
          <p>
            有料コンテンツの販売者が販売事業者に該当する場合、販売者の特定商取引法に基づく表記はコンテンツの販売ページに表示されます。
          </p>
        </div>
      </div>
    </Container>
  )
}
