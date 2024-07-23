import CreatableSelect from 'react-select/creatable'
import { ActionMeta } from 'react-select'
import type Option from 'react-select'
import { Label } from './Label'

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
          valueContainer: (state) => '!p-0',
          singleValue: (state) => '!py-0 !px-2 !m-0',
          input: (state) => '!py-0 !px-2 !m-0',
          placeholder: (state) => 'text-[0.6rem] sm:text-xs py-0 px-2',
          dropdownIndicator: (state) => '!p-[2px]',
          clearIndicator: (state) => '!p-[2px]',
          indicatorSeparator: (state) => '!my-[6px] !mx-0',
        }}
        className="text-sm"
        styles={customStyles}
        menuPosition="fixed"
        defaultValue={defaultValue}
        isClearable
        options={options}
        formatCreateLabel={formatCreateLabel}
        onChange={onChange}
        placeholder="入力して作成"
      />
    </div>
  )
}
