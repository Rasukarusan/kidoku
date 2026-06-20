import {
  mistToSui,
  suiToMist,
  resolveBookPriceMist,
  suiPaymentAmountMist,
} from './config'

describe('sui config', () => {
  describe('mistToSui', () => {
    it('整数SUIに変換できる', () => {
      expect(mistToSui(BigInt('1000000000'))).toBe('1')
    })
    it('小数SUIに変換できる', () => {
      expect(mistToSui(BigInt('10000000'))).toBe('0.01')
      expect(mistToSui(BigInt('50000000'))).toBe('0.05')
    })
    it('末尾ゼロは省かれる', () => {
      expect(mistToSui(BigInt('1500000000'))).toBe('1.5')
    })
  })

  describe('suiToMist', () => {
    it('整数SUIをMISTに変換できる', () => {
      expect(suiToMist('1')).toBe(BigInt('1000000000'))
    })
    it('小数SUIをMISTに変換できる', () => {
      expect(suiToMist('0.05')).toBe(BigInt('50000000'))
      expect(suiToMist('0.01')).toBe(BigInt('10000000'))
    })
    it('不正な文字列はnullを返す', () => {
      expect(suiToMist('abc')).toBeNull()
      expect(suiToMist('')).toBeNull()
      expect(suiToMist('.')).toBeNull()
    })
    it('精度を超える小数はnullを返す', () => {
      expect(suiToMist('0.0000000001')).toBeNull()
    })
  })

  describe('round trip', () => {
    it('SUI -> MIST -> SUI で元に戻る', () => {
      const mist = suiToMist('0.05')
      expect(mist).not.toBeNull()
      expect(mistToSui(mist as bigint)).toBe('0.05')
    })
  })

  describe('resolveBookPriceMist', () => {
    it('価格が設定されていればその値を使う', () => {
      expect(resolveBookPriceMist('50000000')).toBe(BigInt('50000000'))
    })
    it('未設定なら既定額にフォールバックする', () => {
      expect(resolveBookPriceMist(null)).toBe(suiPaymentAmountMist)
      expect(resolveBookPriceMist(undefined)).toBe(suiPaymentAmountMist)
    })
    it('不正な文字列なら既定額にフォールバックする', () => {
      expect(resolveBookPriceMist('abc')).toBe(suiPaymentAmountMist)
    })
  })
})
