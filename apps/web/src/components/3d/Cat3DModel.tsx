import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const Cat3DModel: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null)
  const tailRef = useRef<THREE.Group>(null)
  const leftEarRef = useRef<THREE.Mesh>(null)
  const rightEarRef = useRef<THREE.Mesh>(null)
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
        groupRef.current.position.y = Math.sin(clock.elapsedTime * 2) * 0.08
        groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.05
      }
    }

    if (tailRef.current && landingComplete) {
      // しっぽをゆらゆら
      tailRef.current.rotation.z = Math.sin(clock.elapsedTime * 1.5) * 0.3
      tailRef.current.rotation.x = Math.sin(clock.elapsedTime * 1.2) * 0.1
    }

    // 耳をピクピク
    if (leftEarRef.current && landingComplete) {
      leftEarRef.current.rotation.z =
        Math.sin(clock.elapsedTime * 3) * 0.08 + 0.1
    }
    if (rightEarRef.current && landingComplete) {
      rightEarRef.current.rotation.z =
        Math.sin(clock.elapsedTime * 3 + Math.PI) * 0.08 - 0.1
    }
  })

  // 黒猫の毛並みマテリアル（光沢のある黒）
  const blackFurMaterial = new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    roughness: 0.6,
    metalness: 0.05,
  })

  const darkFurMaterial = new THREE.MeshStandardMaterial({
    color: '#0a0a0a',
    roughness: 0.7,
    metalness: 0.05,
  })

  // 鼻（小さなピンク）
  const noseMaterial = new THREE.MeshStandardMaterial({
    color: '#2a2a2a',
    roughness: 0.4,
    metalness: 0.1,
  })

  // 目（金色に光る）
  const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.2,
    metalness: 0.1,
  })

  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: '#ffcc00',
    emissive: '#aa8800',
    emissiveIntensity: 0.8,
    metalness: 0.9,
    roughness: 0.1,
  })

  const pupilMaterial = new THREE.MeshStandardMaterial({
    color: '#000000',
    roughness: 0.1,
    metalness: 0.8,
  })

  // 肉球（ピンク）
  const pawPadMaterial = new THREE.MeshStandardMaterial({
    color: '#3a3a3a',
    roughness: 0.5,
    metalness: 0.1,
  })

  // 内耳（暗いピンク）
  const innerEarMaterial = new THREE.MeshStandardMaterial({
    color: '#2a2a2a',
    roughness: 0.6,
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 環境光とライティング - 黒猫用に調整 */}
      <ambientLight intensity={0.4} />
      {/* メインライト */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.5}
        castShadow
        color="#ffffff"
      />
      {/* リムライト（輪郭を強調） */}
      <pointLight position={[-5, 3, -3]} intensity={1.2} color="#8899ff" />
      <pointLight position={[5, 3, -3]} intensity={1.0} color="#ffaa88" />
      {/* 下からの反射光 */}
      <pointLight position={[0, -2, 2]} intensity={0.3} color="#6688aa" />

      {/* 体（楕円形のメイン部分） */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.85, 64, 64]} />
        <primitive object={blackFurMaterial} attach="material" />
      </mesh>
      {/* 体の下部（お尻側） */}
      <mesh position={[0, -0.2, -0.2]} scale={[1, 0.8, 1.1]} castShadow>
        <sphereGeometry args={[0.7, 64, 64]} />
        <primitive object={darkFurMaterial} attach="material" />
      </mesh>

      {/* 胸部分（少し前に出っ張る） */}
      <mesh position={[0, 0.2, 0.6]} scale={[0.8, 1, 0.7]} castShadow>
        <sphereGeometry args={[0.45, 32, 32]} />
        <primitive object={blackFurMaterial} attach="material" />
      </mesh>

      {/* 首 */}
      <mesh position={[0, 0.9, 0.3]} scale={[0.7, 0.6, 0.7]} castShadow>
        <sphereGeometry args={[0.4, 32, 32]} />
        <primitive object={blackFurMaterial} attach="material" />
      </mesh>

      {/* 頭（よりリアルな形状） */}
      <mesh position={[0, 1.35, 0.3]} scale={[1, 1, 1.1]} castShadow>
        <sphereGeometry args={[0.55, 64, 64]} />
        <primitive object={blackFurMaterial} attach="material" />
      </mesh>

      {/* 頬の膨らみ */}
      <mesh position={[-0.35, 1.25, 0.5]} scale={[1, 0.9, 1]} castShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <primitive object={blackFurMaterial} attach="material" />
      </mesh>
      <mesh position={[0.35, 1.25, 0.5]} scale={[1, 0.9, 1]} castShadow>
        <sphereGeometry args={[0.22, 32, 32]} />
        <primitive object={blackFurMaterial} attach="material" />
      </mesh>

      {/* マズル（鼻周り） */}
      <mesh position={[0, 1.15, 0.65]} scale={[0.85, 0.7, 0.8]} castShadow>
        <sphereGeometry args={[0.25, 32, 32]} />
        <primitive object={blackFurMaterial} attach="material" />
      </mesh>

      {/* 左耳 */}
      <mesh
        ref={leftEarRef}
        position={[-0.35, 1.8, 0.15]}
        rotation={[0.3, -0.3, 0.1]}
        castShadow
      >
        <coneGeometry args={[0.22, 0.45, 32]} />
        <primitive object={blackFurMaterial} attach="material" />
      </mesh>
      {/* 左耳の内側 */}
      <mesh position={[-0.35, 1.72, 0.2]} rotation={[0.3, -0.3, 0.1]}>
        <coneGeometry args={[0.14, 0.3, 32]} />
        <primitive object={innerEarMaterial} attach="material" />
      </mesh>

      {/* 右耳 */}
      <mesh
        ref={rightEarRef}
        position={[0.35, 1.8, 0.15]}
        rotation={[0.3, 0.3, -0.1]}
        castShadow
      >
        <coneGeometry args={[0.22, 0.45, 32]} />
        <primitive object={blackFurMaterial} attach="material" />
      </mesh>
      {/* 右耳の内側 */}
      <mesh position={[0.35, 1.72, 0.2]} rotation={[0.3, 0.3, -0.1]}>
        <coneGeometry args={[0.14, 0.3, 32]} />
        <primitive object={innerEarMaterial} attach="material" />
      </mesh>

      {/* 目（金色に光る） */}
      {/* 左目 */}
      <group position={[-0.22, 1.42, 0.7]}>
        <mesh castShadow>
          <sphereGeometry args={[0.13, 32, 32]} />
          <primitive object={eyeWhiteMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <sphereGeometry args={[0.11, 32, 32]} />
          <primitive object={eyeMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.15]}>
          <sphereGeometry args={[0.04, 16, 32]} />
          <primitive object={pupilMaterial} attach="material" />
        </mesh>
        {/* ハイライト */}
        <mesh position={[-0.03, 0.05, 0.18]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* 右目 */}
      <group position={[0.22, 1.42, 0.7]}>
        <mesh castShadow>
          <sphereGeometry args={[0.13, 32, 32]} />
          <primitive object={eyeWhiteMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <sphereGeometry args={[0.11, 32, 32]} />
          <primitive object={eyeMaterial} attach="material" />
        </mesh>
        <mesh position={[0, 0, 0.15]}>
          <sphereGeometry args={[0.04, 16, 32]} />
          <primitive object={pupilMaterial} attach="material" />
        </mesh>
        {/* ハイライト */}
        <mesh position={[-0.03, 0.05, 0.18]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* 鼻 */}
      <mesh position={[0, 1.2, 0.8]} castShadow>
        <sphereGeometry args={[0.06, 16, 16]} />
        <primitive object={noseMaterial} attach="material" />
      </mesh>
      {/* 鼻のハイライト */}
      <mesh position={[-0.02, 1.22, 0.84]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial color="#555555" />
      </mesh>

      {/* ヒゲ（黒猫なので目立たせる） */}
      {/* 左のヒゲ */}
      {[-0.1, 0, 0.1].map((offset, i) => (
        <mesh
          key={`whisker-left-${i}`}
          position={[-0.45, 1.25 + offset, 0.6]}
          rotation={[0, 0, -0.2 - i * 0.05]}
        >
          <cylinderGeometry args={[0.008, 0.008, 0.7, 8]} />
          <meshBasicMaterial color="#cccccc" opacity={0.6} transparent />
        </mesh>
      ))}
      {/* 右のヒゲ */}
      {[-0.1, 0, 0.1].map((offset, i) => (
        <mesh
          key={`whisker-right-${i}`}
          position={[0.45, 1.25 + offset, 0.6]}
          rotation={[0, 0, 0.2 + i * 0.05]}
        >
          <cylinderGeometry args={[0.008, 0.008, 0.7, 8]} />
          <meshBasicMaterial color="#cccccc" opacity={0.6} transparent />
        </mesh>
      ))}

      {/* しっぽ（より自然な曲線） */}
      <group ref={tailRef} position={[-0.35, 0.5, -0.6]}>
        {/* しっぽの付け根 */}
        <mesh position={[0, 0, 0]} rotation={[0.5, 0, 0.2]} castShadow>
          <cylinderGeometry args={[0.12, 0.1, 0.4, 32]} />
          <primitive object={blackFurMaterial} attach="material" />
        </mesh>
        {/* しっぽの中間 */}
        <mesh
          position={[-0.1, 0.15, -0.15]}
          rotation={[0.7, 0, 0.3]}
          castShadow
        >
          <cylinderGeometry args={[0.1, 0.08, 0.4, 32]} />
          <primitive object={blackFurMaterial} attach="material" />
        </mesh>
        {/* しっぽの先端 */}
        <mesh
          position={[-0.15, 0.35, -0.25]}
          rotation={[0.9, 0, 0.4]}
          castShadow
        >
          <cylinderGeometry args={[0.08, 0.05, 0.35, 32]} />
          <primitive object={blackFurMaterial} attach="material" />
        </mesh>
        <mesh position={[-0.2, 0.52, -0.3]} castShadow>
          <sphereGeometry args={[0.06, 32, 32]} />
          <primitive object={blackFurMaterial} attach="material" />
        </mesh>
      </group>

      {/* 前足（左） */}
      <group position={[-0.28, 0, 0.35]}>
        <mesh position={[0, -0.05, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.09, 0.6, 32]} />
          <primitive object={blackFurMaterial} attach="material" />
        </mesh>
        {/* 足先 */}
        <mesh position={[0, -0.4, 0]} castShadow>
          <sphereGeometry args={[0.1, 32, 32]} />
          <primitive object={blackFurMaterial} attach="material" />
        </mesh>
        {/* 肉球 */}
        <mesh position={[0, -0.48, 0.08]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <primitive object={pawPadMaterial} attach="material" />
        </mesh>
      </group>

      {/* 前足（右） */}
      <group position={[0.28, 0, 0.35]}>
        <mesh position={[0, -0.05, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.09, 0.6, 32]} />
          <primitive object={blackFurMaterial} attach="material" />
        </mesh>
        {/* 足先 */}
        <mesh position={[0, -0.4, 0]} castShadow>
          <sphereGeometry args={[0.1, 32, 32]} />
          <primitive object={blackFurMaterial} attach="material" />
        </mesh>
        {/* 肉球 */}
        <mesh position={[0, -0.48, 0.08]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <primitive object={pawPadMaterial} attach="material" />
        </mesh>
      </group>

      {/* 後ろ足（左） */}
      <mesh position={[-0.5, -0.1, -0.15]} rotation={[0, 0, -0.4]} castShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.5, 32]} />
        <primitive object={blackFurMaterial} attach="material" />
      </mesh>

      {/* 後ろ足（右） */}
      <mesh position={[0.5, -0.1, -0.15]} rotation={[0, 0, 0.4]} castShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.5, 32]} />
        <primitive object={blackFurMaterial} attach="material" />
      </mesh>
    </group>
  )
}
