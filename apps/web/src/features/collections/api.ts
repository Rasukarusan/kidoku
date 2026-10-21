import { gql } from '@apollo/client'

export const itemFields = gql`
  fragment CollectionItemFields on ItemResponse {
    id
    userId
    itemTypeId
    title
    imageUrl
    category
    rating
    memo
    isPublicMemo
    isPurchasable
    price
    attributes
    attributesVersion
    collectionIds
    createdAt
    updatedAt
    logs {
      id
      itemId
      kind
      occurredAt
      memo
      rating
    }
  }
`
export const workspaceQuery = gql`
  ${itemFields}
  query CollectionWorkspace {
    itemTypes {
      key
      name
      schemaVersion
      definition
    }
    collections {
      id
      userId
      name
      description
      itemCount
      highlights {
        itemId
        position
      }
    }
    items {
      ...CollectionItemFields
    }
  }
`
export const itemQuery = gql`
  ${itemFields}
  query CollectionItem($id: Int!) {
    item(id: $id) {
      ...CollectionItemFields
    }
    itemTypes {
      key
      name
      schemaVersion
      definition
    }
    collections {
      id
      userId
      name
      description
      itemCount
      highlights {
        itemId
        position
      }
    }
  }
`
export const definitionsQuery = gql`
  query CollectionDefinitions {
    itemTypes {
      key
      name
      schemaVersion
      definition
    }
    collections {
      id
      userId
      name
      description
      itemCount
      highlights {
        itemId
        position
      }
    }
  }
`
export const saveItemMutation = gql`
  ${itemFields}
  mutation SaveCollectionItem($input: SaveItemInput!) {
    saveItem(input: $input) {
      ...CollectionItemFields
    }
  }
`
export const deleteItemMutation = gql`
  mutation DeleteCollectionItem($id: Int!) {
    deleteItem(id: $id)
  }
`
export const saveCollectionMutation = gql`
  mutation SaveCollection($input: SaveCollectionInput!) {
    saveCollection(input: $input) {
      id
      name
      description
    }
  }
`
export const deleteCollectionMutation = gql`
  mutation DeleteCollection($id: Int!) {
    deleteCollection(id: $id)
  }
`
export const saveLogMutation = gql`
  mutation SaveItemLog($itemId: Int!, $id: Int, $input: ItemLogInput!) {
    saveItemLog(itemId: $itemId, id: $id, input: $input) {
      id
      itemId
      kind
      occurredAt
      memo
      rating
    }
  }
`
export const deleteLogMutation = gql`
  mutation DeleteItemLog($itemId: Int!, $id: Int!) {
    deleteItemLog(itemId: $itemId, id: $id)
  }
`

export const setHighlightMutation = gql`
  mutation SetCollectionHighlight(
    $collectionId: Int!
    $position: Int!
    $itemId: Int
  ) {
    setCollectionHighlight(
      collectionId: $collectionId
      position: $position
      itemId: $itemId
    )
  }
`
