import { useRef, useState } from 'react'
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

  // 読書メーターCSVインポート
  const [importSheetName, setImportSheetName] = useState('読書メーター')
  const [importing, setImporting] = useState(false)
  const [importMessage, setImportMessage] = useState('')
  const [importError, setImportError] = useState('')
  const [importSkipped, setImportSkipped] = useState<
    { line: number; value: string; reason: string }[]
  >([])
  const importFileRef = useRef<HTMLInputElement>(null)

  const onSelectImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportMessage('')
    setImportError('')
    setImportSkipped([])
    try {
      const csv = await file.text()
      const res = await fetch('/api/import/bookmeter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv, sheetName: importSheetName }),
      })
      const json = await res.json()
      if (!res.ok || !json.result) {
        setImportError(json.message || 'インポートに失敗しました')
      } else {
        setImportMessage(
          `${json.imported}冊をシート「${json.sheetName}」にインポートしました`
        )
        setImportSkipped(json.skipped || [])
      }
    } catch {
      setImportError('インポートに失敗しました')
    } finally {
      setImporting(false)
      if (importFileRef.current) importFileRef.current.value = ''
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

      {/* データエクスポート */}
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-1 text-sm font-bold text-gray-700">
          データエクスポート
        </h3>
        <p className="mb-4 text-xs text-gray-500">
          すべての読書記録をCSV形式でダウンロードできます。
        </p>
        <button
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          onClick={onClickExportCSV}
        >
          CSVでダウンロード
        </button>
      </section>

      {/* データインポート */}
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-1 text-sm font-bold text-gray-700">
          データインポート（読書メーター）
        </h3>
        <p className="mb-4 text-xs text-gray-500">
          読書メーターのエクスポートツール（bookmeter_exporter /
          export_bookmeter）で出力したCSVファイルを取り込めます。
          ISBN形式のCSVはopenBDから書籍情報を自動取得します。
        </p>
        <div className="mb-3">
          <label className="mb-1 block text-xs text-gray-500">
            インポート先シート名（存在しない場合は新規作成されます）
          </label>
          <input
            value={importSheetName}
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            onChange={(e) => setImportSheetName(e.target.value)}
          />
        </div>
        <input
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          ref={importFileRef}
          onChange={onSelectImportFile}
        />
        <button
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={importing || !importSheetName.trim()}
          onClick={() => importFileRef.current?.click()}
        >
          {importing ? 'インポート中...' : 'CSVファイルを選択してインポート'}
        </button>
        <div className="mt-2 text-xs">
          {importError && <p className="text-red-600">{importError}</p>}
          {importMessage && <p className="text-green-600">{importMessage}</p>}
          {importSkipped.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-md bg-slate-50 p-2 text-gray-500">
              <p className="mb-1 font-medium">
                スキップされた行（{importSkipped.length}件）
              </p>
              <ul className="list-inside list-disc">
                {importSkipped.map((row) => (
                  <li key={row.line}>
                    {row.line}行目: {row.value} — {row.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
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
