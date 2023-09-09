import { RankingItem } from './RankingItem'

export const Rankings: React.FC = () => {
  return (
    <div className="mt-8">
      <RankingItem
        year="2022年"
        books={[
          {
            rank: 1,
            name: '人生の法則 「欲求の4タイプ」で分かるあなたと他人',
            image:
              'http://books.google.com/books/content?id=qOaruAAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
            link: 'https://www.amazon.co.jp/dp/B00GTK5IQG',
          },
          {
            rank: 2,
            name: 'お金のむこうに人がいる',
            image:
              'http://books.google.com/books/content?id=47mNzgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
            link: 'https://www.amazon.co.jp/dp/4478113726',
          },
          {
            rank: 3,
            name: 'プロジェクト・ヘイル・メアリー',
            image:
              'http://books.google.com/books/content?id=AIazzgEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
            link: 'https://www.amazon.co.jp/dp/B09NBZLC7J',
          },
        ]}
      />
      <RankingItem
        year="2021年"
        books={[
          {
            rank: 1,
            name: '嫌われる勇気',
            image:
              'http://books.google.com/books/content?id=qNMHnwEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
            link: 'https://www.amazon.co.jp/dp/4478025819',
          },
          {
            rank: 2,
            name: 'ラッセル幸福論',
            image:
              'https://images-na.ssl-images-amazon.com/images/I/51YB2WFC5CL._SX334_BO1,204,203,200_.jpg',
            link: 'https://www.amazon.co.jp/dp/4003364937',
          },
          {
            rank: 3,
            name: '精神科医が見つけた 3つの幸福 最新科学から最高の人生をつくる方法',
            image:
              'http://books.google.com/books/content?id=EJYjEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
            link: 'https://www.amazon.co.jp/dp/4864108234',
          },
        ]}
      />
      <RankingItem
        year="2020年"
        books={[
          {
            rank: 1,
            name: 'ブルシット・ジョブ　クソどうでもいい仕事の理論',
            image:
              'http://books.google.com/books/content?id=9CsPEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
            link: 'https://www.amazon.co.jp/dp/4000614134',
          },
          {
            rank: 2,
            name: 'Google×スタンフォードNO FLOP!失敗できない人の失敗しない技術',
            image:
              'http://books.google.com/books/content?id=6f4rywEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
            link: 'https://www.amazon.co.jp/dp/4763137492',
          },
          {
            rank: 3,
            name: '好きなようにしてください',
            image:
              'http://books.google.com/books/content?id=0vp-CwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
            link: 'https://www.amazon.co.jp/dp/4478068879',
          },
        ]}
      />
      <RankingItem
        year="2019年"
        books={[
          {
            rank: 1,
            name: '人生は、運よりも実力よりも「勘違いさせる力」で決まっている',
            image:
              'http://books.google.com/books/content?id=x81fuwEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
            link: 'https://www.amazon.co.jp/dp/4478106347',
          },
          {
            rank: 2,
            name: 'このまま今の会社にいていいのか？と一度でも思ったら読む 転職の思考法',
            image:
              'http://books.google.com/books/content?id=2ldgDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
            link: 'https://www.amazon.co.jp/dp/4478105553',
          },
          {
            rank: 3,
            name: 'プログラミングバカ一代',
            image:
              'http://books.google.com/books/content?id=fbANswEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
            link: 'https://www.amazon.co.jp/dp/B012C0SO1W',
          },
        ]}
      />
    </div>
  )
}
