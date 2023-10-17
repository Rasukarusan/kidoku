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
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <select
        disabled={readonly}
        className={`px-2 py-1 w-full text-sm sm:text-base ${
          readonly
            ? 'bg-white resize-none border-b appearance-none'
            : 'bg-slate-100 cursor-pointer'
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
