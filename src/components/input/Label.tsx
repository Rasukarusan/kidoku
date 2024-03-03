import { twMerge } from 'tailwind-merge'

interface Props {
  text: string
  className?: string
}

export const Label: React.FC<Props> = ({ text, className = '' }) => {
  return (
    <div
      className={twMerge('mb-1 text-2xs text-gray-400 sm:text-xs', className)}
    >
      {text}
    </div>
  )
}
