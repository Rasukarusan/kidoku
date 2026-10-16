// CLIの出力はANSIエスケープシーケンス（SGR）で色付けし、描画時にspanへ変換する。
const ESC = '\x1b'
// eslint-disable-next-line no-control-regex -- SGRシーケンスそのものを扱う
const SGR = /\x1b\[([0-9;]*)m/g

export const ansi = {
  bold: (text: string) => `${ESC}[1m${text}${ESC}[22m`,
  dim: (text: string) => `${ESC}[2m${text}${ESC}[22m`,
  red: (text: string) => `${ESC}[31m${text}${ESC}[39m`,
  green: (text: string) => `${ESC}[32m${text}${ESC}[39m`,
  yellow: (text: string) => `${ESC}[33m${text}${ESC}[39m`,
  blue: (text: string) => `${ESC}[34m${text}${ESC}[39m`,
  magenta: (text: string) => `${ESC}[35m${text}${ESC}[39m`,
  cyan: (text: string) => `${ESC}[36m${text}${ESC}[39m`,
  gray: (text: string) => `${ESC}[90m${text}${ESC}[39m`,
}

/** ユーザー入力や本のデータに含まれる制御文字が表示を崩さないようにする */
export const sanitize = (text?: string | null) =>
  // eslint-disable-next-line no-control-regex -- 制御文字を取り除くための正規表現
  (text ?? '').replace(/[\x00-\x08\x0b-\x1f\x7f]/g, '')

export const stripAnsi = (text: string) => text.replace(SGR, '')

const WIDE =
  /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/

/** 全角文字を2桁として数えた表示幅 */
export const displayWidth = (text: string) =>
  Array.from(stripAnsi(text)).reduce(
    (width, char) => width + (WIDE.test(char) ? 2 : 1),
    0
  )

export const padEnd = (text: string, width: number) =>
  text + ' '.repeat(Math.max(0, width - displayWidth(text)))

export interface AnsiSegment {
  text: string
  classes: string[]
}

export function parseAnsi(input: string): AnsiSegment[] {
  const segments: AnsiSegment[] = []
  let fg: string | null = null
  let bold = false
  let dim = false
  let underline = false
  let inverse = false
  let index = 0
  const push = (text: string) => {
    if (!text) return
    const classes = [
      fg && `ansi-${fg}`,
      bold && 'ansi-bold',
      dim && 'ansi-dim',
      underline && 'ansi-underline',
      inverse && 'ansi-inverse',
    ].filter(Boolean) as string[]
    segments.push({ text, classes })
  }
  for (const match of Array.from(input.matchAll(SGR))) {
    push(input.slice(index, match.index))
    index = (match.index ?? 0) + match[0].length
    for (const code of (match[1] || '0').split(';').map(Number)) {
      if (code === 0) {
        fg = null
        bold = dim = underline = inverse = false
      } else if (code === 1) bold = true
      else if (code === 2) dim = true
      else if (code === 4) underline = true
      else if (code === 7) inverse = true
      else if (code === 22) bold = dim = false
      else if (code === 24) underline = false
      else if (code === 27) inverse = false
      else if (code === 39) fg = null
      else if (code >= 30 && code <= 37) fg = String(code - 30)
      else if (code >= 90 && code <= 97) fg = `b${code - 90}`
    }
  }
  push(input.slice(index))
  return segments
}
