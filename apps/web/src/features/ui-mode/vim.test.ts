import {
  createVimState,
  imeTextToKeys,
  vimContent,
  vimInsertText,
  vimKeys,
  VimState,
} from './vim'

const type = (state: VimState, keys: string) => vimKeys(state, Array.from(keys))

const run = (content: string, ...keys: string[]) =>
  vimKeys(createVimState(content), keys)

describe('vim', () => {
  it('inserts text, returns to normal mode and writes with :wq', () => {
    let { state } = run('hello', 'A')
    expect(state.mode).toBe('insert')
    state = type(state, ' world').state
    state = vimKeys(state, ['Escape']).state
    expect(vimContent(state)).toBe('hello world')
    expect(state).toMatchObject({ mode: 'normal', col: 10, dirty: true })
    const result = vimKeys(state, [':', 'w', 'q', 'Enter'])
    expect(result.action).toBe('writequit')
  })

  it('refuses :q with unsaved changes unless forced', () => {
    const { state } = run('a', 'x')
    expect(vimKeys(state, [':', 'q', 'Enter'])).toMatchObject({
      action: null,
      state: { error: true, message: expect.stringContaining('E37') },
    })
    expect(vimKeys(state, [':', 'q', '!', 'Enter'])).toMatchObject({
      action: 'quit',
    })
    expect(run('a', ':', 'q', 'Enter').action).toBe('quit')
    expect(run('a', ':', 'w', 'Enter').action).toBe('write')
    expect(run('a', 'Z', 'Z').action).toBe('writequit')
    expect(run('a', ':', 'f', 'o', 'o', 'Enter').state.message).toBe(
      'E492: Not an editor command: foo'
    )
  })

  it('moves with hjkl, counts, gg/G, 0/$ and w/b', () => {
    const content = 'one two three\nsecond\nthird line'
    expect(run(content, 'j', 'l', 'l').state).toMatchObject({ row: 1, col: 2 })
    expect(run(content, '2', 'j').state.row).toBe(2)
    expect(run(content, 'G').state.row).toBe(2)
    expect(run(content, 'G', 'g', 'g').state.row).toBe(0)
    expect(run(content, '$').state.col).toBe(12)
    expect(run(content, 'w', 'w').state.col).toBe(8)
    expect(run(content, '$', 'b').state.col).toBe(8)
    expect(run(content, 'w', 'w', 'w').state).toMatchObject({ row: 1, col: 0 })
    expect(run(content, 'j', 'j', 'j', 'j').state.row).toBe(2)
  })

  it('deletes, yanks, puts and undoes', () => {
    const content = 'a\nb\nc'
    let { state } = run(content, 'd', 'd')
    expect(vimContent(state)).toBe('b\nc')
    state = vimKeys(state, ['p']).state
    expect(vimContent(state)).toBe('b\na\nc')
    state = vimKeys(state, ['u', 'u']).state
    expect(vimContent(state)).toBe('a\nb\nc')
    state = vimKeys(state, ['C-r']).state
    expect(vimContent(state)).toBe('b\nc')
    expect(vimContent(run(content, 'y', 'y', 'j', 'p').state)).toBe(
      'a\nb\na\nc'
    )
    expect(vimContent(run(content, '2', 'd', 'd').state)).toBe('c')
    expect(vimContent(run('abc def', 'd', 'w').state)).toBe('def')
    expect(vimContent(run('abc def', 'x', 'x').state)).toBe('c def')
    expect(vimContent(run('abc def', 'w', 'D').state)).toBe('abc ')
    expect(vimContent(run('a\nb', 'J').state)).toBe('a b')
    expect(vimContent(run('abc', 'r', 'z').state)).toBe('zbc')
    expect(vimContent(run('a\nb', 'd', 'd', 'd', 'd').state)).toBe('')
  })

  it('opens lines, changes words and handles insert-mode editing keys', () => {
    expect(vimContent(type(createVimState('a'), 'onew').state)).toBe('a\nnew')
    expect(vimContent(type(createVimState('a'), 'Otop').state)).toBe('top\na')
    expect(vimContent(type(createVimState('old text'), 'cwnew').state)).toBe(
      'new text'
    )
    expect(vimContent(type(createVimState('x'), 'ccy').state)).toBe('y')
    let { state } = run('ab', 'A', 'Enter')
    state = type(state, 'cd').state
    expect(vimContent(state)).toBe('ab\ncd')
    state = vimKeys(state, ['Backspace', 'Backspace', 'Backspace']).state
    expect(vimContent(state)).toBe('ab')
  })

  it('inserts multibyte text from IME or paste at the cursor', () => {
    let { state } = run('本を', 'i')
    state = vimInsertText(state, '良い')
    expect(vimContent(state)).toBe('良い本を')
    expect(state.col).toBe(2)
    state = vimInsertText(state, '\n二行目')
    expect(vimContent(state)).toBe('良い\n二行目本を')
    state = vimKeys(state, ['Escape', 'x']).state
    expect(vimContent(state)).toBe('良い\n二行本を')
  })

  it('searches with / and n, and toggles line numbers', () => {
    const content = 'foo\nbar foo\nbaz'
    const found = type(createVimState(content), '/foo').state
    const { state } = vimKeys(found, ['Enter'])
    expect(state).toMatchObject({ row: 1, col: 4 })
    expect(vimKeys(state, ['n']).state).toMatchObject({ row: 0, col: 0 })
    expect(
      vimKeys(createVimState(content), ['/', 'x', 'Enter']).state.message
    ).toContain('E486')
    expect(type(createVimState(content), ':set nu').state.mode).toBe('command')
    expect(
      vimKeys(type(createVimState(content), ':set nu').state, ['Enter']).state
        .number
    ).toBe(true)
  })
})

describe('imeTextToKeys', () => {
  it('converts text typed with IME on into vim keys', () => {
    expect(imeTextToKeys('：ｗ')).toEqual([':', 'w'])
    expect(imeTextToKeys('：ｗｑ！')).toEqual([':', 'w', 'q', '!'])
    expect(imeTextToKeys('い')).toEqual(['i'])
    expect(imeTextToKeys('・検索\n')).toEqual(['/', '検', '索', 'Enter'])
  })
})
