/**
 * ストリーミングされたテキストから最上位のJSONオブジェクトだけを取り出す。
 * モデルがJSONの前後にコードフェンスや説明文を付けても、下流には純粋なJSONのみを流す。
 */
export class JsonObjectStream {
  private started = false;
  private finished = false;
  private depth = 0;
  private inString = false;
  private escaped = false;

  /** 受け取った断片のうち、JSONとして採用する部分を返す */
  push(chunk: string): string {
    let output = '';
    for (const char of chunk) {
      if (this.finished) break;

      // JSONの開始括弧までは読み捨てる
      if (!this.started) {
        if (char !== '{') continue;
        this.started = true;
      }
      output += char;

      // 文字列リテラル内の括弧は深さに数えない
      if (this.inString) {
        if (this.escaped) {
          this.escaped = false;
        } else if (char === '\\') {
          this.escaped = true;
        } else if (char === '"') {
          this.inString = false;
        }
        continue;
      }
      if (char === '"') {
        this.inString = true;
      } else if (char === '{') {
        this.depth++;
      } else if (char === '}') {
        this.depth--;
        if (this.depth === 0) this.finished = true;
      }
    }
    return output;
  }
}
