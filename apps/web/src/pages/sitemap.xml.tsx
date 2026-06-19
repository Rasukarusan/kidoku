import { GetServerSideProps } from 'next'

const HOST = process.env.NEXT_PUBLIC_HOST || 'https://kidoku.net'

type SitemapEntry = {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

const toXml = (entries: SitemapEntry[]): string => {
  const urls = entries
    .map((e) => {
      const parts = [`    <loc>${e.loc}</loc>`]
      if (e.lastmod) parts.push(`    <lastmod>${e.lastmod}</lastmod>`)
      if (e.changefreq)
        parts.push(`    <changefreq>${e.changefreq}</changefreq>`)
      if (e.priority) parts.push(`    <priority>${e.priority}</priority>`)
      return `  <url>\n${parts.join('\n')}\n  </url>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
}

const encodePath = (segment: string) =>
  encodeURIComponent(segment).replace(/%2F/gi, '/')

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const entries: SitemapEntry[] = [
    { loc: `${HOST}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${HOST}/about`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${HOST}/comments`, changefreq: 'daily', priority: '0.7' },
  ]

  try {
    const { default: prisma } = await import('@/libs/prisma')

    // 公開メモのある本（「書名+感想」検索の受け皿）
    const books = await prisma.books.findMany({
      where: { isPublicMemo: true },
      select: { id: true, updated: true },
      orderBy: { updated: 'desc' },
      take: 20000,
    })
    for (const b of books) {
      entries.push({
        loc: `${HOST}/books/${b.id}`,
        lastmod: b.updated ? new Date(b.updated).toISOString() : undefined,
        changefreq: 'weekly',
        priority: '0.8',
      })
    }

    // 公開本棚（各ユーザーのシート）
    const sheets = await prisma.sheets.findMany({
      select: { name: true, updated: true, user: { select: { name: true } } },
      orderBy: { updated: 'desc' },
      take: 20000,
    })
    const seenUsers = new Set<string>()
    for (const s of sheets) {
      const userName = s.user?.name
      if (!userName) continue
      if (!seenUsers.has(userName)) {
        seenUsers.add(userName)
        entries.push({
          loc: `${HOST}/${encodePath(userName)}/sheets`,
          changefreq: 'weekly',
          priority: '0.6',
        })
      }
      entries.push({
        loc: `${HOST}/${encodePath(userName)}/sheets/${encodePath(s.name)}`,
        lastmod: s.updated ? new Date(s.updated).toISOString() : undefined,
        changefreq: 'weekly',
        priority: '0.7',
      })
    }

    await prisma.$disconnect()
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  res.setHeader('Content-Type', 'text/xml')
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=43200'
  )
  res.write(toXml(entries))
  res.end()

  return { props: {} }
}

export default function Sitemap() {
  return null
}
