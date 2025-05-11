import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export const StoreAccessToken = () => {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      localStorage.setItem('accessToken', session.accessToken)
    } else if (status === 'unauthenticated') {
      localStorage.removeItem('accessToken')
    }
  }, [status, session?.accessToken])
  return <></>
}
