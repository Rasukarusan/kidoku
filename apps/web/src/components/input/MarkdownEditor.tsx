'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { cn } from '@/utils/cn'

// SSR を無効化してクライアントサイドのみでレンダリング
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
      <span className="text-gray-400">読み込み中...</span>
    </div>
  ),
})

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  minHeight?: string
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  className,
  minHeight = '300px',
}) => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50',
          className
        )}
        style={{ minHeight }}
      >
        <span className="text-gray-400">読み込み中...</span>
      </div>
    )
  }

  return (
    <div
      className={cn('markdown-editor-container', className)}
      data-color-mode="light"
    >
      <style jsx global>{`
        .markdown-editor-container .w-md-editor {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
        .markdown-editor-container .w-md-editor-toolbar {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 0.5rem 0.5rem 0 0;
        }
        .markdown-editor-container .w-md-editor-content {
          background-color: #ffffff;
        }
        .markdown-editor-container .w-md-editor-text-input {
          font-family: inherit;
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .markdown-editor-container .w-md-editor-preview {
          font-family: inherit;
          font-size: 0.875rem;
          line-height: 1.6;
          padding: 1rem;
        }
        .markdown-editor-container .wmde-markdown {
          font-family: inherit;
          background-color: transparent;
        }
        .markdown-editor-container .wmde-markdown h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          border-bottom: none;
        }
        .markdown-editor-container .wmde-markdown h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          border-bottom: none;
        }
        .markdown-editor-container .wmde-markdown h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .markdown-editor-container .wmde-markdown ul,
        .markdown-editor-container .wmde-markdown ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .markdown-editor-container .wmde-markdown blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          margin: 0.5rem 0;
          color: #6b7280;
          font-style: italic;
        }
        .markdown-editor-container .wmde-markdown code {
          background-color: #f3f4f6;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
        .markdown-editor-container .wmde-markdown pre {
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        .markdown-editor-container .wmde-markdown pre code {
          background-color: transparent;
          padding: 0;
        }
      `}</style>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        height={parseInt(minHeight)}
        preview="live"
        hideToolbar={false}
        enableScroll={true}
        textareaProps={{
          placeholder:
            '感想やメモを入力してください...\n\nマークダウン記法が使えます：\n# 見出し\n**太字** *斜体*\n- 箇条書き\n> 引用',
        }}
      />
    </div>
  )
}
