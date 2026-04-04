'use client'

import { useState } from 'react'

type View = 'month' | 'quarter' | 'year'

interface Props {
  curYear: number
  curMonth: number
  activeView: View
  activeYear: number
  activeMonth: number
  activeQuarter: number
}

const QUARTERS = ['Q1（1-3月）', 'Q2（4-6月）', 'Q3（7-9月）', 'Q4（10-12月）']

function navigate(params: Record<string, string | number>) {
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
  window.location.href = `/accounting?${qs}`
}

export default function MonthSelector({ curYear, curMonth, activeView, activeYear, activeMonth, activeQuarter }: Props) {
  const [view, setView] = useState<View>(activeView)

  const years = Array.from({ length: 5 }, (_, i) => curYear - i)
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  const tabCls = (v: View) =>
    `px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
      view === v ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`

  return (
    <div className="flex flex-col items-end gap-2">
      {/* View toggle */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {(['month', 'quarter', 'year'] as View[]).map(v => (
          <button key={v} className={tabCls(v)} onClick={() => setView(v)}>
            {{ month: '月', quarter: '季', year: '年' }[v]}
          </button>
        ))}
      </div>

      {/* Month view */}
      {view === 'month' && (
        <div className="flex items-center gap-2">
          <select
            className="h-8 text-sm border border-gray-200 rounded-lg px-2 bg-white"
            value={activeYear}
            onChange={e => navigate({ view: 'month', year: e.target.value, month: activeMonth })}
          >
            {years.map(y => <option key={y} value={y}>{y} 年</option>)}
          </select>
          <div className="flex gap-1 flex-wrap max-w-xs">
            {months.map(m => (
              <button
                key={m}
                onClick={() => navigate({ view: 'month', year: activeYear, month: m })}
                className={`w-9 h-8 text-xs rounded-lg transition-colors ${
                  view === activeView && m === activeMonth && activeYear === activeYear
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                }`}
              >
                {m}月
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quarter view */}
      {view === 'quarter' && (
        <div className="flex items-center gap-2">
          <select
            className="h-8 text-sm border border-gray-200 rounded-lg px-2 bg-white"
            value={activeYear}
            onChange={e => navigate({ view: 'quarter', year: e.target.value, quarter: activeQuarter })}
          >
            {years.map(y => <option key={y} value={y}>{y} 年</option>)}
          </select>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map(q => (
              <button
                key={q}
                onClick={() => navigate({ view: 'quarter', year: activeYear, quarter: q })}
                className={`px-3 h-8 text-xs rounded-lg transition-colors ${
                  view === activeView && q === activeQuarter
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                }`}
              >
                Q{q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Year view */}
      {view === 'year' && (
        <div className="flex gap-1">
          {years.map(y => (
            <button
              key={y}
              onClick={() => navigate({ view: 'year', year: y })}
              className={`px-3 h-8 text-sm rounded-lg transition-colors ${
                view === activeView && y === activeYear
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
