'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Trash2, CheckCircle2, Circle } from 'lucide-react'

interface Props {
  questionId: string
  status: 'open' | 'resolved'
}

export function AdminQuestionActions({ questionId, status }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleToggleResolved() {
    setLoading(true)
    const newStatus = status === 'resolved' ? 'open' : 'resolved'
    const { error } = await supabase
      .from('knowledge_questions')
      .update({ status: newStatus })
      .eq('id', questionId)
    setLoading(false)
    if (error) { toast.error('更新失敗：' + error.message); return }
    toast.success(newStatus === 'resolved' ? '已標記為已解決' : '已重新開放')
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('確定要刪除這個問題？（連同所有回覆）')) return
    setLoading(true)
    const { error } = await supabase.from('knowledge_questions').delete().eq('id', questionId)
    setLoading(false)
    if (error) { toast.error('刪除失敗：' + error.message); return }
    toast.success('問題已刪除')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={handleToggleResolved}
        disabled={loading}
        title={status === 'resolved' ? '重新開放' : '標記已解決'}
        className={`p-1.5 rounded transition-colors disabled:opacity-40 ${
          status === 'resolved'
            ? 'text-green-500 hover:text-gray-400 hover:bg-gray-50'
            : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
        }`}
      >
        {status === 'resolved'
          ? <CheckCircle2 className="w-4 h-4" />
          : <Circle className="w-4 h-4" />
        }
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        title="刪除問題"
        className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}
