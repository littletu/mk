'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Settings, MessageCircle, HelpCircle, Reply } from 'lucide-react'

interface Props {
  commentPoints:  number
  questionPoints: number
  replyPoints:    number
}

export function KnowledgeSettingsManager({ commentPoints: initC, questionPoints: initQ, replyPoints: initR }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [commentPoints,  setCommentPoints]  = useState(String(initC))
  const [questionPoints, setQuestionPoints] = useState(String(initQ))
  const [replyPoints,    setReplyPoints]    = useState(String(initR))
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const c = parseInt(commentPoints,  10)
    const q = parseInt(questionPoints, 10)
    const r = parseInt(replyPoints,    10)
    if ([c, q, r].some(v => isNaN(v) || v < 0)) { toast.error('請輸入有效的積分數字'); return }
    setSaving(true)
    const { error } = await supabase
      .from('knowledge_settings')
      .update({ comment_points: c, question_points: q, reply_points: r })
      .eq('id', 1)
    setSaving(false)
    if (error) { toast.error('儲存失敗：' + error.message); return }
    toast.success('已更新積分設定')
    router.refresh()
  }

  const rows = [
    {
      icon: <MessageCircle className="w-4 h-4 text-gray-400 shrink-0" />,
      label: '老塞留言得分',
      desc: '師傅在老塞下留言可獲得的積分',
      value: commentPoints,
      set: setCommentPoints,
    },
    {
      icon: <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />,
      label: '提問得分',
      desc: '師傅在問問老塞提出問題可獲得的積分',
      value: questionPoints,
      set: setQuestionPoints,
    },
    {
      icon: <Reply className="w-4 h-4 text-green-400 shrink-0" />,
      label: '回答問題得分',
      desc: '師傅回覆問問老塞的問題可獲得的積分',
      value: replyPoints,
      set: setReplyPoints,
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Settings className="w-4 h-4 text-gray-500" />
          積分設定
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map(row => (
          <div key={row.label} className="flex items-center gap-3">
            {row.icon}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700">{row.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{row.desc}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Input
                type="number"
                min={0}
                value={row.value}
                onChange={e => row.set(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                className="w-20 h-8 text-sm text-center"
              />
              <span className="text-sm text-gray-500">分</span>
            </div>
          </div>
        ))}

        <Button onClick={handleSave} disabled={saving} className="w-full mt-2">
          {saving ? '儲存中...' : '儲存積分設定'}
        </Button>
      </CardContent>
    </Card>
  )
}
