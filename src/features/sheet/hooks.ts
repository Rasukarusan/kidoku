import { useEffect, useState } from 'react'

export function useCountUp(value: number) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let i = 0
    // カウントアップのステップをvalueによって調整する。valueが大きい場合カウントし終わるのが長くなってしまうため。
    const incrementStep = 50
    const interval = setInterval(() => {
      i = i + incrementStep
      setCount(i)
      if (i > value) {
        setCount(value)
        clearInterval(interval)
      }
    }, 10)
  }, [value])
  return count
}
