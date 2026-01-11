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
  maxLength?: number
  error?: string
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
      maxLength,
      error,
    },
    ref
  ) => {
    const showCounter = maxLength !== undefined && value
    const isOverLimit =
      maxLength !== undefined && value && value.length > maxLength
    return (
      <div>
        <div className="flex items-center justify-between">
          {label && <Label text={label} />}
          {showCounter && (
            <span
              className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}
            >
              {value.length}/{maxLength}
            </span>
          )}
        </div>
        <textarea
          ref={ref}
          rows={rows}
          value={value}
          className={`no-scrollbar w-full rounded-md px-2 py-1 text-sm ${
            readonly ? 'resize-none border-b bg-white' : 'bg-slate-100'
          } ${isChanged ? 'border-2 border-orange-400' : ''} ${error ? 'border-2 border-red-500' : ''}`}
          onChange={onChange}
          tabIndex={tabIndex}
          disabled={readonly}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

BookInputField.displayName = 'BookInputField'
