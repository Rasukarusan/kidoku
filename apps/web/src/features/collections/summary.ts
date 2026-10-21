import type { Item } from './types'

export interface CollectionFilter {
  collectionId?: number
  itemTypeId?: string
  year?: string
  logKind?: string
  query?: string
  unassigned?: boolean
}

export function collectionSummary(source: Item[], filter: CollectionFilter) {
  const unique = [...new Map(source.map((item) => [item.id, item])).values()]
  const matchesLog = (log: Item['logs'][number]) =>
    (!filter.logKind || log.kind === filter.logKind) &&
    (!filter.year || log.occurredAt?.startsWith(`${filter.year}-`))
  const items = unique.filter(
    (item) =>
      (!filter.collectionId ||
        item.collectionIds.includes(filter.collectionId)) &&
      (!filter.itemTypeId || item.itemTypeId === filter.itemTypeId) &&
      (!filter.query ||
        item.title.toLowerCase().includes(filter.query.toLowerCase())) &&
      (!filter.unassigned || !item.collectionIds.length) &&
      (!(filter.year || filter.logKind) || item.logs.some(matchesLog))
  )
  const logs = items.flatMap((item) => item.logs.filter(matchesLog))
  const monthly: Record<string, number> = {}
  for (const log of logs) {
    if (!log.occurredAt) continue
    const month = log.occurredAt.slice(0, 7)
    monthly[month] = (monthly[month] ?? 0) + 1
  }
  return {
    items,
    logCount: logs.length,
    monthly: Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b)),
  }
}
