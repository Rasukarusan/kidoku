import { twMerge } from 'tailwind-merge'

interface Props {
  text: string
  className?: string
}

export const Label: React.FC<Props> = ({ text, className = '' }) => {
  return (
    <div className={twMerge('mb-1 text-xs text-gray-300', className)}>
      {text}
    </div>
  )
}
