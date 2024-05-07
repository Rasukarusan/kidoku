interface Props {
  sheet: string
  onClick: () => void
  disabled: boolean
}

export const AiReGenerateButton: React.FC<Props> = ({
  sheet,
  onClick,
  disabled,
}) => {
  return (
    <>
      <button
        className="m-4 rounded-md border border-ai px-6 py-3 text-ai hover:brightness-110 disabled:border-gray-400   disabled:text-gray-400"
        onClick={onClick}
        disabled={disabled}
      >
        AI分析を実行する
      </button>
    </>
  )
}
