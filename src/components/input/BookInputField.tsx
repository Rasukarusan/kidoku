import { Label } from './Label'

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
      <Label text={label} />
      <textarea
        rows={rows}
        value={value}
        className={`no-scrollbar w-full rounded-md py-1 pl-2 text-sm sm:text-base ${
          readonly ? 'resize-none border-b bg-white' : 'bg-slate-100'
        } ${isChanged ? 'border-2 border-orange-400' : ''}`}
        onChange={onChange}
        tabIndex={tabIndex}
        disabled={readonly}
      />
    </div>
  )
}
