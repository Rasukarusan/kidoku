import { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export const Modal: React.FC<Props> = ({
  open,
  onClose,
  children,
  className = '',
}) => {
  useEffect(() => {
    if (open) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed w-full h-full backdrop-blur-[4px] flex justify-center items-center z-[1000] left-0 top-0 bg-[rgba(0,0,0,0.1)] overflow-y-hidden p-8"
      onClick={onClose}
    >
      <div
        className={`w-full sm:w-2/3 bg-white h-2/3 sm:h-3/4 rounded-md flex-col flex m-2 sm:m-0 text-gray-700 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
