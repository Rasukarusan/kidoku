import { aiSummaryPrompt } from './prompt'
import { aiSummaryPrompt as apiPrompt } from '../../../../api/src/shared/ai/prompt'
import { PERSONALITY_TYPE_IDS } from './personality/personality-types'
import { AI_SUMMARY_SCHEMAS } from '@/features/sheet/components/AiSummaries/schema'

it('コピーするプロンプトと自動生成のプロンプトが一致する', () => {
  expect(aiSummaryPrompt).toBe(apiPrompt)
})

it('MBTIの16タイプと、一言まとめを含む10フィールドを指定する', () => {
  for (const id of PERSONALITY_TYPE_IDS) expect(aiSummaryPrompt).toContain(id)
  const format = aiSummaryPrompt.split('[出力形式]\n')[1].split('---')[0]
  expect(Object.keys(JSON.parse(format))).toEqual(AI_SUMMARY_SCHEMAS[4].fields)
})
