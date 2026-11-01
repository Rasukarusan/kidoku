import { fireEvent, render, screen } from '@testing-library/react'
import { ImagePicker } from './ImagePicker'
import { NO_IMAGE } from '@/libs/constants'

jest.mock('../layout/Modal', () => ({
  Modal: ({ open, children }) => (open ? <div>{children}</div> : null),
}))

it.each([undefined, '', 'https://example.com/missing.png'])(
  'allows selecting an image when the current image is %s',
  (img) => {
    const { container } = render(<ImagePicker img={img} />)
    if (img) fireEvent.error(container.querySelector('img'))
    expect(container.querySelector('img')).toHaveAttribute('src', NO_IMAGE)
    fireEvent.click(screen.getByRole('button', { name: '画像を設定' }))
    expect(screen.getByText('決定')).toBeVisible()
    expect(container.querySelector('input[type="file"]')).toBeInTheDocument()
  }
)
