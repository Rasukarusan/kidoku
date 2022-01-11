import React from 'react'
import Link from 'next/link'
const Index: React.FC = () => {
  const [count, setCount] = React.useState(1)
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <Link href="/movie">動画</Link>
    </div>
  )
}
export default Index
