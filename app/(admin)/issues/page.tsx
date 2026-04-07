import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, MessageCircle, MapPin, Clock, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { KnowledgeTip, KnowledgeTagGroup, KnowledgeQuestion } from '@/types'
import { KNOWLEDGE_COLOR_CLASSES } from '@/types'
import { AdminKnowledgeActions } from '@/components/knowledge/AdminKnowledgeActions'
import { AdminCommentRow } from '@/components/knowledge/AdminCommentRow'
import { AdminQuestionActions } from '@/components/knowledge/AdminQuestionActions'
import { AdminReplyRow } from '@/components/knowledge/AdminReplyRow'

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const statusBadge: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}
const statusLabel: Record<string, string> = {
  pending:  '待審核',
  approved: '已通過',
  rejected: '已駁回',
}

function TipRow({ tip, categories, tagGroups }: { tip: KnowledgeTip; categories: any[]; tagGroups: KnowledgeTagGroup[] }) {
  const authorName = (tip as any).worker?.profile?.full_name ?? '—'
  const categoryLabel = tip.knowledge_category?.name ?? tip.category
  const categoryColor = KNOWLEDGE_COLOR_CLASSES[tip.knowledge_category?.color ?? ''] ?? 'bg-gray-100 text-gray-600'
  const comments = (tip as any).knowledge_comments ?? []

  return (
    <div>
      <div className="px-5 py-4 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', categoryColor)}>
              {categoryLabel}
            </span>
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', statusBadge[tip.status] ?? 'bg-gray-100 text-gray-600')}>
              {statusLabel[tip.status] ?? tip.status}
            </span>
            {(tip as any).project && (
              <span className="flex items-center gap-0.5 text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                <MapPin className="w-2.5 h-2.5" />
                {(tip as any).project.name}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900">{tip.title}</p>
          {tip.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {tip.tags.map((tag: string) => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{tag}</span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1 leading-relaxed whitespace-pre-line">{tip.content}</p>
          {tip.reason && (
            <p className="text-xs text-amber-700 mt-1.5 bg-amber-50 rounded px-2 py-1 leading-relaxed">💡 {tip.reason}</p>
          )}
          {tip.caution && (
            <p className="text-xs text-red-700 mt-1 bg-red-50 rounded px-2 py-1 leading-relaxed">⚠️ {tip.caution}</p>
          )}
          {tip.numeric_detail && (
            <p className="text-xs text-blue-700 mt-1 bg-blue-50 rounded px-2 py-1 leading-relaxed">📐 {tip.numeric_detail}</p>
          )}
          {tip.product_brand && (
            <p className="text-xs text-gray-600 mt-1 bg-gray-100 rounded px-2 py-1">🏷️ {tip.product_brand}</p>
          )}
          {tip.image_url && (
            <a href={tip.image_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={tip.image_url} alt="附圖" className="h-32 w-auto rounded-lg border border-gray-200 object-cover" />
            </a>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400">✍️ {authorName}</span>
            <span className="text-xs text-gray-400">{formatDate(tip.created_at)}</span>
            {comments.length > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-gray-400">
                <MessageCircle className="w-3 h-3" />
                {comments.length}
              </span>
            )}
          </div>
        </div>
        <AdminKnowledgeActions tip={tip} categories={categories} tagGroups={tagGroups} />
      </div>
      {comments.length > 0 && (
        <div className="border-t border-gray-50 bg-gray-50/50 divide-y divide-gray-100">
          {comments.map((c: any) => (
            <AdminCommentRow key={c.id} comment={c} />
          ))}
        </div>
      )}
    </div>
  )
}

function QuestionRow({ question }: { question: KnowledgeQuestion }) {
  const authorName = question.worker?.profile?.full_name ?? '—'
  const replies = (question as any).knowledge_question_replies ?? []
  const catColor = (question.knowledge_category as any)?.color ?? 'gray'
  const catColorMap: Record<string, string> = {
    red: 'bg-red-100 text-red-700', orange: 'bg-orange-100 text-orange-700',
    yellow: 'bg-yellow-100 text-yellow-700', green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700', purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-600',
  }
  const catCls = catColorMap[catColor] ?? 'bg-gray-100 text-gray-600'

  return (
    <div>
      <div className="px-5 py-4 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {question.knowledge_category && (
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', catCls)}>
                {question.knowledge_category.name}
              </span>
            )}
            <span className={cn(
              'text-[10px] font-semibold px-2 py-0.5 rounded-full',
              question.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            )}>
              {question.status === 'resolved' ? '✓ 已解決' : '討論中'}
            </span>
            {question.project && (
              <span className="flex items-center gap-0.5 text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                <MapPin className="w-2.5 h-2.5" />
                {question.project.name}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900">{question.title}</p>
          {question.content && (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed whitespace-pre-line">{question.content}</p>
          )}
          {question.image_url && (
            <a href={question.image_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={question.image_url} alt="問題圖片" className="h-32 w-auto rounded-lg border border-gray-200 object-cover" />
            </a>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-400">✍️ {authorName}</span>
            <span className="text-xs text-gray-400">{formatDate(question.created_at)}</span>
            {replies.length > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-gray-400">
                <MessageCircle className="w-3 h-3" />
                {replies.length} 則回覆
              </span>
            )}
          </div>
        </div>
        <AdminQuestionActions questionId={question.id} status={question.status} />
      </div>
      {replies.length > 0 && (
        <div className="border-t border-gray-50 bg-gray-50/50 divide-y divide-gray-100">
          {replies.map((r: any) => (
            <AdminReplyRow key={r.id} reply={r} />
          ))}
        </div>
      )}
    </div>
  )
}

export default async function AdminKnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = 'tips' } = await searchParams
  const supabase = await createClient()

  const [{ data: tips }, { data: knowledgeCategories }, { data: rawTagGroups }, { data: questions }] = await Promise.all([
    supabase
      .from('knowledge_tips')
      .select(`*, worker:workers(profile:profiles(full_name)), project:projects(name), knowledge_category:knowledge_categories(id, name, color), knowledge_comments(id, content, created_at, worker:workers(profile:profiles(full_name)))`)
      .order('created_at', { ascending: false }),
    supabase.from('knowledge_categories').select('id, name, color, points, sort_order').order('sort_order'),
    supabase.from('knowledge_tag_groups').select('id, label, sort_order, knowledge_tags(id, label, sort_order)').order('sort_order'),
    supabase
      .from('knowledge_questions')
      .select(`*, worker:workers(profile:profiles(full_name)), project:projects(name), knowledge_category:knowledge_categories(id, name, color), knowledge_question_replies(id, content, image_url, created_at, worker:workers(profile:profiles(full_name)))`)
      .order('created_at', { ascending: false }),
  ])

  const tagGroups: KnowledgeTagGroup[] = (rawTagGroups ?? []).map(g => ({
    id: g.id, label: g.label, sort_order: g.sort_order,
    tags: ((g as any).knowledge_tags ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order),
  }))

  const allTips = (tips ?? []) as KnowledgeTip[]
  const pending  = allTips.filter(t => t.status === 'pending')
  const rest     = allTips.filter(t => t.status !== 'pending')
  const allQuestions = (questions ?? []) as KnowledgeQuestion[]
  const openQ    = allQuestions.filter(q => q.status === 'open')
  const resolvedQ = allQuestions.filter(q => q.status === 'resolved')

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-orange-500" />
            妙根老塞管理
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
        <a
          href="/issues?tab=tips"
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab !== 'ask'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          老塞（{allTips.length}）
        </a>
        <a
          href="/issues?tab=ask"
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'ask'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          問問老塞（{allQuestions.length}）
        </a>
      </div>

      {tab !== 'ask' ? (
        // ── 老塞 Tab ──────────────────────────────────
        <>
          <p className="text-sm text-gray-500 mb-4">
            已通過 {allTips.filter(t => t.status === 'approved').length} 則・待審核 {pending.length} 則・{allTips.reduce((a, t) => a + ((t as any).knowledge_comments?.length ?? 0), 0)} 則留言
          </p>
          {pending.length > 0 && (
            <Card className="mb-6 border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-yellow-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  待審核（{pending.length}）
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-yellow-50">
                  {pending.map(tip => <TipRow key={tip.id} tip={tip} categories={knowledgeCategories ?? []} tagGroups={tagGroups} />)}
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-gray-700">所有老塞</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {rest.length === 0
                ? <p className="text-center text-gray-400 py-12 text-sm">師傅們還沒有分享老塞 🤫</p>
                : <div className="divide-y divide-gray-50">{rest.map(tip => <TipRow key={tip.id} tip={tip} categories={knowledgeCategories ?? []} tagGroups={tagGroups} />)}</div>
              }
            </CardContent>
          </Card>
        </>
      ) : (
        // ── 問問老塞 Tab ──────────────────────────────
        <>
          <p className="text-sm text-gray-500 mb-4">
            討論中 {openQ.length} 則・已解決 {resolvedQ.length} 則・{allQuestions.reduce((a, q) => a + ((q as any).knowledge_question_replies?.length ?? 0), 0)} 則回覆
          </p>

          {openQ.length > 0 && (
            <Card className="mb-6 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-blue-700 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  討論中（{openQ.length}）
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-blue-50">
                  {openQ.map(q => <QuestionRow key={q.id} question={q} />)}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-gray-700">已解決（{resolvedQ.length}）</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {resolvedQ.length === 0
                ? <p className="text-center text-gray-400 py-12 text-sm">還沒有已解決的問題</p>
                : <div className="divide-y divide-gray-50">{resolvedQ.map(q => <QuestionRow key={q.id} question={q} />)}</div>
              }
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
