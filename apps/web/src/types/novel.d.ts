/* eslint-disable @typescript-eslint/no-explicit-any */

// novel/extensions のサブパスエクスポートの型宣言
declare module 'novel/extensions' {
  import { Extension, Node, Mark } from '@tiptap/core'
  import type { ReactNode } from 'react'

  // Tiptapの標準拡張機能をre-export
  export const StarterKit: any
  export const TiptapLink: any
  export const TiptapUnderline: any
  export const TiptapImage: any
  export const TextStyle: any
  export const TaskList: any
  export const TaskItem: any
  export const Color: any
  export const CharacterCount: any
  export const CodeBlockLowlight: any
  export const Youtube: any
  export const InputRule: any

  // Novel固有の拡張機能
  export const Command: Extension<any, any>
  export const Placeholder: Extension<any, any>
  export const HorizontalRule: Node<any, any>
  export const HighlightExtension: Mark<any, any>
  export const MarkdownExtension: Extension<any, any>
  export const CustomKeymap: Extension<any, any>

  export interface SuggestionItem {
    title: string
    description: string
    icon: ReactNode
    searchTerms?: string[]
    command?: (props: { editor: any; range: any }) => void
  }

  export function createSuggestionItems(
    items: SuggestionItem[]
  ): SuggestionItem[]
  export function handleCommandNavigation(
    event: KeyboardEvent
  ): true | undefined
}

declare module 'novel/plugins' {
  export function isValidUrl(url: string): boolean
  export function getUrlFromString(str: string): string | null
}
