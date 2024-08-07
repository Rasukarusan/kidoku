import { Label } from './Label'

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
  const values = ['-', '◎', '◯', '△', '✗']
  return (
    <div>
      <Label text={label} />
      <select
        disabled={readonly}
        className={`w-full rounded-md px-2 py-1 text-sm ${
          readonly
            ? 'resize-none appearance-none border-b bg-white'
            : 'cursor-pointer bg-slate-100'
        } ${isChanged ? 'border-2 border-orange-400' : ''}`}
        onChange={onChange}
        tabIndex={tabIndex}
        defaultValue={value}
      >
        {values.map((v) => {
          return (
            <option key={v} value={v}>
              {v}
            </option>
          )
        })}
      </select>
    </div>
  )
}
