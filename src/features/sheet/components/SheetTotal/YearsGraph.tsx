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

interface Props {
  years: Year[]
}
export const YearsGraph: React.FC<Props> = ({ years }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={years}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <XAxis dataKey="year" />
        <YAxis dataKey="count" />
        <CartesianGrid stroke="#f5f5f5" />
        <Tooltip formatter={(value, name, props) => [`${value}冊`]} />
        <Bar dataKey="count" barSize={30}>
          {years.map((entry, index) => (
            <Cell key={`cell-${index}`} cursor="pointer" fill="#507C8F" />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  )
}
