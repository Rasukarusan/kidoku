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
        groupRef.current.position.y = Math.sin(clock.elapsedTime * 2) * 0.05
        groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.5) * 0.03
      }
    }

    if (tailRef.current && landingComplete) {
      // しっぽをゆらゆら
      tailRef.current.rotation.z = Math.sin(clock.elapsedTime * 1.5) * 0.25
      tailRef.current.rotation.x = Math.sin(clock.elapsedTime * 1.2) * 0.08
    }

    // 耳をピクピク
    if (leftEarRef.current && landingComplete) {
      leftEarRef.current.rotation.z =
        Math.sin(clock.elapsedTime * 3) * 0.06 + 0.08
    }
    if (rightEarRef.current && landingComplete) {
      rightEarRef.current.rotation.z =
        Math.sin(clock.elapsedTime * 3 + Math.PI) * 0.06 - 0.08
    }
  })

  // 超リアルな黒猫の毛並みマテリアル
  const catFurMaterial = new THREE.MeshStandardMaterial({
    color: '#0d0d0d',
    roughness: 0.85,
    metalness: 0.02,
    envMapIntensity: 0.3,
  })

  const catFurDarkMaterial = new THREE.MeshStandardMaterial({
    color: '#050505',
    roughness: 0.9,
    metalness: 0.01,
  })

  const catFurLightMaterial = new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    roughness: 0.75,
    metalness: 0.03,
  })

  // 目のマテリアル（よりリアルに）
  const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
    color: '#f5f5f5',
    roughness: 0.3,
    metalness: 0.05,
  })

  const irisMaterial = new THREE.MeshStandardMaterial({
    color: '#d4af37',
    emissive: '#8b7500',
    emissiveIntensity: 0.6,
    metalness: 0.7,
    roughness: 0.2,
  })

  const pupilMaterial = new THREE.MeshStandardMaterial({
    color: '#000000',
    roughness: 0.05,
    metalness: 0.9,
  })

  const noseMaterial = new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    roughness: 0.6,
    metalness: 0.1,
  })

  const innerEarMaterial = new THREE.MeshStandardMaterial({
    color: '#2a2a2a',
    roughness: 0.8,
  })

  const pawPadMaterial = new THREE.MeshStandardMaterial({
    color: '#2a2a2a',
    roughness: 0.7,
    metalness: 0.05,
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 高度なライティング設定 */}
      <ambientLight intensity={0.35} color="#e8f4ff" />

      {/* メインキーライト（太陽光） */}
      <directionalLight
        position={[5, 10, 7]}
        intensity={2.0}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* リムライト（輪郭強調） - 青系 */}
      <pointLight position={[-8, 4, -5]} intensity={1.8} color="#7799ff" />

      {/* リムライト - 暖色系 */}
      <pointLight position={[8, 3, -4]} intensity={1.5} color="#ffbb88" />

      {/* 下からの反射光（地面からの照り返し） */}
      <pointLight position={[0, -3, 3]} intensity={0.4} color="#aaccff" />

      {/* フィルライト（影を和らげる） */}
      <pointLight position={[-3, 2, 5]} intensity={0.6} color="#f0e8ff" />

      {/* ============ 体の構造 ============ */}

      {/* 胴体メイン */}
      <mesh
        position={[0, 0.2, -0.1]}
        scale={[1, 0.95, 1.3]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.75, 128, 128]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 胴体下部 */}
      <mesh position={[0, -0.3, -0.3]} scale={[0.9, 0.7, 1.2]} castShadow>
        <sphereGeometry args={[0.65, 96, 96]} />
        <primitive object={catFurDarkMaterial} attach="material" />
      </mesh>

      {/* 胸部 */}
      <mesh position={[0, 0.15, 0.55]} scale={[0.75, 0.9, 0.8]} castShadow>
        <sphereGeometry args={[0.42, 64, 64]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 肩（左） */}
      <mesh position={[-0.35, 0.15, 0.35]} scale={[1, 0.95, 1.1]} castShadow>
        <sphereGeometry args={[0.28, 48, 48]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 肩（右） */}
      <mesh position={[0.35, 0.15, 0.35]} scale={[1, 0.95, 1.1]} castShadow>
        <sphereGeometry args={[0.28, 48, 48]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* ============ 頭部 ============ */}

      {/* 首 */}
      <mesh position={[0, 0.85, 0.25]} scale={[0.65, 0.55, 0.75]} castShadow>
        <sphereGeometry args={[0.38, 64, 64]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 頭部メイン */}
      <mesh position={[0, 1.3, 0.25]} scale={[0.95, 0.98, 1.05]} castShadow>
        <sphereGeometry args={[0.52, 128, 128]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 額 */}
      <mesh position={[0, 1.55, 0.45]} scale={[0.8, 0.7, 0.9]} castShadow>
        <sphereGeometry args={[0.35, 64, 64]} />
        <primitive object={catFurLightMaterial} attach="material" />
      </mesh>

      {/* 頬（左） */}
      <mesh position={[-0.32, 1.2, 0.48]} scale={[0.95, 0.88, 1.05]} castShadow>
        <sphereGeometry args={[0.21, 48, 48]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 頬（右） */}
      <mesh position={[0.32, 1.2, 0.48]} scale={[0.95, 0.88, 1.05]} castShadow>
        <sphereGeometry args={[0.21, 48, 48]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* マズル（鼻周り） */}
      <mesh position={[0, 1.1, 0.65]} scale={[0.78, 0.68, 0.85]} castShadow>
        <sphereGeometry args={[0.24, 48, 48]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 下顎 */}
      <mesh position={[0, 1.0, 0.58]} scale={[0.65, 0.5, 0.75]} castShadow>
        <sphereGeometry args={[0.18, 32, 32]} />
        <primitive object={catFurDarkMaterial} attach="material" />
      </mesh>

      {/* ============ 耳 ============ */}

      {/* 左耳外側 */}
      <mesh
        ref={leftEarRef}
        position={[-0.32, 1.75, 0.12]}
        rotation={[0.25, -0.25, 0.08]}
        castShadow
      >
        <coneGeometry args={[0.2, 0.42, 48]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 左耳内側 */}
      <mesh position={[-0.32, 1.68, 0.18]} rotation={[0.25, -0.25, 0.08]}>
        <coneGeometry args={[0.13, 0.28, 32]} />
        <primitive object={innerEarMaterial} attach="material" />
      </mesh>

      {/* 左耳の毛（房） */}
      <mesh position={[-0.28, 1.88, 0.08]} rotation={[0.3, -0.2, 0]} castShadow>
        <sphereGeometry args={[0.06, 16, 16]} />
        <primitive object={catFurLightMaterial} attach="material" />
      </mesh>

      {/* 右耳外側 */}
      <mesh
        ref={rightEarRef}
        position={[0.32, 1.75, 0.12]}
        rotation={[0.25, 0.25, -0.08]}
        castShadow
      >
        <coneGeometry args={[0.2, 0.42, 48]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 右耳内側 */}
      <mesh position={[0.32, 1.68, 0.18]} rotation={[0.25, 0.25, -0.08]}>
        <coneGeometry args={[0.13, 0.28, 32]} />
        <primitive object={innerEarMaterial} attach="material" />
      </mesh>

      {/* 右耳の毛（房） */}
      <mesh position={[0.28, 1.88, 0.08]} rotation={[0.3, 0.2, 0]} castShadow>
        <sphereGeometry args={[0.06, 16, 16]} />
        <primitive object={catFurLightMaterial} attach="material" />
      </mesh>

      {/* ============ 目 ============ */}

      {/* 左目 */}
      <group position={[-0.2, 1.38, 0.68]} rotation={[0, -0.05, 0]}>
        {/* 眼窩の影 */}
        <mesh position={[0, 0, -0.02]}>
          <sphereGeometry args={[0.14, 32, 32]} />
          <primitive object={catFurDarkMaterial} attach="material" />
        </mesh>
        {/* 白目 */}
        <mesh castShadow>
          <sphereGeometry args={[0.12, 48, 48]} />
          <primitive object={eyeWhiteMaterial} attach="material" />
        </mesh>
        {/* 虹彩 */}
        <mesh position={[0, 0, 0.07]}>
          <sphereGeometry args={[0.1, 48, 48]} />
          <primitive object={irisMaterial} attach="material" />
        </mesh>
        {/* 瞳孔 */}
        <mesh position={[0, 0, 0.13]}>
          <sphereGeometry args={[0.035, 32, 64]} />
          <primitive object={pupilMaterial} attach="material" />
        </mesh>
        {/* ハイライト1 */}
        <mesh position={[-0.035, 0.04, 0.16]}>
          <sphereGeometry args={[0.022, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* ハイライト2（小） */}
        <mesh position={[0.02, -0.03, 0.155]}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
        </mesh>
      </group>

      {/* 右目 */}
      <group position={[0.2, 1.38, 0.68]} rotation={[0, 0.05, 0]}>
        {/* 眼窩の影 */}
        <mesh position={[0, 0, -0.02]}>
          <sphereGeometry args={[0.14, 32, 32]} />
          <primitive object={catFurDarkMaterial} attach="material" />
        </mesh>
        {/* 白目 */}
        <mesh castShadow>
          <sphereGeometry args={[0.12, 48, 48]} />
          <primitive object={eyeWhiteMaterial} attach="material" />
        </mesh>
        {/* 虹彩 */}
        <mesh position={[0, 0, 0.07]}>
          <sphereGeometry args={[0.1, 48, 48]} />
          <primitive object={irisMaterial} attach="material" />
        </mesh>
        {/* 瞳孔 */}
        <mesh position={[0, 0, 0.13]}>
          <sphereGeometry args={[0.035, 32, 64]} />
          <primitive object={pupilMaterial} attach="material" />
        </mesh>
        {/* ハイライト1 */}
        <mesh position={[-0.035, 0.04, 0.16]}>
          <sphereGeometry args={[0.022, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* ハイライト2（小） */}
        <mesh position={[0.02, -0.03, 0.155]}>
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshBasicMaterial color="#ffffff" opacity={0.8} transparent />
        </mesh>
      </group>

      {/* ============ 鼻と口 ============ */}

      {/* 鼻 */}
      <mesh position={[0, 1.16, 0.78]} castShadow>
        <sphereGeometry args={[0.055, 24, 24]} />
        <primitive object={noseMaterial} attach="material" />
      </mesh>

      {/* 鼻のハイライト */}
      <mesh position={[-0.018, 1.18, 0.82]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshBasicMaterial color="#444444" />
      </mesh>

      {/* ============ ヒゲ ============ */}

      {/* 左ヒゲ */}
      {[-0.08, 0, 0.08].map((offset, i) => (
        <group key={`left-whisker-${i}`}>
          <mesh
            position={[-0.42, 1.18 + offset, 0.62]}
            rotation={[0, 0, -0.15 - i * 0.04]}
          >
            <cylinderGeometry args={[0.006, 0.006, 0.65, 8]} />
            <meshBasicMaterial
              color="#dddddd"
              opacity={0.75}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* 右ヒゲ */}
      {[-0.08, 0, 0.08].map((offset, i) => (
        <group key={`right-whisker-${i}`}>
          <mesh
            position={[0.42, 1.18 + offset, 0.62]}
            rotation={[0, 0, 0.15 + i * 0.04]}
          >
            <cylinderGeometry args={[0.006, 0.006, 0.65, 8]} />
            <meshBasicMaterial
              color="#dddddd"
              opacity={0.75}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* ============ しっぽ ============ */}

      <group ref={tailRef} position={[-0.32, 0.4, -0.65]}>
        {/* 付け根 */}
        <mesh position={[0, 0, 0]} rotation={[0.4, 0, 0.15]} castShadow>
          <cylinderGeometry args={[0.11, 0.095, 0.38, 48]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>

        {/* 中間1 */}
        <mesh
          position={[-0.08, 0.12, -0.14]}
          rotation={[0.6, 0, 0.22]}
          castShadow
        >
          <cylinderGeometry args={[0.095, 0.08, 0.35, 48]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>

        {/* 中間2 */}
        <mesh
          position={[-0.13, 0.28, -0.22]}
          rotation={[0.75, 0, 0.28]}
          castShadow
        >
          <cylinderGeometry args={[0.08, 0.065, 0.32, 48]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>

        {/* 先端 */}
        <mesh
          position={[-0.17, 0.45, -0.28]}
          rotation={[0.85, 0, 0.32]}
          castShadow
        >
          <cylinderGeometry args={[0.065, 0.04, 0.28, 48]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>

        {/* しっぽの先端（丸み） */}
        <mesh position={[-0.19, 0.58, -0.3]} castShadow>
          <sphereGeometry args={[0.05, 32, 32]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
      </group>

      {/* ============ 前足 ============ */}

      {/* 左前足 */}
      <group position={[-0.26, 0, 0.32]}>
        {/* 上腕 */}
        <mesh position={[0, 0.05, 0]} rotation={[0.05, 0, -0.02]} castShadow>
          <cylinderGeometry args={[0.1, 0.085, 0.35, 32]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* 前腕 */}
        <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.08, 0.3, 32]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* 足先 */}
        <mesh position={[0, -0.42, 0]} castShadow>
          <sphereGeometry args={[0.09, 32, 32]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* 肉球 */}
        <mesh position={[0, -0.49, 0.07]}>
          <sphereGeometry args={[0.04, 20, 20]} />
          <primitive object={pawPadMaterial} attach="material" />
        </mesh>
      </group>

      {/* 右前足 */}
      <group position={[0.26, 0, 0.32]}>
        {/* 上腕 */}
        <mesh position={[0, 0.05, 0]} rotation={[0.05, 0, 0.02]} castShadow>
          <cylinderGeometry args={[0.1, 0.085, 0.35, 32]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* 前腕 */}
        <mesh position={[0, -0.2, 0]} rotation={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.085, 0.08, 0.3, 32]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* 足先 */}
        <mesh position={[0, -0.42, 0]} castShadow>
          <sphereGeometry args={[0.09, 32, 32]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* 肉球 */}
        <mesh position={[0, -0.49, 0.07]}>
          <sphereGeometry args={[0.04, 20, 20]} />
          <primitive object={pawPadMaterial} attach="material" />
        </mesh>
      </group>

      {/* ============ 後ろ足 ============ */}

      {/* 左後ろ足 */}
      <group position={[-0.48, -0.15, -0.2]}>
        <mesh rotation={[0, 0, -0.35]} castShadow>
          <cylinderGeometry args={[0.16, 0.13, 0.48, 32]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
      </group>

      {/* 右後ろ足 */}
      <group position={[0.48, -0.15, -0.2]}>
        <mesh rotation={[0, 0, 0.35]} castShadow>
          <cylinderGeometry args={[0.16, 0.13, 0.48, 32]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
      </group>
    </group>
  )
}
