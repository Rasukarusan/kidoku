/* eslint-disable */
import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const hasTitle = searchParams.has('title')
  const title = hasTitle
    ? searchParams.get('title')?.slice(0, 100)
    : 'My default title'

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          padding: 60,
          backgroundImage: 'linear-gradient(to right, #334d50, #cbcaa5)',
          height: '100%',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            borderRadius: 10,
            backgroundColor: 'white',
            width: '100%',
            height: '100%',
          }}
        >
          <h2
            style={{
              fontSize: 44,
              fontWeight: 'bold',
              width: '65%',
              textAlign: 'center',
              fontFamily: '"ZenMaruGothic"',
            }}
          >
            {title}
          </h2>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 600,
    }
  )
}
