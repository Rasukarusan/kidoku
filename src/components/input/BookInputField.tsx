interface Props {
  value: string
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  label: string
  tabIndex: number
  rows?: number
  readonly?: boolean
  isChanged?: boolean
}

export const BookInputField: React.FC<Props> = ({
  value,
  onChange = null,
  label,
  tabIndex,
  rows = 1,
  readonly = false,
  isChanged = false,
}) => {
  return (
    <div className="mb-1">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <textarea
        rows={rows}
        value={value}
        className={`pl-2 py-1  w-full text-sm sm:text-base ${
          readonly ? 'bg-white resize-none border-b' : 'bg-slate-100'
        } ${isChanged ? 'border-2 border-orange-400' : ''}`}
        onChange={onChange}
        tabIndex={tabIndex}
        disabled={readonly}
      />
    </div>
  )
}
