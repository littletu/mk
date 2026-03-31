import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, History, Wallet } from 'lucide-react'
import { WorkerHeader } from '@/components/layout/WorkerHeader'

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') redirect('/dashboard')

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <WorkerHeader fullName={profile?.full_name ?? ''} />

      {/* Content */}
      <main className="flex-1 px-4 py-4 pb-24 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10">
        {[
          { href: '/worker/work-log', label: '填工時', icon: ClipboardList },
          { href: '/worker/history', label: '歷史紀錄', icon: History },
          { href: '/worker/payroll', label: '薪資', icon: Wallet },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center py-3 gap-1 text-xs text-gray-500 hover:text-orange-500 transition-colors"
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
