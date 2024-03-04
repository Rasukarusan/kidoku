import { IconBaseProps } from 'react-icons'
import { FaQuestionCircle } from 'react-icons/fa'
import { twMerge } from 'tailwind-merge'
interface Props extends IconBaseProps {
  className?: string
}

export const HintIcon: React.FC<Props> = ({ className = '', ...props }) => {
  return (
    <FaQuestionCircle
      className={twMerge('h-3 w-3 text-slate-500', className)}
      {...props}
    />
  )
}
