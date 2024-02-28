interface Props {
  text: string
}

export const Label: React.FC<Props> = ({ text }) => {
  return <div className="mb-1 text-2xs text-gray-400 sm:text-xs">{text}</div>
}
