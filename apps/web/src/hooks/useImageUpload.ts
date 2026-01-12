import { useState } from 'react'
import { upload } from '@vercel/blob/client'

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true)
    setError(null)

    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload/image',
      })

      setUploading(false)
      return blob.url
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      setUploading(false)
      return null
    }
  }

  return {
    uploadImage,
    uploading,
    error,
  }
}
