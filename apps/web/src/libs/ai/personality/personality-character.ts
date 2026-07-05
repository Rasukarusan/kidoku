import type { PersonalityFace, PersonalityType } from './personality-types'

/**
 * 読書性格タイプのキャラクター画像（SVG）を生成する
 *
 * Web UIとOG画像（@vercel/og）の両方で使うため、SVG文字列として単一ソースで管理する。
 * OG画像側でbase64エンコードするため、SVG内はASCII文字のみで構成すること（<text>要素は使わない）。
 */

const face = (type: PersonalityType): string => {
  const eyesByFace: Record<PersonalityFace, string> = {
    round: `
      <circle cx="98" cy="118" r="7" fill="#1f2937"/>
      <circle cx="142" cy="118" r="7" fill="#1f2937"/>
      <circle cx="100.5" cy="115.5" r="2.5" fill="#ffffff"/>
      <circle cx="144.5" cy="115.5" r="2.5" fill="#ffffff"/>`,
    closed: `
      <path d="M91 118 q7 7 14 0" stroke="#1f2937" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <path d="M135 118 q7 7 14 0" stroke="#1f2937" stroke-width="3.5" stroke-linecap="round" fill="none"/>`,
    sparkle: `
      <path d="M98 109 l2.6 6 6 2.6 -6 2.6 -2.6 6 -2.6 -6 -6 -2.6 6 -2.6 Z" fill="#1f2937"/>
      <path d="M142 109 l2.6 6 6 2.6 -6 2.6 -2.6 6 -2.6 -6 -6 -2.6 6 -2.6 Z" fill="#1f2937"/>`,
  }

  return `${eyesByFace[type.face]}
      <ellipse cx="84" cy="132" rx="7.5" ry="4.5" fill="#fda4af" opacity="0.7"/>
      <ellipse cx="156" cy="132" rx="7.5" ry="4.5" fill="#fda4af" opacity="0.7"/>
      <path d="M112 136 q8 8 16 0" stroke="#1f2937" stroke-width="3.5" stroke-linecap="round" fill="none"/>`
}

const accessories: Record<string, string> = {
  adventurer: `
      <ellipse cx="120" cy="86" rx="47" ry="10" fill="#92400e"/>
      <path d="M94 86 Q94 56 120 56 Q146 56 146 86 Z" fill="#b45309"/>
      <rect x="94" y="76" width="52" height="8" fill="#78350f"/>`,
  philosopher: `
      <circle cx="168" cy="96" r="4" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
      <circle cx="178" cy="82" r="6" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
      <circle cx="192" cy="62" r="10" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>`,
  scholar: `
      <polygon points="120,56 170,74 120,92 70,74" fill="#1e3a8a"/>
      <circle cx="120" cy="74" r="4" fill="#facc15"/>
      <path d="M120 74 Q150 80 156 100" stroke="#facc15" stroke-width="3" fill="none"/>
      <circle cx="156" cy="104" r="5" fill="#facc15"/>`,
  empath: `
      <path d="M164 66 c4 -7 14 -5 14 3 c0 6 -8 11 -14 15 c-6 -4 -14 -9 -14 -15 c0 -8 10 -10 14 -3 Z" fill="#f43f5e"/>
      <path d="M190 96 c2.5 -4.5 9 -3 9 2 c0 4 -5 7 -9 9.5 c-4 -2.5 -9 -5.5 -9 -9.5 c0 -5 6.5 -6.5 9 -2 Z" fill="#fb7185"/>`,
  strategist: `
      <rect x="113" y="142" width="14" height="8" rx="2" fill="#065f46"/>
      <polygon points="120,150 110,158 120,170 130,158" fill="#047857"/>`,
  dreamer: `
      <path d="M86 86 Q114 46 166 54 Q150 72 152 86 Z" fill="#7c3aed"/>
      <circle cx="168" cy="53" r="8" fill="#ffffff"/>
      <path d="M66 96 l2 4.6 4.6 2 -4.6 2 -2 4.6 -2 -4.6 -4.6 -2 4.6 -2 Z" fill="#c4b5fd"/>
      <path d="M186 104 l2 4.6 4.6 2 -4.6 2 -2 4.6 -2 -4.6 -4.6 -2 4.6 -2 Z" fill="#c4b5fd"/>`,
  detective: `
      <ellipse cx="120" cy="86" rx="45" ry="9" fill="#4338ca"/>
      <path d="M82 86 Q120 44 158 86 Z" fill="#4f46e5"/>
      <circle cx="180" cy="142" r="14" fill="#ffffff" fill-opacity="0.35" stroke="#1f2937" stroke-width="4"/>
      <line x1="190" y1="152" x2="202" y2="166" stroke="#1f2937" stroke-width="6" stroke-linecap="round"/>`,
  healer: `
      <path d="M120 86 Q120 72 120 64" stroke="#059669" stroke-width="4" stroke-linecap="round" fill="none"/>
      <path d="M120 66 Q104 60 98 44 Q116 44 120 60 Z" fill="#34d399"/>
      <path d="M120 66 Q136 60 142 44 Q124 44 120 60 Z" fill="#6ee7b7"/>`,
  challenger: `
      <path d="M76 104 Q120 88 164 104 L164 116 Q120 100 76 116 Z" fill="#b91c1c"/>
      <circle cx="164" cy="110" r="5" fill="#991b1b"/>
      <polygon points="168,110 190,100 184,116" fill="#b91c1c"/>
      <polygon points="168,112 188,124 178,128" fill="#dc2626"/>`,
  curator: `
      <path d="M84 84 Q86 56 120 54 Q154 56 156 84 Q120 70 84 84 Z" fill="#db2777"/>
      <circle cx="120" cy="52" r="4" fill="#9d174d"/>`,
  timetraveler: `
      <path d="M150 96 Q166 100 174 92" stroke="#a16207" stroke-width="3" stroke-dasharray="1 5" stroke-linecap="round" fill="none"/>
      <rect x="172" y="58" width="10" height="7" rx="2" fill="#a16207"/>
      <circle cx="177" cy="80" r="16" fill="#fef08a" stroke="#a16207" stroke-width="4"/>
      <line x1="177" y1="80" x2="177" y2="70" stroke="#a16207" stroke-width="3" stroke-linecap="round"/>
      <line x1="177" y1="80" x2="184" y2="84" stroke="#a16207" stroke-width="3" stroke-linecap="round"/>`,
  innovator: `
      <line x1="120" y1="90" x2="120" y2="64" stroke="#0e7490" stroke-width="4"/>
      <circle cx="120" cy="54" r="10" fill="#fde047" stroke="#a16207" stroke-width="3"/>
      <line x1="102" y1="44" x2="108" y2="50" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
      <line x1="138" y1="44" x2="132" y2="50" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>
      <line x1="120" y1="36" x2="120" y2="42" stroke="#facc15" stroke-width="3" stroke-linecap="round"/>`,
  wanderer: `
      <polygon points="158,82 198,64 178,94" fill="#ffffff" stroke="#475569" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="174,84 178,94 172,98" fill="#cbd5e1" stroke="#475569" stroke-width="2" stroke-linejoin="round"/>`,
}

/**
 * キャラクターSVG文字列を生成する
 */
export const personalityCharacterSvg = (
  type: PersonalityType,
  size = 240
): string => {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 240 240">
      <circle cx="120" cy="120" r="112" fill="${type.colorLight}"/>
      <ellipse cx="120" cy="138" rx="63" ry="60" fill="${type.color}"/>
      <ellipse cx="120" cy="162" rx="42" ry="30" fill="#ffffff" opacity="0.3"/>
      ${face(type)}
      <path d="M120 196 C104 186 84 186 72 192 L72 170 C84 164 104 164 120 174 Z" fill="#fffdf7" stroke="#8b5e34" stroke-width="4" stroke-linejoin="round"/>
      <path d="M120 196 C136 186 156 186 168 192 L168 170 C156 164 136 164 120 174 Z" fill="#fffdf7" stroke="#8b5e34" stroke-width="4" stroke-linejoin="round"/>
      <line x1="120" y1="174" x2="120" y2="196" stroke="#8b5e34" stroke-width="3"/>
      <circle cx="74" cy="178" r="9" fill="${type.color}"/>
      <circle cx="166" cy="178" r="9" fill="${type.color}"/>
      ${accessories[type.id] ?? ''}
    </svg>`
    .replace(/\n\s*/g, ' ')
    .trim()
}

/**
 * Web UIの<img>で使えるdata URIを生成する
 */
export const personalityCharacterDataUri = (
  type: PersonalityType,
  size = 240
): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(personalityCharacterSvg(type, size))}`
