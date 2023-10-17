interface Props {
  value: string
  label: string
  tabIndex: number
  readonly?: boolean
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

export const BookSelectBox: React.FC<Props> = ({
  value,
  label,
  tabIndex,
  readonly = false,
  onChange = null,
}) => {
  const values = { great: '◎', good: '◯', bad: '✗' }
  return (
    <div className="mb-1 mr-12">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <select
        disabled={readonly}
        className={`px-2 py-1 w-full text-sm sm:text-base ${
          readonly
            ? 'bg-white resize-none border-b'
            : 'bg-slate-100 cursor-pointer'
        }`}
        onChange={onChange}
        tabIndex={tabIndex}
      >
        {Object.keys(values).map((key) => {
          const value = values[key]
          return (
            <option key={key} value={value}>
              {value}
            </option>
          )
        })}
      </select>
    </div>
  )
}
