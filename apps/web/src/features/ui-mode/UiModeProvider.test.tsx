import { fireEvent, render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { UiModeProvider, UiModeSwitch } from './UiModeProvider'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

it('restores and persists a mode, then returns to the normal UI', () => {
  localStorage.setItem('kidoku-ui-mode', 'cli')
  render(
    <UiModeProvider>
      <UiModeSwitch />
    </UiModeProvider>
  )
  expect(screen.getByRole('combobox')).toHaveValue('cli')
  expect(document.documentElement).toHaveAttribute('data-ui-mode', 'cli')
  fireEvent.change(screen.getByRole('combobox'), {
    target: { value: 'terminal' },
  })
  expect(localStorage.getItem('kidoku-ui-mode')).toBe('terminal')
  fireEvent.change(screen.getByRole('combobox'), {
    target: { value: 'normal' },
  })
  expect(document.documentElement).toHaveAttribute('data-ui-mode', 'normal')
})

it('ignores an invalid saved preference', () => {
  localStorage.setItem('kidoku-ui-mode', 'unexpected')
  render(
    <UiModeProvider>
      <UiModeSwitch />
    </UiModeProvider>
  )
  expect(screen.getByRole('combobox')).toHaveValue('normal')
})
