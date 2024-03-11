interface Props {
  sheet: string
  onClick: () => void
}

export const AiReGenerateButton: React.FC<Props> = ({ sheet, onClick }) => {
  return (
    <>
      <button
        className="m-4 rounded-md border border-ai px-6 py-3 text-ai hover:brightness-110"
        onClick={onClick}
      >
        AI分析を実行する
      </button>
    </>
  )
}
