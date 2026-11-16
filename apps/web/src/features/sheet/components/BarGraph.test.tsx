import { act, render } from '@testing-library/react'
import { Bar, ComposedChart, XAxis } from 'recharts'
import { Book } from '@/types/book'
import { BarGraph } from './BarGraph'

// Recharts needs browser layout; inspect the data and handlers passed to it.
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <>{children}</>,
  ComposedChart: jest.fn(({ children }) => <>{children}</>),
  XAxis: jest.fn(() => null),
  CartesianGrid: () => null,
  Tooltip: () => null,
  Bar: jest.fn(() => null),
  Line: () => null,
  Cell: () => null,
}))

const book = (id: number, month: Book['month']): Book => ({
  id,
  userId: 'reader',
  month,
  title: `Book ${id}`,
  author: '',
  category: '',
  image: '',
  impression: '-',
  memo: '',
  finished: `2026-${month.replace('月', '').padStart(2, '0')}-01`,
  isPublicMemo: false,
  isPurchasable: false,
})

const chartData = () =>
  (ComposedChart as unknown as jest.Mock).mock.calls.at(-1)[0].data
const clickMonth = (index: number) => {
  act(() => {
    ;(Bar as unknown as jest.Mock).mock.calls
      .at(-1)[0]
      .onClick(chartData()[index], index)
  })
}

beforeEach(() => jest.clearAllMocks())

it('shows January through December in calendar order with monthly and cumulative counts', () => {
  const records = [
    book(1, '8月'),
    book(2, '6月'),
    book(3, '2月'),
    book(4, '6月'),
  ]
  const original = [...records]
  render(
    <BarGraph records={records} setShowData={jest.fn()} setFilter={jest.fn()} />
  )

  expect(chartData().map(({ name }) => name)).toEqual([
    '1月',
    '2月',
    '3月',
    '4月',
    '5月',
    '6月',
    '7月',
    '8月',
    '9月',
    '10月',
    '11月',
    '12月',
  ])
  expect(chartData().map(({ count }) => count)).toEqual([
    0, 1, 0, 0, 0, 2, 0, 1, 0, 0, 0, 0,
  ])
  expect(chartData().map(({ sum }) => sum)).toEqual([
    0, 1, 1, 1, 1, 3, 3, 4, 4, 4, 4, 4,
  ])
  expect((XAxis as unknown as jest.Mock).mock.calls.at(-1)[0].interval).toBe(0)
  expect(records).toEqual(original)
})

it('shows all twelve months for an empty sheet and recalculates when the sheet changes', () => {
  const props = { setShowData: jest.fn(), setFilter: jest.fn() }
  const { rerender } = render(
    <BarGraph {...props} records={[book(1, '1月')]} />
  )
  rerender(<BarGraph {...props} records={[]} />)

  expect(chartData()).toHaveLength(12)
  expect(
    chartData().every(
      ({ count, sum, children }) =>
        count === 0 && sum === 0 && children.length === 0
    )
  ).toBe(true)

  rerender(<BarGraph {...props} records={[book(2, '12月')]} />)
  expect(chartData()[0].sum).toBe(0)
  expect(chartData()[11]).toMatchObject({ count: 1, sum: 1 })
})

it('filters by the clicked month, clears on a second click, and handles zero-book months', () => {
  const records = [book(1, '12月'), book(2, '1月'), book(3, '12月')]
  const setShowData = jest.fn()
  const setFilter = jest.fn()
  render(
    <BarGraph
      records={records}
      setShowData={setShowData}
      setFilter={setFilter}
    />
  )

  clickMonth(11)
  expect(setFilter).toHaveBeenLastCalledWith('12月')
  expect(setShowData).toHaveBeenLastCalledWith([records[0], records[2]])
  clickMonth(11)
  expect(setFilter).toHaveBeenLastCalledWith('')
  expect(setShowData).toHaveBeenLastCalledWith(records)
  clickMonth(1)
  expect(setFilter).toHaveBeenLastCalledWith('2月')
  expect(setShowData).toHaveBeenLastCalledWith([])
})
