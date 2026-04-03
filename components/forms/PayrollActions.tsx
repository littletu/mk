'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Calculator } from 'lucide-react'
import { calculatePayroll } from '@/lib/utils/payroll'

interface WorkerSummary {
  id: string
  daily_rate: number
  overtime_rate: number
  profile_id?: string
  bank_account?: string | null
  notes?: string | null
  is_active?: boolean
}

interface Props {
  periodStart: string
  periodEnd: string
  workers: WorkerSummary[]
}

export function PayrollActions({ periodStart, periodEnd, workers }: Props) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleCalculate() {
    setShowConfirm(false)
    setLoading(true)

    let count = 0
    let errorMsg = ''

    for (const worker of workers) {
      const { data: entries, error: fetchError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('worker_id', worker.id)
        .gte('work_date', periodStart)
        .lte('work_date', periodEnd)

      if (fetchError) { errorMsg = fetchError.message; continue }
      if (!entries?.length) continue

      const payrollData = calculatePayroll(entries as any, worker as any, periodStart, periodEnd)

      const { error: upsertError } = await supabase.from('payroll_records').upsert({
        ...payrollData,
        status: 'draft',
      }, { onConflict: 'worker_id,period_start,period_end' })

      if (upsertError) { errorMsg = upsertError.message; continue }
      count++
    }

    setLoading(false)

    if (errorMsg) {
      toast.error('部分薪資計算失敗：' + errorMsg)
    } else if (count === 0) {
      toast.info('此期間內沒有工時記錄，無法計算薪資')
    } else {
      toast.success(`薪資計算完成，共 ${count} 位師傅`)
    }

    router.refresh()
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600">確定計算 {periodStart} ~ {periodEnd}？</span>
        <Button size="sm" variant="destructive" onClick={handleCalculate} disabled={loading}>
          確定
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowConfirm(false)}>
          取消
        </Button>
      </div>
    )
  }

  return (
    <Button size="sm" variant="outline" onClick={() => setShowConfirm(true)} disabled={loading}>
      <Calculator className="w-3.5 h-3.5 mr-1.5" />
      {loading ? '計算中...' : '計算薪資'}
    </Button>
  )
}
