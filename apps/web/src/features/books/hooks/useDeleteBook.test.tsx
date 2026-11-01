import { act, renderHook } from '@testing-library/react'
import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'
import { bookDeleteNoticeAtom, useDeleteBook } from './useDeleteBook'

const refetchQueries = jest.fn().mockResolvedValue(undefined)
jest.mock('@apollo/client', () => ({
  useApolloClient: () => ({ refetchQueries }),
}))
jest.mock('@/utils/localStorage', () => ({ removeBookDraft: jest.fn() }))
const { removeBookDraft } = jest.requireMock('@/utils/localStorage')

const book = { id: 12, title: 'テストの本' }
const setup = () => {
  const store = createStore()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  )
  const hook = renderHook(() => useDeleteBook(), { wrapper })
  return { ...hook, store }
}

beforeEach(() => {
  jest.clearAllMocks()
  window.confirm = jest.fn().mockReturnValue(true)
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ result: true }) })
})

it('shows success after deletion, refreshes the list and closes the details', async () => {
  const { result, store } = setup()
  const close = jest.fn()
  await act(async () => {
    await result.current.deleteBook(book, close)
  })
  expect(store.get(bookDeleteNoticeAtom)).toEqual({
    text: '『テストの本』を削除しました',
    error: false,
  })
  expect(removeBookDraft).toHaveBeenCalledWith('12')
  expect(refetchQueries).toHaveBeenCalledWith({ include: ['GetBooks'] })
  expect(close).toHaveBeenCalledTimes(1)
})

it.each(['http', 'result', 'network'])(
  'keeps details open and shows an error on %s failure',
  async (failure) => {
    if (failure === 'network')
      (fetch as jest.Mock).mockRejectedValue(new Error('offline'))
    else
      (fetch as jest.Mock).mockResolvedValue({
        ok: failure !== 'http',
        json: async () => ({ result: false }),
      })
    const { result, store } = setup()
    const close = jest.fn()
    await act(async () => {
      await result.current.deleteBook(book, close)
    })
    expect(store.get(bookDeleteNoticeAtom)?.error).toBe(true)
    expect(close).not.toHaveBeenCalled()
    expect(removeBookDraft).not.toHaveBeenCalled()
    expect(refetchQueries).not.toHaveBeenCalled()
    expect(result.current.deleting).toBe(false)
  }
)

it('does nothing when cancelled', async () => {
  ;(window.confirm as jest.Mock).mockReturnValue(false)
  const { result, store } = setup()
  await act(async () => {
    await result.current.deleteBook(book, jest.fn())
  })
  expect(fetch).not.toHaveBeenCalled()
  expect(store.get(bookDeleteNoticeAtom)).toBeNull()
})

it('prevents duplicate requests while deletion is pending', async () => {
  let finish: (value: unknown) => void
  ;(fetch as jest.Mock).mockReturnValue(
    new Promise((resolve) => {
      finish = resolve
    })
  )
  const { result } = setup()
  let pending: Promise<void>
  act(() => {
    pending = result.current.deleteBook(book, jest.fn())
  })
  expect(result.current.deleting).toBe(true)
  await act(async () => {
    await result.current.deleteBook(book, jest.fn())
  })
  expect(fetch).toHaveBeenCalledTimes(1)
  await act(async () => {
    finish({ ok: true, json: async () => ({ result: true }) })
    await pending
  })
  expect(result.current.deleting).toBe(false)
})
