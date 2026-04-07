import { createClient } from '@/lib/supabase/server'
import { getAuthUser, getWorkerIdByProfileId, getWorkerProfile } from '@/lib/supabase/cached-auth'
import { getCachedKnowledgeCategories, getCachedTagGroups, getCachedActiveProjects } from '@/lib/supabase/cached-data'
import { KnowledgeTipForm } from '@/components/forms/KnowledgeTipForm'
import { KnowledgeTipCard } from '@/components/knowledge/KnowledgeTipCard'
import { KnowledgeQuestionForm } from '@/components/forms/KnowledgeQuestionForm'
import { KnowledgeQuestionCard } from '@/components/knowledge/KnowledgeQuestionCard'
import { Lightbulb, Trophy, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import type { KnowledgeTip, KnowledgeQuestion } from '@/types'

export default async function WorkerKnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = 'tips' } = await searchParams

  const user = await getAuthUser()
  if (!user) return null

  const [profileData, workerId] = await Promise.all([
    getWorkerProfile(user.id),
    getWorkerIdByProfileId(user.id),
  ])

  const allowedSections: string[] | null = profileData?.allowed_sections ?? null
  const hasAccess = allowedSections === null || allowedSections.includes('worker-issues')
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400 text-center">
        <Lightbulb className="w-10 h-10 mb-3 opacity-20" />
        <p className="text-sm font-medium text-gray-500">沒有存取權限</p>
        <p className="text-xs mt-1">請聯絡管理員開通妙根老塞功能</p>
      </div>
    )
  }

  const supabase = await createClient()
  const [projects, knowledgeCategories, tagGroups] = await Promise.all([
    getCachedActiveProjects(),
    getCachedKnowledgeCategories(),
    getCachedTagGroups(),
  ])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-orange-500" />
            妙根老塞
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            集結師傅智慧，一起傳承施工好手藝
          </p>
        </div>
        <Link
          href="/worker/leaderboard"
          className="flex items-center gap-1.5 text-xs text-orange-600 font-medium bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full transition-colors"
        >
          <Trophy className="w-3.5 h-3.5" />
          排行榜
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">
        <Link
          href="/worker/issues?tab=tips"
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab !== 'ask'
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          老塞
        </Link>
        <Link
          href="/worker/issues?tab=ask"
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'ask'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          問問老塞
        </Link>
      </div>

      {tab !== 'ask' ? (
        // ── 老塞 Tab ─────────────────────────────────────────
        <>
          {workerId && (
            <div className="mb-5">
              <KnowledgeTipForm
                workerId={workerId}
                projects={projects}
                categories={knowledgeCategories}
                tagGroups={tagGroups}
              />
            </div>
          )}
          <TipsSection workerId={workerId} supabase={supabase} tagGroups={tagGroups} />
        </>
      ) : (
        // ── 問問老塞 Tab ──────────────────────────────────────
        <>
          {workerId && (
            <div className="mb-5">
              <KnowledgeQuestionForm
                workerId={workerId}
                projects={projects}
                categories={knowledgeCategories}
              />
            </div>
          )}
          <QuestionsSection workerId={workerId} supabase={supabase} />
        </>
      )}
    </div>
  )
}

// ── Sub-sections (server components) ──────────────────────

async function TipsSection({
  workerId,
  supabase,
  tagGroups,
}: {
  workerId: string | null
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>
  tagGroups: Awaited<ReturnType<typeof getCachedTagGroups>>
}) {
  const { data: tips } = await supabase
    .from('knowledge_tips')
    .select(`
      id, worker_id, project_id, title, content, reason, caution, numeric_detail, product_brand,
      category, category_id, status, tags, image_url, created_at,
      worker:workers(profile:profiles(full_name)),
      project:projects(name),
      knowledge_category:knowledge_categories(id, name, color),
      knowledge_comments(id)
    `)
    .or(workerId ? `status.eq.approved,worker_id.eq.${workerId}` : 'status.eq.approved')
    .order('created_at', { ascending: false })
    .limit(30)

  if (!tips?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Lightbulb className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-sm font-medium">還沒有老塞</p>
        <p className="text-xs mt-1">成為第一個分享的師傅吧！</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {(tips as unknown as KnowledgeTip[]).map(tip => (
        <KnowledgeTipCard
          key={tip.id}
          tip={tip}
          currentWorkerId={workerId ?? ''}
          tagGroups={tagGroups}
        />
      ))}
    </div>
  )
}

async function QuestionsSection({
  workerId,
  supabase,
}: {
  workerId: string | null
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>
}) {
  const { data: questions } = await supabase
    .from('knowledge_questions')
    .select(`
      id, worker_id, project_id, category_id, title, content, image_url, status, created_at,
      worker:workers(profile:profiles(full_name)),
      project:projects(name),
      knowledge_category:knowledge_categories(id, name, color),
      knowledge_question_replies(id)
    `)
    .order('created_at', { ascending: false })
    .limit(30)

  if (!questions?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <HelpCircle className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-sm font-medium">還沒有問題</p>
        <p className="text-xs mt-1">有疑問就盡管問！</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {(questions as unknown as KnowledgeQuestion[]).map(q => (
        <KnowledgeQuestionCard
          key={q.id}
          question={q}
          currentWorkerId={workerId ?? ''}
        />
      ))}
    </div>
  )
}
