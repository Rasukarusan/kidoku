import { parseAnsi } from './ansi'

export function AnsiText({ text }: { text: string }) {
  return (
    <>
      {parseAnsi(text).map((segment, index) =>
        segment.classes.length ? (
          <span key={index} className={segment.classes.join(' ')}>
            {segment.text}
          </span>
        ) : (
          segment.text
        )
      )}
    </>
  )
}
