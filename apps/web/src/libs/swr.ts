export const fetcher = <T = unknown>(
  url: string,
  params?: Record<string, string>
): Promise<T> => {
  if (params) {
    const query = new URLSearchParams(params).toString()
    url += '?' + query
  }
  return fetch(url).then((res) => res.json())
}
