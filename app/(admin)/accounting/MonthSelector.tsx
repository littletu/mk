'use client'

interface MonthSelectorProps {
  value: string
  options: { year: number; month: number }[]
}

export default function MonthSelector({ value, options }: MonthSelectorProps) {
  return (
    <select
      className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
      defaultValue={value}
      onChange={e => {
        const [y, m] = e.target.value.split('-')
        window.location.href = `/accounting?year=${y}&month=${m}`
      }}
    >
      {options.map(o => (
        <option key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`}>
          {o.year} 年 {o.month} 月
        </option>
      ))}
    </select>
  )
}
