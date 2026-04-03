'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

const statusOptions = [
  { value: '', label: '全部' },
  { value: 'active', label: '進行中' },
  { value: 'pending', label: '待開工' },
  { value: 'completed', label: '已完工' },
  { value: 'cancelled', label: '已取消' },
]

interface Props {
  customers: { id: string; name: string }[]
  total: number
  filtered: number
}

export function ProjectFilters({ customers, total, filtered }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const status = searchParams.get('status') ?? ''
  const customerId = searchParams.get('customer_id') ?? ''
  const keyword = searchParams.get('q') ?? ''

  const update = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, router, pathname])

  const clearAll = () => router.push(pathname)

  const hasFilter = status || customerId || keyword

  return (
    <div className="space-y-3 mb-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="搜尋工程名稱或地址..."
          value={keyword}
          onChange={e => update('q', e.target.value)}
          className="pl-9 pr-9"
        />
        {keyword && (
          <button onClick={() => update('q', '')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => update('status', opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              status === opt.value
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Customer filter */}
      {customers.length > 0 && (
        <select
          value={customerId}
          onChange={e => update('customer_id', e.target.value)}
          className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring"
        >
          <option value="">所有客戶</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}

      {/* Result count + clear */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>顯示 {filtered} / {total} 筆工程</span>
        {hasFilter && (
          <button onClick={clearAll} className="flex items-center gap-1 text-orange-500 hover:text-orange-700">
            <X className="w-3 h-3" />清除篩選
          </button>
        )}
      </div>
    </div>
  )
}
