import { Label } from './Label'

interface Props {
  value: string
  label: string
  tabIndex: number
  readonly?: boolean
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  isChanged?: boolean
}

export const BookDatePicker: React.FC<Props> = ({
  value,
  label,
  tabIndex,
  readonly = false,
  // eslint-disable-next-line
  onChange = () => {},
  isChanged = false,
}) => {
  return (
    <div>
      <Label text={label} />
      <input
        type="date"
        value={value}
        className={`w-full rounded-md py-1 pl-2 text-sm ${
          readonly
            ? 'resize-none appearance-none border-b bg-white'
            : 'cursor-pointer bg-slate-100'
        } ${isChanged ? 'border-2 border-orange-400' : ''}`}
        onChange={onChange}
        tabIndex={tabIndex}
        disabled={readonly}
      />
    </div>
  )
}
