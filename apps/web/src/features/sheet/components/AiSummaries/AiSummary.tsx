import { getTitleAndIcon } from './util'

interface Props {
  jsonKey: string
  text: string
}

export const AiSummary: React.FC<Props> = ({ jsonKey, text }) => {
  const { Icon, title } = getTitleAndIcon(jsonKey)
  return (
    <>
      <div className="flex items-center justify-center py-2">
        <Icon color="a782c3" className="mr-2" />
        <div className="font-bold text-gray-700">{title}</div>
      </div>
      <div className="flex justify-center pb-2 text-left text-sm text-gray-700">
        {text}
      </div>
    </>
  )
}
