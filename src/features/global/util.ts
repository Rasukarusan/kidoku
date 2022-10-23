export const login = async (pass: string): Promise<boolean> => {
  return await fetch(`/api/login?pass=${pass}`, { method: 'POST' })
    .then((res) => res.json())
    .then((res) => res)
}

export const logout = async (): Promise<boolean> => {
  return await fetch(`/api/logout`, { method: 'POST' })
    .then((res) => res.json())
    .then((res) => res)
}

export const auth = async (): Promise<boolean> => {
  return await fetch('/api/auth')
    .then((res) => res.json())
    .then((res) => res)
}
