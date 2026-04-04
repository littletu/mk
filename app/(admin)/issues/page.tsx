import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquareWarning, CheckCircle2, Clock } from 'lucide-react'
import { IssueStatusToggle } from '@/components/forms/IssueStatusToggle'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default async function IssuesPage() {
  const supabase = await createClient()

  const { data: issues } = await supabase
    .from('issues')
    .select('*, worker:workers(profile:profiles(full_name))')
    .order('created_at', { ascending: false })

  const openIssues = (issues ?? []).filter((i: any) => i.status === 'open')
  const resolvedIssues = (issues ?? []).filter((i: any) => i.status === 'resolved')

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">問題管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            待處理 {openIssues.length} 件・已解決 {resolvedIssues.length} 件
          </p>
        </div>
      </div>

      {/* 待處理 */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-500" />
            待處理
            {openIssues.length > 0 && (
              <span className="text-xs font-normal bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                {openIssues.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {openIssues.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">目前沒有待處理的問題 🎉</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {openIssues.map((issue: any) => (
                <IssueRow key={issue.id} issue={issue} formatDate={formatDate} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 已解決 */}
      {resolvedIssues.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-500">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              已解決
              <span className="text-xs font-normal bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                {resolvedIssues.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {resolvedIssues.map((issue: any) => (
                <IssueRow key={issue.id} issue={issue} formatDate={formatDate} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function IssueRow({ issue, formatDate }: { issue: any; formatDate: (s: string) => string }) {
  const workerName = issue.worker?.profile?.full_name ?? '—'
  const resolved = issue.status === 'resolved'

  return (
    <div className={`px-5 py-4 flex items-start gap-4 ${resolved ? 'opacity-60' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {workerName}
          </span>
          <span className="text-xs text-gray-400">{formatDate(issue.created_at)}</span>
        </div>
        <p className="text-sm font-semibold text-gray-900">{issue.title}</p>
        {issue.description && (
          <p className="text-xs text-gray-500 mt-1 whitespace-pre-line leading-relaxed">
            {issue.description}
          </p>
        )}
        {resolved && issue.resolved_at && (
          <p className="text-xs text-green-600 mt-1.5">
            已於 {formatDate(issue.resolved_at)} 解決
          </p>
        )}
      </div>
      <div className="shrink-0 pt-0.5">
        <IssueStatusToggle issueId={issue.id} status={issue.status} />
      </div>
    </div>
  )
}
