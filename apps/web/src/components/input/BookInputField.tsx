import { forwardRef } from 'react'
import { Label } from './Label'

interface Props {
  value: string
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
  label?: string
  tabIndex: number
  rows?: number
  readonly?: boolean
  isChanged?: boolean
}

export const BookInputField = forwardRef<HTMLTextAreaElement, Props>(
  (
    {
      value,
      onChange = null,
      label = '',
      tabIndex,
      rows = 1,
      readonly = false,
      isChanged = false,
    },
    ref
  ) => {
    return (
      <div>
        {label && <Label text={label} />}
        <textarea
          ref={ref}
          rows={rows}
          value={value}
          className={`no-scrollbar w-full rounded-md px-2 py-1 text-sm ${
            readonly ? 'resize-none border-b bg-white' : 'bg-slate-100'
          } ${isChanged ? 'border-2 border-orange-400' : ''}`}
          onChange={onChange}
          tabIndex={tabIndex}
          disabled={readonly}
        />
      </div>
    )
  }
)

BookInputField.displayName = 'BookInputField'
