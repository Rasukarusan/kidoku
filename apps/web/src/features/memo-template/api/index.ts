import { gql } from '@apollo/client'

export interface MemoTemplate {
  id: string
  name: string
  content: string
  isDefault: boolean
}

export const memoTemplatesQuery = gql`
  query MemoTemplates {
    memoTemplates {
      id
      name
      content
      isDefault
    }
  }
`

export const createMemoTemplateMutation = gql`
  mutation CreateMemoTemplate($input: CreateMemoTemplateInput!) {
    createMemoTemplate(input: $input) {
      id
      name
      content
      isDefault
    }
  }
`

export const updateMemoTemplateMutation = gql`
  mutation UpdateMemoTemplate($input: UpdateMemoTemplateInput!) {
    updateMemoTemplate(input: $input) {
      id
      name
      content
      isDefault
    }
  }
`

export const deleteMemoTemplateMutation = gql`
  mutation DeleteMemoTemplate($input: DeleteMemoTemplateInput!) {
    deleteMemoTemplate(input: $input)
  }
`
