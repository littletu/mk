'use client'

import { useRouter } from 'next/navigation'

interface Option { year: number; month: number }

export function MonthSelector({ options, value }: { options: Option[]; value: string }) {
  const router = useRouter()

  const [selectedYear, selectedMonth] = value.split('-').map(Number)

  const years = [...new Set(options.map(o => o.year))].sort((a, b) => b - a)
  const monthsForYear = options.filter(o => o.year === selectedYear).map(o => o.month)

  return (
    <div className="flex items-center gap-4">
      <select
        value={selectedYear}
        onChange={e => {
          const y = Number(e.target.value)
          router.push(`/payroll?year=${y}&month=${selectedMonth}`)
        }}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 shrink-0"
      >
        {years.map(y => (
          <option key={y} value={y}>{y} 年</option>
        ))}
      </select>

      <div className="flex flex-wrap gap-1.5">
        {monthsForYear.map(month => {
          const active = month === selectedMonth
          return (
            <button
              key={month}
              onClick={() => router.push(`/payroll?year=${selectedYear}&month=${month}`)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {month}月
            </button>
          )
        })}
      </div>
    </div>
  )
}
