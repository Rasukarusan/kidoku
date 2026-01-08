import { useQuery } from '@apollo/client'
import { getSheetsQuery } from '@/features/sheet/api'
import { Label } from './Label'

interface Sheet {
  id: number
  name: string
}

interface Props {
  value?: number
  onChange: (sheet: { id: number; name: string }) => void
  label?: string
  className?: string
  tabIndex?: number
}

export const SheetSelectBox: React.FC<Props> = ({
  value,
  onChange,
  label = 'シート',
  className = '',
  tabIndex,
}) => {
  const { data: sheetsData } = useQuery(getSheetsQuery)
  const sheets: Sheet[] = sheetsData?.sheets || []

  if (sheets.length === 0) return null

  return (
    <div className={className}>
      {label && <Label text={label} className="mb-1" />}
      <select
        className="w-full cursor-pointer rounded-md bg-slate-100 px-2 py-1 text-sm"
        value={value || ''}
        onChange={(e) => {
          const selectedOption = e.target.selectedOptions[0]
          const sheetName = selectedOption.textContent || ''
          onChange({
            id: Number(e.target.value),
            name: sheetName,
          })
        }}
        tabIndex={tabIndex}
      >
        {sheets.map((sheet) => (
          <option key={sheet.id} value={sheet.id}>
            {sheet.name}
          </option>
        ))}
      </select>
    </div>
  )
}
