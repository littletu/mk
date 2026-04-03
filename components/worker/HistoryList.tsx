'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatDate, formatCurrency } from '@/lib/utils/date'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, X, Check, Lock } from 'lucide-react'

interface Entry {
  id: string
  work_date: string
  project_id: string
  regular_days: number
  overtime_hours: number
  transportation_fee: number
  meal_fee: number
  advance_payment: number
  subsidy: number
  other_fee: number
  work_progress: string | null
  project?: { name: string } | null
}

interface PayrollPeriod {
  period_start: string
  period_end: string
}

interface Props {
  entries: Entry[]
  payrollPeriods: PayrollPeriod[]
}

function isInPayroll(workDate: string, periods: PayrollPeriod[]) {
  return periods.some(p => workDate >= p.period_start && workDate <= p.period_end)
}

interface EditForm {
  regular_days: string
  overtime_hours: string
  transportation_fee: string
  meal_fee: string
  advance_payment: string
  subsidy: string
  other_fee: string
  work_progress: string
}

function entryToForm(entry: Entry): EditForm {
  return {
    regular_days: String(entry.regular_days || ''),
    overtime_hours: String(entry.overtime_hours || ''),
    transportation_fee: String(entry.transportation_fee || ''),
    meal_fee: String(entry.meal_fee || ''),
    advance_payment: String(entry.advance_payment || ''),
    subsidy: String(entry.subsidy || ''),
    other_fee: String(entry.other_fee || ''),
    work_progress: entry.work_progress || '',
  }
}

export function HistoryList({ entries, payrollPeriods }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<EditForm | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function startEdit(entry: Entry) {
    setEditingId(entry.id)
    setForm(entryToForm(entry))
    setDeletingId(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(null)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => prev ? { ...prev, [e.target.name]: e.target.value } : prev)
  }

  async function handleSave(entryId: string) {
    if (!form) return
    setSaving(true)
    const payload = {
      regular_days: parseFloat(form.regular_days) || 0,
      overtime_hours: parseFloat(form.overtime_hours) || 0,
      transportation_fee: parseFloat(form.transportation_fee) || 0,
      meal_fee: parseFloat(form.meal_fee) || 0,
      advance_payment: parseFloat(form.advance_payment) || 0,
      subsidy: parseFloat(form.subsidy) || 0,
      other_fee: parseFloat(form.other_fee) || 0,
      work_progress: form.work_progress || null,
    }
    const { error } = await supabase.from('time_entries').update(payload).eq('id', entryId)
    setSaving(false)
    if (error) { toast.error('更新失敗：' + error.message); return }
    toast.success('工時已更新')
    setEditingId(null)
    setForm(null)
    router.refresh()
  }

  async function handleDelete(entryId: string) {
    setSaving(true)
    const { error, count } = await supabase.from('time_entries').delete({ count: 'exact' }).eq('id', entryId)
    setSaving(false)
    if (error) { toast.error('刪除失敗：' + error.message); return }
    if (count === 0) { toast.error('刪除失敗：沒有權限或記錄不存在'); return }
    toast.success('記錄已刪除')
    setDeletingId(null)
    router.refresh()
  }

  // Group by month
  const grouped: Record<string, Entry[]> = {}
  for (const entry of entries) {
    const month = (entry.work_date as string).slice(0, 7)
    if (!grouped[month]) grouped[month] = []
    grouped[month]!.push(entry)
  }

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([month, monthEntries]) => {
        const totalDays = monthEntries.reduce((s, e) => s + (e.regular_days || 0), 0)
        const totalOvertime = monthEntries.reduce((s, e) => s + (e.overtime_hours || 0), 0)
        const totalFees = monthEntries.reduce((s, e) =>
          s + (e.transportation_fee || 0) + (e.meal_fee || 0) + (e.advance_payment || 0) + (e.subsidy || 0) + (e.other_fee || 0), 0)

        return (
          <div key={month}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-700">{month.replace('-', ' 年 ')} 月</h2>
              <span className="text-xs text-gray-500">共 {totalDays}天 {totalOvertime > 0 ? `加班 ${totalOvertime}h` : ''} ／ 費用 {formatCurrency(totalFees)}</span>
            </div>
            <div className="space-y-2">
              {monthEntries.map((entry) => {
                const locked = isInPayroll(entry.work_date, payrollPeriods)
                const dailyFees = (entry.transportation_fee || 0) + (entry.meal_fee || 0) +
                  (entry.advance_payment || 0) + (entry.subsidy || 0) + (entry.other_fee || 0)
                const isEditing = editingId === entry.id
                const isConfirmingDelete = deletingId === entry.id

                return (
                  <Card key={entry.id} className="border-gray-100">
                    <CardContent className="p-4">
                      {isEditing && form ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center mb-1">
                            <div>
                              <p className="font-medium text-sm text-gray-900">{formatDate(entry.work_date)}</p>
                              <p className="text-xs text-gray-500">{entry.project?.name}</p>
                            </div>
                            <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">工數</Label>
                              <Input name="regular_days" type="number" value={form.regular_days}
                                onChange={handleChange} min="0" step="0.5" inputMode="decimal" className="h-8 text-sm" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">加班時數（h）</Label>
                              <Input name="overtime_hours" type="number" value={form.overtime_hours}
                                onChange={handleChange} min="0" step="0.5" inputMode="decimal" className="h-8 text-sm" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">交通費（NT$）</Label>
                              <Input name="transportation_fee" type="number" value={form.transportation_fee}
                                onChange={handleChange} min="0" step="1" inputMode="numeric" className="h-8 text-sm" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">餐費（NT$）</Label>
                              <Input name="meal_fee" type="number" value={form.meal_fee}
                                onChange={handleChange} min="0" step="1" inputMode="numeric" className="h-8 text-sm" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">代墊費（NT$）</Label>
                              <Input name="advance_payment" type="number" value={form.advance_payment}
                                onChange={handleChange} min="0" step="1" inputMode="numeric" className="h-8 text-sm" />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">補貼（NT$）</Label>
                              <Input name="subsidy" type="number" value={form.subsidy}
                                onChange={handleChange} min="0" step="1" inputMode="numeric" className="h-8 text-sm" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">其他費用（NT$）</Label>
                            <Input name="other_fee" type="number" value={form.other_fee}
                              onChange={handleChange} min="0" step="1" inputMode="numeric" className="h-8 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">施工概況</Label>
                            <Textarea name="work_progress" value={form.work_progress}
                              onChange={handleChange} rows={2} className="text-sm" />
                          </div>
                          <Button size="sm" className="w-full" onClick={() => handleSave(entry.id)} disabled={saving}>
                            <Check className="w-3.5 h-3.5 mr-1.5" />
                            {saving ? '儲存中...' : '儲存'}
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm text-gray-900">{formatDate(entry.work_date)}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{entry.project?.name}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  工作 {entry.regular_days}天
                                  {entry.overtime_hours > 0 && ` ／ 加班 ${entry.overtime_hours}h`}
                                </p>
                                {dailyFees > 0 && (
                                  <p className="text-xs text-gray-500">{formatCurrency(dailyFees)} 費用</p>
                                )}
                              </div>
                              {locked ? (
                                <Lock className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" />
                              ) : (
                                <div className="flex gap-1 shrink-0">
                                  <button
                                    onClick={() => startEdit(entry)}
                                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                    aria-label="編輯"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingId(entry.id)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    aria-label="刪除"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          {entry.work_progress && (
                            <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded p-2 leading-relaxed">
                              {entry.work_progress}
                            </p>
                          )}
                          {isConfirmingDelete && (
                            <div className="mt-3 flex items-center gap-2 bg-red-50 rounded-lg p-2.5">
                              <p className="text-xs text-red-700 flex-1">確定要刪除此筆記錄？</p>
                              <Button size="sm" variant="destructive" className="h-7 text-xs px-2.5"
                                onClick={() => handleDelete(entry.id)} disabled={saving}>
                                {saving ? '刪除中...' : '確認刪除'}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs px-2"
                                onClick={() => setDeletingId(null)} disabled={saving}>
                                取消
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
