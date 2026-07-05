/**
 * AI読書性格診断のタイプ定義（MBTI風）
 *
 * LLMが読書履歴から1タイプを分類し、タイプごとのキャラクター画像を表示する。
 * idはプロンプト・保存データ・キャラクターSVGで共通のキーとして使用する。
 */
export type PersonalityFace = 'round' | 'closed' | 'sparkle'

export type PersonalityType = {
  /** 保存データ・プロンプトで使う識別子 */
  id: string
  /** MBTIのタイプコード風の英字コード */
  code: string
  /** タイプ名（日本語） */
  name: string
  /** タイプの短い説明（診断カードに表示） */
  tagline: string
  /** LLM分類用の判定基準 */
  criteria: string
  /** キャラクターのメインカラー */
  color: string
  /** 背景・アクセント用のライトカラー */
  colorLight: string
  /** キャラクターの表情 */
  face: PersonalityFace
}

export const PERSONALITY_TYPES: PersonalityType[] = [
  {
    id: 'adventurer',
    code: 'ADVENTURER',
    name: '物語の冒険家',
    tagline: 'ページをめくるたび、新しい世界へ飛び込む',
    criteria: '小説・ファンタジー・冒険譚を中心に、物語世界への没入を楽しむ',
    color: '#f59e0b',
    colorLight: '#fef3c7',
    face: 'round',
  },
  {
    id: 'philosopher',
    code: 'PHILOSOPHER',
    name: '静かな思索家',
    tagline: '一冊の問いを、どこまでも深く掘り下げる',
    criteria: '哲学・思想・抽象的なテーマを好み、深く考えながら読む',
    color: '#8b5cf6',
    colorLight: '#ede9fe',
    face: 'closed',
  },
  {
    id: 'scholar',
    code: 'SCHOLAR',
    name: '知の探究者',
    tagline: '知識を積み上げ、世界の解像度を上げていく',
    criteria: 'ノンフィクション・専門書・学術書で体系的な知識を求める',
    color: '#3b82f6',
    colorLight: '#dbeafe',
    face: 'round',
  },
  {
    id: 'empath',
    code: 'EMPATH',
    name: '共感の語り部',
    tagline: '登場人物の心に寄り添い、涙も笑いも共にする',
    criteria:
      '人間ドラマ・恋愛・家族の物語に感情移入し、感想に感情が豊かに表れる',
    color: '#ec4899',
    colorLight: '#fce7f3',
    face: 'round',
  },
  {
    id: 'strategist',
    code: 'STRATEGIST',
    name: '未来の戦略家',
    tagline: '読んだ知識を、明日の一手に変える',
    criteria: 'ビジネス・自己啓発・実用書から行動につながる学びを得る',
    color: '#10b981',
    colorLight: '#d1fae5',
    face: 'round',
  },
  {
    id: 'dreamer',
    code: 'DREAMER',
    name: '夢見る空想家',
    tagline: '現実の少し外側に、お気に入りの居場所がある',
    criteria: 'SF・ファンタジー・幻想的な物語で想像力を羽ばたかせる',
    color: '#a78bfa',
    colorLight: '#f3e8ff',
    face: 'sparkle',
  },
  {
    id: 'detective',
    code: 'DETECTIVE',
    name: '真相を追う探偵',
    tagline: '伏線とどんでん返しに、心を奪われる',
    criteria: 'ミステリー・サスペンス・謎解きを好み、構造や伏線に注目する',
    color: '#6366f1',
    colorLight: '#e0e7ff',
    face: 'round',
  },
  {
    id: 'healer',
    code: 'HEALER',
    name: '心を整える癒し人',
    tagline: '本のページは、深呼吸のための場所',
    criteria: 'エッセイ・詩・穏やかな物語で心を癒やし、読書で気持ちを整える',
    color: '#34d399',
    colorLight: '#ecfdf5',
    face: 'closed',
  },
  {
    id: 'challenger',
    code: 'CHALLENGER',
    name: '限界を超える挑戦者',
    tagline: '難しい本ほど、燃える',
    criteria:
      '難解な本・大作・幅広いジャンルに果敢に挑み、読破すること自体を楽しむ',
    color: '#ef4444',
    colorLight: '#fee2e2',
    face: 'round',
  },
  {
    id: 'curator',
    code: 'CURATOR',
    name: '美を愛でる審美家',
    tagline: '言葉の手ざわりと、装丁の美しさに敏感',
    criteria: '芸術・デザイン・文体の美しい作品を好み、表現そのものを味わう',
    color: '#f472b6',
    colorLight: '#fdf2f8',
    face: 'sparkle',
  },
  {
    id: 'timetraveler',
    code: 'TIMETRAVELER',
    name: '時を渡る旅人',
    tagline: '歴史の中に、今を生きるヒントを探す',
    criteria: '歴史・伝記・古典を通じて過去と対話し、時代を越えた学びを得る',
    color: '#eab308',
    colorLight: '#fef9c3',
    face: 'round',
  },
  {
    id: 'innovator',
    code: 'INNOVATOR',
    name: 'ひらめきの発明家',
    tagline: '本と本のあいだで、アイデアが火花を散らす',
    criteria:
      '科学・テクノロジー・新しい概念に惹かれ、知識を組み合わせて発想する',
    color: '#06b6d4',
    colorLight: '#cffafe',
    face: 'sparkle',
  },
  {
    id: 'wanderer',
    code: 'WANDERER',
    name: '気ままな漂流者',
    tagline: 'ジャンルの海を、風の向くまま漂う',
    criteria: '特定ジャンルに縛られず、そのときの気分と偶然の出会いで本を選ぶ',
    color: '#64748b',
    colorLight: '#f1f5f9',
    face: 'closed',
  },
]

export const PERSONALITY_TYPE_IDS = PERSONALITY_TYPES.map((t) => t.id)

/**
 * idからタイプ定義を取得する（未知のid・未設定はundefined）
 */
export const findPersonalityType = (
  id: string | undefined | null
): PersonalityType | undefined => PERSONALITY_TYPES.find((t) => t.id === id)

/**
 * プロンプトに埋め込むタイプ一覧（id: 名前 - 判定基準）
 */
export const personalityTypePromptList = PERSONALITY_TYPES.map(
  (t) => `  - ${t.id}（${t.name}）: ${t.criteria}`
).join('\n')
