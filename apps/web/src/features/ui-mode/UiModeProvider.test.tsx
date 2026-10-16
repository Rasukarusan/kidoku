import { fireEvent, render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { UiModeProvider, UiModeSwitch } from './UiModeProvider'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

it('shows one icon and cycles through all modes while persisting the choice', () => {
  render(
    <UiModeProvider>
      <UiModeSwitch />
    </UiModeProvider>
  )
  expect(screen.getAllByRole('button')).toHaveLength(1)
  const button = screen.getByRole('button')
  for (const [current, next, value] of [
    ['通常', 'CLI', 'cli'],
    ['CLI', '通常', 'normal'],
  ]) {
    expect(button).toHaveAccessibleName(
      `UI表示モード: ${current}。${next}に切り替え`
    )
    fireEvent.click(button)
    expect(localStorage.getItem('kidoku-ui-mode')).toBe(value)
    expect(document.documentElement).toHaveAttribute('data-ui-mode', value)
    expect(screen.getAllByRole('button')).toHaveLength(1)
  }
})

it('restores the saved mode and cycles back to normal', () => {
  localStorage.setItem('kidoku-ui-mode', 'cli')
  render(
    <UiModeProvider>
      <UiModeSwitch />
    </UiModeProvider>
  )
  expect(document.documentElement).toHaveAttribute('data-ui-mode', 'cli')
  fireEvent.click(
    screen.getByRole('button', { name: 'UI表示モード: CLI。通常に切り替え' })
  )
  expect(document.documentElement).toHaveAttribute('data-ui-mode', 'normal')
})

it('ignores an invalid saved preference', () => {
  localStorage.setItem('kidoku-ui-mode', 'unexpected')
  render(
    <UiModeProvider>
      <UiModeSwitch />
    </UiModeProvider>
  )
  expect(screen.getByRole('button')).toHaveAccessibleName(
    'UI表示モード: 通常。CLIに切り替え'
  )
})

it('migrates the removed terminal mode to CLI', () => {
  localStorage.setItem('kidoku-ui-mode', 'terminal')
  render(
    <UiModeProvider>
      <UiModeSwitch />
    </UiModeProvider>
  )
  expect(document.documentElement).toHaveAttribute('data-ui-mode', 'cli')
})
