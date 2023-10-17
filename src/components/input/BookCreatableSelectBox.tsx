import CreatableSelect from 'react-select/creatable'
import { ActionMeta } from 'react-select'
import type Option from 'react-select'

interface Props {
  label: string
  tabIndex: number
  onChange?: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void
  defaultValue: unknown
  options: Option[]
  isChanged?: boolean
}

export const BookCreatableSelectBox: React.FC<Props> = ({
  label,
  tabIndex,
  defaultValue,
  options,
  // eslint-disable-next-line
  onChange = () => {},
  isChanged = false,
}) => {
  const formatCreateLabel = (inputValue) => `「${inputValue}」を作成`
  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: isChanged ? 'solid #f6ad54 2px' : 'unset',
      backgroundColor: '#f1f5f9',
      '&:hover': {
        border: isChanged ? 'solid #f6ad54 2px' : 'unset',
        cursor: 'pointer',
      },
    }),
  }
  return (
    <div className="mb-1">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <CreatableSelect
        styles={customStyles}
        defaultValue={defaultValue}
        isClearable
        options={options}
        formatCreateLabel={formatCreateLabel}
        onChange={onChange}
      />
    </div>
  )
}
