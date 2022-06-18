import { useEffect, useRef } from 'react'

export function usePrevious(value: any) {
  const ref = useRef(null)
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}
