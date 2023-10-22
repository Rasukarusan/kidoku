interface Props {
  onClick: () => void
  className?: string
}
export const SignInWithGoogleButton: React.FC<Props> = ({
  onClick,
  className = '',
}) => {
  return (
    <button
      className={`flex gap-2 rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition duration-150 hover:border-slate-400 hover:text-slate-900 hover:shadow ${className}`}
      onClick={onClick}
    >
      <img
        className="h-6 w-6"
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        loading="lazy"
        alt="google logo"
      />
      <span className="font-bold">Login with Google</span>
    </button>
  )
}
