import { Fragment } from 'react'
import Linkify from 'linkify-react'

/**
 * \nを<br>に変換したコンポーネント
 */
export const Memo = ({ memo }) => {
  if (!memo) return null
  const texts = memo.split(/(\n)/).map((item, index) => {
    return <Fragment key={index}>{item.match(/\n/) ? <br /> : item}</Fragment>
  })
  return (
    <Linkify
      as="div"
      options={{ className: 'text-blue-500', target: '_blank' }}
    >
      {texts}
    </Linkify>
  )
}
