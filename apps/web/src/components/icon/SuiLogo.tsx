interface Props {
  size?: number
  className?: string
}

/**
 * Sui のシンボル（水滴）を模したロゴアイコン。
 * fill は currentColor を使用するため、文字色クラスで色を制御できる。
 */
export const SuiLogo: React.FC<Props> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M12 2.25c2.2 3.06 7.05 7.66 7.05 12.6A7.05 7.05 0 1 1 4.95 14.85C4.95 9.91 9.8 5.31 12 2.25Z"
      fill="currentColor"
    />
    <path
      d="M9.2 12.1c-.9 1.27-1.15 2.86-.5 4.3.66 1.46 2.06 2.4 3.6 2.5"
      stroke="white"
      strokeOpacity="0.6"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
)
