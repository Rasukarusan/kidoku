import { stripAnsi } from './ansi'
import {
  CommandContext,
  expandAlias,
  runCommand,
  tokenizeCommand,
} from './commands'
import { DEFAULT_ZSHRC, defaultVars, renderPrompt, runScript } from './shell'

const context: CommandContext = {
  username: 'reader',
  currentSheet: '2026',
  sheets: [{ id: '1', name: '2026', order: 0 }],
  books: [],
  vars: defaultVars('reader'),
}

describe('shell configuration', () => {
  it('expands variables outside single quotes and ignores comments', () => {
    const vars = { USER: 'reader', HOME: '/reader' }
    expect(
      tokenizeCommand('echo $USER "${HOME}/x" \'$USER\' \\$USER', vars)
    ).toEqual(['echo', 'reader', '/reader/x', '$USER', '$USER'])
    expect(tokenizeCommand('ls -l # comment', vars)).toEqual(['ls', '-l'])
    expect(tokenizeCommand('echo a#b', vars)).toEqual(['echo', 'a#b'])
  })

  it('expands aliases once, so an alias may wrap the original command', () => {
    expect(expandAlias('ll sheets', { ll: 'ls -l' })).toBe('ls -l sheets')
    expect(expandAlias('ls', { ls: 'ls -l' })).toBe('ls -l')
    expect(expandAlias('cd x', { ll: 'ls -l' })).toBe('cd x')
  })

  it('runs the default .zshrc and applies aliases and PROMPT', () => {
    const result = runScript(DEFAULT_ZSHRC, context)
    expect(result.aliases.ll).toBe('ls -l')
    expect(result.output).toBe('')
    expect(
      stripAnsi(
        renderPrompt(result.vars.PROMPT, {
          user: 'reader',
          cwd: '~/sheets/2026',
          path: '/reader/sheets/2026',
        })
      )
    ).toBe('reader@kidoku:~/sheets/2026$ ')
  })

  it('reports errors with file and line, and refuses interactive commands', () => {
    const result = runScript('alias x=pwd\nfoo\nvim', context)
    expect(result.aliases.x).toBe('pwd')
    expect(stripAnsi(result.output)).toBe(
      '~/.zshrc:2: command not found: foo\n~/.zshrc:3: vim: 設定ファイルの中では実行できません'
    )
    expect(stripAnsi(runScript('echo hi\nwhoami', context).output)).toBe(
      'hi\nreader'
    )
  })

  it('renders zsh prompt escapes', () => {
    const prompt = renderPrompt('%B%F{red}%n%f%b %/ %# %% %F{12}x%f', {
      user: 'u',
      cwd: '~',
      path: '/u/sheets',
    })
    expect(stripAnsi(prompt)).toBe('u /u/sheets % % x')
    expect(prompt).toContain('\x1b[31m')
    expect(prompt).toContain('\x1b[94m')
  })

  it('manages aliases and variables with builtins', () => {
    const set = runCommand("alias g='grep foo' h=history", context)
    expect(set).toMatchObject({
      type: 'env',
      aliases: { g: 'grep foo', h: 'history' },
    })
    const aliases = { g: 'grep foo' }
    expect(runCommand('alias', { ...context, aliases })).toMatchObject({
      text: "g='grep foo'",
    })
    expect(runCommand('unalias g', { ...context, aliases })).toMatchObject({
      aliases: {},
    })
    expect(
      runCommand('which g ls nope', { ...context, aliases })
    ).toMatchObject({
      text: 'g: aliased to grep foo\nls: shell built-in command\nnope not found',
    })
    expect(runCommand('FOO=bar', context)).toMatchObject({
      vars: { FOO: 'bar' },
    })
    expect(runCommand('export A=1 B=2', context)).toMatchObject({
      vars: { A: '1', B: '2' },
    })
    expect(runCommand('export 1x=2', context)).toMatchObject({ type: 'text' })
    expect(
      runCommand('echo $FOO', { ...context, vars: { FOO: 'bar' } })
    ).toMatchObject({ text: 'bar' })
  })

  it('reads, sources and opens ~/.zshrc', () => {
    const rc = 'alias ll="ls -l"'
    expect(runCommand('cat ~/.zshrc', { ...context, rc })).toMatchObject({
      text: rc,
    })
    expect(runCommand('source ~/.zshrc', { ...context, rc })).toEqual({
      type: 'source',
      script: rc,
      path: '~/.zshrc',
    })
    expect(runCommand('. $HOME/.zshrc', { ...context, rc })).toMatchObject({
      type: 'source',
    })
    expect(runCommand('vim ~/.zshrc', { ...context, rc })).toMatchObject({
      type: 'vim',
      file: { kind: 'rc', content: rc },
    })
    expect(
      stripAnsi((runCommand('ls -a ~', context) as { text: string }).text)
    ).toBe('.zshrc\nsheets/')
  })
})
