import { FiShare2 } from 'react-icons/fi'
import type { PersonalityType } from '@/libs/ai/personality/personality-types'
import { personalityCharacterDataUri } from '@/libs/ai/personality/personality-character'

interface Props {
  type: PersonalityType
  characterSummary: string
  showShare: boolean
  onShare: () => void
}

/**
 * MBTI診断風の読書性格タイプカード
 * キャラクター画像・タイプコード・タイプ名を診断結果のヒーローとして表示する
 */
export const PersonalityCard: React.FC<Props> = ({
  type,
  characterSummary,
  showShare,
  onShare,
}) => {
  return (
    <div
      className="mb-6 rounded-xl px-6 py-7 shadow-sm"
      style={{
        background: `linear-gradient(135deg, ${type.colorLight} 0%, #ffffff 60%, ${type.colorLight}80 100%)`,
      }}
    >
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
        あなたの読書性格タイプ
      </h3>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
        <img
          src={personalityCharacterDataUri(type)}
          alt={type.name}
          width={140}
          height={140}
          className="h-[140px] w-[140px] drop-shadow-md"
        />
        <div className="text-center sm:text-left">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-bold tracking-widest text-white"
            style={{ backgroundColor: type.color }}
          >
            {type.code}
          </span>
          <p
            className="mt-2 text-2xl font-extrabold leading-snug"
            style={{ color: type.color }}
          >
            {type.name}
          </p>
          <p className="mt-1 text-sm text-gray-500">{type.tagline}</p>
        </div>
      </div>
      {characterSummary && (
        <p className="mt-5 text-lg font-bold leading-relaxed text-gray-800">
          「{characterSummary}」
        </p>
      )}
      {showShare && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={onShare}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-2 text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 hover:brightness-105"
          >
            <FiShare2 size={16} />
            診断結果をシェア
          </button>
        </div>
      )}
    </div>
  )
}
