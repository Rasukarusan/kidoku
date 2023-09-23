// eslint-disable-next-line
export const fetcher = (url: string): Promise<any> =>
  fetch(url).then((res) => res.json())
