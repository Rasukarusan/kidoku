'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Book3D } from './Book3D'
import { Book } from '@/types/book'

type BookShelf3DProps = {
  books: Book[]
  onBookClick?: (book: Book) => void
}

// 棚板コンポーネント
const Shelf = ({ position }: { position: [number, number, number] }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[5, 0.05, 0.6]} />
      <meshStandardMaterial color="#5D4037" />
    </mesh>
  )
}

// 本棚の背板
const BackBoard = () => {
  return (
    <mesh position={[0, 0, -0.35]}>
      <boxGeometry args={[5.2, 3.5, 0.05]} />
      <meshStandardMaterial color="#4E342E" />
    </mesh>
  )
}

// 本棚の側板
const SideBoard = ({ position }: { position: [number, number, number] }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.1, 3.5, 0.7]} />
      <meshStandardMaterial color="#5D4037" />
    </mesh>
  )
}

// ランダムな色を生成（本の背表紙用）
const getBookColor = (index: number): string => {
  const colors = [
    '#8B4513', // 茶色
    '#2E7D32', // 緑
    '#1565C0', // 青
    '#C62828', // 赤
    '#6A1B9A', // 紫
    '#F57F17', // オレンジ
    '#00695C', // ティール
    '#4527A0', // 深い紫
    '#AD1457', // ピンク
    '#37474F', // グレー
  ]
  return colors[index % colors.length]
}

export const BookShelf3D = ({ books, onBookClick }: BookShelf3DProps) => {
  // 本を1段に最大12冊配置
  const booksPerShelf = 12
  const bookWidth = 0.18 // 本の幅 + 間隔
  const shelfStartX = -2.2 // 棚の開始位置

  // 本の位置を計算
  const getBookPosition = (index: number): [number, number, number] => {
    const shelfIndex = Math.floor(index / booksPerShelf)
    const positionInShelf = index % booksPerShelf
    const x = shelfStartX + positionInShelf * bookWidth
    const y = 1.2 - shelfIndex * 1.1 // 各段の高さ
    const z = 0
    return [x, y, z]
  }

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0.5, 4]} fov={50} />
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, 5, 5]} intensity={0.5} />

        {/* 本棚の構造 */}
        <BackBoard />
        <SideBoard position={[-2.55, 0, 0]} />
        <SideBoard position={[2.55, 0, 0]} />

        {/* 棚板（3段） */}
        <Shelf position={[0, 0.75, 0]} />
        <Shelf position={[0, -0.35, 0]} />
        <Shelf position={[0, -1.45, 0]} />
        <Shelf position={[0, 1.65, 0]} />

        {/* 本を配置 */}
        <Suspense fallback={null}>
          {books.slice(0, 36).map((book, index) => (
            <Book3D
              key={book.id}
              position={getBookPosition(index)}
              title={book.title}
              image={book.image}
              color={getBookColor(index)}
              onClick={() => onBookClick?.(book)}
            />
          ))}
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={2}
          maxDistance={8}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}
