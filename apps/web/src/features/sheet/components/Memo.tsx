import ReactMarkdown from 'react-markdown'
import { useState } from 'react'

interface MemoProps {
  memo: string | null | undefined
}

/**
 * マスクされたテキストを表示するコンポーネント
 * クリックで内容を表示/非表示を切り替え
 */
const MaskedText: React.FC<{ text: string }> = ({ text }) => {
  const [revealed, setRevealed] = useState(false)

  return (
    <span
      className={`cursor-pointer rounded px-1 py-0.5 transition-colors ${
        revealed
          ? 'bg-gray-100 text-gray-800'
          : 'bg-gray-800 text-gray-800 hover:bg-gray-700'
      }`}
      onClick={() => setRevealed(!revealed)}
      title={revealed ? 'クリックで隠す' : 'クリックで表示'}
    >
      {revealed ? text : 'ネタバレ'}
    </span>
  )
}

/**
 * [[MASK: text]] 形式のテキストを処理してマスク表示する
 * エスケープされたバージョン \[\[MASK: text\]\] にも対応
 */
const processMaskedText = (content: string): React.ReactNode[] => {
  // エスケープされたバージョンと通常バージョン両方にマッチ
  const maskPattern = /(?:\\\[\\\[|\[\[)MASK:\s*(.*?)(?:\\\]\\\]|\]\])/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = maskPattern.exec(content)) !== null) {
    // マッチ前のテキスト
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index))
    }
    // マスクされたテキスト
    parts.push(<MaskedText key={match.index} text={match[1]} />)
    lastIndex = match.index + match[0].length
  }

  // 残りのテキスト
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex))
  }

  return parts
}

/**
 * マークダウンをレンダリングするコンポーネント
 */
export const Memo: React.FC<MemoProps> = ({ memo }) => {
  if (!memo) return null

  return (
    <div className="memo-content prose prose-sm max-w-none">
      <style jsx global>{`
        .memo-content h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          border-bottom: none;
        }
        .memo-content h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
          border-bottom: none;
        }
        .memo-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .memo-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .memo-content ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .memo-content blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          margin: 0.5rem 0;
          color: #6b7280;
          font-style: italic;
        }
        .memo-content code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-family: ui-monospace, monospace;
        }
        .memo-content pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 0.5rem 0;
        }
        .memo-content pre code {
          background-color: transparent;
          padding: 0;
        }
        .memo-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        .memo-content a:hover {
          color: #2563eb;
        }
        .memo-content p {
          margin: 0.5rem 0;
        }
        .memo-content hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 1rem 0;
        }
        .memo-content strong {
          font-weight: 600;
        }
        .memo-content em {
          font-style: italic;
        }
      `}</style>
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          p: ({ children }) => {
            // 子要素を処理してマスクテキストを変換
            const processChildren = (
              child: React.ReactNode
            ): React.ReactNode => {
              if (typeof child === 'string') {
                const hasMask =
                  /(?:\\\[\\\[|\[\[)MASK:\s*(.*?)(?:\\\]\\\]|\]\])/.test(child)
                if (hasMask) {
                  return <>{processMaskedText(child)}</>
                }
                return child
              }
              return child
            }
            const processed = Array.isArray(children)
              ? children.map((child, i) => (
                  <span key={i}>{processChildren(child)}</span>
                ))
              : processChildren(children)
            return <p>{processed}</p>
          },
          li: ({ children }) => {
            const processChildren = (
              child: React.ReactNode
            ): React.ReactNode => {
              if (typeof child === 'string') {
                const hasMask =
                  /(?:\\\[\\\[|\[\[)MASK:\s*(.*?)(?:\\\]\\\]|\]\])/.test(child)
                if (hasMask) {
                  return <>{processMaskedText(child)}</>
                }
                return child
              }
              return child
            }
            const processed = Array.isArray(children)
              ? children.map((child, i) => (
                  <span key={i}>{processChildren(child)}</span>
                ))
              : processChildren(children)
            return <li>{processed}</li>
          },
        }}
      >
        {memo}
      </ReactMarkdown>
    </div>
  )
}
