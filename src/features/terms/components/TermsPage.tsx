import { Container } from '@/components/layout/Container'
import { NextSeo } from 'next-seo'
export const TermsPage = () => {
  return (
    <Container className="text-gray-700">
      <NextSeo title="利用規約 | kidoku" />
      <div className="mx-auto max-w-screen-md py-8 px-4">
        <h1 className="mb-6 text-3xl font-bold">kidoku利用規約</h1>

        <h2 className="mb-4 text-2xl font-semibold">第1条（適用）</h2>
        <p className="mb-6">
          本規約は、ユーザーが本サービスを利用する際に適用されます。ユーザーは、本規約に同意の上、本サービスを利用するものとします。
        </p>

        <h2 className="mb-4 text-2xl font-semibold">第2条（定義）</h2>
        <ol className="mb-6 list-decimal pl-6">
          <li className="mb-2">
            「サービス」とは、kidoku及びこれに付随する一切のサービスを指します。
          </li>
          <li>
            「ユーザー」とは、本サービスを利用する全ての個人または法人を指します。
          </li>
        </ol>

        <h2 className="mb-4 text-2xl font-semibold">第3条（利用登録）</h2>
        <ol className="mb-6 list-decimal pl-6">
          <li className="mb-2">
            ユーザーは、本サービスの利用にあたり、利用登録を行うものとします。
          </li>
          <li>
            当社は、利用登録の申し込みが以下のいずれかに該当すると判断した場合、利用登録を承認しないことがあります。
            <ul className="mt-2 list-disc pl-6">
              <li className="mb-2">
                申込者が本規約に違反したことがある者である場合
              </li>
              <li>その他、当社が利用登録を相当でないと判断した場合</li>
            </ul>
          </li>
        </ol>

        <h2 className="mb-4 text-2xl font-semibold">
          第4条（利用料金および支払方法）
        </h2>
        <ol className="mb-6 list-decimal pl-6">
          <li className="mb-2">
            ユーザーは、本サービスの利用にあたり、所定の利用料金を支払うものとします。
          </li>
          <li>
            利用料金の支払いは、クレジットカード、銀行振込、その他当社が指定する方法によるものとします。
          </li>
        </ol>

        <h2 className="mb-4 text-2xl font-semibold">第5条（禁止事項）</h2>
        <p className="mb-4">
          ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
        </p>
        <ol className="mb-6 list-decimal pl-6">
          <li className="mb-2">法令または公序良俗に違反する行為</li>
          <li className="mb-2">犯罪行為に関連する行為</li>
          <li className="mb-2">
            他のユーザー、第三者、または当社の著作権、商標権、プライバシー権、その他の権利または利益を侵害する行為
          </li>
          <li className="mb-2">
            本サービスを通じて得られる情報を商業的に利用する行為
          </li>
          <li className="mb-2">当社、本サービスの運営を妨げる行為</li>
          <li className="mb-2">不正アクセスをし、またはこれを試みる行為</li>
          <li>その他、当社が不適切と判断する行為</li>
        </ol>

        <h2 className="mb-4 text-2xl font-semibold">
          第6条（本サービスの提供の停止等）
        </h2>
        <ol className="mb-6 list-decimal pl-6">
          <li className="mb-2">
            当社は、以下のいずれかの事由があると判断した場合、ユーザーへの事前の通知または承諾なく、本サービスの全部または一部の提供を停止または中断することができるものとします。
            <ul className="mt-2 list-disc pl-6">
              <li className="mb-2">
                本サービスにかかるコンピュータシステムの保守点検または更新を行う場合
              </li>
              <li className="mb-2">
                地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合
              </li>
              <li className="mb-2">
                コンピュータまたは通信回線等が事故により停止した場合
              </li>
              <li>その他、当社が本サービスの提供が困難と判断した場合</li>
            </ul>
          </li>
          <li>
            当社は、本サービスの提供の停止または中断により、ユーザーまたは第三者が被ったいかなる不利益または損害に対しても責任を負わないものとします。
          </li>
        </ol>

        <h2 className="mb-4 text-2xl font-semibold">
          第7条（利用制限および登録抹消）
        </h2>
        <ol className="mb-6 list-decimal pl-6">
          <li className="mb-2">
            当社は、ユーザーが以下のいずれかに該当すると判断した場合、事前の通知なく、ユーザーに対して本サービスの全部または一部の利用を制限し、またはユーザーとしての登録を抹消することができるものとします。
            <ul className="mt-2 list-disc pl-6">
              <li className="mb-2">本規約のいずれかの条項に違反した場合</li>
              <li className="mb-2">
                登録事項に虚偽の事実があることが判明した場合
              </li>
              <li className="mb-2">
                その他、当社が本サービスの利用を適当でないと判断した場合
              </li>
            </ul>
          </li>
          <li>
            当社は、本条に基づき当社が行った措置に関して、ユーザーに対して一切の責任を負いません。
          </li>
        </ol>

        <h2 className="mb-4 text-2xl font-semibold">
          第8条（保証の否認および免責事項）
        </h2>
        <ol className="mb-6 list-decimal pl-6">
          <li className="mb-2">
            当社は、本サービスに事実上または法律上の瑕疵（セキュリティ性、信頼性、正確性、完全性、有効性、特定目的への適合性、セキュリティ等に関する欠陥、エラーやバグ、権利侵害等を含む）がないことを明示的にも黙示的にも保証しておりません。
          </li>
          <li className="mb-2">
            当社は、本サービスによってユーザーに生じた任意の損害について、一切の責任を負いません。
          </li>
          <li>
            何らかの理由により当社が責任を負うことが法律上生じた場合であっても、当社は、ユーザーに発生した直接損害に限り、かつ、かかる損害が当社の故意または重過失によるものである場合を除いて、当該損害が発生した月にユーザーから受領した利用料金相当額を上限として責任を負うものとします。
          </li>
        </ol>

        <h2 className="mb-4 text-2xl font-semibold">
          第9条（サービス内容の変更等）
        </h2>
        <p className="mb-6">
          当社は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を終了することができるものとし、これによってユーザーに生じた損害について、一切の責任を負いません。
        </p>

        <h2 className="mb-4 text-2xl font-semibold">
          第10条（利用規約の変更）
        </h2>
        <p className="mb-6">
          当社は、必要と判断した場合には、ユーザーに通知することなく、本規約を変更することができるものとします。なお、本規約の変更後、本サービスの利用を開始した場合には、ユーザーは変更後の規約に同意したものとみなします。
        </p>

        <h2 className="mb-4 text-2xl font-semibold">
          第11条（個人情報の取扱い）
        </h2>
        <p className="mb-6">
          当社は、本サービスの利用によって取得する個人情報については、当社「プライバシーポリシー」に従い適切に取り扱うものとします。
        </p>

        <h2 className="mb-4 text-2xl font-semibold">
          第12条（通知または連絡）
        </h2>
        <p className="mb-6">
          ユーザーと当社との間の通知または連絡は、当社の定める方法によって行うものとします。当社は,ユーザーから,当社が別途定める方法に従った変更届出がない限り,現在登録されている連絡先に対して通知または連絡を行い,これらは,到達したものとみなします。
        </p>

        <h2 className="mb-4 text-2xl font-semibold">
          第13条（権利義務の譲渡の禁止)
        </h2>
        <p className="mb-6">
          ユーザーは、当社の書面による事前の承諾なく、利用契約上の地位または本規約にもとづく権利または義務を第三者に譲渡、移転、担保設定その他の処分をすることはできません。
        </p>
      </div>
    </Container>
  )
}
