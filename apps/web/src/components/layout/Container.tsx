interface Props {
  className?: string
  children: React.ReactNode
}

export const Container: React.FC<Props> = ({ children, className = '' }) => {
  return (
    <div
      className={`mx-auto w-full px-4 sm:max-w-[800px] sm:px-6 lg:max-w-[960px] ${className}`}
    >
      {children}
    </div>
  )
}
