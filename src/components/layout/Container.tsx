interface Props {
  className?: string
  children: React.ReactNode
}

export const Container: React.FC<Props> = ({ children, className = '' }) => {
  return (
    <div
      className={`sm:max-w-[900px] lg:max-w-[1200px] px-4 sm:px-6 w-full mx-auto ${className}`}
    >
      {children}
    </div>
  )
}
