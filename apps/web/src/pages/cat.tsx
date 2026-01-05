import dynamic from 'next/dynamic'
import Head from 'next/head'

// SSR無効化（Three.jsはクライアントサイドでのみ動作）
const WalkingCat = dynamic(
  () => import('@/components/three/WalkingCat').then((mod) => mod.WalkingCat),
  { ssr: false }
)

export default function CatPage() {
  return (
    <>
      <Head>
        <title>Walking Cat Demo</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-4 text-center text-3xl font-bold text-gray-800">
            Walking Cat
          </h1>
          <p className="mb-8 text-center text-gray-600">
            3D cat walking around the screen. Click to pause/resume.
          </p>

          {/* 猫のコンポーネント */}
          <div className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-white shadow-lg">
            <WalkingCat style={{ height: '400px' }} autoPlay={true} />
          </div>

          <div className="mt-8 text-center">
            <h2 className="mb-2 text-xl font-semibold text-gray-700">
              Controls
            </h2>
            <ul className="text-gray-600">
              <li>Click on the canvas to pause/resume the cat</li>
              <li>The cat will randomly change direction while walking</li>
              <li>When hitting boundaries, the cat turns around</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
