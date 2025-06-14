import { useEffect, useRef } from 'react'
import Router from 'next/router'
import LoadingBar, { LoadingBarRef, IProps } from 'react-top-loading-bar'

export const LoadingTopBar: React.FC<IProps> = (props) => {
  const ref = useRef<LoadingBarRef>(null)

  useEffect(() => {
    const handleRouteStart = () => ref.current.continuousStart()
    const handleRouteDone = () => ref.current.complete()

    Router.events.on('routeChangeStart', handleRouteStart)
    Router.events.on('routeChangeComplete', handleRouteDone)
    Router.events.on('routeChangeError', handleRouteDone)

    return () => {
      Router.events.off('routeChangeStart', handleRouteStart)
      Router.events.off('routeChangeComplete', handleRouteDone)
      Router.events.off('routeChangeError', handleRouteDone)
    }
  }, [])

  return <LoadingBar color="#f11946" ref={ref} height={3} {...props} />
}
