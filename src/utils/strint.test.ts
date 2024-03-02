import { truncate } from './string'
test('指定した長さで省略されること', () => {
  const str = '123456789'
  const len = 5
  const result = truncate(str, len)
  const expected = '12345...'
  expect(result).toEqual(expected)
})
