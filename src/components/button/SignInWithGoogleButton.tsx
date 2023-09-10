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
      className={`px-4 py-2 border flex gap-2 border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150 ${className}`}
      onClick={onClick}
    >
      <img
        className="w-6 h-6"
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        loading="lazy"
        alt="google logo"
      />
      <span className="font-bold">Login with Google</span>
    </button>
  )
}
