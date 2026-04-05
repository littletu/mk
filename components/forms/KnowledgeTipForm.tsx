'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KnowledgeCategory } from '@/types'
import { KNOWLEDGE_CATEGORY_LABELS } from '@/types'

interface Project {
  id: string
  name: string
}

interface Props {
  workerId: string
  projects: Project[]
}

const CATEGORIES = Object.entries(KNOWLEDGE_CATEGORY_LABELS) as [KnowledgeCategory, string][]

export function KnowledgeTipForm({ workerId, projects }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'general' as KnowledgeCategory,
    project_id: '',
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('請填寫標題'); return }
    if (!form.content.trim()) { toast.error('請填寫內容'); return }
    if (!workerId) { toast.error('找不到師傅資料'); return }

    setLoading(true)
    const { error } = await supabase.from('knowledge_tips').insert({
      worker_id: workerId,
      project_id: form.project_id || null,
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
    })

    if (error) { toast.error('送出失敗：' + error.message); setLoading(false); return }

    toast.success('老塞分享成功！感謝師傅的智慧傳承 🎉')
    setForm({ title: '', content: '', category: 'general', project_id: '' })
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <Card className="border-orange-200 bg-orange-50/40">
      <CardContent className="pt-0 pb-0">
        {/* Toggle header */}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between py-4 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-orange-700">
            <Lightbulb className="w-4 h-4" />
            分享一個老塞
          </span>
          {open
            ? <ChevronUp className="w-4 h-4 text-orange-400" />
            : <ChevronDown className="w-4 h-4 text-orange-400" />
          }
        </button>

        {open && (
          <form onSubmit={handleSubmit} className="space-y-3 pb-4">
            {/* 標題 */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">標題 *</label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="例：外牆噴塗前一定要做的事"
                className="text-sm bg-white"
              />
            </div>

            {/* 內容 */}
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">分享內容 *</label>
              <Textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="把你的施工經驗或訣竅寫下來，讓其他師傅也能學到..."
                rows={4}
                className="text-sm bg-white resize-none"
              />
            </div>

            {/* 分類 + 工程 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">分類</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={cn(
                    'w-full h-8 rounded-lg border border-input bg-white px-2.5 text-sm outline-none',
                    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
                  )}
                >
                  {CATEGORIES.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">相關工程（選填）</label>
                <select
                  name="project_id"
                  value={form.project_id}
                  onChange={handleChange}
                  className={cn(
                    'w-full h-8 rounded-lg border border-input bg-white px-2.5 text-sm outline-none',
                    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                    !form.project_id && 'text-muted-foreground'
                  )}
                >
                  <option value="">不指定</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '送出中...' : '送出老塞'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
