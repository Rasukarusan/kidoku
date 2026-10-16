import { createContext, useContext, useEffect, useState } from 'react'
import { LayoutGrid, Terminal } from 'lucide-react'

export type UiMode = 'normal' | 'cli'
const STORAGE_KEY = 'kidoku-ui-mode'
// 廃止した「ターミナル風」モードを選んでいた人はCLIに引き継ぐ
const parseUiMode = (value: string | null): UiMode =>
  value === 'cli' || value === 'terminal' ? 'cli' : 'normal'

const UiModeContext = createContext<{
  mode: UiMode
  setMode: (mode: UiMode) => void
}>({ mode: 'normal', setMode: () => {} })

export function UiModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, updateMode] = useState<UiMode>('normal')

  useEffect(() => {
    try {
      updateMode(parseUiMode(localStorage.getItem(STORAGE_KEY)))
    } catch {
      // Storage can be disabled; switching still works for this session.
    }
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        updateMode(parseUiMode(event.newValue))
      }
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.uiMode = mode
    return () => {
      delete document.documentElement.dataset.uiMode
    }
  }, [mode])

  const setMode = (next: UiMode) => {
    updateMode(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Keep the in-memory preference when storage is unavailable.
    }
  }

  return (
    <UiModeContext.Provider value={{ mode, setMode }}>
      {children}
    </UiModeContext.Provider>
  )
}

export const useUiMode = () => useContext(UiModeContext)

export function UiModeSwitch() {
  const { mode, setMode } = useUiMode()
  const modes = [
    { value: 'normal' as const, label: '通常', Icon: LayoutGrid },
    { value: 'cli' as const, label: 'CLI', Icon: Terminal },
  ]
  const currentIndex = modes.findIndex((item) => item.value === mode)
  const current = modes[currentIndex]
  const next = modes[(currentIndex + 1) % modes.length]
  const Icon = current.Icon
  const label = `UI表示モード: ${current.label}。${next.label}に切り替え`
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setMode(next.value)}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-600 transition-colors hover:text-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  )
}
