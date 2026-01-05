import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const Cat3DModel: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null)
  const tailRef = useRef<THREE.Group>(null)
  const earsRef = useRef<THREE.Group>(null)
  const [landingComplete, setLandingComplete] = useState(false)

  // 着地アニメーション
  useEffect(() => {
    const timer = setTimeout(() => {
      setLandingComplete(true)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // アニメーション：降り立つ、尻尾を揺らす、耳を動かす
  useFrame(({ clock }) => {
    if (groupRef.current) {
      if (!landingComplete) {
        // 降り立つアニメーション
        const t = Math.min(clock.elapsedTime / 0.8, 1)
        const easeOut = 1 - Math.pow(1 - t, 3)
        groupRef.current.position.y = -5 + easeOut * 5
        groupRef.current.rotation.y = (1 - easeOut) * Math.PI * 2
      } else {
        // 着地後の浮遊アニメーション
        groupRef.current.position.y = Math.sin(clock.elapsedTime * 2) * 0.1
        groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.1
      }
    }

    if (tailRef.current && landingComplete) {
      tailRef.current.rotation.z = Math.sin(clock.elapsedTime * 2) * 0.2
    }
    if (earsRef.current && landingComplete) {
      earsRef.current.children.forEach((ear, i) => {
        ear.rotation.z = Math.sin(clock.elapsedTime * 3 + i * Math.PI) * 0.05
      })
    }
  })

  // オレンジ色の毛並みマテリアル
  const furMaterial = new THREE.MeshStandardMaterial({
    color: '#ff8844',
    roughness: 0.8,
    metalness: 0.1,
  })

  const darkFurMaterial = new THREE.MeshStandardMaterial({
    color: '#cc6633',
    roughness: 0.9,
    metalness: 0.1,
  })

  const whiteFurMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.7,
    metalness: 0.1,
  })

  const pinkMaterial = new THREE.MeshStandardMaterial({
    color: '#ff88aa',
    roughness: 0.3,
    metalness: 0.2,
  })

  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: '#00ff00',
    emissive: '#004400',
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.1,
  })

  const pupilMaterial = new THREE.MeshStandardMaterial({
    color: '#000000',
    roughness: 0.1,
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 環境光とライティング */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <pointLight position={[-5, 5, 5]} intensity={0.8} color="#ffc088" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.6}
        penumbra={0.5}
        intensity={0.5}
        castShadow
      />

      {/* 体（座った姿勢） */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.8, 32, 32]} />
        <primitive object={furMaterial} attach="material" />
      </mesh>

      {/* 胸の白い部分 */}
      <mesh position={[0, 0.3, 0.5]} castShadow>
        <sphereGeometry args={[0.4, 32, 32]} />
        <primitive object={whiteFurMaterial} attach="material" />
      </mesh>

      {/* 頭 */}
      <mesh position={[0, 1.3, 0.1]} castShadow>
        <sphereGeometry args={[0.65, 32, 32]} />
        <primitive object={furMaterial} attach="material" />
      </mesh>

      {/* 頬の膨らみ */}
      <mesh position={[-0.4, 1.2, 0.3]} castShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <primitive object={furMaterial} attach="material" />
      </mesh>
      <mesh position={[0.4, 1.2, 0.3]} castShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <primitive object={furMaterial} attach="material" />
      </mesh>

      {/* 耳 */}
      <group ref={earsRef}>
        <mesh position={[-0.35, 1.85, 0]} castShadow>
          <coneGeometry args={[0.25, 0.5, 32]} />
          <primitive object={furMaterial} attach="material" />
        </mesh>
        <mesh position={[-0.35, 1.75, 0.05]} castShadow>
          <coneGeometry args={[0.15, 0.3, 32]} />
          <primitive object={pinkMaterial} attach="material" />
        </mesh>

        <mesh position={[0.35, 1.85, 0]} castShadow>
          <coneGeometry args={[0.25, 0.5, 32]} />
          <primitive object={furMaterial} attach="material" />
        </mesh>
        <mesh position={[0.35, 1.75, 0.05]} castShadow>
          <coneGeometry args={[0.15, 0.3, 32]} />
          <primitive object={pinkMaterial} attach="material" />
        </mesh>
      </group>

      {/* 目 */}
      <mesh position={[-0.25, 1.4, 0.55]} castShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <primitive object={eyeMaterial} attach="material" />
      </mesh>
      <mesh position={[-0.25, 1.4, 0.63]}>
        <sphereGeometry args={[0.06, 32, 32]} />
        <primitive object={pupilMaterial} attach="material" />
      </mesh>
      {/* ハイライト */}
      <mesh position={[-0.22, 1.45, 0.68]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <mesh position={[0.25, 1.4, 0.55]} castShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <primitive object={eyeMaterial} attach="material" />
      </mesh>
      <mesh position={[0.25, 1.4, 0.63]}>
        <sphereGeometry args={[0.06, 32, 32]} />
        <primitive object={pupilMaterial} attach="material" />
      </mesh>
      {/* ハイライト */}
      <mesh position={[0.28, 1.45, 0.68]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* 鼻 */}
      <mesh position={[0, 1.15, 0.6]} castShadow>
        <sphereGeometry args={[0.08, 32, 32]} />
        <primitive object={pinkMaterial} attach="material" />
      </mesh>

      {/* 口 */}
      <mesh position={[0, 1.05, 0.58]} rotation={[Math.PI / 6, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 16, 32, Math.PI]} />
        <primitive object={darkFurMaterial} attach="material" />
      </mesh>

      {/* ヒゲ（左） */}
      <mesh position={[-0.4, 1.2, 0.5]} rotation={[0, 0, -0.2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.4, 1.15, 0.5]} rotation={[0, 0, -0.1]}>
        <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.4, 1.1, 0.5]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* ヒゲ（右） */}
      <mesh position={[0.4, 1.2, 0.5]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.4, 1.15, 0.5]} rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.4, 1.1, 0.5]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.6, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* しっぽ */}
      <group ref={tailRef} position={[-0.5, 0.7, -0.5]}>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 6, 0, Math.PI / 4]} castShadow>
          <cylinderGeometry args={[0.15, 0.1, 1.2, 32]} />
          <primitive object={furMaterial} attach="material" />
        </mesh>
      </group>

      {/* 前足（左） */}
      <mesh position={[-0.3, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.8, 32]} />
        <primitive object={furMaterial} attach="material" />
      </mesh>
      <mesh position={[-0.3, -0.4, 0.3]} castShadow>
        <sphereGeometry args={[0.12, 32, 32]} />
        <primitive object={furMaterial} attach="material" />
      </mesh>
      {/* 肉球 */}
      <mesh position={[-0.3, -0.5, 0.35]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <primitive object={pinkMaterial} attach="material" />
      </mesh>

      {/* 前足（右） */}
      <mesh position={[0.3, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.8, 32]} />
        <primitive object={furMaterial} attach="material" />
      </mesh>
      <mesh position={[0.3, -0.4, 0.3]} castShadow>
        <sphereGeometry args={[0.12, 32, 32]} />
        <primitive object={furMaterial} attach="material" />
      </mesh>
      {/* 肉球 */}
      <mesh position={[0.3, -0.5, 0.35]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <primitive object={pinkMaterial} attach="material" />
      </mesh>

      {/* 後ろ足（左） */}
      <mesh position={[-0.5, -0.1, -0.2]} rotation={[0, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.6, 32]} />
        <primitive object={furMaterial} attach="material" />
      </mesh>

      {/* 後ろ足（右） */}
      <mesh position={[0.5, -0.1, -0.2]} rotation={[0, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.6, 32]} />
        <primitive object={furMaterial} attach="material" />
      </mesh>
    </group>
  )
}
