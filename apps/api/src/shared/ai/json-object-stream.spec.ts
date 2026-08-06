import { JsonObjectStream } from './json-object-stream';

describe('JsonObjectStream', () => {
  it('JSONの前後に付いた説明文とコードフェンスを除去する', () => {
    const stream = new JsonObjectStream();
    const output = ['以下です```json\n{"a":1}', '\n```\n補足です'].reduce(
      (text, chunk) => text + stream.push(chunk),
      '',
    );

    expect(output).toBe('{"a":1}');
  });

  it('断片に分割されたJSONを結合できる', () => {
    const stream = new JsonObjectStream();
    const output = ['{"a":', '"あ', 'い"}'].reduce(
      (text, chunk) => text + stream.push(chunk),
      '',
    );

    expect(JSON.parse(output)).toEqual({ a: 'あい' });
  });

  it('文字列リテラル内の括弧を深さに数えない', () => {
    const stream = new JsonObjectStream();
    const output = stream.push('{"a":"}{"}後続');

    expect(output).toBe('{"a":"}{"}');
  });

  it('エスケープされた引用符で文字列を終わらせない', () => {
    const stream = new JsonObjectStream();
    const output = stream.push('{"a":"\\"}"}余分');

    expect(JSON.parse(output)).toEqual({ a: '"}' });
  });

  it('ネストしたオブジェクトを最後まで通す', () => {
    const stream = new JsonObjectStream();
    const output = stream.push('{"a":{"b":1}}trailing');

    expect(output).toBe('{"a":{"b":1}}');
  });
});
