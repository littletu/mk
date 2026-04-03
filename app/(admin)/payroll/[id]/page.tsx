import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils/date'
import { PayrollStatusActions } from '@/components/forms/PayrollStatusActions'

const statusLabel: Record<string, string> = { draft: '草稿', confirmed: '已確認', paid: '已發薪' }
const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'outline', confirmed: 'secondary', paid: 'default',
}

export default async function PayrollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: record } = await supabase
    .from('payroll_records')
    .select('*, worker:workers(daily_rate, overtime_rate, profile:profiles(full_name))')
    .eq('id', id)
    .single()

  if (!record) notFound()

  const { data: entries } = await supabase
    .from('time_entries')
    .select('*, project:projects(name)')
    .eq('worker_id', record.worker_id)
    .gte('work_date', record.period_start)
    .lte('work_date', record.period_end)
    .order('work_date', { ascending: true })

  const worker = record.worker as any

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/payroll" className="text-gray-500 hover:text-gray-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">薪資明細</h1>
          <p className="text-sm text-gray-500">{worker?.profile?.full_name}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-gray-600">
              {formatDate(record.period_start)} ~ {formatDate(record.period_end)}
            </CardTitle>
            <Badge variant={statusVariant[record.status]}>{statusLabel[record.status]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <p className="text-sm text-orange-700 mb-1">實領金額</p>
            <p className="text-3xl font-bold text-orange-600">{formatCurrency(record.net_amount)}</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-600">日薪薪資</span>
              <div className="text-right">
                <span className="font-medium">{formatCurrency(record.regular_amount)}</span>
                <span className="text-xs text-gray-400 ml-2">{record.regular_days}天 × {formatCurrency(worker?.daily_rate)}</span>
              </div>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-600">加班薪資</span>
              <div className="text-right">
                <span className="font-medium">{formatCurrency(record.overtime_amount)}</span>
                <span className="text-xs text-gray-400 ml-2">{record.overtime_hours}h × {formatCurrency(worker?.overtime_rate)}</span>
              </div>
            </div>
            {record.transportation_total > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-600">交通費</span>
                <span className="font-medium">{formatCurrency(record.transportation_total)}</span>
              </div>
            )}
            {record.meal_total > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-600">餐費</span>
                <span className="font-medium">{formatCurrency(record.meal_total)}</span>
              </div>
            )}
            {record.advance_total > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-600">代墊費</span>
                <span className="font-medium">{formatCurrency(record.advance_total)}</span>
              </div>
            )}
            {record.subsidy_total > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-600">補貼</span>
                <span className="font-medium">{formatCurrency(record.subsidy_total)}</span>
              </div>
            )}
            {record.other_total > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-600">其他費用</span>
                <span className="font-medium">{formatCurrency(record.other_total)}</span>
              </div>
            )}
            {record.deduction_amount > 0 && (
              <div className="flex justify-between py-2 border-b border-gray-50 text-red-600">
                <span>扣款</span>
                <span className="font-medium">-{formatCurrency(record.deduction_amount)}</span>
              </div>
            )}
            <div className="flex justify-between py-3 font-bold text-base">
              <span>實領合計</span>
              <span className="text-orange-600">{formatCurrency(record.net_amount)}</span>
            </div>
          </div>

          {/* Daily breakdown */}
          {entries && entries.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">每日工時明細</p>
              <div className="space-y-2">
                {entries.map((entry: any) => {
                  const fees = [
                    { label: '交通費', value: entry.transportation_fee },
                    { label: '餐費', value: entry.meal_fee },
                    { label: '代墊費', value: entry.advance_payment },
                    { label: '補貼', value: entry.subsidy },
                    { label: '其他費用', value: entry.other_fee },
                  ].filter(f => f.value > 0)
                  return (
                    <div key={entry.id} className="rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2.5 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-medium text-gray-800">{formatDate(entry.work_date)}</span>
                        <span className="text-gray-500 truncate max-w-[140px] text-right">{(entry.project as any)?.name ?? '—'}</span>
                      </div>
                      <div className="flex gap-4 text-gray-600">
                        <span>工數 <span className="font-medium text-gray-800">{entry.regular_days}天</span></span>
                        {entry.overtime_hours > 0 && (
                          <span>加班 <span className="font-medium text-gray-800">{entry.overtime_hours}h</span></span>
                        )}
                      </div>
                      {fees.length > 0 && (
                        <div className="mt-1.5 pt-1.5 border-t border-gray-200 flex flex-wrap gap-x-4 gap-y-1 text-gray-600">
                          {fees.map(f => (
                            <span key={f.label}>{f.label} <span className="font-medium text-gray-800">{formatCurrency(f.value)}</span></span>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
                <div className="flex justify-between px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg">
                  <span>合計工時</span>
                  <span>合計 {record.regular_days}天　加班 {record.overtime_hours}h</span>
                </div>
              </div>
            </div>
          )}

          {record.notes && (
            <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">{record.notes}</p>
          )}

          <PayrollStatusActions recordId={id} currentStatus={record.status} />
        </CardContent>
      </Card>
    </div>
  )
}
