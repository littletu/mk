import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency, currentYearMonth } from '@/lib/utils/date'
import { getBiweeklyPeriods } from '@/lib/utils/payroll'
import { PayrollActions } from '@/components/forms/PayrollActions'
import { PayrollQuickActions } from '@/components/forms/PayrollQuickActions'
import { PayrollPrintButton } from '@/components/forms/PayrollPrintButton'
import { MonthSelector } from '@/components/forms/MonthSelector'
import Link from 'next/link'
import { Wallet } from 'lucide-react'

interface SearchParams { year?: string; month?: string }

const statusLabel: Record<string, string> = { draft: '草稿', confirmed: '已確認', paid: '已發薪' }
const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'outline', confirmed: 'secondary', paid: 'default',
}

export default async function PayrollPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const { year: curYear, month: curMonth } = currentYearMonth()
  const year = parseInt(sp.year ?? String(curYear))
  const month = parseInt(sp.month ?? String(curMonth))

  const supabase = await createClient()
  const periods = getBiweeklyPeriods(year, month)

  const { data: workers } = await supabase
    .from('workers')
    .select('id, daily_rate, overtime_rate, profile:profiles(full_name)')
    .eq('is_active', true) as { data: Array<{ id: string; daily_rate: number; overtime_rate: number; profile: any }> | null }

  // Load payroll records for this month
  // Use period_start bounds only (avoids invalid dates like 2025-04-31)
  const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`
  const { data: records } = await supabase
    .from('payroll_records')
    .select('*')
    .gte('period_start', `${year}-${String(month).padStart(2, '0')}-01`)
    .lt('period_start', nextMonth)

  // recordMap not used directly; lookup via find below

  // Month selector options (last 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(curYear, curMonth - 1 - i, 1)
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">薪資管理</h1>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <MonthSelector options={monthOptions} value={`${year}-${month}`} />
        </div>
      </div>

      {periods.map(period => (
        <div key={period.start} className="mb-8">
          {(() => {
            const periodRecords = (records ?? []).filter(r => r.period_start === period.start)
            const totalDays = periodRecords.reduce((s, r) => s + (r.regular_days ?? 0), 0)
            const totalNet = periodRecords.reduce((s, r) => s + (r.net_amount ?? 0), 0)
            return (
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-semibold text-gray-800">{period.label}</h2>
                {periodRecords.length > 0 && (
                  <span className="text-sm text-gray-500">
                    共 {totalDays} 工・本期薪資合計 {formatCurrency(totalNet)}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <PayrollPrintButton
                    periodStart={period.start}
                    periodEnd={period.end}
                    disabled={periodRecords.length === 0}
                  />
                  <PayrollActions
                    periodStart={period.start}
                    periodEnd={period.end}
                    workers={workers ?? []}
                  />
                </div>
              </div>
            )
          })()}

          <div className="space-y-3">
            {(workers ?? []).map((worker: any) => {
              const record = records?.find(r => r.worker_id === worker.id && r.period_start === period.start)
              if (!record) return null
              return (
                <Card key={worker.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{(worker.profile as any)?.full_name}</p>
                      <p className="text-xs text-gray-500">
                        日薪 {formatCurrency(worker.daily_rate)} ／ 加班時薪 {formatCurrency(worker.overtime_rate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold text-orange-600">{formatCurrency(record.net_amount)}</p>
                        <p className="text-xs text-gray-500">{record.regular_days}天 ＋ {record.overtime_hours}h 加班</p>
                      </div>
                      <PayrollQuickActions recordId={record.id} status={record.status} />
                      <Link href={`/payroll/${record.id}`}>
                        <Badge variant={statusVariant[record.status]} className="cursor-pointer">
                          {statusLabel[record.status]}
                        </Badge>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {!(records ?? []).some(r => r.period_start === period.start) && (
              <p className="text-sm text-gray-400 text-center py-6">此期間尚無薪資記錄，請先計算薪資</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
