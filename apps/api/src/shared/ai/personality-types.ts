/**
 * AI読書性格診断のタイプ定義（プロンプト生成・保存値検証用）
 *
 * 表示用の定義（色・キャラクター等）は apps/web/src/libs/ai/personality/ にあり、
 * idはフロントエンドと共通のキーとして使用する。両ファイルのid・name・criteriaは
 * 同期を保つこと。
 */
type PersonalityType = {
  /** 保存データ・プロンプトで使う識別子 */
  id: string;
  /** タイプ名（日本語） */
  name: string;
  /** LLM分類用の判定基準 */
  criteria: string;
};

export const PERSONALITY_TYPES: PersonalityType[] = [
  {
    id: 'adventurer',
    name: '物語の冒険家',
    criteria: '小説・ファンタジー・冒険譚を中心に、物語世界への没入を楽しむ',
  },
  {
    id: 'philosopher',
    name: '静かな思索家',
    criteria: '哲学・思想・抽象的なテーマを好み、深く考えながら読む',
  },
  {
    id: 'scholar',
    name: '知の探究者',
    criteria: 'ノンフィクション・専門書・学術書で体系的な知識を求める',
  },
  {
    id: 'empath',
    name: '共感の語り部',
    criteria:
      '人間ドラマ・恋愛・家族の物語に感情移入し、感想に感情が豊かに表れる',
  },
  {
    id: 'strategist',
    name: '未来の戦略家',
    criteria: 'ビジネス・自己啓発・実用書から行動につながる学びを得る',
  },
  {
    id: 'dreamer',
    name: '夢見る空想家',
    criteria: 'SF・ファンタジー・幻想的な物語で想像力を羽ばたかせる',
  },
  {
    id: 'detective',
    name: '真相を追う探偵',
    criteria: 'ミステリー・サスペンス・謎解きを好み、構造や伏線に注目する',
  },
  {
    id: 'healer',
    name: '心を整える癒し人',
    criteria: 'エッセイ・詩・穏やかな物語で心を癒やし、読書で気持ちを整える',
  },
  {
    id: 'challenger',
    name: '限界を超える挑戦者',
    criteria:
      '難解な本・大作・幅広いジャンルに果敢に挑み、読破すること自体を楽しむ',
  },
  {
    id: 'curator',
    name: '美を愛でる審美家',
    criteria: '芸術・デザイン・文体の美しい作品を好み、表現そのものを味わう',
  },
  {
    id: 'timetraveler',
    name: '時を渡る旅人',
    criteria: '歴史・伝記・古典を通じて過去と対話し、時代を越えた学びを得る',
  },
  {
    id: 'innovator',
    name: 'ひらめきの発明家',
    criteria:
      '科学・テクノロジー・新しい概念に惹かれ、知識を組み合わせて発想する',
  },
  {
    id: 'wanderer',
    name: '気ままな漂流者',
    criteria: '特定ジャンルに縛られず、そのときの気分と偶然の出会いで本を選ぶ',
  },
];

export const PERSONALITY_TYPE_IDS = PERSONALITY_TYPES.map((t) => t.id);

/**
 * プロンプトに埋め込むタイプ一覧（id: 名前 - 判定基準）
 */
export const personalityTypePromptList = PERSONALITY_TYPES.map(
  (t) => `  - ${t.id}（${t.name}）: ${t.criteria}`,
).join('\n');
