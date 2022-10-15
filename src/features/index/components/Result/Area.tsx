import { selectItemsAtom } from '@/store/selectItems'
import { OpenInNew } from '@mui/icons-material'
import { Typography, Link } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { useEffect } from 'react'
import { useRecoilState } from 'recoil'
import { Results, Item } from '../../types'
import { Card } from './Card'

const useStyles = makeStyles({
  area: {
    display: 'flex',
    overflowX: 'scroll',
  },
  item: {
    display: 'inline-block',
  },
  searchWord: {
    paddingTop: 20,
    paddingBottom: 10,
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
})
interface Props {
  results: Results
  searchWords: string[]
}
export const Area: React.FC<Props> = ({ results, searchWords }) => {
  const classes = useStyles()
  const [selectItems, setSelectItems] = useRecoilState(selectItemsAtom)

  /**
   * 検索結果の一番最初をデフォルトでチェック状態とする
   *
   * UX向上のため。大体検索結果の最初が求めているもので、一々チェックするのが面倒なので省略。
   */
  useEffect(() => {
    const newSelectItems = searchWords.map((searchWord: string, i: number) => {
      if (typeof selectItems[i] === 'undefined') {
        return results[searchWord][0]
      } else {
        return selectItems[i]
      }
    })
    setSelectItems(newSelectItems)
  }, [results])

  return (
    <div style={{ marginBottom: '100px' }}>
      {searchWords.map((searchWord: string, i: number) => {
        return (
          <div key={`${i}-${searchWord}`}>
            <Link
              target="_blank"
              rel="noreferrer"
              href={`https://www.amazon.co.jp/s?k=${searchWord}`}
            >
              <Typography
                color="primary"
                variant="h5"
                className={classes.searchWord}
              >
                『{searchWord}』の検索結果
                <OpenInNew style={{ paddingLeft: 5 }} />
              </Typography>
            </Link>
            <div className={classes.area}>
              {Array.isArray(results[searchWord]) &&
                results[searchWord].map((item: Item, index: number) => (
                  <div className={classes.item} key={item.id}>
                    <Card row={i} searchWord={searchWord} item={item} />
                  </div>
                ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
