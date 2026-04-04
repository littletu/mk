'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CheckCircle, Banknote } from 'lucide-react'

interface Props {
  recordId: string
  status: string
}

export function PayrollQuickActions({ recordId, status }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function updateStatus(newStatus: string) {
    setLoading(true)
    const { error } = await supabase
      .from('payroll_records')
      .update({
        status: newStatus,
        confirmed_at: newStatus !== 'draft' ? new Date().toISOString() : null,
      })
      .eq('id', recordId)

    if (error) { toast.error('更新失敗：' + error.message); setLoading(false); return }
    toast.success(newStatus === 'confirmed' ? '薪資已確認' : '已標記發薪')
    router.refresh()
    setLoading(false)
  }

  if (status === 'paid') return null

  return (
    <div className="flex items-center gap-1.5" onClick={e => e.preventDefault()}>
      {status === 'draft' && (
        <button
          onClick={() => updateStatus('confirmed')}
          disabled={loading}
          title="確認薪資"
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
        </button>
      )}
      {status === 'confirmed' && (
        <button
          onClick={() => updateStatus('paid')}
          disabled={loading}
          title="標記已發薪"
          className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
        >
          <Banknote className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
