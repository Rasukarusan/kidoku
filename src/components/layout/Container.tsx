interface Props {
  className?: string
  children: React.ReactNode
}

export const Container: React.FC<Props> = ({ children, className = '' }) => {
  return (
    <div
      className={`mx-auto w-full px-4 sm:max-w-[900px] sm:px-6 lg:max-w-[1200px] ${className}`}
    >
      {children}
    </div>
  )
}
