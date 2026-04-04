import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { IssueForm } from '@/components/forms/IssueForm'
import { MessageSquareWarning, CheckCircle2, Clock } from 'lucide-react'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function WorkerIssuesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: worker } = await supabase
    .from('workers')
    .select('id')
    .eq('profile_id', user!.id)
    .single()

  const { data: issues } = worker
    ? await supabase
        .from('issues')
        .select('*')
        .eq('worker_id', worker.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">回報問題</h1>
        <p className="text-xs text-gray-500 mt-1">有使用問題或建議歡迎回報，管理員會盡快處理</p>
      </div>

      <IssueForm workerId={worker?.id ?? ''} />

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">我的回報記錄</h2>
        {!issues?.length ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10 text-gray-400">
              <MessageSquareWarning className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">尚無回報記錄</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {issues.map((issue: any) => (
              <Card key={issue.id} className="border-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{issue.title}</p>
                      {issue.description && (
                        <p className="text-xs text-gray-500 mt-1 whitespace-pre-line">{issue.description}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">{formatDate(issue.created_at)}</p>
                    </div>
                    <div className="shrink-0">
                      {issue.status === 'resolved' ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          已解決
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                          <Clock className="w-3.5 h-3.5" />
                          處理中
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
