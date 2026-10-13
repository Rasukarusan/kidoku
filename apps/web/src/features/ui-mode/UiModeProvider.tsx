import { createContext, useContext, useEffect, useState } from 'react'

export type UiMode = 'normal' | 'terminal' | 'cli'
const STORAGE_KEY = 'kidoku-ui-mode'
const isUiMode = (value: string): value is UiMode =>
  ['normal', 'terminal', 'cli'].includes(value)

const UiModeContext = createContext<{
  mode: UiMode
  setMode: (mode: UiMode) => void
}>({ mode: 'normal', setMode: () => {} })

export function UiModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, updateMode] = useState<UiMode>('normal')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (isUiMode(saved)) updateMode(saved)
    } catch {
      // Storage can be disabled; switching still works for this session.
    }
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        updateMode(isUiMode(event.newValue) ? event.newValue : 'normal')
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
  return (
    <label className="flex shrink-0 items-center gap-1 text-xs text-gray-700">
      <span className="sr-only">UI表示モード</span>
      <select
        aria-label="UI表示モード"
        value={mode}
        onChange={(event) => setMode(event.target.value as UiMode)}
        className="max-w-[120px] rounded border border-gray-300 bg-white px-1 py-2 text-xs sm:px-2"
      >
        <option value="normal">通常</option>
        <option value="terminal">ターミナル風</option>
        <option value="cli">CLI</option>
      </select>
    </label>
  )
}
