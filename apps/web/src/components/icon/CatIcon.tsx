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
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* メインボディのグラデーション（3D感） */}
        <radialGradient id="bodyGradient" cx="45%" cy="35%">
          <stop offset="0%" stopColor="#FFB366" />
          <stop offset="40%" stopColor="#FF9944" />
          <stop offset="80%" stopColor="#E8773D" />
          <stop offset="100%" stopColor="#CC6633" />
        </radialGradient>

        {/* 頭部のグラデーション */}
        <radialGradient id="headGradient" cx="40%" cy="30%">
          <stop offset="0%" stopColor="#FFC27D" />
          <stop offset="50%" stopColor="#FFA855" />
          <stop offset="100%" stopColor="#E88844" />
        </radialGradient>

        {/* 耳のグラデーション */}
        <linearGradient id="earGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFB366" />
          <stop offset="100%" stopColor="#E88844" />
        </linearGradient>

        {/* 耳の内側 */}
        <radialGradient id="earInner">
          <stop offset="0%" stopColor="#FFD9B3" />
          <stop offset="100%" stopColor="#FFB380" />
        </radialGradient>

        {/* しっぽのグラデーション */}
        <linearGradient id="tailGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E88844" />
          <stop offset="50%" stopColor="#FF9944" />
          <stop offset="100%" stopColor="#CC7733" />
        </linearGradient>

        {/* 影用フィルター */}
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="1" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* しっぽ（後ろ） */}
      <path
        d="M 72 60 Q 85 55, 92 48 Q 97 42, 96 35 Q 95 30, 92 28"
        stroke="url(#tailGradient)"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
        filter="url(#shadow)"
      />
      {/* しっぽのハイライト */}
      <path
        d="M 73 58 Q 84 54, 90 48"
        stroke="#FFB366"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* 後ろ足の影 */}
      <ellipse
        cx="50"
        cy="82"
        rx="20"
        ry="4"
        fill="#00000030"
        filter="url(#shadow)"
      />

      {/* 体（座った姿勢） */}
      <ellipse
        cx="50"
        cy="65"
        rx="22"
        ry="20"
        fill="url(#bodyGradient)"
        filter="url(#shadow)"
      />

      {/* 体の影部分 */}
      <ellipse cx="55" cy="70" rx="12" ry="10" fill="#D9753D" opacity="0.4" />

      {/* 体のハイライト */}
      <ellipse cx="42" cy="58" rx="8" ry="6" fill="#FFCC99" opacity="0.5" />

      {/* 左耳（後ろ） */}
      <path
        d="M 28 22 Q 22 8, 18 5 Q 22 10, 30 20 Z"
        fill="url(#earGradient)"
        filter="url(#shadow)"
      />
      <path d="M 25 18 Q 22 12, 20 10 Q 23 14, 27 19 Z" fill="url(#earInner)" />

      {/* 右耳 */}
      <path
        d="M 58 18 Q 62 6, 68 2 Q 63 8, 56 20 Z"
        fill="url(#earGradient)"
        filter="url(#shadow)"
      />
      <path d="M 60 16 Q 63 10, 66 7 Q 62 11, 59 17 Z" fill="url(#earInner)" />

      {/* 頭 */}
      <ellipse
        cx="45"
        cy="38"
        rx="20"
        ry="22"
        fill="url(#headGradient)"
        filter="url(#shadow)"
      />

      {/* 頭の影 */}
      <ellipse cx="52" cy="45" rx="10" ry="12" fill="#E88844" opacity="0.3" />

      {/* 頭のハイライト */}
      <ellipse cx="38" cy="32" rx="8" ry="10" fill="#FFD9B3" opacity="0.6" />

      {/* 額の模様 */}
      <path
        d="M 40 28 Q 45 24, 50 28"
        stroke="#CC6633"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />

      {/* 目（リアルな瞳） */}
      <g filter="url(#shadow)">
        {/* 左目の白目 */}
        <ellipse cx="38" cy="38" rx="5" ry="6" fill="#FFFFFF" />
        {/* 左目の瞳 */}
        <ellipse cx="38" cy="39" rx="3" ry="5" fill="#2ECC40" />
        <ellipse cx="38" cy="39" rx="1.5" ry="3.5" fill="#1A7A28" />
        {/* 左目のハイライト */}
        <ellipse cx="39" cy="36" rx="1.5" ry="2" fill="#FFFFFF" opacity="0.9" />
        <circle cx="37.5" cy="41" r="0.8" fill="#FFFFFF" opacity="0.7" />

        {/* 右目の白目 */}
        <ellipse cx="52" cy="38" rx="5" ry="6" fill="#FFFFFF" />
        {/* 右目の瞳 */}
        <ellipse cx="52" cy="39" rx="3" ry="5" fill="#2ECC40" />
        <ellipse cx="52" cy="39" rx="1.5" ry="3.5" fill="#1A7A28" />
        {/* 右目のハイライト */}
        <ellipse cx="53" cy="36" rx="1.5" ry="2" fill="#FFFFFF" opacity="0.9" />
        <circle cx="51.5" cy="41" r="0.8" fill="#FFFFFF" opacity="0.7" />
      </g>

      {/* 鼻（立体的） */}
      <path
        d="M 45 48 L 43 52 L 47 52 Z"
        fill="#E85D75"
        filter="url(#shadow)"
      />
      <ellipse cx="45" cy="51" rx="2" ry="1" fill="#CC4D65" opacity="0.6" />
      <circle cx="44" cy="49" r="0.8" fill="#FFB3C1" opacity="0.8" />

      {/* 口 */}
      <path
        d="M 45 52 L 45 54"
        stroke="#8B6B47"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M 45 54 Q 40 57, 37 55 M 45 54 Q 50 57, 53 55"
        stroke="#8B6B47"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ヒゲ（左） */}
      <line
        x1="25"
        y1="42"
        x2="12"
        y2="38"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.9"
      />
      <line
        x1="25"
        y1="45"
        x2="10"
        y2="45"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.9"
      />
      <line
        x1="26"
        y1="48"
        x2="12"
        y2="52"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* ヒゲ（右） */}
      <line
        x1="65"
        y1="42"
        x2="78"
        y2="38"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.9"
      />
      <line
        x1="65"
        y1="45"
        x2="80"
        y2="45"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.9"
      />
      <line
        x1="64"
        y1="48"
        x2="78"
        y2="52"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* 前足（左） */}
      <path
        d="M 35 70 L 32 82 L 36 82 L 38 70 Z"
        fill="url(#bodyGradient)"
        filter="url(#shadow)"
      />
      <ellipse cx="34" cy="82" rx="2.5" ry="2" fill="#E88844" />
      {/* 肉球 */}
      <circle cx="34" cy="82" r="1.2" fill="#CC6B7D" opacity="0.8" />

      {/* 前足（右） */}
      <path
        d="M 52 70 L 50 82 L 54 82 L 56 70 Z"
        fill="url(#bodyGradient)"
        filter="url(#shadow)"
      />
      <ellipse cx="52" cy="82" rx="2.5" ry="2" fill="#E88844" />
      {/* 肉球 */}
      <circle cx="52" cy="82" r="1.2" fill="#CC6B7D" opacity="0.8" />

      {/* 胸の白い部分 */}
      <ellipse
        cx="45"
        cy="60"
        rx="8"
        ry="12"
        fill="#FFFFFF"
        opacity="0.3"
        filter="url(#shadow)"
      />
    </svg>
  )
}
