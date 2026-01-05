import React from 'react'

interface Props {
  className?: string
  size?: number
}

export const CatIcon: React.FC<Props> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 猫のボディ（グラデーション付き） */}
      <defs>
        <linearGradient id="catGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF8C42" />
          <stop offset="100%" stopColor="#FF6B35" />
        </linearGradient>
      </defs>

      {/* 左耳 */}
      <path
        d="M 15 12 L 8 2 L 20 8 Z"
        fill="url(#catGradient)"
        stroke="#D9534F"
        strokeWidth="1"
      />
      {/* 右耳 */}
      <path
        d="M 49 12 L 56 2 L 44 8 Z"
        fill="url(#catGradient)"
        stroke="#D9534F"
        strokeWidth="1"
      />

      {/* 頭 */}
      <ellipse cx="32" cy="28" rx="18" ry="20" fill="url(#catGradient)" />

      {/* 体 */}
      <ellipse cx="32" cy="48" rx="14" ry="15" fill="url(#catGradient)" />

      {/* しっぽ */}
      <path
        d="M 45 52 Q 55 48, 58 42 Q 60 38, 59 34"
        stroke="url(#catGradient)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* 目（大きく可愛く） */}
      <ellipse cx="25" cy="26" rx="3.5" ry="5" fill="#2C3E50" />
      <ellipse cx="39" cy="26" rx="3.5" ry="5" fill="#2C3E50" />
      {/* ハイライト */}
      <ellipse cx="26" cy="24" rx="1.5" ry="2" fill="white" opacity="0.9" />
      <ellipse cx="40" cy="24" rx="1.5" ry="2" fill="white" opacity="0.9" />

      {/* 鼻 */}
      <path d="M 32 32 L 30 35 L 34 35 Z" fill="#D9534F" />

      {/* 口 */}
      <path
        d="M 32 35 Q 28 38, 26 36 M 32 35 Q 36 38, 38 36"
        stroke="#2C3E50"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ヒゲ（左） */}
      <line
        x1="16"
        y1="28"
        x2="8"
        y2="26"
        stroke="#2C3E50"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="30"
        x2="8"
        y2="30"
        stroke="#2C3E50"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="32"
        x2="8"
        y2="34"
        stroke="#2C3E50"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* ヒゲ（右） */}
      <line
        x1="48"
        y1="28"
        x2="56"
        y2="26"
        stroke="#2C3E50"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="48"
        y1="30"
        x2="56"
        y2="30"
        stroke="#2C3E50"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <line
        x1="48"
        y1="32"
        x2="56"
        y2="34"
        stroke="#2C3E50"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* 前足 */}
      <ellipse cx="26" cy="58" rx="3" ry="6" fill="url(#catGradient)" />
      <ellipse cx="38" cy="58" rx="3" ry="6" fill="url(#catGradient)" />
    </svg>
  )
}
