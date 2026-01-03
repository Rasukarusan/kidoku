export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}
