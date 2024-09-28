import { Tooltip } from 'react-tooltip'
import { HintIcon } from '../icon/HintIcon'

export const MaskingHint: React.FC = () => {
  return (
    <>
      <div data-tooltip-id="toggle-memo-tooltip">
        <HintIcon />
      </div>
      <Tooltip id="toggle-memo-tooltip" className="!w-[300px]">
        &quot;**&quot;で囲んだ文字はマスキングされ、他のユーザーには&quot;*****&quot;と表示されるようになります。例：「**マスク**さん」は「*****さん」と表示されます。
      </Tooltip>
    </>
  )
}
