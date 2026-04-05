import { createClient } from '@/lib/supabase/server'
import { getAuthUser, getWorkerIdByProfileId } from '@/lib/supabase/cached-auth'
import { notFound, redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils/date'
import { TimeEntryEditRow } from '@/components/forms/TimeEntryEditRow'

const statusLabel: Record<string, string> = { draft: '待確認', confirmed: '已確認', paid: '已發薪' }
const statusVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'outline', confirmed: 'secondary', paid: 'default',
}

export default async function WorkerPayrollDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const workerId = await getWorkerIdByProfileId(user.id)
  if (!workerId) redirect('/worker/payroll')

  const supabase = await createClient()

  // Fetch worker details and payroll record in parallel
  const [{ data: worker }, { data: record }] = await Promise.all([
    supabase.from('workers').select('id, daily_rate, overtime_rate').eq('id', workerId).single(),
    supabase.from('payroll_records').select('*').eq('id', id).eq('worker_id', workerId).single(),
  ])

  if (!worker) redirect('/worker/payroll')
  if (!record) notFound()

  const [{ data: entries }, { data: projects }] = await Promise.all([
    supabase
      .from('time_entries')
      .select('*, project:projects(name)')
      .eq('worker_id', worker.id)
      .gte('work_date', record.period_start)
      .lte('work_date', record.period_end)
      .order('work_date', { ascending: true }),
    supabase.from('projects').select('id, name').eq('status', 'active').order('name'),
  ])

  // Only draft payrolls allow editing
  const canEdit = record.status === 'draft'

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Link href="/worker/payroll" className="text-gray-500 hover:text-gray-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">薪資明細</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDate(record.period_start)} ~ {formatDate(record.period_end)}
          </p>
        </div>
        <div className="ml-auto">
          <Badge variant={statusVariant[record.status]}>{statusLabel[record.status]}</Badge>
        </div>
      </div>

      <div className="space-y-4">
        {/* 實領金額 */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <p className="text-sm text-orange-700 mb-1">實領金額</p>
              <p className="text-3xl font-bold text-orange-600">{formatCurrency(record.net_amount)}</p>
            </div>
          </CardContent>
        </Card>

        {/* 費用摘要 */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm text-gray-700">費用摘要</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-1 text-sm">
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-600">日薪薪資</span>
              <div className="text-right">
                <span className="font-medium">{formatCurrency(record.regular_amount)}</span>
                <span className="text-xs text-gray-400 ml-2">{record.regular_days}天 × {formatCurrency(worker.daily_rate)}</span>
              </div>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-50">
              <span className="text-gray-600">加班薪資</span>
              <div className="text-right">
                <span className="font-medium">{formatCurrency(record.overtime_amount)}</span>
                <span className="text-xs text-gray-400 ml-2">{record.overtime_hours}h × {formatCurrency(worker.overtime_rate)}</span>
              </div>
            </div>
            {record.transportation_total > 0 && (
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-600">交通費</span>
                <span className="font-medium">{formatCurrency(record.transportation_total)}</span>
              </div>
            )}
            {record.meal_total > 0 && (
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-600">餐費</span>
                <span className="font-medium">{formatCurrency(record.meal_total)}</span>
              </div>
            )}
            {record.advance_total > 0 && (
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-600">代墊費</span>
                <span className="font-medium">{formatCurrency(record.advance_total)}</span>
              </div>
            )}
            {record.subsidy_total > 0 && (
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-600">補貼</span>
                <span className="font-medium">{formatCurrency(record.subsidy_total)}</span>
              </div>
            )}
            {record.other_total > 0 && (
              <div className="flex justify-between py-1.5 border-b border-gray-50">
                <span className="text-gray-600">其他費用</span>
                <span className="font-medium">{formatCurrency(record.other_total)}</span>
              </div>
            )}
            {record.deduction_amount > 0 && (
              <div className="flex justify-between py-1.5 border-b border-gray-50 text-red-600">
                <span>扣款</span>
                <span className="font-medium">-{formatCurrency(record.deduction_amount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 font-bold text-base">
              <span>實領合計</span>
              <span className="text-orange-600">{formatCurrency(record.net_amount)}</span>
            </div>
          </CardContent>
        </Card>

        {/* 每日工時明細 */}
        {entries && entries.length > 0 && (
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-gray-700">每日工時明細</CardTitle>
                {canEdit && (
                  <span className="text-xs text-orange-500">滑動每筆可編輯</span>
                )}
                {!canEdit && (
                  <span className="text-xs text-gray-400">已{statusLabel[record.status]}，無法修改</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              {entries.map((entry: any) => (
                <TimeEntryEditRow
                  key={entry.id}
                  entry={entry}
                  projects={projects ?? []}
                  canEdit={canEdit}
                />
              ))}
              <div className="flex justify-between px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg">
                <span>合計工時</span>
                <span>合計 {record.regular_days}天　加班 {record.overtime_hours}h</span>
              </div>
            </CardContent>
          </Card>
        )}

        {record.notes && (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">{record.notes}</p>
        )}
      </div>
    </div>
  )
}
