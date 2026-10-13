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
      backgroundColor: 'var(--ui-control-bg)',
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
        classNamePrefix="book-select"
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: 'var(--ui-select-primary)',
            primary25: 'var(--ui-select-focused)',
            primary50: 'var(--ui-select-active)',
            neutral0: 'var(--ui-surface)',
            neutral5: 'var(--ui-control-bg)',
            neutral10: 'var(--ui-divider)',
            neutral20: 'var(--ui-border)',
            neutral30: 'var(--ui-muted)',
            neutral40: 'var(--ui-muted)',
            neutral50: 'var(--ui-muted)',
            neutral60: 'var(--ui-text)',
            neutral70: 'var(--ui-text)',
            neutral80: 'var(--ui-text)',
            neutral90: 'var(--ui-text)',
          },
        })}
        styles={{
          ...customStyles,
          dropdownIndicator: (base) => ({
            ...base,
            color: 'var(--ui-muted)',
            '&:hover': { color: 'var(--ui-text)' },
          }),
          clearIndicator: (base) => ({
            ...base,
            color: 'var(--ui-muted)',
            '&:hover': { color: 'var(--ui-text)' },
          }),
          option: (base, state) => ({
            ...base,
            color: state.isSelected
              ? 'var(--ui-select-selected-text)'
              : 'var(--ui-text)',
          }),
        }}
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
