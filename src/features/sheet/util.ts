import dayjs from 'dayjs'

export const bgColors = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#0C8CC2',
  '#F73E58',
  '#507C8F',
  '#FF8042',
  '#27F5C1',
]

const getRandomInt = (max: number): number => {
  return Math.floor(Math.random() * max)
}

export const getRandomColor = (): string => {
  const i = getRandomInt(bgColors.length)
  return bgColors[i]
}

export const getYears = (): string[] => {
  const from = 2016 // 読書シートが存在する最初の年
  const to = parseInt(dayjs().format('YYYY')) // 今年
  const years = []
  for (let year = from; year <= to; year++) {
    years.push(String(year))
  }
  return years
}
