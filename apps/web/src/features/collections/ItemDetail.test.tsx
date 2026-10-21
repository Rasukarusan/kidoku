import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { ItemDetail } from './ItemDetail'
import { itemQuery } from './api'
import type { Item, ItemType } from './types'

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: 'owner' } } }),
}))
jest.mock('next/router', () => ({ useRouter: () => ({ push: jest.fn() }) }))
jest.mock(
  'next/link',
  () =>
    function Link({
      href,
      children,
    }: {
      href: string
      children: React.ReactNode
    }) {
      return <a href={href}>{children}</a>
    }
)
jest.mock('next-seo', () => ({ NextSeo: () => null }))
jest.mock('@/features/sheet/components/BookDetailReadModal', () => ({
  BookDetailReadModal: () => null,
}))
jest.mock('@/features/sheet/components/Memo', () => ({
  Memo: ({ memo }: { memo: string }) => <p>{memo}</p>,
}))
jest.mock('./ItemForm', () => ({
  ItemForm: ({ item }: { item: { memo: string } }) => (
    <p data-testid="editing-memo">{item.memo}</p>
  ),
}))

const item: Item = {
  id: 99,
  userId: 'owner',
  itemTypeId: 'movie',
  title: '映画',
  imageUrl: '/no-image.png',
  category: '',
  rating: '-',
  memo: '',
  isPublicMemo: false,
  isPurchasable: false,
  price: null,
  attributes: {},
  attributesVersion: 1,
  collectionIds: [],
  logs: [],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}
const types: ItemType[] = [
  {
    key: 'movie',
    name: '映画',
    schemaVersion: 1,
    definition: { fields: [], logKinds: [], itemUnit: '作品' },
  },
]
const props = {
  item,
  types,
  user: { id: 'owner', name: 'owner' },
  collections: [],
}

it('waits for the owner memo before allowing edits to a public SSR snapshot', async () => {
  render(
    <MockedProvider
      addTypename={false}
      mocks={[
        {
          request: { query: itemQuery, variables: { id: 99 } },
          delay: 30,
          result: {
            data: {
              item: {
                ...item,
                __typename: 'ItemResponse',
                memo: '非公開の元のメモ',
              },
              itemTypes: types,
              collections: [],
            },
          },
        },
      ]}
    >
      <ItemDetail {...props} />
    </MockedProvider>
  )
  expect(screen.queryByRole('button', { name: '編集' })).not.toBeInTheDocument()
  fireEvent.click(await screen.findByRole('button', { name: '編集' }))
  expect(screen.getByTestId('editing-memo')).toHaveTextContent(
    '非公開の元のメモ'
  )
})

it('does not display or edit data cached for a different owner', async () => {
  const result = jest.fn(() => ({
    data: {
      item: {
        ...item,
        __typename: 'ItemResponse',
        userId: 'other',
        memo: '別の所有者のメモ',
      },
      itemTypes: types,
      collections: [],
    },
  }))
  render(
    <MockedProvider
      addTypename={false}
      mocks={[{ request: { query: itemQuery, variables: { id: 99 } }, result }]}
    >
      <ItemDetail {...props} />
    </MockedProvider>
  )
  await waitFor(() => expect(result).toHaveBeenCalled())
  expect(screen.queryByText('別の所有者のメモ')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: '編集' })).not.toBeInTheDocument()
})
