import { useRef, useState } from 'react'
import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { NextSeo } from 'next-seo'
import { useLazyQuery, useMutation, useQuery } from '@apollo/client'
import {
  isNameAvailableQuery,
  updateUserNameMutation,
  deleteUserMutation,
  mySuiAddressQuery,
  updateSuiAddressMutation,
} from '@/features/user/api'
import { SuiLogo } from '@/components/icon/SuiLogo'

interface Props {
  name: string
  image: string
}
export const ProfilePage: React.FC<Props> = ({ name, image }) => {
  const [currentName, setCurrentName] = useState(name)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const savedNameRef = useRef(name)

  const [checkNameAvailable] = useLazyQuery(isNameAvailableQuery)
  const [updateUserName] = useMutation(updateUserNameMutation)
  const [deleteUser] = useMutation(deleteUserMutation)

  // Sui 受取アドレス
  const [suiAddress, setSuiAddress] = useState('')
  const [suiError, setSuiError] = useState('')
  const [suiSaved, setSuiSaved] = useState(false)
  const savedSuiRef = useRef('')
  useQuery(mySuiAddressQuery, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      const addr = data?.mySuiAddress ?? ''
      setSuiAddress(addr)
      savedSuiRef.current = addr
    },
  })
  const [updateSuiAddress] = useMutation(updateSuiAddressMutation)

  const onChangeSui = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim()
    setSuiAddress(value)
    setSuiSaved(false)
    setSuiError(
      value === '' || /^0x[0-9a-fA-F]{1,64}$/.test(value)
        ? ''
        : '0x で始まる正しい Sui アドレスを入力してください'
    )
  }
  const onBlurSui = async () => {
    if (suiError || suiAddress === savedSuiRef.current) return
    await updateSuiAddress({ variables: { input: { suiAddress } } })
    savedSuiRef.current = suiAddress
    setSuiSaved(true)
  }

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setCurrentName(newName)
    setSaved(false)
    const { data } = await checkNameAvailable({
      variables: { input: { name: newName } },
    })
    setError(
      data?.isNameAvailable ? '' : 'すでに利用されているため登録できません'
    )
  }
  const onBlur = async () => {
    if (error || currentName === savedNameRef.current || !currentName) return
    await updateUserName({
      variables: { input: { name: currentName } },
    })
    savedNameRef.current = currentName
    setSaved(true)
  }

  const onClickDelete = async () => {
    const confirm = window.confirm('アカウントを削除してもよろしいですか？')
    if (!confirm) return
    const { data } = await deleteUser()
    if (data?.deleteUser) {
      location.href = '/'
    }
  }

  const onClickExportCSV = () => {
    window.open('/api/export/csv', '_blank')
  }

  const onClickExportMarkdown = () => {
    window.open('/api/export/markdown', '_blank')
  }

  // CSVインポート
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState('')
  const [importError, setImportError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult('')
    setImportError('')
    try {
      const csv = await file.text()
      const res = await fetch('/api/import/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv }),
      })
      const data = await res.json()
      if (res.ok && data.result) {
        setImportResult(
          `${data.imported}件を取り込みました（スキップ${data.skipped}件、シート作成${data.createdSheets}件）`
        )
      } else {
        setImportError(data.error || 'インポートに失敗しました')
      }
    } catch {
      setImportError('インポートに失敗しました')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Container className="px-4 py-8 sm:px-10 sm:py-10">
      <NextSeo title="アカウント設定 | kidoku" />
      <h2 className="mb-6 text-2xl font-bold">設定</h2>

      {/* プロフィール */}
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-bold text-gray-700">プロフィール</h3>
        <div className="flex items-center gap-5">
          <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full">
            <img
              src={image}
              width={72}
              height={72}
              className="h-full w-full object-cover"
              alt="プロフィール画像"
            />
          </div>
          <div className="min-w-0 flex-1">
            <label className="mb-1 block text-xs text-gray-500">表示名</label>
            <input
              value={currentName}
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              onChange={onChange}
              onBlur={onBlur}
            />
            <div className="mt-1 h-4 text-xs">
              {error && <span className="text-red-600">{error}</span>}
              {saved && <span className="text-green-600">保存しました</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Sui 受取アドレス */}
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <div className="mb-1 flex items-center gap-2">
          <SuiLogo size={16} className="text-sky-500" />
          <h3 className="text-sm font-bold text-gray-700">Sui 受取アドレス</h3>
        </div>
        <p className="mb-4 text-xs text-gray-500">
          有料メモが購入されたときに SUI を受け取るウォレットアドレスです。
          未設定の場合、あなたの本は Sui で購入できません。
        </p>
        <input
          value={suiAddress}
          placeholder="0x..."
          spellCheck={false}
          className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm outline-none transition focus:border-slate-400 focus:bg-white"
          onChange={onChangeSui}
          onBlur={onBlurSui}
        />
        <div className="mt-1 h-4 text-xs">
          {suiError && <span className="text-red-600">{suiError}</span>}
          {suiSaved && <span className="text-green-600">保存しました</span>}
        </div>
      </section>

      {/* 年間レポート */}
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-1 text-sm font-bold text-gray-700">年間レポート</h3>
        <p className="mb-4 text-xs text-gray-500">
          年ごとの詳細な読書レポートを自分だけで振り返れます。印刷・PDF保存にも対応しています。
        </p>
        <Link
          href="/report"
          className="inline-block rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-50"
        >
          レポートを見る
        </Link>
      </section>

      {/* メモテンプレート */}
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-1 text-sm font-bold text-gray-700">
          メモテンプレート
        </h3>
        <p className="mb-4 text-xs text-gray-500">
          本を登録するときのメモの雛形を自分の型にカスタマイズできます。
        </p>
        <Link
          href="/settings/memo-templates"
          className="inline-block rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-50"
        >
          テンプレートを管理する
        </Link>
      </section>

      {/* 評価軸 */}
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-1 text-sm font-bold text-gray-700">評価軸</h3>
        <p className="mb-4 text-xs text-gray-500">
          「没入度」「難易度」など、自分だけの採点基準を作って本を5段階で評価できます。
        </p>
        <Link
          href="/settings/rating-axes"
          className="inline-block rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-50"
        >
          評価軸を管理する
        </Link>
      </section>

      {/* データエクスポート */}
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-1 text-sm font-bold text-gray-700">
          データエクスポート
        </h3>
        <p className="mb-4 text-xs text-gray-500">
          すべての読書記録をCSV形式、またはObsidian等で使えるMarkdown形式（1冊=1ファイルのzip）でダウンロードできます。
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            onClick={onClickExportCSV}
          >
            CSVでダウンロード
          </button>
          <button
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-50"
            onClick={onClickExportMarkdown}
          >
            Markdown(zip)でダウンロード
          </button>
        </div>
      </section>

      {/* データインポート */}
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-1 text-sm font-bold text-gray-700">
          データインポート
        </h3>
        <p className="mb-4 text-xs text-gray-500">
          エクスポートしたCSVを書き戻せます。ヘッダー行に「タイトル」列があれば他サービスのCSVも取り込めます（著者・カテゴリ・評価・メモ・読了日・シート名に対応）。
          同じシートに同じタイトルの本がある場合はスキップされます。
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onImportFile}
        />
        <button
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-50 disabled:opacity-50"
          disabled={importing}
          onClick={() => fileInputRef.current?.click()}
        >
          {importing ? 'インポート中...' : 'CSVファイルを選択'}
        </button>
        <div className="mt-2 h-4 text-xs">
          {importResult && (
            <span className="text-green-600">{importResult}</span>
          )}
          {importError && <span className="text-red-600">{importError}</span>}
        </div>
      </section>

      {/* 個人用API */}
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-1 text-sm font-bold text-gray-700">個人用API</h3>
        <p className="mb-4 text-xs text-gray-500">
          アクセストークンを発行して、自分の読書記録を外部ツールから読み取れます。
        </p>
        <Link
          href="/settings/api-tokens"
          className="inline-block rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-50"
        >
          トークンを管理する
        </Link>
      </section>

      {/* アカウント削除 */}
      <section className="rounded-lg border border-red-100 bg-red-50/40 p-6">
        <h3 className="mb-1 text-sm font-bold text-red-600">アカウント削除</h3>
        <p className="mb-4 text-xs text-gray-500">
          アカウントを削除すると登録されていたデータは全て削除され、復元できません。
        </p>
        <button
          className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
          onClick={onClickDelete}
        >
          アカウントを削除する
        </button>
      </section>
    </Container>
  )
}
