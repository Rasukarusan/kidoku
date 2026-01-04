import ReactMarkdown from 'react-markdown'

interface MemoProps {
  memo: string | null | undefined
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
        }}
      >
        {memo}
      </ReactMarkdown>
    </div>
  )
}
