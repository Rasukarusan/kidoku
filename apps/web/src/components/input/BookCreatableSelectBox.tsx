import CreatableSelect from 'react-select/creatable'
import { ActionMeta } from 'react-select'
import { Label } from './Label'

interface OptionType {
  value: string
  label: string
}

interface Props {
  label: string
  tabIndex?: number
  onChange?: (newValue: unknown, actionMeta: ActionMeta<unknown>) => void
  defaultValue?: unknown
  value?: unknown
  options: OptionType[]
  isChanged?: boolean
}

export const BookCreatableSelectBox: React.FC<Props> = ({
  label,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tabIndex,
  defaultValue,
  value,
  options,
  // eslint-disable-next-line
  onChange = () => {},
  isChanged = false,
}) => {
  const formatCreateLabel = (inputValue) => `「${inputValue}」を作成`
  const customStyles = {
    control: (base) => ({
      ...base,
      minWidth: '120px',
      height: '30px',
      minHeight: '30px',
      border: isChanged ? 'solid #f6ad54 2px' : 'unset',
      backgroundColor: '#f1f5f9',
      '&:hover': {
        border: isChanged ? 'solid #f6ad54 2px' : 'unset',
        cursor: 'pointer',
      },
    }),
  }
  return (
    <div>
      <Label text={label} />
      <CreatableSelect
        classNames={{
          valueContainer: () => '!p-0',
          singleValue: () => '!py-0 !px-2 !m-0',
          input: () => '!py-0 !px-2 !m-0',
          placeholder: () => 'text-[0.6rem] sm:text-xs py-0 px-2',
          dropdownIndicator: () => '!p-[2px]',
          clearIndicator: () => '!p-[2px]',
          indicatorSeparator: () => '!my-[6px] !mx-0',
        }}
        className="text-sm"
        styles={customStyles}
        value={value !== undefined ? value : defaultValue}
        isClearable
        options={options}
        formatCreateLabel={formatCreateLabel}
        onChange={onChange}
        placeholder="入力して作成"
      />
    </div>
  )
}
