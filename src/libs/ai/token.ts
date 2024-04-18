export const getToken = async (text: string) => {
  return await fetch(process.env.TIKTOKEN_URL, {
    method: 'POST',
    body: JSON.stringify({ text }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json())
}
