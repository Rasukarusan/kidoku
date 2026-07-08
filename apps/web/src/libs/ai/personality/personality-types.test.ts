import {
  PERSONALITY_TYPES,
  PERSONALITY_TYPE_IDS,
  findPersonalityType,
  personalityTypePromptList,
} from './personality-types'
import {
  personalityCharacterSvg,
  personalityCharacterDataUri,
} from './personality-character'

describe('PERSONALITY_TYPES', () => {
  it('idが重複していないこと', () => {
    expect(new Set(PERSONALITY_TYPE_IDS).size).toBe(PERSONALITY_TYPES.length)
  })

  it('全タイプに必須フィールドが定義されていること', () => {
    for (const type of PERSONALITY_TYPES) {
      expect(type.id).toMatch(/^[a-z]+$/)
      expect(type.code).toMatch(/^[A-Z]+$/)
      expect(type.name).not.toBe('')
      expect(type.tagline).not.toBe('')
      expect(type.criteria).not.toBe('')
      expect(type.color).toMatch(/^#[0-9a-f]{6}$/)
      expect(type.colorLight).toMatch(/^#[0-9a-f]{6}$/)
    }
  })
})

describe('findPersonalityType()', () => {
  it('idからタイプを取得できること', () => {
    expect(findPersonalityType('adventurer')?.name).toBe('物語の冒険家')
  })

  it('未知のid・空文字・未設定はundefinedを返すこと', () => {
    expect(findPersonalityType('unknown_type')).toBeUndefined()
    expect(findPersonalityType('')).toBeUndefined()
    expect(findPersonalityType(undefined)).toBeUndefined()
    expect(findPersonalityType(null)).toBeUndefined()
  })
})

describe('personalityTypePromptList', () => {
  it('全タイプのidと名前が含まれていること', () => {
    for (const type of PERSONALITY_TYPES) {
      expect(personalityTypePromptList).toContain(type.id)
      expect(personalityTypePromptList).toContain(type.name)
    }
  })
})

describe('personalityCharacterSvg()', () => {
  it('全タイプでSVGが生成できること', () => {
    for (const type of PERSONALITY_TYPES) {
      const svg = personalityCharacterSvg(type)
      expect(svg).toContain('<svg')
      expect(svg).toContain(type.color)
      expect(svg).toContain(type.colorLight)
    }
  })

  it('OG画像でbase64エンコードできるようASCII文字のみで構成されていること', () => {
    for (const type of PERSONALITY_TYPES) {
      const svg = personalityCharacterSvg(type)
      // eslint-disable-next-line no-control-regex
      expect(svg).toMatch(/^[\x00-\x7F]*$/)
    }
  })

  it('サイズを指定できること', () => {
    const svg = personalityCharacterSvg(PERSONALITY_TYPES[0], 300)
    expect(svg).toContain('width="300"')
    expect(svg).toContain('height="300"')
  })
})

describe('personalityCharacterDataUri()', () => {
  it('data URI形式で返ること', () => {
    const uri = personalityCharacterDataUri(PERSONALITY_TYPES[0])
    expect(uri).toMatch(/^data:image\/svg\+xml;utf8,/)
  })
})
