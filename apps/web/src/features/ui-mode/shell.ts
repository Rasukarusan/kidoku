import { ansi, sanitize } from './ansi'
import { CommandContext, Env, RC_PATH, runCommand, SHELL } from './commands'

export const RC_STORAGE_KEY = 'kidoku-zshrc'

export const DEFAULT_PROMPT = '%B%F{green}%n@%m%f%b:%B%F{blue}%~%f%b$ '

export const DEFAULT_ZSHRC = `# ~/.zshrc — kidoku shell の設定ファイル
# 編集: vim ~/.zshrc   反映: source ~/.zshrc
# この設定はこのブラウザに保存されます。

# エイリアス
alias ll='ls -l'
alias la='ls -a ~'
alias q='exit'

# プロンプト
#   %n ユーザー名  %m ホスト名  %~ カレントディレクトリ  %T 時刻
#   %F{色}…%f 文字色（red green yellow blue magenta cyan white）  %B…%b 太字
PROMPT='${DEFAULT_PROMPT}'

# 起動時に実行するコマンドも書けます
# neofetch
`

export const defaultVars = (username: string): Env => ({
  HOME: `/${username}`,
  USER: username,
  SHELL: `/bin/${SHELL}`,
  PROMPT: DEFAULT_PROMPT,
})

const COLORS: Record<string, number> = {
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
}

const pad = (value: number) => String(value).padStart(2, '0')

/** zsh の PROMPT 書式（%n, %~, %F{color} など）をANSIの文字列に変換する */
export function renderPrompt(
  template: string,
  info: { user: string; cwd: string; path: string; now?: Date }
): string {
  const source = sanitize(template)
  const now = info.now ?? new Date()
  let output = ''
  for (let index = 0; index < source.length; index++) {
    const char = source[index]
    if (char !== '%' || index === source.length - 1) {
      output += char
      continue
    }
    const code = source[++index]
    const braced = source.slice(index + 1).match(/^\{([^}]*)\}/)
    switch (code) {
      case 'n':
        output += info.user
        break
      case 'm':
      case 'M':
        output += SHELL
        break
      case '~':
        output += info.cwd
        break
      case '/':
      case 'd':
        output += info.path
        break
      case '#':
        output += '%'
        break
      case '%':
        output += '%'
        break
      case 'T':
        output += `${pad(now.getHours())}:${pad(now.getMinutes())}`
        break
      case '*':
        output += `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
        break
      case 'B':
        output += '\x1b[1m'
        break
      case 'b':
        output += '\x1b[22m'
        break
      case 'U':
        output += '\x1b[4m'
        break
      case 'u':
        output += '\x1b[24m'
        break
      case 'f':
        output += '\x1b[39m'
        break
      case 'F': {
        if (!braced) break
        const name = braced[1].toLowerCase()
        const number = name in COLORS ? COLORS[name] : Number(name)
        if (Number.isInteger(number) && number >= 0 && number <= 15)
          output += `\x1b[${number < 8 ? 30 + number : 82 + number}m`
        index += braced[0].length
        break
      }
      default:
        output += `%${code}`
    }
  }
  return output + '\x1b[0m'
}

/** ~/.zshrc のようなスクリプトを1行ずつ実行し、エイリアスと変数を反映する */
export function runScript(
  script: string,
  context: CommandContext,
  path = RC_PATH
): { aliases: Env; vars: Env; output: string } {
  let aliases = { ...context.aliases }
  let vars = { ...context.vars }
  let output: string[] = []
  const fail = (line: number, message: string) =>
    output.push(ansi.red(`${path}:${line}: ${message}`))
  script.split('\n').forEach((raw, index) => {
    const line = raw.trim()
    if (!line || line.startsWith('#')) return
    const result = runCommand(line, { ...context, aliases, vars })
    switch (result.type) {
      case 'env':
        aliases = result.aliases
        vars = result.vars
        if (result.text) output.push(result.text)
        break
      case 'text':
        if (result.text.startsWith(`${SHELL}: `))
          fail(index + 1, result.text.slice(SHELL.length + 2))
        else if (result.text) output.push(result.text)
        break
      case 'clear':
        output = []
        break
      default:
        fail(
          index + 1,
          `${sanitize(line.split(/\s/)[0])}: 設定ファイルの中では実行できません`
        )
    }
  })
  return { aliases, vars, output: output.join('\n') }
}
