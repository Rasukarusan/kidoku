import { useState } from 'react'
import axios from 'axios'
import Head from 'next/head'
import { Layout } from '@/components/Layout'
import { TextField, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { ResultCard } from '@/components/ResultCard'

interface ImageLinks {
  smallThumbnail: string
  thumbnail: string
}

interface VolumeInfo {
  allowAnonLogging: boolean
  authors?: string[]
  canonicalVolumeLink: string
  categories: string[]
  contentVersion: string
  description?: string
  imageLinks?: ImageLinks
  industryIdentifiers: any
  infoLink: string
  language: string
  maturityRating: string
  previewLink: string
  printType: string
  publishedDate: string
  publisher: string
  readingModes: any
  subtitle: string
  title: string
}

export interface Item {
  // TODO: volumeInfo以外は使わないのでanyにしておく
  accessInfo: any
  etag: string
  id: string
  kind: string
  saleInfo: any
  searchInfo: any
  selfLink: string
  volumeInfo: VolumeInfo
}

export const InputField = ({ setResults }) => {
  const getBook = async (title: string): Promise<Item[]> => {
    return axios
      .get(`https://www.googleapis.com/books/v1/volumes?q=${title}`)
      .then((res) => res.data.items)
  }

  const handleOnChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {}

  const handleOnBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    const titles = event.target.value.split('\n').filter((v) => v !== '')
    const results = {}
    await Promise.all(
      titles.map(async (title) => {
        results[title] = await getBook(title)
      })
    )
    setResults(results)
  }

  return (
    <TextField
      label="本のタイトルを1行ずつ入力"
      multiline
      fullWidth
      rows={10}
      variant="outlined"
      onChange={handleOnChange}
      onBlur={handleOnBlur}
    />
  )
}
