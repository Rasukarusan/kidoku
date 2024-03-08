interface Props {
  step: number
  maxStep: number
  onBack: () => void
  onNext: () => void
}

export const StepIndicator: React.FC<Props> = ({
  step,
  maxStep,
  onBack,
  onNext,
}) => {
  return (
    <div className="text-right text-sm text-gray-700">
      <button
        className="disabled:text-gray-400"
        onClick={onBack}
        disabled={step === 0}
      >
        &lt;
      </button>
      {` ${step + 1}/${maxStep} `}
      <button
        className="disabled:text-gray-400"
        onClick={onNext}
        disabled={step + 1 === maxStep}
      >
        &gt;
      </button>
    </div>
  )
}
