import ReactMarkdown from 'react-markdown'

interface MemoPreviewProps {
  memo: string | null | undefined
  className?: string
  /** 自分の本かどうか。trueの場合はマスクテキストをそのまま表示 */
  isMine?: boolean
}

/**
 * [[MASK: text]] 形式のテキストを処理する
 * エスケープされたバージョン \[\[MASK: text\]\] にも対応
 * @param content - 処理する文字列
 * @param isMine - 自分の本の場合はtrueでテキストをそのまま表示、falseの場合は*****で置換
 */
const processMaskedText = (content: string, isMine: boolean): string => {
  // エスケープされたバージョンと通常バージョン両方にマッチ
  const maskPattern = /(?:\\\[\\\[|\[\[)MASK:\s*(.*?)(?:\\\]\\\]|\]\])/g
  if (isMine) {
    // 自分の本の場合はマスク記法を外してテキストをそのまま表示
    return content.replace(maskPattern, '$1')
  } else {
    // 他人の本の場合は*****で置換
    return content.replace(maskPattern, '*****')
  }
}

/**
 * テーブル行などで使うメモのプレビューコンポーネント
 * マークダウンをシンプルにレンダリングし、マスクも処理する
 */
export const MemoPreview: React.FC<MemoPreviewProps> = ({
  memo,
  className = '',
  isMine = true,
}) => {
  if (!memo) return null

  // マスクテキストを処理
  const processedMemo = processMaskedText(memo, isMine)

  return (
    <div className={`memo-preview ${className}`}>
      <style jsx global>{`
        .memo-preview p {
          margin: 0;
          display: inline;
        }
        .memo-preview h1,
        .memo-preview h2,
        .memo-preview h3 {
          font-weight: 600;
          display: inline;
        }
        .memo-preview ul,
        .memo-preview ol {
          display: inline;
          margin: 0;
          padding: 0;
        }
        .memo-preview li {
          display: inline;
        }
        .memo-preview li::before {
          content: '• ';
        }
        .memo-preview blockquote {
          display: inline;
          font-style: italic;
          color: #6b7280;
        }
        .memo-preview code {
          background-color: #f3f4f6;
          padding: 0 0.25rem;
          border-radius: 0.125rem;
          font-size: 0.875em;
        }
        .memo-preview a {
          color: #3b82f6;
          text-decoration: underline;
        }
      `}</style>
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </a>
          ),
        }}
      >
        {processedMemo}
      </ReactMarkdown>
    </div>
  )
}
