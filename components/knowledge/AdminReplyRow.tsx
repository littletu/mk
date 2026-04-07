'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface Reply {
  id: string
  content: string
  image_url: string | null
  created_at: string
  worker?: { profile?: { full_name: string } }
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('zh-TW', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function AdminReplyRow({ reply }: { reply: Reply }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('確定要刪除這則回覆？')) return
    setLoading(true)
    const { error } = await supabase.from('knowledge_question_replies').delete().eq('id', reply.id)
    setLoading(false)
    if (error) { toast.error('刪除失敗：' + error.message); return }
    toast.success('回覆已刪除')
    router.refresh()
  }

  return (
    <div className="px-5 py-2.5 flex items-start gap-3 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-gray-700">
            {reply.worker?.profile?.full_name ?? '師傅'}
          </span>
          <span className="text-[10px] text-gray-400" suppressHydrationWarning>
            {formatDate(reply.created_at)}
          </span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">{reply.content}</p>
        {reply.image_url && (
          <a href={reply.image_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={reply.image_url} alt="回覆圖片" className="h-24 w-auto rounded-lg border border-gray-200 object-cover" />
          </a>
        )}
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
          title="刪除回覆"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
