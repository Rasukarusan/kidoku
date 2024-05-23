import { twMerge } from 'tailwind-merge'

interface Props {
  text: string
  className?: string
}

export const Label: React.FC<Props> = ({ text, className = '' }) => {
  return (
    <div className={twMerge('text-xs text-gray-400', className)}>{text}</div>
  )
}
