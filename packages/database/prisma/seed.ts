import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // テストユーザー
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'test-user-id',
      name: 'testuser',
      email: 'test@example.com',
      admin: false,
    },
  })
  console.log(`User: ${user.name} (${user.email})`)

  // 本棚（シート）
  const sheet = await prisma.sheets.upsert({
    where: { userId_name: { userId: user.id, name: '本棚' } },
    update: {},
    create: { userId: user.id, name: '本棚', order: 1 },
  })
  console.log(`Sheet: ${sheet.name}`)

  // 書籍データ（実データの構造を参考に匿名化）
  const booksData = [
    {
      userId: user.id,
      sheetId: sheet.id,
      title: 'ソフトウェアの世界でキャリアを築く Making it Big in Software',
      author: 'Sam Lightstone',
      category: 'Technology & Engineering',
      image: 'https://books.google.com/books/content?id=NobsheCaz4UC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      impression: '-',
      memo: '[期待]\n\n[感想]\n',
      isPublicMemo: false,
      isPurchasable: false,
      finished: new Date('2025-06-25'),
      created: new Date('2025-06-25'),
      updated: new Date('2025-06-25'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: 'トレーダーの精神分析',
      author: 'ブレット・N・スティーンバーガー',
      category: 'お金',
      image: 'http://books.google.com/books/content?id=AVuyBAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      impression: '◎',
      memo: '[期待]\n今まさに求めている内容だった。2007年の本だが普遍的な内容が書かれていそうで、立ち読みしたらするする読めたので購入。\n\n[感想]\n認知療法の章が特に素晴らしい。出来事に対して「ではもし別の状況だったら」という思考実験を通じて、自分の解釈を見直す方法が紹介されている。\n・自分の性格とニッチなマーケットが絡み合った時に勝つ。それこそがエッジ\n・プロは前向き推論、アマチュアは後ろ向き推論',
      isPublicMemo: true,
      isPurchasable: false,
      finished: new Date('2025-03-08'),
      created: new Date('2025-02-14'),
      updated: new Date('2025-03-09'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: 'マネジメントは嫌いですけど',
      author: '関谷雅宏',
      category: 'ビジネス',
      image: 'http://books.google.com/books/content?id=x63v0AEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      impression: '◎',
      memo: '[期待]\nエンジニア関連の本を購入。予算の考え方を深めたかった。\n\n[感想]\n良著。タイトルに反して、着実にマネジメントをするための実践的な方法が書かれている。\nコスト削減は0を目指す袋小路なので、伸ばす方向に意識を持っていくことが大事。「50万円の削減」ではなく「50万円の投資で100万円の資産を獲得できた」と捉えると、次の予算獲得につながる。',
      isPublicMemo: true,
      isPurchasable: false,
      finished: new Date('2025-02-15'),
      created: new Date('2025-02-14'),
      updated: new Date('2025-03-16'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: '基礎からわかるTCP/IPネットワークコンピューティング入門（第４版）',
      author: '村山公保',
      category: 'Computers',
      image: 'http://books.google.com/books/content?id=R5EYEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      impression: '-',
      memo: '[期待]\n\n[感想]\n',
      isPublicMemo: false,
      isPurchasable: false,
      finished: new Date('2024-11-01'),
      created: new Date('2025-02-23'),
      updated: new Date('2025-02-23'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: '貧困と脳　「働かない」のではなく「働けない」',
      author: '鈴木大介',
      category: 'ビジネス',
      image: 'http://books.google.com/books/content?id=2F8zEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      impression: '◎',
      memo: '[期待]\n動画で紹介されていて、思考を広げたいと思い購入。\n\n[感想]\n衝撃的だった。自分は何もわかっていなかったと痛感させられる本。遅刻や事務処理など「やればできる・怠惰なだけ」だと思っていたが、脳の障害だった。著者が元々できる側の人間だったからこそ、どちらの言い分もまとめられる稀有な一冊。',
      isPublicMemo: true,
      isPurchasable: false,
      finished: new Date('2025-03-16'),
      created: new Date('2025-03-16'),
      updated: new Date('2025-05-24'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: 'Software Design 2025年3月号',
      author: 'Software Design',
      category: '技術',
      image: 'http://books.google.com/books/content?id=placeholder_sd202503&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      impression: '◯',
      memo: '[期待]\nAIエディタへの関心が高まっていた時期だったので購入。\n[感想]\nCursorを試してみようと思えたので元は取れた。MySQLに位置情報を計算するためのメソッド・型があるのは知らなかった。',
      isPublicMemo: true,
      isPurchasable: false,
      finished: new Date('2025-03-27'),
      created: new Date('2025-03-27'),
      updated: new Date('2025-03-27'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: 'ラザルス',
      author: 'ジェフ・ホワイト',
      category: '技術',
      image: 'http://books.google.com/books/content?id=i4WpzwEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      impression: '✗',
      memo: '[期待]\n大規模なクラッキング事件のニュースを見て興味を持った。どんな経緯で生まれた組織なのかを知りたかった。\n[感想]\n微妙だった。事件がただ紹介されていくだけで、具体的に組織とは何なのかは触れられていなかったので途中で読むのをやめた。',
      isPublicMemo: true,
      isPurchasable: false,
      finished: new Date('2025-03-27'),
      created: new Date('2025-03-27'),
      updated: new Date('2025-04-14'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: '22世紀の資本主義　やがてお金は絶滅する',
      author: '成田悠輔',
      category: 'ビジネス',
      image: 'http://books.google.com/books/content?id=ARNIEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      impression: '△',
      memo: '[期待]\n書店で立ち読みしていたら引き込まれたので購入。言い回しが好みだった。\n\n[感想]\n最終的によくわからなかった。いくつか印象的なワードがあった。\n・アカシックレコード。宇宙の歴史全てを記録したハードディスクのようなもの。\n・心身の状態に値段がつく世界。\n・お金から解放されるにはまずお金が必要だという世界観に住む限り、解放されることはない。',
      isPublicMemo: true,
      isPurchasable: false,
      finished: new Date('2025-04-14'),
      created: new Date('2025-04-14'),
      updated: new Date('2025-04-16'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: '人生の経営戦略',
      author: '山口周',
      category: 'ビジネス',
      image: 'http://books.google.com/books/content?id=gZs9EQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      impression: '△',
      memo: '[期待]\n人生を季節に分ける箇所を読みたくて購入。\n[感想]\nビジネス色が強い内容で、思っていたほどミッドライフクライシスの乗り越え方は書かれていなかった。市場価値の高い人材になるための方法が中心。',
      isPublicMemo: true,
      isPurchasable: false,
      finished: new Date('2025-04-14'),
      created: new Date('2025-04-14'),
      updated: new Date('2025-04-16'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: 'Software Design 2025年5月号',
      author: 'Software Design',
      category: '技術',
      image: 'http://books.google.com/books/content?id=placeholder_sd202505&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      impression: '◯',
      memo: '[期待]\nクラス設計と監視の話に興味があったので購入。\n[感想]\n・Grafana使ってみたい\n・クラス設計の章は微妙だった。実際の設計をイメージしづらかった。\n・LLMの比較表は良かった。モデル名が何を指しているのか一覧で見れるのは助かった。',
      isPublicMemo: true,
      isPurchasable: false,
      finished: new Date('2025-04-30'),
      created: new Date('2025-04-30'),
      updated: new Date('2025-05-02'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: '人生の目的',
      author: '高森光晴, 大見滋紀',
      category: '哲学',
      image: 'http://books.google.com/books/content?id=GoQC0AEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      impression: '◯',
      memo: '[期待]\n長い人生のゴールを設定するヒントを得たかった。\n\n[感想]\n喩え話を使った説明は面白いが、解説がないとわかりにくい。知りたかった人生の目的は結局わからなかった。\n・他人の死は檻の中のトラを見ている状態。自分の死は山中で出会うトラ、全く別物。',
      isPublicMemo: true,
      isPurchasable: false,
      finished: new Date('2025-05-01'),
      created: new Date('2025-05-01'),
      updated: new Date('2025-05-02'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: '無意識の正体',
      author: '山竹伸二',
      category: '哲学',
      image: 'http://books.google.com/books/content?id=u-0NEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      impression: '◯',
      memo: '[期待]\n「自分とは何か」「自由とは何か」というサブタイトルに惹かれて購入。\n[感想]\n「無意識とは自己了解である」という認識を得られたのが最大の成果。\n・没頭できる行動においては無意識に任せたほうが良い。\n・自由と承認を求めながら葛藤するのが現代人。不安が大きくなると自由を手離してしまう。',
      isPublicMemo: true,
      isPurchasable: false,
      finished: new Date('2025-05-04'),
      created: new Date('2025-05-04'),
      updated: new Date('2025-05-18'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: '世界の一流は「休日」に何をしているのか',
      author: '越川慎司',
      category: 'ビジネス',
      image: 'http://books.google.com/books/content?id=djQtEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      impression: '△',
      memo: '[期待]\n実家にあったので読んだ。\n[感想]\nよくあることが書いてある。いくつか改めて言語化されたものもあった。\n・趣味を楽しむために仕事を頑張っているという感覚は意外と刺さった。\n・人の真似をして幸福になれるほど単純なものじゃない。自分が好きなものは自分では選べない。',
      isPublicMemo: true,
      isPurchasable: false,
      finished: new Date('2025-05-05'),
      created: new Date('2025-05-05'),
      updated: new Date('2025-05-07'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: 'ごきげんになる技術',
      author: '佐久間宣行',
      category: '-',
      image: 'http://books.google.com/books/content?id=Rp7J0AEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      impression: '◯',
      memo: '[期待]\n\n[感想]\n',
      isPublicMemo: false,
      isPurchasable: false,
      finished: new Date('2025-03-27'),
      created: new Date('2025-05-11'),
      updated: new Date('2025-05-11'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: 'ゼロ秒思考',
      author: '赤羽雄二',
      category: 'Business & Economics',
      image: 'http://books.google.com/books/content?id=mYWAAgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      impression: '◎',
      memo: '[期待]\n\n[感想]\n',
      isPublicMemo: false,
      isPurchasable: false,
      finished: new Date('2025-02-01'),
      created: new Date('2025-05-11'),
      updated: new Date('2025-05-11'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: '[改訂新版]プロになるためのWeb技術入門',
      author: '小森裕介',
      category: '-',
      image: 'http://books.google.com/books/content?id=4tPl0AEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      impression: '◎',
      memo: '[期待]\n\n[感想]\n',
      isPublicMemo: false,
      isPurchasable: false,
      finished: new Date('2025-05-04'),
      created: new Date('2025-05-11'),
      updated: new Date('2025-05-11'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: '強いビジネスパーソンを目指して鬱になった僕の 弱さ考',
      author: '井上慎平',
      category: '哲学',
      image: 'http://books.google.com/books/content?id=1XFNEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      impression: '◎',
      memo: '[期待]\n価値観が崩壊した後に改めて社会を考えることで得られた著者の考えを知りたかった。成長のレースからの降り方に興味があった。\n\n[感想]\n素晴らしかった。ビジネス本というより哲学に近い。脱成長が最高、のように単純に結論づけないスタイルがいい。\n・人は自分が思っているほどに自分の人生を選べていない\n・時間は「分配」されているのではなく「生成」されていくもの\n・仕事以外の依存先を見つけるべき。比べられないこと自体が尊い。',
      isPublicMemo: true,
      isPurchasable: false,
      finished: new Date('2025-05-11'),
      created: new Date('2025-05-11'),
      updated: new Date('2025-05-14'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: 'Software Design 2024年5月号',
      author: 'Software Design',
      category: '技術',
      image: 'http://books.google.com/books/content?id=placeholder_sd202405&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      impression: '◯',
      memo: '[期待]\n特に読みたいものはなかったが購入。\n[感想]\nDBの章でカスタムフィールドの話があり、EAV（Entity, Attribute, Value）という名前を知れたのが良かった。',
      isPublicMemo: true,
      isPurchasable: false,
      finished: new Date('2025-05-19'),
      created: new Date('2025-05-18'),
      updated: new Date('2025-05-18'),
    },
    {
      userId: user.id,
      sheetId: sheet.id,
      title: '林住期',
      author: '五木寛之',
      category: '哲学',
      image: 'http://books.google.com/books/content?id=ukd3PgAACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
      impression: '◎',
      memo: '[期待]\n50歳以降の生き方のヒントが書いてあると期待して購入。\n\n[感想]\n良かった。50歳〜75歳こそが黄金期であるというメンタル変革について書かれている。\n・学生期、家住期、林住期、遊行期\n・他人や組織のためではなく、ただ自分のために生きる。それが真の人生の黄金期。\n・鬱は人間の支えであると考える。光が強ければ影もまた濃い。',
      isPublicMemo: true,
      isPurchasable: false,
      finished: new Date('2025-05-31'),
      created: new Date('2025-05-31'),
      updated: new Date('2025-06-14'),
    },
  ]

  const createdBooks = []
  for (const bookData of booksData) {
    const book = await prisma.books.create({ data: bookData })
    createdBooks.push(book)
    console.log(`  Created book: ${book.title}`)
  }

  // 年間ベスト本（2025年トップ3）
  const topBookTitles = [
    '強いビジネスパーソンを目指して鬱になった僕の 弱さ考',
    '林住期',
    'トレーダーの精神分析',
  ]
  for (let i = 0; i < topBookTitles.length; i++) {
    const book = createdBooks.find((b) => b.title === topBookTitles[i])
    if (book) {
      await prisma.yearlyTopBook.create({
        data: {
          userId: user.id,
          bookId: book.id,
          order: i + 1,
          year: '2025',
        },
      })
    }
  }
  console.log('  Created yearly top books (2025)')

  // AI要約サンプル
  await prisma.aiSummaries.create({
    data: {
      userId: user.id,
      sheetId: sheet.id,
      analysis: {
        _schemaVersion: 2,
        character_summary:
          '技術と哲学の両方に関心を持つ内省的な読書家。キャリアや人生の意味を技術書と哲学書の両面から探求している。',
        reading_trend_analysis:
          'ビジネス書・自己啓発書を中心に幅広く読んでおり、技術書（Software Design等）も定期的に読んでいる。哲学・人生論への関心も高く、内省的なテーマへの探求が見られる。',
        sentiment_analysis:
          '高評価（◎）が多いのはキャリア・働き方に関する書籍。技術書は継続的に読んでいるが評価は控えめ。人生の目的や意味を問う本に強い共感を示している。',
        hidden_theme_discovery:
          '「自分らしい働き方・生き方」を模索している。技術力の向上と人生の充実の両立を無意識に追い求めており、それが書籍選びに反映されている。',
        overall_feedback:
          '技術と人文の両方をバランスよく読む知的好奇心の高い読書家です。「暇と退屈の倫理学」や「ライフシフト」を読むとさらに考えが深まるでしょう。',
      },
      token: 1800,
    },
  })
  console.log('  Created AI summary')

  // テンプレート本
  await prisma.template_books.create({
    data: {
      userId: user.id,
      name: '読書メモテンプレート',
      title: '',
      author: '',
      category: '',
      image: '',
      memo: '[期待]\n\n[感想]\n',
      isPublicMemo: false,
    },
  })
  console.log('  Created template book')

  console.log(`\nSeed completed! (${createdBooks.length} books)`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
