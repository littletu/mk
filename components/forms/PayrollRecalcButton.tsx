'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { calculatePayroll } from '@/lib/utils/payroll'

interface Props {
  recordId: string
  workerId: string
  workerDailyRate: number
  workerOvertimeRate: number
  periodStart: string
  periodEnd: string
  currentDeduction: number
}

export function PayrollRecalcButton({
  recordId, workerId, workerDailyRate, workerOvertimeRate,
  periodStart, periodEnd, currentDeduction,
}: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleRecalc() {
    setLoading(true)

    const { data: entries, error: fetchError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('worker_id', workerId)
      .gte('work_date', periodStart)
      .lte('work_date', periodEnd)

    if (fetchError) { toast.error('讀取工時失敗：' + fetchError.message); setLoading(false); return }

    if (!entries?.length) {
      toast.info('此期間沒有工時記錄')
      setLoading(false)
      return
    }

    const payrollData = calculatePayroll(
      entries as any,
      { id: workerId, daily_rate: workerDailyRate, overtime_rate: workerOvertimeRate } as any,
      periodStart,
      periodEnd,
    )

    // Preserve existing deduction
    const newNet = payrollData.net_amount - (currentDeduction || 0)

    const { error } = await supabase
      .from('payroll_records')
      .update({
        ...payrollData,
        deduction_amount: currentDeduction,
        net_amount: newNet,
      })
      .eq('id', recordId)

    if (error) { toast.error('重算失敗：' + error.message); setLoading(false); return }
    toast.success('薪資已重新計算')
    router.refresh()
    setLoading(false)
  }

  return (
    <Button size="sm" variant="outline" onClick={handleRecalc} disabled={loading}>
      <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
      {loading ? '計算中...' : '重新計算'}
    </Button>
  )
}
