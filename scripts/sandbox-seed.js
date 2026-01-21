// Sandbox seed script - creates sample data for development
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding sandbox database...');

  // Create a sandbox user
  const user = await prisma.user.upsert({
    where: { email: 'sandbox@example.com' },
    update: {},
    create: {
      id: 'sandbox-user-id',
      email: 'sandbox@example.com',
      name: 'Sandbox User',
      admin: false,
    },
  });

  console.log('Created user:', user.email);

  // Create a default sheet
  const sheet = await prisma.sheets.upsert({
    where: {
      uniq_user_id_name: {
        userId: user.id,
        name: '読んだ本',
      },
    },
    update: {},
    create: {
      userId: user.id,
      name: '読んだ本',
      order: 1,
    },
  });

  console.log('Created sheet:', sheet.name);

  // Create sample books
  const sampleBooks = [
    {
      title: '吾輩は猫である',
      author: '夏目漱石',
      category: '文学',
      impression: '5',
      memo: '猫の視点から人間社会を風刺した名作。',
    },
    {
      title: '人間失格',
      author: '太宰治',
      category: '文学',
      impression: '4',
      memo: '自己の内面を深く掘り下げた作品。',
    },
    {
      title: 'ノルウェイの森',
      author: '村上春樹',
      category: '文学',
      impression: '5',
      memo: '青春の喪失と再生を描いた物語。',
    },
  ];

  for (const bookData of sampleBooks) {
    const book = await prisma.books.create({
      data: {
        userId: user.id,
        sheet_id: sheet.id,
        title: bookData.title,
        author: bookData.author,
        category: bookData.category,
        image: '',
        impression: bookData.impression,
        memo: bookData.memo,
        is_public_memo: false,
        is_purchasable: false,
        finished: new Date(),
      },
    });
    console.log('Created book:', book.title);
  }

  console.log('Sandbox seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
