import { createContext, useContext, useEffect, useState } from 'react'
import { LayoutGrid, Monitor, Terminal } from 'lucide-react'

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
  const modes = [
    { value: 'normal' as const, label: '通常', Icon: LayoutGrid },
    { value: 'terminal' as const, label: 'ターミナル風', Icon: Monitor },
    { value: 'cli' as const, label: 'CLI', Icon: Terminal },
  ]
  return (
    <div
      role="group"
      aria-label="UI表示モード"
      className="flex shrink-0 items-center gap-1 rounded border border-gray-300 bg-white p-1"
    >
      {modes.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          aria-pressed={mode === value}
          title={label}
          onClick={() => setMode(value)}
          className={`rounded p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
            mode === value
              ? 'bg-gray-100 text-emerald-600 ring-1 ring-emerald-500'
              : 'text-gray-500 hover:text-emerald-600'
          }`}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}
