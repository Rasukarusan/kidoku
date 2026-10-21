import { collectionSummary } from './summary'
import type { Item } from './types'

const movie = {
  id: 1,
  title: '映画',
  itemTypeId: 'movie',
  collectionIds: [10, 20],
  logs: [
    { kind: 'watched', occurredAt: '2025-12-20T00:00:00Z' },
    { kind: 'watched', occurredAt: '2026-01-20T00:00:00Z' },
    { kind: 'purchased', occurredAt: null },
  ],
} as Item
const book = {
  id: 2,
  title: '本',
  itemTypeId: 'book',
  collectionIds: [10],
  logs: [{ kind: 'read', occurredAt: '2026-01-10T00:00:00Z' }],
} as Item

it('counts an item once across collections and counts repeat viewings separately', () => {
  const summary = collectionSummary([movie, movie], {})
  expect(summary.items).toHaveLength(1)
  expect(summary.logCount).toBe(3)
  expect(summary.monthly).toEqual([
    ['2025-12', 1],
    ['2026-01', 1],
  ])
})
it('filters actual dates without interpreting a collection name as a year', () => {
  const summary = collectionSummary([movie, book], {
    collectionId: 20,
    year: '2026',
    logKind: 'watched',
  })
  expect(summary.items.map((item) => item.id)).toEqual([1])
  expect(summary.logCount).toBe(1)
  expect(summary.monthly).toEqual([['2026-01', 1]])
})
it('excludes movies from reading statistics', () => {
  const summary = collectionSummary([movie, book], {
    itemTypeId: 'book',
    logKind: 'read',
  })
  expect(summary.items.map((item) => item.id)).toEqual([2])
  expect(summary.logCount).toBe(1)
})
it('retains unassigned and undated items in the unfiltered collection', () => {
  const item = {
    ...movie,
    collectionIds: [],
    logs: [{ ...movie.logs[0], occurredAt: null }],
  }
  expect(collectionSummary([item], { unassigned: true }).items).toHaveLength(1)
  expect(collectionSummary([item], { year: '2026' }).items).toHaveLength(0)
  expect(collectionSummary([item], {}).monthly).toEqual([])
})
