'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Html } from '@react-three/drei'
import { Suspense, useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'

// 歩行状態の型定義
interface WalkState {
  position: THREE.Vector3
  direction: THREE.Vector3
  speed: number
  isWalking: boolean
}

// 猫コンポーネントのProps
interface CatModelProps {
  walkState: WalkState
  onBoundaryHit: () => void
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
}

// シンプルな3D猫モデル（プリミティブで構成）
function SimpleCat({ walkState, onBoundaryHit, bounds }: CatModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const legRefs = useRef<THREE.Mesh[]>([])
  const tailRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (!groupRef.current || !walkState.isWalking) return

    // 位置の更新
    const newX =
      walkState.position.x + walkState.direction.x * walkState.speed * delta
    const newZ =
      walkState.position.z + walkState.direction.z * walkState.speed * delta

    // 境界チェック
    if (
      newX < bounds.minX ||
      newX > bounds.maxX ||
      newZ < bounds.minZ ||
      newZ > bounds.maxZ
    ) {
      onBoundaryHit()
      return
    }

    walkState.position.x = newX
    walkState.position.z = newZ

    // グループの位置と向きを更新
    groupRef.current.position.copy(walkState.position)
    const angle = Math.atan2(walkState.direction.x, walkState.direction.z)
    groupRef.current.rotation.y = angle

    // 足のアニメーション
    const time = state.clock.elapsedTime * 8
    legRefs.current.forEach((leg, index) => {
      if (leg) {
        const offset = index < 2 ? 0 : Math.PI
        const sideOffset = index % 2 === 0 ? 0 : Math.PI
        leg.rotation.x = Math.sin(time + offset + sideOffset) * 0.3
      }
    })

    // しっぽのアニメーション
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.2
      tailRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 2) * 0.1 + 0.3
    }
  })

  // 猫の色（キジトラ風）
  const bodyColor = '#8B7355'
  const stripeColor = '#4A3728'
  const eyeColor = '#90EE90'

  return (
    <group
      ref={groupRef}
      position={[walkState.position.x, 0.3, walkState.position.z]}
    >
      {/* 体 */}
      <mesh position={[0, 0.15, 0]}>
        <capsuleGeometry args={[0.12, 0.3, 8, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* 頭 */}
      <mesh position={[0, 0.25, 0.25]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* 耳 */}
      <mesh position={[-0.06, 0.38, 0.25]} rotation={[0, 0, -0.3]}>
        <coneGeometry args={[0.04, 0.08, 4]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      <mesh position={[0.06, 0.38, 0.25]} rotation={[0, 0, 0.3]}>
        <coneGeometry args={[0.04, 0.08, 4]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* 目 */}
      <mesh position={[-0.04, 0.27, 0.35]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial
          color={eyeColor}
          emissive={eyeColor}
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[0.04, 0.27, 0.35]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial
          color={eyeColor}
          emissive={eyeColor}
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* 鼻 */}
      <mesh position={[0, 0.22, 0.36]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="#FFB6C1" />
      </mesh>

      {/* 足（前後左右） */}
      {[
        [-0.06, 0, 0.12],
        [0.06, 0, 0.12],
        [-0.06, 0, -0.12],
        [0.06, 0, -0.12],
      ].map((pos, index) => (
        <mesh
          key={index}
          ref={(el) => {
            if (el) legRefs.current[index] = el
          }}
          position={pos as [number, number, number]}
        >
          <cylinderGeometry args={[0.025, 0.02, 0.15, 8]} />
          <meshStandardMaterial color={stripeColor} />
        </mesh>
      ))}

      {/* しっぽ */}
      <mesh ref={tailRef} position={[0, 0.2, -0.25]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.01, 0.25, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* 縞模様 */}
      {[-0.05, 0, 0.05].map((offset, index) => (
        <mesh key={`stripe-${index}`} position={[0, 0.18, offset]}>
          <boxGeometry args={[0.25, 0.02, 0.03]} />
          <meshStandardMaterial color={stripeColor} />
        </mesh>
      ))}
    </group>
  )
}

// GLTFモデルを使用する猫コンポーネント
interface GLTFCatProps extends CatModelProps {
  modelUrl: string
}

function GLTFCat({ modelUrl, walkState, onBoundaryHit, bounds }: GLTFCatProps) {
  const { scene, animations } = useGLTF(modelUrl)
  const groupRef = useRef<THREE.Group>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)

  useEffect(() => {
    if (animations.length > 0) {
      mixerRef.current = new THREE.AnimationMixer(scene)
      const action = mixerRef.current.clipAction(animations[0])
      action.play()
    }
    return () => {
      mixerRef.current?.stopAllAction()
    }
  }, [animations, scene])

  useFrame((state, delta) => {
    if (!groupRef.current || !walkState.isWalking) return

    // アニメーションの更新
    mixerRef.current?.update(delta)

    // 位置の更新
    const newX =
      walkState.position.x + walkState.direction.x * walkState.speed * delta
    const newZ =
      walkState.position.z + walkState.direction.z * walkState.speed * delta

    // 境界チェック
    if (
      newX < bounds.minX ||
      newX > bounds.maxX ||
      newZ < bounds.minZ ||
      newZ > bounds.maxZ
    ) {
      onBoundaryHit()
      return
    }

    walkState.position.x = newX
    walkState.position.z = newZ

    groupRef.current.position.copy(walkState.position)
    const angle = Math.atan2(walkState.direction.x, walkState.direction.z)
    groupRef.current.rotation.y = angle
  })

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={0.5} />
    </group>
  )
}

// ローディング表示
function LoadingFallback() {
  return (
    <Html center>
      <div className="text-sm text-gray-500">Loading cat...</div>
    </Html>
  )
}

// メインのWalkingCatコンポーネント
interface WalkingCatProps {
  modelUrl?: string
  className?: string
  style?: React.CSSProperties
  autoPlay?: boolean
}

export function WalkingCat({
  modelUrl,
  className = '',
  style,
  autoPlay = true,
}: WalkingCatProps) {
  const [walkState, setWalkState] = useState<WalkState>(() => ({
    position: new THREE.Vector3(0, 0, 0),
    direction: new THREE.Vector3(1, 0, 0).normalize(),
    speed: 0.5,
    isWalking: autoPlay,
  }))

  const bounds = useMemo(
    () => ({
      minX: -3,
      maxX: 3,
      minZ: -2,
      maxZ: 2,
    }),
    []
  )

  const handleBoundaryHit = () => {
    // ランダムな新しい方向を設定
    const newAngle = Math.random() * Math.PI * 2
    setWalkState((prev) => ({
      ...prev,
      direction: new THREE.Vector3(
        Math.sin(newAngle),
        0,
        Math.cos(newAngle)
      ).normalize(),
    }))
  }

  const toggleWalking = () => {
    setWalkState((prev) => ({
      ...prev,
      isWalking: !prev.isWalking,
    }))
  }

  // 定期的に方向を変える
  useEffect(() => {
    if (!walkState.isWalking) return

    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        const newAngle = Math.random() * Math.PI * 2
        setWalkState((prev) => ({
          ...prev,
          direction: new THREE.Vector3(
            Math.sin(newAngle),
            0,
            Math.cos(newAngle)
          ).normalize(),
        }))
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [walkState.isWalking])

  return (
    <div
      className={`relative ${className}`}
      style={{ width: '100%', height: '300px', ...style }}
      onClick={toggleWalking}
    >
      <Canvas
        camera={{ position: [0, 3, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
        <pointLight position={[-5, 3, -5]} intensity={0.4} />

        <Suspense fallback={<LoadingFallback />}>
          {modelUrl ? (
            <GLTFCat
              modelUrl={modelUrl}
              walkState={walkState}
              onBoundaryHit={handleBoundaryHit}
              bounds={bounds}
            />
          ) : (
            <SimpleCat
              walkState={walkState}
              onBoundaryHit={handleBoundaryHit}
              bounds={bounds}
            />
          )}
        </Suspense>

        {/* 地面 */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#f5f5f5" transparent opacity={0.5} />
        </mesh>
      </Canvas>

      {/* 操作説明 */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-400">
        Click to {walkState.isWalking ? 'pause' : 'resume'}
      </div>
    </div>
  )
}

export default WalkingCat
