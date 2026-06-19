/**
 * Markdown表示用のユーティリティ
 */

// ノーブレークスペース(U+00A0)。Markdownで「空段落」を表現するために使う。
const NBSP = String.fromCharCode(0xa0)

/**
 * 連続した空行を保持するために、3つ以上連続する改行を「空段落」に展開する。
 *
 * CommonMark（react-markdown）では、段落区切りの`\n\n`を超える連続空行は
 * すべて1段落分の間隔に詰められてしまう。入力どおりの縦の間隔を表示で
 * 再現するため、余分な空行ぶんだけノーブレークスペース(U+00A0)のみの
 * 段落を挿入する。
 *
 * 例: `A\n\n\n\nB`（A と B の間に空行2つ）
 *   → 空段落(U+00A0のみの段落)を2つ挿入する
 *
 * 単一改行（`\n`）はそのまま残し、`remark-breaks`側で`<br>`に変換させる。
 */
export const expandBlankLines = (markdown: string): string => {
  // 改行コードを統一してから処理する
  const normalized = markdown.replace(/\r\n/g, '\n')

  return normalized.replace(/\n{3,}/g, (match) => {
    // 連続する改行数 N のうち、段落区切り(2)を超えたぶんが「余分な空行」
    const extraBlankLines = match.length - 2
    return '\n\n' + `${NBSP}\n\n`.repeat(extraBlankLines)
  })
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * tiptap-markdown用のParagraph直列化関数。
 *
 * prosemirror-markdownの標準実装は空段落（ユーザーがEnterで空けた行）を
 * serialize時に黙って削除してしまう。空段落をNBSPのみの段落として出力する
 * ことで、保存後も空行が保持されるようにする。
 *
 * @param state tiptap-markdownのMarkdownSerializerState
 * @param node ProseMirrorのparagraphノード
 */
export const serializeParagraphPreservingBlank = (
  state: any,
  node: any
): void => {
  if (node.childCount === 0) {
    // 空段落はNBSPを書き出してブロックとして残す（消されないように）
    state.write(NBSP)
  } else {
    state.renderInline(node)
  }
  state.closeBlock(node)
}

/* eslint-enable @typescript-eslint/no-explicit-any */
