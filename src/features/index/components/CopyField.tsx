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
      />
      <style jsx>{`
        textarea {
          width: 100%;
          display: block;
          resize: none;
          height: 263px;
          color: gray;
          padding: 10px;
          font-size: 1rem;
          cursor: pointer;
          background: transparent;
          border-color: rgba(0, 0, 0, 0.23);
          border-radius: 4px;
        }
        textarea:focus {
          outline: none;
        }
      `}</style>
    </div>
  )
}
