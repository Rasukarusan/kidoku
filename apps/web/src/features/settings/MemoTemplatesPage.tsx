import { useState } from 'react'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import { useMutation, useQuery } from '@apollo/client'
import { Container } from '@/components/layout/Container'
import {
  MemoTemplate,
  memoTemplatesQuery,
  createMemoTemplateMutation,
  updateMemoTemplateMutation,
  deleteMemoTemplateMutation,
} from '@/features/memo-template/api'

const inputClass =
  'w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white'

interface EditorProps {
  template?: MemoTemplate
  onSaved: () => void
  onCancel?: () => void
}

const TemplateEditor: React.FC<EditorProps> = ({
  template,
  onSaved,
  onCancel,
}) => {
  const [name, setName] = useState(template?.name ?? '')
  const [content, setContent] = useState(template?.content ?? '')
  const [isDefault, setIsDefault] = useState(template?.isDefault ?? false)
  const [error, setError] = useState('')
  const [createTemplate, { loading: creating }] = useMutation(
    createMemoTemplateMutation
  )
  const [updateTemplate, { loading: updating }] = useMutation(
    updateMemoTemplateMutation
  )

  const onSave = async () => {
    setError('')
    if (!name.trim() || !content.trim()) {
      setError('テンプレート名と内容を入力してください')
      return
    }
    try {
      if (template) {
        await updateTemplate({
          variables: {
            input: { id: Number(template.id), name, content, isDefault },
          },
          refetchQueries: ['MemoTemplates'],
        })
      } else {
        await createTemplate({
          variables: { input: { name, content, isDefault } },
          refetchQueries: ['MemoTemplates'],
        })
        setName('')
        setContent('')
        setIsDefault(false)
      }
      onSaved()
    } catch {
      setError('保存に失敗しました')
    }
  }

  return (
    <div>
      <label className="mb-1 block text-xs text-gray-500">テンプレート名</label>
      <input
        value={name}
        placeholder="例: 学びメモ"
        className={inputClass}
        onChange={(e) => setName(e.target.value)}
      />
      <label className="mb-1 mt-3 block text-xs text-gray-500">内容</label>
      <textarea
        value={content}
        placeholder={'【学び】\n\n【アクション】\n'}
        rows={6}
        className={`${inputClass} font-mono`}
        onChange={(e) => setContent(e.target.value)}
      />
      <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
        />
        本を登録するときのデフォルトにする
      </label>
      <div className="mt-3 flex items-center gap-2">
        <button
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
          disabled={creating || updating}
          onClick={onSave}
        >
          {template ? '保存' : '追加'}
        </button>
        {onCancel && (
          <button
            className="rounded-md px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100"
            onClick={onCancel}
          >
            キャンセル
          </button>
        )}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  )
}

export const MemoTemplatesPage: React.FC = () => {
  const { data, refetch } = useQuery(memoTemplatesQuery)
  const [deleteTemplate] = useMutation(deleteMemoTemplateMutation)
  const [editingId, setEditingId] = useState<string | null>(null)
  const templates: MemoTemplate[] = data?.memoTemplates ?? []

  const onDelete = async (template: MemoTemplate) => {
    if (!window.confirm(`「${template.name}」を削除してもよろしいですか？`))
      return
    await deleteTemplate({
      variables: { input: { id: Number(template.id) } },
    })
    await refetch()
  }

  return (
    <Container className="px-4 py-8 sm:px-10 sm:py-10">
      <NextSeo title="メモテンプレート | kidoku" />
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">メモテンプレート</h2>
        <Link
          href="/settings/profile"
          className="text-sm text-blue-500 hover:underline"
        >
          設定に戻る
        </Link>
      </div>
      <p className="mb-6 text-sm text-gray-500">
        本を登録するときのメモの雛形を自分の型にカスタマイズできます。
        デフォルトに設定したテンプレートが新規登録時に自動で挿入されます。
      </p>

      {/* 新規作成 */}
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-bold text-gray-700">
          新しいテンプレート
        </h3>
        <TemplateEditor onSaved={() => refetch()} />
      </section>

      {/* 一覧 */}
      {templates.map((template) => (
        <section
          key={template.id}
          className="mb-4 rounded-lg border border-slate-200 bg-white p-6"
        >
          {editingId === template.id ? (
            <TemplateEditor
              template={template}
              onSaved={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-700">
                  {template.name}
                </h3>
                {template.isDefault && (
                  <span className="rounded bg-teal-50 px-2 py-0.5 text-xs text-teal-700">
                    デフォルト
                  </span>
                )}
              </div>
              <pre className="mb-3 whitespace-pre-wrap rounded bg-slate-50 p-3 font-mono text-xs text-gray-600">
                {template.content}
              </pre>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-slate-300 px-3 py-1 text-xs text-gray-600 transition hover:bg-slate-50"
                  onClick={() => setEditingId(template.id)}
                >
                  編集
                </button>
                <button
                  className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-500 transition hover:bg-red-50"
                  onClick={() => onDelete(template)}
                >
                  削除
                </button>
              </div>
            </>
          )}
        </section>
      ))}
      {templates.length === 0 && (
        <p className="text-sm text-gray-400">
          まだテンプレートがありません。上のフォームから作成できます。
        </p>
      )}
    </Container>
  )
}
