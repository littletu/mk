'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CheckCircle2, RotateCcw } from 'lucide-react'

interface Props {
  issueId: string
  status: string
}

export function IssueStatusToggle({ issueId, status }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const resolved = status === 'resolved'

  async function handleToggle() {
    setLoading(true)
    const newStatus = resolved ? 'open' : 'resolved'
    const { error } = await supabase
      .from('issues')
      .update({
        status: newStatus,
        resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null,
      })
      .eq('id', issueId)

    if (error) { toast.error('更新失敗：' + error.message); setLoading(false); return }
    toast.success(newStatus === 'resolved' ? '已標記為解決' : '已重新開啟')
    router.refresh()
    setLoading(false)
  }

  if (resolved) {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        title="重新開啟"
        className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        已解決
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title="標記為已解決"
      className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-green-50 hover:text-green-600 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      <CheckCircle2 className="w-3.5 h-3.5" />
      標記解決
    </button>
  )
}
