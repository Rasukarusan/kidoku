import { useEffect, useState } from 'react'

export function useCountUp(value: number) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i = i + 1
      setCount(i)
      if (i > value) {
        setCount(value)
        clearInterval(interval)
      }
    }, 10)
  }, [value])
  return count
}
