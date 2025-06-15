export const fetcher = (
  url: string,
  params?: Record<string, string>
): Promise<unknown> => {
  if (params) {
    const query = new URLSearchParams(params).toString()
    url += '?' + query
  }
  return fetch(url).then((res) => res.json())
}
