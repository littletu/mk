'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Settings, MessageCircle } from 'lucide-react'

interface Props {
  commentPoints: number
}

export function KnowledgeSettingsManager({ commentPoints: init }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [commentPoints, setCommentPoints] = useState(String(init))
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const val = parseInt(commentPoints, 10)
    if (isNaN(val) || val < 0) { toast.error('請輸入有效的積分數字'); return }
    setSaving(true)
    const { error } = await supabase
      .from('knowledge_settings')
      .update({ comment_points: val })
      .eq('id', 1)
    setSaving(false)
    if (error) { toast.error('儲存失敗：' + error.message); return }
    toast.success('已更新留言積分設定')
    router.refresh()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-500" />
          積分設定
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <MessageCircle className="w-4 h-4 text-gray-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">每則留言得分</p>
            <p className="text-xs text-gray-400 mt-0.5">師傅在老塞下留言可獲得的積分</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              value={commentPoints}
              onChange={e => setCommentPoints(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
              className="w-20 h-8 text-sm text-center"
            />
            <span className="text-sm text-gray-500 shrink-0">分</span>
            <Button size="sm" onClick={handleSave} disabled={saving} className="h-8">
              {saving ? '儲存中...' : '儲存'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
