'use client'

interface Option { year: number; month: number }

export function MonthSelector({ options, value }: { options: Option[]; value: string }) {
  return (
    <select
      className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
      defaultValue={value}
      onChange={e => {
        const [y, m] = e.target.value.split('-')
        window.location.href = `/payroll?year=${y}&month=${m}`
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
