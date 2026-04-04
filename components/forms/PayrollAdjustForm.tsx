'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Pencil, X, Check } from 'lucide-react'

interface Props {
  recordId: string
  currentDeduction: number
  currentNotes: string | null
  currentNetAmount: number
  disabled?: boolean
}

export function PayrollAdjustForm({ recordId, currentDeduction, currentNotes, currentNetAmount, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const [deduction, setDeduction] = useState(String(currentDeduction || ''))
  const [notes, setNotes] = useState(currentNotes ?? '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSave() {
    setLoading(true)
    const deductionVal = parseFloat(deduction) || 0
    // Recalculate net_amount: current net + old deduction - new deduction
    const newNet = currentNetAmount + (currentDeduction || 0) - deductionVal

    const { error } = await supabase
      .from('payroll_records')
      .update({
        deduction_amount: deductionVal,
        net_amount: newNet,
        notes: notes.trim() || null,
      })
      .eq('id', recordId)

    if (error) { toast.error('儲存失敗：' + error.message); setLoading(false); return }
    toast.success('已更新')
    setOpen(false)
    router.refresh()
    setLoading(false)
  }

  if (disabled) return null

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" />
        調整扣款 / 備註
      </button>
    )
  }

  return (
    <div className="border border-orange-200 rounded-xl p-4 bg-orange-50/40 space-y-3">
      <p className="text-sm font-medium text-gray-700">調整扣款與備註</p>

      <div className="space-y-1.5">
        <Label className="text-xs">扣款金額（NT$）</Label>
        <Input
          type="number"
          min="0"
          step="1"
          value={deduction}
          onChange={e => setDeduction(e.target.value)}
          placeholder="0"
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">備註</Label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="備註說明（可不填）"
          rows={2}
          className="text-sm"
        />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={loading} className="flex-1 h-8">
          <Check className="w-3.5 h-3.5 mr-1" />
          {loading ? '儲存中...' : '儲存'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(false)} disabled={loading} className="h-8">
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
