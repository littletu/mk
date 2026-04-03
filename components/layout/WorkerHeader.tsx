'use client'

import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function WorkerHeader({ fullName }: { fullName: string }) {
  const supabase = createClient()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="font-bold text-sm">妙根塗裝</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-300">{fullName}</span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          登出
        </button>
      </div>
    </header>
  )
}
