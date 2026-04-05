'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function AdminKnowledgeActions({ tipId }: { tipId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('確定要刪除這則老塞？此操作無法復原。')) return
    setLoading(true)
    const { error } = await supabase.from('knowledge_tips').delete().eq('id', tipId)
    if (error) {
      toast.error('刪除失敗：' + error.message)
    } else {
      toast.success('已刪除')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
      title="刪除"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
