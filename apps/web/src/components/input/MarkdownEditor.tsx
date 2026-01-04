'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  EditorRoot,
  EditorContent,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
  EditorBubble,
  EditorBubbleItem,
} from 'novel'
import {
  StarterKit,
  TiptapLink,
  Placeholder,
  TaskList,
  TaskItem,
  HorizontalRule,
  handleCommandNavigation,
  Command,
  createSuggestionItems,
  MarkdownExtension,
} from 'novel/extensions'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  CheckSquare,
  Text,
} from 'lucide-react'
import { cn } from '@/utils/cn'

// スラッシュコマンドの定義
const suggestionItems = createSuggestionItems([
  {
    title: 'テキスト',
    description: '通常のテキストを入力',
    searchTerms: ['p', 'paragraph', 'text'],
    icon: <Text className="h-4 w-4" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode('paragraph', 'paragraph')
        .run()
    },
  },
  {
    title: '見出し1',
    description: '大きな見出し',
    searchTerms: ['title', 'big', 'large', 'h1'],
    icon: <Heading1 className="h-4 w-4" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 1 })
        .run()
    },
  },
  {
    title: '見出し2',
    description: '中くらいの見出し',
    searchTerms: ['subtitle', 'medium', 'h2'],
    icon: <Heading2 className="h-4 w-4" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run()
    },
  },
  {
    title: '見出し3',
    description: '小さな見出し',
    searchTerms: ['small', 'h3'],
    icon: <Heading3 className="h-4 w-4" />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 3 })
        .run()
    },
  },
  {
    title: '箇条書き',
    description: '箇条書きリストを作成',
    searchTerms: ['bullet', 'list', 'unordered'],
    icon: <List className="h-4 w-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: '番号付きリスト',
    description: '番号付きリストを作成',
    searchTerms: ['numbered', 'ordered', 'list'],
    icon: <ListOrdered className="h-4 w-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    title: 'チェックリスト',
    description: 'タスクリストを作成',
    searchTerms: ['todo', 'task', 'checkbox'],
    icon: <CheckSquare className="h-4 w-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
  },
  {
    title: '引用',
    description: '引用ブロックを作成',
    searchTerms: ['quote', 'blockquote'],
    icon: <Quote className="h-4 w-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    },
  },
  {
    title: 'コード',
    description: 'コードブロックを作成',
    searchTerms: ['code', 'codeblock'],
    icon: <Code className="h-4 w-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    },
  },
  {
    title: '区切り線',
    description: '水平線を挿入',
    searchTerms: ['hr', 'divider', 'separator'],
    icon: <Minus className="h-4 w-4" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
])

// スラッシュコマンド拡張の設定
const slashCommand = Command.configure({
  suggestion: {
    items: () => suggestionItems,
  },
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

  // Tiptap拡張機能の設定
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-outside ml-4',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-outside ml-4',
          },
        },
        heading: {
          levels: [1, 2, 3],
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 italic text-gray-600',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-gray-100 rounded-md p-4 font-mono text-sm',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'bg-gray-100 rounded px-1 py-0.5 font-mono text-sm',
          },
        },
      }),
      TiptapLink.configure({
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose pl-2',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-start gap-2',
        },
      }),
      HorizontalRule,
      Placeholder.configure({
        placeholder: '感想やメモを入力... (「/」でコマンドメニュー)',
      }),
      MarkdownExtension,
      slashCommand,
    ],
    []
  )

  // 初期コンテンツ（マークダウン文字列をそのまま渡す）
  // MarkdownExtensionがパースしてくれる
  const initialContent = useMemo(() => value || '', [])

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
    <div className={cn('novel-editor', className)}>
      <style jsx global>{`
        .novel-editor .tiptap {
          min-height: ${minHeight};
          padding: 1rem;
          outline: none;
        }
        .novel-editor .tiptap p.is-editor-empty:first-child::before {
          color: #9ca3af;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .novel-editor .tiptap h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 1rem 0 0.5rem;
        }
        .novel-editor .tiptap h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.75rem 0 0.5rem;
        }
        .novel-editor .tiptap h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0.5rem 0 0.25rem;
        }
        .novel-editor .tiptap ul[data-type='taskList'] {
          list-style: none;
          padding: 0;
        }
        .novel-editor .tiptap ul[data-type='taskList'] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }
        .novel-editor .tiptap ul[data-type='taskList'] li input {
          margin-top: 0.25rem;
        }
        .novel-editor .tiptap hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 1rem 0;
        }
      `}</style>
      <EditorRoot>
        <EditorContent
          extensions={extensions}
          className="rounded-lg border border-gray-200 bg-white shadow-sm"
          onCreate={({ editor }) => {
            // 初期値をマークダウンとしてセット
            if (initialContent) {
              editor.commands.setContent(initialContent)
            }
          }}
          onUpdate={({ editor }) => {
            // マークダウン形式で保存
            const markdown =
              editor.storage.markdown?.getMarkdown() || editor.getText()
            onChange(markdown)
          }}
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            attributes: {
              class: 'prose prose-sm max-w-none focus:outline-none',
            },
          }}
        >
          {/* スラッシュコマンドメニュー */}
          <EditorCommand className="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-gray-200 bg-white px-1 py-2 shadow-lg">
            <EditorCommandEmpty className="px-2 py-1 text-sm text-gray-500">
              コマンドが見つかりません
            </EditorCommandEmpty>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                value={item.title}
                onCommand={(val) => item.command?.(val)}
                key={item.title}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-gray-100 aria-selected:bg-gray-100"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-gray-200 bg-white">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </EditorCommandItem>
            ))}
          </EditorCommand>

          {/* テキスト選択時のバブルメニュー */}
          <EditorBubble
            tippyOptions={{
              placement: 'top',
            }}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg"
          >
            <EditorBubbleItem
              onSelect={(editor) =>
                (editor as any).chain().focus().toggleBold().run()
              }
            >
              <button
                type="button"
                className="rounded p-1.5 hover:bg-gray-100"
                title="太字"
              >
                <Bold className="h-4 w-4" />
              </button>
            </EditorBubbleItem>
            <EditorBubbleItem
              onSelect={(editor) =>
                (editor as any).chain().focus().toggleItalic().run()
              }
            >
              <button
                type="button"
                className="rounded p-1.5 hover:bg-gray-100"
                title="斜体"
              >
                <Italic className="h-4 w-4" />
              </button>
            </EditorBubbleItem>
            <EditorBubbleItem
              onSelect={(editor) =>
                (editor as any).chain().focus().toggleStrike().run()
              }
            >
              <button
                type="button"
                className="rounded p-1.5 hover:bg-gray-100"
                title="取り消し線"
              >
                <Strikethrough className="h-4 w-4" />
              </button>
            </EditorBubbleItem>
            <EditorBubbleItem
              onSelect={(editor) =>
                (editor as any).chain().focus().toggleCode().run()
              }
            >
              <button
                type="button"
                className="rounded p-1.5 hover:bg-gray-100"
                title="コード"
              >
                <Code className="h-4 w-4" />
              </button>
            </EditorBubbleItem>
          </EditorBubble>
        </EditorContent>
      </EditorRoot>
    </div>
  )
}
