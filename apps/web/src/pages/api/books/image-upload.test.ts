/** @jest-environment node */
import { Readable } from 'stream'
import { parseBody } from 'next/dist/server/api-utils/node/parse-body'
import bookHandler, { config as bookConfig } from './index'
import templateHandler, { config as templateConfig } from '../template/books'
import { IMAGE_SIZE_ERROR, MAX_IMAGE_BYTES } from '@/utils/imageUpload'

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn().mockResolvedValue({ user: { id: 'user-1' } }),
}))
jest.mock('@/pages/api/auth/[...nextauth]', () => ({ authOptions: {} }))
jest.mock('@/libs/prisma', () => ({
  __esModule: true,
  default: {
    item: { update: jest.fn() },
    itemTemplate: {
      create: jest.fn().mockResolvedValue({ id: 1 }),
      update: jest.fn(),
    },
  },
}))
jest.mock('@/libs/graphql/backend-client', () => ({
  graphqlClient: {
    execute: jest.fn().mockResolvedValue({ saveItem: { id: 1 } }),
  },
}))
jest.mock('@/libs/sharp/bufferToWebp', () => ({
  bufferToWebp: jest.fn().mockResolvedValue(Buffer.from('webp')),
}))
jest.mock('@vercel/blob', () => ({
  put: jest.fn().mockResolvedValue({ url: 'https://example.com/image.webp' }),
}))

const prisma = jest.requireMock('@/libs/prisma').default
const { graphqlClient } = jest.requireMock('@/libs/graphql/backend-client')
const { bufferToWebp } = jest.requireMock('@/libs/sharp/bufferToWebp')

const response = () => {
  const res = { status: jest.fn(), json: jest.fn(), revalidate: jest.fn() }
  res.status.mockReturnValue(res)
  return res
}

// Exercise the Next.js body parser too: the original 3mb setting rejects this payload.
const request = async (
  bytes: number,
  config: typeof bookConfig,
  method: string
) => {
  const image = `data:image/png;base64,${Buffer.alloc(bytes).toString('base64')}`
  const body = JSON.stringify({
    id: 1,
    image,
    title: '本',
    sheet: { id: 1, name: '本棚' },
    memo: 'メモ'.repeat(1000),
  })
  const stream = Readable.from([body])
  Object.assign(stream, { headers: { 'content-type': 'text/plain' } })
  return {
    method,
    body: await parseBody(
      stream as never,
      config.api.bodyParser.sizeLimit as '5mb'
    ),
  }
}

beforeEach(() => jest.clearAllMocks())

describe.each([
  ['book POST', bookHandler, bookConfig, 'POST'],
  ['book PUT', bookHandler, bookConfig, 'PUT'],
  ['template POST', templateHandler, templateConfig, 'POST'],
] as const)('%s image upload', (_label, handler, config, method) => {
  it.each([MAX_IMAGE_BYTES - 1, MAX_IMAGE_BYTES])(
    'accepts an image of %i bytes after Base64 expansion',
    async (bytes) => {
      const res = response()
      await handler(await request(bytes, config, method), res)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(bufferToWebp).toHaveBeenCalledTimes(1)
      expect(bufferToWebp.mock.calls[0][0].equals(Buffer.alloc(bytes))).toBe(
        true
      )
    }
  )

  it('rejects over 3MiB before saving or uploading', async () => {
    const res = response()
    await handler(await request(MAX_IMAGE_BYTES + 1, config, method), res)
    expect(res.status).toHaveBeenCalledWith(413)
    expect(res.json).toHaveBeenCalledWith({
      result: false,
      message: IMAGE_SIZE_ERROR,
    })
    expect(graphqlClient.execute).not.toHaveBeenCalled()
    expect(prisma.itemTemplate.create).not.toHaveBeenCalled()
    expect(bufferToWebp).not.toHaveBeenCalled()
  })
})
