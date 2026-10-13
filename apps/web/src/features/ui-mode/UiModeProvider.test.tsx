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
  expect(screen.getByRole('button', { name: 'CLI' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  expect(document.documentElement).toHaveAttribute('data-ui-mode', 'cli')
  fireEvent.click(screen.getByRole('button', { name: 'ターミナル風' }))
  expect(localStorage.getItem('kidoku-ui-mode')).toBe('terminal')
  expect(screen.getByRole('button', { name: 'ターミナル風' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  expect(screen.getByRole('button', { name: 'CLI' })).toHaveAttribute(
    'aria-pressed',
    'false'
  )
  fireEvent.click(screen.getByRole('button', { name: '通常' }))
  expect(document.documentElement).toHaveAttribute('data-ui-mode', 'normal')
})

it('ignores an invalid saved preference', () => {
  localStorage.setItem('kidoku-ui-mode', 'unexpected')
  render(
    <UiModeProvider>
      <UiModeSwitch />
    </UiModeProvider>
  )
  expect(screen.getByRole('button', { name: '通常' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
})
