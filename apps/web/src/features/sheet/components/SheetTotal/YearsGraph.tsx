import {
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  CartesianGrid,
  Bar,
  Cell,
  YAxis,
} from 'recharts'
import { Year } from '../../types'

const colors = [
  '#003049',
  '#021E66',
  '#D62828',
  '#F77F00',
  '#564779',
  '#FCBF49',
  '#EAE2B7',
  '#F76E7C',
  '#F73668',
  '#FF7F75',
  '#F0EAD8',
  '#2B2F6C',
]

interface Props {
  years: Year[]
}
export const YearsGraph: React.FC<Props> = ({ years }) => {
  return (
    <ResponsiveContainer width="115%" height="100%" className="-mx-12">
      <ComposedChart
        data={years}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
        <YAxis dataKey="count" tick={{ fontSize: 12 }} dx={0} />
        <CartesianGrid stroke="#f5f5f5" />
        <Tooltip formatter={(value) => [`${value}冊`]} />
        <Bar dataKey="count" barSize={30}>
          {years.map((entry, i) => (
            <Cell key={`cell-${i}`} cursor="pointer" fill={colors[i % 12]} />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  )
}
