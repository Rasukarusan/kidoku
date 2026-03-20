// Sandbox seed script - creates sample data for development and E2E tests
const path = require('path');
const { PrismaClient } = require(path.join(__dirname, '..', 'apps', 'web', 'node_modules', '@prisma', 'client'));

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sandbox database...');

  // Create a test user (matches backdoor login email and health-check expectations)
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'testuser',
      admin: false,
    },
  });

  console.log('Created user:', user.email);

  // Create the primary sheet (E2E tests expect '本棚')
  const sheet = await prisma.sheets.upsert({
    where: {
      userId_name: {
        userId: user.id,
        name: '本棚',
      },
    },
    update: {},
    create: {
      userId: user.id,
      name: '本棚',
      order: 1,
    },
  });

  console.log('Created sheet:', sheet.name);

  // Create 19 sample books (E2E tests expect this count and specific titles)
  const sampleBooks = [
    { title: 'トレーダーの精神分析', author: 'ブレット・スティーンバーガー', category: '投資', impression: '5', memo: 'トレーダーの心理を分析した名著。' },
    { title: '吾輩は猫である', author: '夏目漱石', category: '文学', impression: '5', memo: '猫の視点から人間社会を風刺した名作。' },
    { title: '人間失格', author: '太宰治', category: '文学', impression: '4', memo: '自己の内面を深く掘り下げた作品。' },
    { title: 'ノルウェイの森', author: '村上春樹', category: '文学', impression: '5', memo: '青春の喪失と再生を描いた物語。' },
    { title: '坊っちゃん', author: '夏目漱石', category: '文学', impression: '4', memo: '痛快な学園小説。' },
    { title: '羅生門', author: '芥川龍之介', category: '文学', impression: '4', memo: '人間のエゴイズムを描いた短編。' },
    { title: '銀河鉄道の夜', author: '宮沢賢治', category: '文学', impression: '5', memo: '幻想的な旅の物語。' },
    { title: '走れメロス', author: '太宰治', category: '文学', impression: '4', memo: '友情と信頼の物語。' },
    { title: '雪国', author: '川端康成', category: '文学', impression: '5', memo: '日本の美を描いたノーベル文学賞作品。' },
    { title: '伊豆の踊子', author: '川端康成', category: '文学', impression: '4', memo: '青春の淡い恋を描いた作品。' },
    { title: '蟹工船', author: '小林多喜二', category: '文学', impression: '3', memo: 'プロレタリア文学の代表作。' },
    { title: '風立ちぬ', author: '堀辰雄', category: '文学', impression: '4', memo: '愛と死を描いた美しい小説。' },
    { title: 'こころ', author: '夏目漱石', category: '文学', impression: '5', memo: '人間の孤独と罪を描いた名作。' },
    { title: '友情', author: '武者小路実篤', category: '文学', impression: '3', memo: '友情と恋愛の葛藤。' },
    { title: '山月記', author: '中島敦', category: '文学', impression: '4', memo: '自尊心と才能の寓話。' },
    { title: '金閣寺', author: '三島由紀夫', category: '文学', impression: '5', memo: '美への執着を描いた作品。' },
    { title: '檸檬', author: '梶井基次郎', category: '文学', impression: '3', memo: '繊細な感覚で描かれた短編。' },
    { title: 'リーダブルコード', author: 'Dustin Boswell', category: '技術書', impression: '5', memo: '読みやすいコードの書き方。' },
    { title: 'リファクタリング', author: 'Martin Fowler', category: '技術書', impression: '5', memo: 'コード改善の定番書。' },
  ];

  for (const bookData of sampleBooks) {
    const book = await prisma.books.create({
      data: {
        user: { connect: { id: user.id } },
        sheet: { connect: { id: sheet.id } },
        title: bookData.title,
        author: bookData.author,
        category: bookData.category,
        image: '',
        impression: bookData.impression,
        memo: bookData.memo,
        isPublicMemo: false,
        isPurchasable: false,
        finished: new Date(),
      },
    });
    console.log('Created book:', book.title);
  }

  console.log(`Seeding completed! Created ${sampleBooks.length} books in sheet "${sheet.name}".`);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
