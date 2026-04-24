import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

const width = 1200
const height = 630

const baseStyle = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'space-between',
  padding: '56px',
  background:
    'linear-gradient(135deg, rgba(249,250,251,1) 0%, rgba(236,253,245,1) 50%, rgba(224,242,254,1) 100%)',
  color: '#0f172a',
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

const cardStyle = {
  borderRadius: '24px',
  backgroundColor: 'rgba(255,255,255,0.82)',
  border: '1px solid rgba(148,163,184,0.25)',
  padding: '28px 32px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '14px',
}

const trim = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text

export default function handler(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? 'year'
  const user = trim(searchParams.get('user') ?? 'kidoku user', 24)

  const title =
    type === 'book'
      ? trim(searchParams.get('title') ?? '本の詳細', 44)
      : trim(searchParams.get('title') ?? '今年読んだ冊数', 28)
  const subtitle =
    type === 'book'
      ? trim(searchParams.get('author') ?? 'book detail', 50)
      : trim(searchParams.get('subtitle') ?? '読書記録サマリー', 52)
  const value =
    type === 'book'
      ? trim(searchParams.get('category') ?? '', 20)
      : `${searchParams.get('count') ?? '0'}冊`

  const imageParam = searchParams.get('image') ?? ''
  const hasCover =
    type === 'book' &&
    (imageParam.startsWith('http://') || imageParam.startsWith('https://'))

  return new ImageResponse(
    <div style={baseStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div
          style={{
            fontSize: 38,
            fontWeight: 700,
            color: '#0f766e',
          }}
        >
          kidoku
        </div>
        <div style={{ fontSize: 28, color: '#334155' }}>読書記録をシェア</div>
      </div>

      {hasCover ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <img
            src={imageParam}
            width={240}
            height={360}
            style={{
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(15,23,42,0.18)',
              objectFit: 'cover',
            }}
          />
          <div style={{ ...cardStyle, flex: 1 }}>
            <div style={{ fontSize: 26, color: '#334155' }}>{user}</div>
            <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1 }}>
              {title}
            </div>
            <div style={{ fontSize: 30, color: '#334155' }}>{subtitle}</div>
            {value ? (
              <div style={{ fontSize: 40, fontWeight: 700, color: '#0f766e' }}>
                {value}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div style={cardStyle}>
          <div style={{ fontSize: 28, color: '#334155' }}>{user}</div>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>
            {title}
          </div>
          <div style={{ fontSize: 34, color: '#334155' }}>{subtitle}</div>
          {value ? (
            <div style={{ fontSize: 48, fontWeight: 700, color: '#0f766e' }}>
              {value}
            </div>
          ) : null}
        </div>
      )}

      <div style={{ fontSize: 26, color: '#475569' }}>https://kidoku.net</div>
    </div>,
    {
      width,
      height,
    }
  )
}
