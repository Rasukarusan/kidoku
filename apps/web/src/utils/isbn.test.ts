import { extractISBNFromAmazonUrl } from './isbn'

describe('extractISBNFromAmazonUrl', () => {
  it('Amazonの商品URLのdpパスからISBN-10を取得する', () => {
    expect(
      extractISBNFromAmazonUrl(
        'https://www.amazon.co.jp/%E3%82%B5%E3%83%8A%E3%82%A8%E3%83%8E%E3%83%9F%E3%82%AF%E3%82%B9/dp/479768173X/ref=sr_1_1?keywords=test'
      )
    ).toBe('479768173X')
  })

  it('Amazonの商品URLのgp/productパスからISBNを取得する', () => {
    expect(
      extractISBNFromAmazonUrl(
        'https://amazon.co.jp/gp/product/9784798177060?tag=example'
      )
    ).toBe('9784798177060')
  })

  it('KindleなどISBNではないASINは取得しない', () => {
    expect(
      extractISBNFromAmazonUrl('https://www.amazon.co.jp/dp/B0ABCDEFGHI')
    ).toBeNull()
  })

  it('Amazon.co.jp以外のURLは取得しない', () => {
    expect(
      extractISBNFromAmazonUrl('https://example.com/dp/479768173X')
    ).toBeNull()
  })

  it('URLではない入力は取得しない', () => {
    expect(extractISBNFromAmazonUrl('479768173X')).toBeNull()
  })
})
