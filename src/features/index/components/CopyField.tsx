import { useRecoilValue } from 'recoil'
import { useState, useRef } from 'react'
import { Snackbar, Alert } from '@mui/material'
import { selectItemsCopyTextSelector } from '@/store/selectItems/selector'

export const CopyField: React.FC = () => {
  const text = useRecoilValue(selectItemsCopyTextSelector)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  const handleOnClick = () => {
    navigator.clipboard.writeText(text)
    setOpen(true)
  }
  return (
    <div>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity="success"
          elevation={6}
          variant="filled"
        >
          Copied!
        </Alert>
      </Snackbar>
      <textarea
        wrap="off"
        placeholder="クリックしてコピー"
        value={text}
        rows={13}
        readOnly
        onClick={handleOnClick}
        className="w-full block resize-none h-[263px] p-2 cursor-pointer bg-transparent border border-[rgba(0,0,0,0.23)] rounded text-gray-500 outline-none"
      />
    </div>
  )
}
