interface Props {
  label: string
  checked: boolean
  onChange: () => void
}

export const ToggleButton: React.FC<Props> = ({ label, checked, onChange }) => {
  return (
    <>
      <label className="relative inline-flex items-center cursor-pointer mb-3">
        <input
          type="checkbox"
          value=""
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-200 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
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
