import { createClient } from '@/lib/supabase/server'
import { WorkerReceiptForm } from '@/components/forms/WorkerReceiptForm'
import { todayString } from '@/lib/utils/date'

export default async function WorkerReceiptsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: worker } = await supabase
    .from('workers')
    .select('id')
    .eq('profile_id', user!.id)
    .single()

  if (!worker) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>找不到師傅資料，請聯絡管理者。</p>
      </div>
    )
  }

  const [{ data: projects }, { data: receipts }] = await Promise.all([
    supabase.from('projects').select('id, name').eq('status', 'active').order('name'),
    supabase.from('worker_receipts')
      .select('*, project:projects(name)')
      .eq('worker_id', worker.id)
      .order('receipt_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">發票上傳</h1>
        <p className="text-sm text-gray-500 mt-0.5">上傳工程相關發票與收據</p>
      </div>
      <WorkerReceiptForm
        workerId={worker.id}
        workerProfileId={user!.id}
        projects={projects ?? []}
        receipts={receipts ?? []}
        today={todayString()}
      />
    </div>
  )
}
