interface Props {
  open: boolean
  text: string
  onClose: () => void
}

export const SuccessAlert: React.FC<Props> = ({ open, text, onClose }) => {
  if (!open) return null
  return (
    <div
      id="alert-1"
      className={`flex items-center p-4 mb-4 text-blue-800 rounded-lg bg-blue-50`}
      role="alert"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 30 30"
        width="30px"
        height="30px"
        fill="currentColor"
      >
        <path d="M 15 3 C 8.373 3 3 8.373 3 15 C 3 21.627 8.373 27 15 27 C 21.627 27 27 21.627 27 15 C 27 12.820623 26.409997 10.783138 25.394531 9.0214844 L 14.146484 20.267578 C 13.959484 20.454578 13.705453 20.560547 13.439453 20.560547 C 13.174453 20.560547 12.919422 20.455578 12.732422 20.267578 L 8.2792969 15.814453 C 7.8882969 15.423453 7.8882969 14.791391 8.2792969 14.400391 C 8.6702969 14.009391 9.3023594 14.009391 9.6933594 14.400391 L 13.439453 18.146484 L 24.240234 7.3457031 C 22.039234 4.6907031 18.718 3 15 3 z M 24.240234 7.3457031 C 24.671884 7.8662808 25.053743 8.4300516 25.394531 9.0195312 L 27.707031 6.7070312 C 28.098031 6.3150312 28.098031 5.6839688 27.707031 5.2929688 C 27.316031 4.9019687 26.683969 4.9019688 26.292969 5.2929688 L 24.240234 7.3457031 z" />
      </svg>
      <span className="sr-only">Info</span>
      <div className="ml-3 text-sm font-medium">{text}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-blue-50 text-blue-500 rounded-lg focus:ring-2 focus:ring-blue-400 p-1.5 hover:bg-blue-200 inline-flex items-center justify-center h-8 w-8"
        data-dismiss-target="#alert-1"
        aria-label="Close"
        onClick={onClose}
      >
        <span className="sr-only">Close</span>
        <svg
          className="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
      </button>
    </div>
  )
}
