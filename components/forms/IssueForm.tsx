'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'

export function IssueForm({ workerId }: { workerId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { toast.error('請填寫問題標題'); return }
    if (!workerId) { toast.error('找不到師傅資料'); return }
    setLoading(true)

    const { error } = await supabase.from('issues').insert({
      worker_id: workerId,
      title: title.trim(),
      description: description.trim() || null,
    })

    if (error) { toast.error('送出失敗：' + error.message); setLoading(false); return }
    toast.success('問題已送出，感謝回報！')
    setTitle('')
    setDescription('')
    setLoading(false)
    router.refresh()
  }

  return (
    <Card className="border-orange-100">
      <CardContent className="pt-4 pb-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">問題標題 *</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="簡短描述問題，例如：工時無法送出"
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">詳細說明（選填）</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="描述問題發生的情況、步驟或建議..."
              rows={3}
              className="text-sm resize-none"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {loading ? '送出中...' : '送出問題'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
