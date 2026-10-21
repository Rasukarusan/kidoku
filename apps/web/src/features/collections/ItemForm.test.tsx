import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { ItemForm } from './ItemForm'
import { definitionsQuery, saveItemMutation } from './api'

const push = jest.fn().mockResolvedValue(true)
jest.mock('next/router', () => ({ useRouter: () => ({ query: {}, push }) }))
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'owner' } },
    status: 'authenticated',
  }),
}))
jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useSetAtom: () => jest.fn(),
}))
jest.mock('@/components/button/ImagePicker', () => ({
  ImagePicker: () => <div />,
}))
jest.mock(
  'next/dynamic',
  () => () =>
    function Editor() {
      return <div />
    }
)

const definitions = {
  itemTypes: [
    {
      key: 'book',
      name: '本',
      schemaVersion: 1,
      definition: {
        fields: [{ key: 'authors', label: '著者', type: 'textList' }],
        logKinds: [{ key: 'read', label: '読了', dateLabel: '読了日' }],
        itemUnit: '冊',
      },
    },
    {
      key: 'movie',
      name: '映画',
      schemaVersion: 1,
      definition: {
        fields: [{ key: 'directors', label: '監督', type: 'textList' }],
        logKinds: [{ key: 'watched', label: '鑑賞', dateLabel: '鑑賞日' }],
        itemUnit: '作品',
      },
    },
    {
      key: 'exhibition',
      name: '展示',
      schemaVersion: 1,
      definition: {
        fields: [{ key: 'venue', label: '会場', type: 'text', required: true }],
        logKinds: [{ key: 'visited', label: '訪問', dateLabel: '訪問日' }],
        itemUnit: '展',
      },
    },
  ],
  collections: [
    {
      id: 10,
      userId: 'owner',
      name: 'お気に入り',
      highlights: [],
      description: '',
      itemCount: 0,
    },
  ],
}
const definitionMock = {
  request: { query: definitionsQuery },
  result: { data: definitions },
}

it('renders a third type and its fields directly from the server definition', async () => {
  render(
    <MockedProvider mocks={[definitionMock]} addTypename={false}>
      <ItemForm />
    </MockedProvider>
  )
  fireEvent.change(await screen.findByLabelText('種類'), {
    target: { value: 'exhibition' },
  })
  expect(screen.getByLabelText('会場（必須）')).toBeRequired()
  expect(screen.queryByLabelText(/^著者/)).not.toBeInTheDocument()
  fireEvent.click(screen.getByLabelText('履歴も記録する'))
  expect(screen.getByText('訪問日')).toBeInTheDocument()
})

it('saves multiple directors and a viewing log with the selected collection', async () => {
  const saved = jest.fn(() => ({
    data: {
      saveItem: {
        id: 99,
        userId: 'owner',
        itemTypeId: 'movie',
        title: 'テスト映画',
        imageUrl: '/no-image.png',
        category: '',
        rating: '-',
        memo: '',
        isPublicMemo: false,
        isPurchasable: false,
        price: null,
        attributes: { directors: ['監督A', '監督B'] },
        attributesVersion: 1,
        collectionIds: [10],
        logs: [],
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
    },
  }))
  render(
    <MockedProvider
      mocks={[
        definitionMock,
        {
          request: {
            query: saveItemMutation,
            variables: {
              input: {
                itemTypeId: 'movie',
                title: 'テスト映画',
                imageUrl: '/no-image.png',
                category: '',
                rating: '-',
                memo: '',
                isPublicMemo: false,
                attributes: { directors: ['監督A', '監督B'] },
                collectionIds: [10],
                initialLog: {
                  kind: 'watched',
                  occurredAt: '2026-01-02T00:00:00.000Z',
                  memo: '',
                  rating: null,
                },
              },
            },
          },
          result: saved,
        },
      ]}
      addTypename={false}
    >
      <ItemForm />
    </MockedProvider>
  )
  fireEvent.change(await screen.findByLabelText('種類'), {
    target: { value: 'movie' },
  })
  fireEvent.change(screen.getByLabelText('タイトル'), {
    target: { value: 'テスト映画' },
  })
  const directors = screen.getByLabelText(/^監督/)
  fireEvent.change(directors, { target: { value: '監督A、' } })
  expect(directors).toHaveValue('監督A、')
  fireEvent.change(directors, { target: { value: '監督A、監督B' } })
  fireEvent.click(screen.getByLabelText('お気に入り'))
  fireEvent.click(screen.getByLabelText('履歴も記録する'))
  fireEvent.change(screen.getByLabelText(/^鑑賞日/), {
    target: { value: '2026-01-02' },
  })
  fireEvent.click(screen.getByRole('button', { name: '保存する' }))
  await waitFor(() => expect(saved).toHaveBeenCalled())
  await waitFor(() => expect(push).toHaveBeenCalledWith('/items/99'))
})
