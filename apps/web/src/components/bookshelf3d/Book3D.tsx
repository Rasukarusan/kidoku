'use client'

import { useRef, useState } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import * as THREE from 'three'

type Book3DProps = {
  position: [number, number, number]
  title: string
  image?: string
  color?: string
  onClick?: () => void
}

export const Book3D = ({
  position,
  title: _title,
  image,
  color = '#8B4513',
  onClick,
}: Book3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // 本のサイズ（幅、高さ、奥行き）
  const width = 0.15
  const height = 0.8
  const depth = 0.5

  // ホバー時のアニメーション
  useFrame(() => {
    if (meshRef.current) {
      const targetZ = hovered ? position[2] + 0.1 : position[2]
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z,
        targetZ,
        0.1
      )
    }
  })

  // 表紙画像をテクスチャとして読み込み
  const texture = image ? useLoader(TextureLoader, image) : null

  // 各面のマテリアル（前面に表紙、他は背表紙の色）
  const materials = [
    new THREE.MeshStandardMaterial({ color }), // 右
    new THREE.MeshStandardMaterial({ color }), // 左
    new THREE.MeshStandardMaterial({ color }), // 上
    new THREE.MeshStandardMaterial({ color }), // 下
    texture
      ? new THREE.MeshStandardMaterial({ map: texture })
      : new THREE.MeshStandardMaterial({ color }), // 前（表紙）
    new THREE.MeshStandardMaterial({ color }), // 後
  ]

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      material={materials}
    >
      <boxGeometry args={[width, height, depth]} />
    </mesh>
  )
}
