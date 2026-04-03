'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  workerId: string
  workerName: string
}

export function WorkerDeleteButton({ workerId, workerName }: Props) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/workers/${workerId}`, { method: 'DELETE' })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error || '刪除失敗')
      setLoading(false)
      setShowConfirm(false)
      return
    }
    toast.success('師傅已刪除')
    router.push('/workers')
    router.refresh()
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 text-center mb-1">確認刪除師傅</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            確定要刪除 <span className="font-semibold text-gray-800">{workerName}</span> 嗎？<br />
            此操作無法復原，所有工時與薪資記錄也會一併刪除。
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? '刪除中...' : '確認刪除'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Button
      variant="outline"
      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
      onClick={() => setShowConfirm(true)}
    >
      <Trash2 className="w-4 h-4 mr-2" />
      刪除師傅
    </Button>
  )
}
