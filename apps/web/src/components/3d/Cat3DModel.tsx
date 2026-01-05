import React, { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// プロシージャルテクスチャ生成：黒猫の毛並み
const createFurTexture = (color = '#0d0d0d'): THREE.Texture => {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!

  // ベース色
  ctx.fillStyle = color
  ctx.fillRect(0, 0, 1024, 1024)

  // 毛の繊維を描画（細かいランダムな線）
  for (let i = 0; i < 15000; i++) {
    const x = Math.random() * 1024
    const y = Math.random() * 1024
    const length = Math.random() * 8 + 4
    const angle = Math.random() * Math.PI * 2
    const opacity = Math.random() * 0.15 + 0.05

    ctx.strokeStyle = `rgba(${Math.random() * 40 + 10}, ${Math.random() * 40 + 10}, ${Math.random() * 40 + 10}, ${opacity})`
    ctx.lineWidth = Math.random() * 0.8 + 0.3
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length)
    ctx.stroke()
  }

  // 毛の束（クラスター）
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * 1024
    const y = Math.random() * 1024
    const radius = Math.random() * 15 + 8
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, 'rgba(25, 25, 25, 0.3)')
    gradient.addColorStop(0.5, 'rgba(15, 15, 15, 0.15)')
    gradient.addColorStop(1, 'rgba(10, 10, 10, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

// ノーマルマップ生成：毛の立体感
const createNormalMap = (): THREE.Texture => {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // ベース（中間色）
  ctx.fillStyle = '#8080ff'
  ctx.fillRect(0, 0, 512, 512)

  // 毛の凹凸
  for (let i = 0; i < 8000; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const size = Math.random() * 3 + 1
    const brightness = Math.random() * 100 + 100

    ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness + 80})`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

// ラフネスマップ：毛のツヤと粗さのバリエーション
const createRoughnessMap = (): THREE.Texture => {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // ベース（やや粗い）
  ctx.fillStyle = '#bbbbbb'
  ctx.fillRect(0, 0, 512, 512)

  // ランダムなツヤ・粗さ
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 512
    const radius = Math.random() * 10 + 3
    const value = Math.random() * 120 + 60

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, `rgba(${value}, ${value}, ${value}, 0.6)`)
    gradient.addColorStop(1, `rgba(${value}, ${value}, ${value}, 0)`)
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

// 環境マップ生成（簡易的なHDRI風）
const createEnvMap = (): THREE.CubeTexture => {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // 6面分の画像データ
  const cubeImages: HTMLCanvasElement[] = []

  for (let i = 0; i < 6; i++) {
    const faceCanvas = document.createElement('canvas')
    faceCanvas.width = size
    faceCanvas.height = size
    const faceCtx = faceCanvas.getContext('2d')!

    // グラデーション背景（空）
    const gradient = faceCtx.createLinearGradient(0, 0, 0, size)
    gradient.addColorStop(0, '#87CEEB')
    gradient.addColorStop(0.5, '#B0D4E8')
    gradient.addColorStop(1, '#E0F0FF')
    faceCtx.fillStyle = gradient
    faceCtx.fillRect(0, 0, size, size)

    // 雲
    for (let j = 0; j < 30; j++) {
      const x = Math.random() * size
      const y = Math.random() * size * 0.6
      const radius = Math.random() * 40 + 20
      const cloudGrad = faceCtx.createRadialGradient(x, y, 0, x, y, radius)
      cloudGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)')
      cloudGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
      faceCtx.fillStyle = cloudGrad
      faceCtx.beginPath()
      faceCtx.arc(x, y, radius, 0, Math.PI * 2)
      faceCtx.fill()
    }

    cubeImages.push(faceCanvas)
  }

  const cubeTexture = new THREE.CubeTexture(cubeImages)
  cubeTexture.needsUpdate = true
  return cubeTexture
}

export const Cat3DModel: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null)
  const tailRef = useRef<THREE.Group>(null)
  const leftEarRef = useRef<THREE.Mesh>(null)
  const rightEarRef = useRef<THREE.Mesh>(null)
  const [landingComplete, setLandingComplete] = useState(false)

  const { scene } = useThree()

  // テクスチャとマテリアルのメモ化
  const furTexture = useMemo(() => createFurTexture('#0d0d0d'), [])
  const normalMap = useMemo(() => createNormalMap(), [])
  const roughnessMap = useMemo(() => createRoughnessMap(), [])
  const envMap = useMemo(() => createEnvMap(), [])

  // シーンに環境マップを設定
  useEffect(() => {
    scene.environment = envMap
  }, [scene, envMap])

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

  // 超リアルな黒猫の毛並みマテリアル（テクスチャ適用）
  const catFurMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0d0d0d',
        map: furTexture,
        normalMap: normalMap,
        normalScale: new THREE.Vector2(0.8, 0.8),
        roughnessMap: roughnessMap,
        roughness: 0.75,
        metalness: 0.02,
        envMap: envMap,
        envMapIntensity: 0.6,
      }),
    [furTexture, normalMap, roughnessMap, envMap]
  )

  const catFurDarkMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#050505',
        map: createFurTexture('#050505'),
        normalMap: normalMap,
        normalScale: new THREE.Vector2(0.6, 0.6),
        roughness: 0.9,
        metalness: 0.01,
        envMap: envMap,
        envMapIntensity: 0.3,
      }),
    [normalMap, envMap]
  )

  const catFurLightMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a1a1a',
        map: createFurTexture('#1a1a1a'),
        normalMap: normalMap,
        normalScale: new THREE.Vector2(1.0, 1.0),
        roughness: 0.7,
        metalness: 0.03,
        envMap: envMap,
        envMapIntensity: 0.8,
      }),
    [normalMap, envMap]
  )

  // 目のマテリアル（よりリアルに）
  const eyeWhiteMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f5f5f5',
        roughness: 0.3,
        metalness: 0.05,
        envMap: envMap,
        envMapIntensity: 0.4,
      }),
    [envMap]
  )

  const irisMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d4af37',
        emissive: '#8b7500',
        emissiveIntensity: 0.7,
        metalness: 0.8,
        roughness: 0.15,
        envMap: envMap,
        envMapIntensity: 1.2,
      }),
    [envMap]
  )

  const pupilMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#000000',
        roughness: 0.05,
        metalness: 0.95,
        envMap: envMap,
        envMapIntensity: 0.8,
      }),
    [envMap]
  )

  const noseMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1a1a1a',
        roughness: 0.5,
        metalness: 0.15,
        envMap: envMap,
        envMapIntensity: 0.5,
      }),
    [envMap]
  )

  const innerEarMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2a2a2a',
        roughness: 0.8,
        normalMap: normalMap,
        normalScale: new THREE.Vector2(0.4, 0.4),
      }),
    [normalMap]
  )

  const pawPadMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2a2a2a',
        roughness: 0.65,
        metalness: 0.05,
        envMap: envMap,
        envMapIntensity: 0.3,
      }),
    [envMap]
  )

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 高度なライティング設定 - よりシネマティックに */}
      <ambientLight intensity={0.25} color="#d4e4f7" />

      {/* メインキーライト（太陽光）- より強く */}
      <directionalLight
        position={[6, 12, 8]}
        intensity={2.5}
        color="#fffef0"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />

      {/* バックライト（リムライト）- 青系 */}
      <pointLight
        position={[-10, 5, -6]}
        intensity={2.2}
        color="#6699ff"
        distance={20}
        decay={2}
      />

      {/* サイドライト - 暖色系 */}
      <pointLight
        position={[10, 4, -5]}
        intensity={2.0}
        color="#ffcc88"
        distance={18}
        decay={2}
      />

      {/* 下からの反射光（地面からの照り返し）*/}
      <pointLight
        position={[0, -4, 4]}
        intensity={0.6}
        color="#99bbff"
        distance={12}
        decay={2}
      />

      {/* フィルライト（影を和らげる）*/}
      <pointLight
        position={[-4, 3, 6]}
        intensity={0.8}
        color="#f5e8ff"
        distance={15}
        decay={2}
      />

      {/* アクセントライト（猫の目を強調）*/}
      <spotLight
        position={[0, 3, 5]}
        intensity={1.5}
        angle={Math.PI / 6}
        penumbra={0.5}
        color="#ffffff"
        target-position={[0, 1.3, 0.5]}
      />

      {/* ============ 体の構造 ============ */}

      {/* 胴体メイン */}
      <mesh
        position={[0, 0.2, -0.1]}
        scale={[1, 0.95, 1.3]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.75, 256, 256]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 胴体下部 */}
      <mesh
        position={[0, -0.3, -0.3]}
        scale={[0.9, 0.7, 1.2]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.65, 192, 192]} />
        <primitive object={catFurDarkMaterial} attach="material" />
      </mesh>

      {/* 胸部 */}
      <mesh
        position={[0, 0.15, 0.55]}
        scale={[0.75, 0.9, 0.8]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.42, 128, 128]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 肩（左） */}
      <mesh
        position={[-0.35, 0.15, 0.35]}
        scale={[1, 0.95, 1.1]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.28, 96, 96]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 肩（右） */}
      <mesh
        position={[0.35, 0.15, 0.35]}
        scale={[1, 0.95, 1.1]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.28, 96, 96]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 背中の毛のディテール（隆起） */}
      {[...Array(8)].map((_, i) => {
        const z = -0.5 + i * 0.15
        const y = 0.5 - i * 0.05
        const scale = 0.12 - i * 0.008
        return (
          <mesh
            key={`back-fur-${i}`}
            position={[0, y, z]}
            scale={[0.4, 0.25, 0.3]}
            castShadow
          >
            <sphereGeometry args={[scale, 48, 48]} />
            <primitive object={catFurLightMaterial} attach="material" />
          </mesh>
        )
      })}

      {/* ============ 頭部 ============ */}

      {/* 首 */}
      <mesh
        position={[0, 0.85, 0.25]}
        scale={[0.65, 0.55, 0.75]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.38, 128, 128]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 頭部メイン */}
      <mesh
        position={[0, 1.3, 0.25]}
        scale={[0.95, 0.98, 1.05]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.52, 256, 256]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 額 */}
      <mesh
        position={[0, 1.55, 0.45]}
        scale={[0.8, 0.7, 0.9]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.35, 128, 128]} />
        <primitive object={catFurLightMaterial} attach="material" />
      </mesh>

      {/* 頭頂部の毛の隆起 */}
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI - Math.PI / 2
        const radius = 0.25
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius + 0.3
        return (
          <mesh
            key={`head-fur-${i}`}
            position={[x, 1.65, z]}
            scale={[0.15, 0.12, 0.15]}
            castShadow
          >
            <sphereGeometry args={[0.08, 32, 32]} />
            <primitive object={catFurLightMaterial} attach="material" />
          </mesh>
        )
      })}

      {/* 頬（左） */}
      <mesh
        position={[-0.32, 1.2, 0.48]}
        scale={[0.95, 0.88, 1.05]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.21, 96, 96]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 頬（右） */}
      <mesh
        position={[0.32, 1.2, 0.48]}
        scale={[0.95, 0.88, 1.05]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.21, 96, 96]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* マズル（鼻周り） */}
      <mesh
        position={[0, 1.1, 0.65]}
        scale={[0.78, 0.68, 0.85]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.24, 96, 96]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 下顎 */}
      <mesh
        position={[0, 1.0, 0.58]}
        scale={[0.65, 0.5, 0.75]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.18, 64, 64]} />
        <primitive object={catFurDarkMaterial} attach="material" />
      </mesh>

      {/* ============ 耳 ============ */}

      {/* 左耳外側 */}
      <mesh
        ref={leftEarRef}
        position={[-0.32, 1.75, 0.12]}
        rotation={[0.25, -0.25, 0.08]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[0.2, 0.42, 64]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 左耳内側 */}
      <mesh position={[-0.32, 1.68, 0.18]} rotation={[0.25, -0.25, 0.08]}>
        <coneGeometry args={[0.13, 0.28, 48]} />
        <primitive object={innerEarMaterial} attach="material" />
      </mesh>

      {/* 左耳の毛（房） */}
      {[...Array(3)].map((_, i) => (
        <mesh
          key={`left-ear-tuft-${i}`}
          position={[-0.28 - i * 0.015, 1.88 + i * 0.02, 0.08]}
          rotation={[0.3, -0.2, 0]}
          castShadow
        >
          <sphereGeometry args={[0.06 - i * 0.01, 24, 24]} />
          <primitive object={catFurLightMaterial} attach="material" />
        </mesh>
      ))}

      {/* 右耳外側 */}
      <mesh
        ref={rightEarRef}
        position={[0.32, 1.75, 0.12]}
        rotation={[0.25, 0.25, -0.08]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[0.2, 0.42, 64]} />
        <primitive object={catFurMaterial} attach="material" />
      </mesh>

      {/* 右耳内側 */}
      <mesh position={[0.32, 1.68, 0.18]} rotation={[0.25, 0.25, -0.08]}>
        <coneGeometry args={[0.13, 0.28, 48]} />
        <primitive object={innerEarMaterial} attach="material" />
      </mesh>

      {/* 右耳の毛（房） */}
      {[...Array(3)].map((_, i) => (
        <mesh
          key={`right-ear-tuft-${i}`}
          position={[0.28 + i * 0.015, 1.88 + i * 0.02, 0.08]}
          rotation={[0.3, 0.2, 0]}
          castShadow
        >
          <sphereGeometry args={[0.06 - i * 0.01, 24, 24]} />
          <primitive object={catFurLightMaterial} attach="material" />
        </mesh>
      ))}

      {/* ============ 目 ============ */}

      {/* 左目 */}
      <group position={[-0.2, 1.38, 0.68]} rotation={[0, -0.05, 0]}>
        {/* 眼窩の影 */}
        <mesh position={[0, 0, -0.03]}>
          <sphereGeometry args={[0.15, 64, 64]} />
          <primitive object={catFurDarkMaterial} attach="material" />
        </mesh>
        {/* 白目 */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.12, 96, 96]} />
          <primitive object={eyeWhiteMaterial} attach="material" />
        </mesh>
        {/* 虹彩 */}
        <mesh position={[0, 0, 0.07]}>
          <sphereGeometry args={[0.1, 96, 96]} />
          <primitive object={irisMaterial} attach="material" />
        </mesh>
        {/* 瞳孔（縦長の猫目） */}
        <mesh position={[0, 0, 0.13]} scale={[0.4, 1.2, 1]}>
          <sphereGeometry args={[0.04, 48, 96]} />
          <primitive object={pupilMaterial} attach="material" />
        </mesh>
        {/* ハイライト1（メイン） */}
        <mesh position={[-0.04, 0.045, 0.17]}>
          <sphereGeometry args={[0.026, 24, 24]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* ハイライト2（サブ） */}
        <mesh position={[0.025, -0.035, 0.165]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshBasicMaterial color="#ffffff" opacity={0.85} transparent />
        </mesh>
        {/* ハイライト3（微細） */}
        <mesh position={[-0.01, 0.02, 0.172]}>
          <sphereGeometry args={[0.008, 12, 12]} />
          <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
        </mesh>
      </group>

      {/* 右目 */}
      <group position={[0.2, 1.38, 0.68]} rotation={[0, 0.05, 0]}>
        {/* 眼窩の影 */}
        <mesh position={[0, 0, -0.03]}>
          <sphereGeometry args={[0.15, 64, 64]} />
          <primitive object={catFurDarkMaterial} attach="material" />
        </mesh>
        {/* 白目 */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.12, 96, 96]} />
          <primitive object={eyeWhiteMaterial} attach="material" />
        </mesh>
        {/* 虹彩 */}
        <mesh position={[0, 0, 0.07]}>
          <sphereGeometry args={[0.1, 96, 96]} />
          <primitive object={irisMaterial} attach="material" />
        </mesh>
        {/* 瞳孔（縦長の猫目） */}
        <mesh position={[0, 0, 0.13]} scale={[0.4, 1.2, 1]}>
          <sphereGeometry args={[0.04, 48, 96]} />
          <primitive object={pupilMaterial} attach="material" />
        </mesh>
        {/* ハイライト1（メイン） */}
        <mesh position={[-0.04, 0.045, 0.17]}>
          <sphereGeometry args={[0.026, 24, 24]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* ハイライト2（サブ） */}
        <mesh position={[0.025, -0.035, 0.165]}>
          <sphereGeometry args={[0.015, 16, 16]} />
          <meshBasicMaterial color="#ffffff" opacity={0.85} transparent />
        </mesh>
        {/* ハイライト3（微細） */}
        <mesh position={[-0.01, 0.02, 0.172]}>
          <sphereGeometry args={[0.008, 12, 12]} />
          <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
        </mesh>
      </group>

      {/* ============ 鼻と口 ============ */}

      {/* 鼻 */}
      <mesh position={[0, 1.16, 0.78]} castShadow receiveShadow>
        <sphereGeometry args={[0.055, 48, 48]} />
        <primitive object={noseMaterial} attach="material" />
      </mesh>

      {/* 鼻のハイライト */}
      <mesh position={[-0.02, 1.185, 0.825]}>
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshBasicMaterial color="#555555" />
      </mesh>

      {/* 鼻の光沢 */}
      <mesh position={[-0.012, 1.19, 0.83]}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshBasicMaterial color="#888888" opacity={0.7} transparent />
      </mesh>

      {/* ============ ヒゲ ============ */}

      {/* 左ヒゲ（上段） */}
      {[-0.08, 0, 0.08].map((offset, i) => (
        <group key={`left-whisker-top-${i}`}>
          <mesh
            position={[-0.42, 1.18 + offset, 0.62]}
            rotation={[0, 0, -0.15 - i * 0.04]}
          >
            <cylinderGeometry args={[0.005, 0.005, 0.7, 12]} />
            <meshBasicMaterial
              color="#e8e8e8"
              opacity={0.8}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* 右ヒゲ（上段） */}
      {[-0.08, 0, 0.08].map((offset, i) => (
        <group key={`right-whisker-top-${i}`}>
          <mesh
            position={[0.42, 1.18 + offset, 0.62]}
            rotation={[0, 0, 0.15 + i * 0.04]}
          >
            <cylinderGeometry args={[0.005, 0.005, 0.7, 12]} />
            <meshBasicMaterial
              color="#e8e8e8"
              opacity={0.8}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* 左ヒゲ（下段） */}
      {[0, 0.06].map((offset, i) => (
        <group key={`left-whisker-bottom-${i}`}>
          <mesh
            position={[-0.38, 1.08 + offset, 0.64]}
            rotation={[0, 0, -0.22 - i * 0.05]}
          >
            <cylinderGeometry args={[0.004, 0.004, 0.55, 10]} />
            <meshBasicMaterial
              color="#d8d8d8"
              opacity={0.75}
              transparent
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}

      {/* 右ヒゲ（下段） */}
      {[0, 0.06].map((offset, i) => (
        <group key={`right-whisker-bottom-${i}`}>
          <mesh
            position={[0.38, 1.08 + offset, 0.64]}
            rotation={[0, 0, 0.22 + i * 0.05]}
          >
            <cylinderGeometry args={[0.004, 0.004, 0.55, 10]} />
            <meshBasicMaterial
              color="#d8d8d8"
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
        <mesh
          position={[0, 0, 0]}
          rotation={[0.4, 0, 0.15]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.11, 0.095, 0.38, 64]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>

        {/* しっぽの毛の房（付け根） */}
        {[...Array(5)].map((_, i) => {
          const angle = (i / 5) * Math.PI * 2
          const radius = 0.1
          return (
            <mesh
              key={`tail-base-fur-${i}`}
              position={[
                Math.sin(angle) * radius * 0.3,
                0.05,
                Math.cos(angle) * radius * 0.3,
              ]}
              rotation={[0.4, 0, 0.15]}
              castShadow
            >
              <sphereGeometry args={[0.035, 16, 16]} />
              <primitive object={catFurLightMaterial} attach="material" />
            </mesh>
          )
        })}

        {/* 中間1 */}
        <mesh
          position={[-0.08, 0.12, -0.14]}
          rotation={[0.6, 0, 0.22]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.095, 0.08, 0.35, 64]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>

        {/* 中間2 */}
        <mesh
          position={[-0.13, 0.28, -0.22]}
          rotation={[0.75, 0, 0.28]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.08, 0.065, 0.32, 64]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>

        {/* 先端 */}
        <mesh
          position={[-0.17, 0.45, -0.28]}
          rotation={[0.85, 0, 0.32]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.065, 0.04, 0.28, 64]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>

        {/* しっぽの先端（丸み） */}
        <mesh position={[-0.19, 0.58, -0.3]} castShadow receiveShadow>
          <sphereGeometry args={[0.05, 64, 64]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>

        {/* しっぽの毛の房（先端） */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          const radius = 0.05
          return (
            <mesh
              key={`tail-tip-fur-${i}`}
              position={[
                -0.19 + Math.sin(angle) * radius * 0.6,
                0.58 + Math.cos(angle) * radius * 0.4,
                -0.3 + Math.cos(angle) * radius * 0.6,
              ]}
              castShadow
            >
              <sphereGeometry args={[0.022, 16, 16]} />
              <primitive object={catFurLightMaterial} attach="material" />
            </mesh>
          )
        })}
      </group>

      {/* ============ 前足 ============ */}

      {/* 左前足 */}
      <group position={[-0.26, 0, 0.32]}>
        {/* 上腕 */}
        <mesh
          position={[0, 0.05, 0]}
          rotation={[0.05, 0, -0.02]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.1, 0.085, 0.35, 48]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* 前腕 */}
        <mesh
          position={[0, -0.2, 0]}
          rotation={[0, 0, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.085, 0.08, 0.3, 48]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* 足首 */}
        <mesh position={[0, -0.36, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.082, 48, 48]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* 足先 */}
        <mesh position={[0, -0.42, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.09, 64, 64]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* 肉球メイン */}
        <mesh position={[0, -0.49, 0.07]}>
          <sphereGeometry args={[0.042, 32, 32]} />
          <primitive object={pawPadMaterial} attach="material" />
        </mesh>
        {/* 肉球サブ（4つの指先） */}
        {[-0.04, -0.015, 0.015, 0.04].map((xOffset, i) => (
          <mesh key={`left-front-toe-${i}`} position={[xOffset, -0.485, 0.095]}>
            <sphereGeometry args={[0.018, 20, 20]} />
            <primitive object={pawPadMaterial} attach="material" />
          </mesh>
        ))}
      </group>

      {/* 右前足 */}
      <group position={[0.26, 0, 0.32]}>
        {/* 上腕 */}
        <mesh
          position={[0, 0.05, 0]}
          rotation={[0.05, 0, 0.02]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.1, 0.085, 0.35, 48]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* 前腕 */}
        <mesh
          position={[0, -0.2, 0]}
          rotation={[0, 0, 0]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.085, 0.08, 0.3, 48]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* 足首 */}
        <mesh position={[0, -0.36, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.082, 48, 48]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* 足先 */}
        <mesh position={[0, -0.42, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.09, 64, 64]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* 肉球メイン */}
        <mesh position={[0, -0.49, 0.07]}>
          <sphereGeometry args={[0.042, 32, 32]} />
          <primitive object={pawPadMaterial} attach="material" />
        </mesh>
        {/* 肉球サブ（4つの指先） */}
        {[-0.04, -0.015, 0.015, 0.04].map((xOffset, i) => (
          <mesh
            key={`right-front-toe-${i}`}
            position={[xOffset, -0.485, 0.095]}
          >
            <sphereGeometry args={[0.018, 20, 20]} />
            <primitive object={pawPadMaterial} attach="material" />
          </mesh>
        ))}
      </group>

      {/* ============ 後ろ足 ============ */}

      {/* 左後ろ足 */}
      <group position={[-0.48, -0.15, -0.2]}>
        {/* 太もも */}
        <mesh
          position={[0, 0.12, 0]}
          rotation={[0, 0, -0.25]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.18, 0.15, 0.35, 48]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* ふくらはぎ */}
        <mesh
          position={[0, -0.1, 0]}
          rotation={[0, 0, -0.4]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.15, 0.12, 0.32, 48]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* 足首 */}
        <mesh position={[-0.08, -0.28, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.11, 48, 48]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
      </group>

      {/* 右後ろ足 */}
      <group position={[0.48, -0.15, -0.2]}>
        {/* 太もも */}
        <mesh
          position={[0, 0.12, 0]}
          rotation={[0, 0, 0.25]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.18, 0.15, 0.35, 48]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* ふくらはぎ */}
        <mesh
          position={[0, -0.1, 0]}
          rotation={[0, 0, 0.4]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0.15, 0.12, 0.32, 48]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
        {/* 足首 */}
        <mesh position={[0.08, -0.28, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.11, 48, 48]} />
          <primitive object={catFurMaterial} attach="material" />
        </mesh>
      </group>

      {/* ============ 追加の毛の房（体全体のふわふわ感） ============ */}

      {/* 首周りの毛 */}
      {[...Array(12)].map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const radius = 0.35
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius * 0.6 + 0.25
        return (
          <mesh key={`neck-fur-${i}`} position={[x, 0.85, z]} castShadow>
            <sphereGeometry args={[0.055, 24, 24]} />
            <primitive object={catFurLightMaterial} attach="material" />
          </mesh>
        )
      })}

      {/* 体側面の毛のディテール */}
      {[...Array(6)].map((_, i) => {
        const y = 0.3 - i * 0.12
        const z = 0.1 - i * 0.15
        return (
          <React.Fragment key={`body-side-fur-${i}`}>
            <mesh position={[-0.65, y, z]} castShadow>
              <sphereGeometry args={[0.08 - i * 0.008, 28, 28]} />
              <primitive object={catFurLightMaterial} attach="material" />
            </mesh>
            <mesh position={[0.65, y, z]} castShadow>
              <sphereGeometry args={[0.08 - i * 0.008, 28, 28]} />
              <primitive object={catFurLightMaterial} attach="material" />
            </mesh>
          </React.Fragment>
        )
      })}
    </group>
  )
}
