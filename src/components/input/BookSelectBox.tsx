interface Props {
  value: string
  label: string
  tabIndex: number
  readonly?: boolean
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
  isChanged?: boolean
}

export const BookSelectBox: React.FC<Props> = ({
  value,
  label,
  tabIndex,
  readonly = false,
  // eslint-disable-next-line
  onChange = () => {},
  isChanged = false,
}) => {
  const values = { great: '◎', good: '◯', bad: '✗' }
  return (
    <div className="mb-1 pr-4 sm:pr-12">
      <div className="mb-1 text-xs text-gray-400">{label}</div>
      <select
        disabled={readonly}
        className={`w-full px-2 py-1 text-sm sm:text-base ${
          readonly
            ? 'resize-none appearance-none border-b bg-white'
            : 'cursor-pointer bg-slate-100'
        } ${isChanged ? 'border-2 border-orange-400' : ''}`}
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
