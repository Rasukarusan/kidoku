import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface MemoPreviewProps {
  memo: string | null | undefined
  className?: string
}

/**
 * マスクされたテキストを表示するコンポーネント（プレビュー用）
 */
const MaskedTextPreview: React.FC<{ text: string }> = ({ text }) => {
  const [revealed, setRevealed] = useState(false)

  return (
    <span
      className={`cursor-pointer rounded px-0.5 transition-colors ${
        revealed
          ? 'bg-gray-100 text-gray-800'
          : 'bg-gray-800 text-gray-800 hover:bg-gray-700'
      }`}
      onClick={(e) => {
        e.stopPropagation() // 親要素のクリックを防ぐ
        setRevealed(!revealed)
      }}
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
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index))
    }
    parts.push(<MaskedTextPreview key={match.index} text={match[1]} />)
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex))
  }

  return parts
}

/**
 * テーブル行などで使うメモのプレビューコンポーネント
 * マークダウンをシンプルにレンダリングし、マスクも処理する
 */
export const MemoPreview: React.FC<MemoPreviewProps> = ({
  memo,
  className = '',
}) => {
  if (!memo) return null

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
          p: ({ children }) => {
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
            return <span>{processed}</span>
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
            return <span>{processed}</span>
          },
        }}
      >
        {memo}
      </ReactMarkdown>
    </div>
  )
}
