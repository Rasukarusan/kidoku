import { ImageResponse } from '@vercel/og'
import { findPersonalityType } from '@/libs/ai/personality/personality-types'
import { personalityCharacterSvg } from '@/libs/ai/personality/personality-character'

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

const header = (label: string, color = '#0f766e') => (
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <div style={{ fontSize: 38, fontWeight: 700, color }}>kidoku</div>
    <div style={{ fontSize: 28, color: '#334155' }}>{label}</div>
  </div>
)

const footer = (color = '#475569') => (
  <div style={{ fontSize: 26, color }}>https://kidoku.net</div>
)

/**
 * AI読書性格診断カード。character_summaryを主役にした拡散向けの1枚。
 */
const renderAi = (params: URLSearchParams) => {
  const user = trim(params.get('user') ?? 'kidoku user', 24)
  const summary = trim(params.get('summary') ?? 'あなたの読書性格', 60)
  const sub = trim(params.get('sub') ?? '', 90)
  // MBTI風の読書性格タイプ（キャラクター画像付きレイアウト）
  const personalityType = findPersonalityType(params.get('ptype'))

  if (personalityType) {
    // SVGはASCIIのみで構成されているためbtoaでbase64化できる
    const characterSrc = `data:image/svg+xml;base64,${btoa(
      personalityCharacterSvg(personalityType)
    )}`
    return new ImageResponse(
      <div
        style={{
          ...baseStyle,
          background: `linear-gradient(135deg, ${personalityType.colorLight} 0%, rgba(255,255,255,1) 55%, ${personalityType.colorLight} 100%)`,
        }}
      >
        {header('AI読書性格診断', personalityType.color)}
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
          <div
            style={{
              ...cardStyle,
              flex: 1,
              gap: '16px',
            }}
          >
            <div style={{ fontSize: 26, color: '#475569' }}>
              {`${user} さんの読書性格タイプは…`}
            </div>
            <div
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                borderRadius: '9999px',
                backgroundColor: personalityType.color,
                color: '#ffffff',
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: '0.2em',
                padding: '6px 20px',
              }}
            >
              {personalityType.code}
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                lineHeight: 1.15,
                color: personalityType.color,
              }}
            >
              {personalityType.name}
            </div>
            {summary ? (
              <div style={{ fontSize: 30, color: '#334155', lineHeight: 1.4 }}>
                {`「${summary}」`}
              </div>
            ) : null}
            {sub ? (
              <div style={{ fontSize: 24, color: '#64748b', lineHeight: 1.4 }}>
                {sub}
              </div>
            ) : null}
          </div>
          <img src={characterSrc} width={300} height={300} />
        </div>
        {footer('#475569')}
      </div>,
      { width, height }
    )
  }

  return new ImageResponse(
    <div
      style={{
        ...baseStyle,
        background:
          'linear-gradient(135deg, rgba(250,245,255,1) 0%, rgba(252,231,243,1) 55%, rgba(243,232,255,1) 100%)',
      }}
    >
      {header('AI読書性格診断', '#9333ea')}
      <div
        style={{
          ...cardStyle,
          background:
            'linear-gradient(120deg, rgba(255,255,255,0.92) 0%, rgba(253,242,248,0.92) 100%)',
          gap: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: 26, color: '#a21caf' }}>
            {`${user} さんの読書性格は…`}
          </div>
        </div>
        <div
          style={{
            fontSize: summary.length > 28 ? 52 : 64,
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#581c87',
          }}
        >
          {`「${summary}」`}
        </div>
        {sub ? (
          <div style={{ fontSize: 28, color: '#475569', lineHeight: 1.4 }}>
            {sub}
          </div>
        ) : null}
      </div>
      {footer('#7e22ce')}
    </div>,
    { width, height }
  )
}

/**
 * 年間読書まとめ（Spotify Wrapped型）カード。冊数・ジャンル・ベストブックを1枚に。
 */
const renderWrapped = (params: URLSearchParams) => {
  const user = trim(params.get('user') ?? 'kidoku user', 24)
  const year = trim(params.get('year') ?? '', 6)
  const count = params.get('count') ?? '0'
  const category = trim(params.get('category') ?? '', 16)
  const bestBook = trim(params.get('book') ?? '', 28)
  const imageParam = params.get('image') ?? ''
  const hasCover =
    imageParam.startsWith('http://') || imageParam.startsWith('https://')

  const stat = (label: string, value: string) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
      }}
    >
      <div style={{ fontSize: 24, color: '#cbd5e1' }}>{label}</div>
      <div style={{ fontSize: 40, fontWeight: 800, color: '#f8fafc' }}>
        {value || '—'}
      </div>
    </div>
  )

  return new ImageResponse(
    <div
      style={{
        ...baseStyle,
        color: '#f8fafc',
        background:
          'linear-gradient(135deg, #0f172a 0%, #4c1d95 55%, #be185d 100%)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 38, fontWeight: 700, color: '#f8fafc' }}>
          kidoku
        </div>
        <div style={{ fontSize: 30, color: '#f9a8d4' }}>
          {`${year} 読書まとめ`}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flex: 1,
          }}
        >
          <div style={{ fontSize: 26, color: '#e9d5ff' }}>{user}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <div style={{ fontSize: 120, fontWeight: 900, lineHeight: 1 }}>
              {count}
            </div>
            <div style={{ fontSize: 44, fontWeight: 700 }}>冊</div>
          </div>
          <div style={{ display: 'flex', gap: '48px', marginTop: '12px' }}>
            {stat('よく読んだジャンル', category)}
            {stat('ベストブック', bestBook)}
          </div>
        </div>
        {hasCover ? (
          <img
            src={imageParam}
            width={220}
            height={330}
            style={{
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              objectFit: 'cover',
            }}
          />
        ) : null}
      </div>

      <div style={{ fontSize: 26, color: '#f9a8d4' }}>https://kidoku.net</div>
    </div>,
    { width, height }
  )
}

const renderBook = (params: URLSearchParams) => {
  const user = trim(params.get('user') ?? 'kidoku user', 24)
  const title = trim(params.get('title') ?? '本の詳細', 44)
  const subtitle = trim(params.get('author') ?? 'book detail', 50)
  const value = trim(params.get('category') ?? '', 20)
  const imageParam = params.get('image') ?? ''
  const hasCover =
    imageParam.startsWith('http://') || imageParam.startsWith('https://')

  return new ImageResponse(
    <div style={baseStyle}>
      {header('読書記録をシェア')}
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
      {footer()}
    </div>,
    { width, height }
  )
}

const renderYear = (params: URLSearchParams) => {
  const user = trim(params.get('user') ?? 'kidoku user', 24)
  const title = trim(params.get('title') ?? '今年読んだ冊数', 28)
  const subtitle = trim(params.get('subtitle') ?? '読書記録サマリー', 52)
  const value = `${params.get('count') ?? '0'}冊`

  return new ImageResponse(
    <div style={baseStyle}>
      {header('読書記録をシェア')}
      <div style={cardStyle}>
        <div style={{ fontSize: 28, color: '#334155' }}>{user}</div>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ fontSize: 34, color: '#334155' }}>{subtitle}</div>
        <div style={{ fontSize: 48, fontWeight: 700, color: '#0f766e' }}>
          {value}
        </div>
      </div>
      {footer()}
    </div>,
    { width, height }
  )
}

export default function handler(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') ?? 'year'

  switch (type) {
    case 'ai':
      return renderAi(searchParams)
    case 'wrapped':
      return renderWrapped(searchParams)
    case 'book':
      return renderBook(searchParams)
    default:
      return renderYear(searchParams)
  }
}
