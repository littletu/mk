import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, FolderOpen, MapPin, DollarSign } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils/date'
import { ProjectFilters } from '@/components/forms/ProjectFilters'

const statusLabel: Record<string, string> = {
  pending: '待開工', active: '進行中', completed: '已完工', cancelled: '已取消',
}
const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline', active: 'default', completed: 'secondary', cancelled: 'destructive',
}

interface SearchParams {
  status?: string
  customer_id?: string
  q?: string
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const supabase = await createClient()

  const [{ data: allProjects }, { data: customers }] = await Promise.all([
    supabase.from('projects').select('*, customer:customers(name, id)').order('created_at', { ascending: false }),
    supabase.from('customers').select('id, name').order('name'),
  ])

  // Client-side filtering
  let projects = allProjects ?? []

  if (sp.status) {
    projects = projects.filter(p => p.status === sp.status)
  }
  if (sp.customer_id) {
    projects = projects.filter(p => (p.customer as any)?.id === sp.customer_id)
  }
  if (sp.q) {
    const q = sp.q.toLowerCase()
    projects = projects.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.address ?? '').toLowerCase().includes(q)
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">工程管理</h1>
        </div>
        <Link href="/projects/new">
          <Button><Plus className="w-4 h-4 mr-2" />新增工程</Button>
        </Link>
      </div>

      <ProjectFilters
        customers={customers ?? []}
        total={allProjects?.length ?? 0}
        filtered={projects.length}
      />

      {!projects.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-500">
            <FolderOpen className="w-10 h-10 mb-3 opacity-40" />
            <p>{allProjects?.length ? '沒有符合條件的工程' : '尚無工程資料'}</p>
            {!allProjects?.length && (
              <Link href="/projects/new" className="mt-3">
                <Button variant="outline" size="sm">新增第一筆工程</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project: any) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                      <Badge variant={statusVariant[project.status]}>{statusLabel[project.status]}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{project.customer?.name}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
                      {project.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{project.address}
                        </span>
                      )}
                      {project.start_date && (
                        <span>{formatDate(project.start_date)}{project.end_date ? ` ~ ${formatDate(project.end_date)}` : ''}</span>
                      )}
                    </div>
                  </div>
                  {project.contract_amount && (
                    <div className="flex items-center gap-1 text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-full shrink-0">
                      <DollarSign className="w-3.5 h-3.5" />
                      {formatCurrency(project.contract_amount)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
