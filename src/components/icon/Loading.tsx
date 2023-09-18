interface Props {
  className?: string
}
export const Loading: React.FC<Props> = ({ className }) => {
  return (
    <div className="flex justify-center" aria-label="読み込み中">
      <div
        className={`animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent ${className}`}
      ></div>
    </div>
  )
}
