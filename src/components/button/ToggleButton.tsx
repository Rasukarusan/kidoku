interface Props {
  label: string
  checked: boolean
  onChange: () => void
}

export const ToggleButton: React.FC<Props> = ({ label, checked, onChange }) => {
  return (
    <>
      <label className="relative mb-3 inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          value=""
          className="peer sr-only"
          checked={checked}
          onChange={onChange}
        />
        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-2 peer-focus:ring-blue-200"></div>
        <span
          className={`ml-3 text-sm text-gray-900 ${
            checked ? 'font-bold' : 'font-medium'
          }`}
        >
          {label}
        </span>
      </label>
    </>
  )
}
