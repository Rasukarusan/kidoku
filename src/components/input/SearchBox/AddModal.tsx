import { Item } from '@/types/search'

interface Props {
  item: Item
}

export const AddModal: React.FC<Props> = ({ item }) => {
  return (
    <div>
      <div>{item.volumeInfo.title}</div>
    </div>
  )
}
