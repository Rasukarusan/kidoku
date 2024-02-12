interface Props {
  label: string
  checked: boolean
  disabled?: boolean
  onChange: () => void
}

export const ToggleButton: React.FC<Props> = ({
  label,
  checked,
  disabled = false,
  onChange,
}) => {
  return (
    <div>
      <label
        className={`relative mb-3 inline-flex items-center ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <input
          type="checkbox"
          value=""
          className="peer sr-only disabled:bg-gray-200"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <div
          className={`peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-blue-200 ${
            disabled ? 'peer-checked:bg-gray-200' : 'peer-checked:bg-blue-600'
          }`}
        ></div>
        <span
          className={`ml-3 text-sm ${checked ? 'font-bold' : 'font-medium'}
          ${disabled ? 'text-gray-300' : 'text-gray-900 '}
          `}
        >
          {label}
        </span>
      </label>
    </div>
  )
}
