import { getTitleAndIcon } from './util'

interface Props {
  jsonKey: string
  text: string
  summary?: string
  originalSchemaVersion?: number
}

export const AiSummary: React.FC<Props> = ({
  jsonKey,
  text,
  summary,
  originalSchemaVersion,
}) => {
  const { Icon, title } = getTitleAndIcon(jsonKey, originalSchemaVersion)
  return (
    <>
      <div className="flex items-center justify-center py-2">
        <Icon color="a782c3" className="mr-2" />
        <div className="font-bold text-gray-700">{title}</div>
      </div>
      {summary && (
        <h4 className="mb-3 text-left text-base font-bold leading-relaxed text-gray-800">
          {summary}
        </h4>
      )}
      <div className="whitespace-pre-line pb-2 text-left text-sm leading-relaxed text-gray-700">
        {text}
      </div>
    </>
  )
}
