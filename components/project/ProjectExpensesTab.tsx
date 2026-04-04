'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExpenseForm } from '@/components/forms/ExpenseForm'
import { formatCurrency } from '@/lib/utils/date'
import { ExpenseRow } from '@/components/forms/ExpenseRow'
import { ShoppingCart, Plus, X } from 'lucide-react'

interface Expense {
  id: string
  date: string
  category: string
  amount: number
  description: string | null
  receipt_url: string | null
  receipt_name: string | null
}

interface Props {
  projectId: string
  expenses: Expense[]
  totalExpenses: number
  categories?: Array<{ id: string; name: string }>
}

export function ProjectExpensesTab({ projectId, expenses, totalExpenses, categories }: Props) {
  const [showForm, setShowForm] = useState(false)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          工程開銷（{expenses.length} 筆）
          {totalExpenses > 0 && (
            <span className="text-sm font-normal text-gray-500">
              合計 {formatCurrency(totalExpenses)}
            </span>
          )}
          <button
            onClick={() => setShowForm(v => !v)}
            className="ml-auto flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 border border-orange-200 hover:border-orange-300 px-2.5 py-1 rounded-lg transition-colors"
          >
            {showForm ? <><X className="w-3 h-3" /> 取消</> : <><Plus className="w-3 h-3" /> 新增開銷</>}
          </button>
        </CardTitle>
      </CardHeader>

      {showForm && (
        <div className="px-5 pb-4 border-b border-gray-100">
          <ExpenseForm
            projects={[{ id: projectId, name: '' }]}
            categories={categories}
            defaultProjectId={projectId}
            onSaved={() => setShowForm(false)}
          />
        </div>
      )}

      <CardContent className="p-0">
        {expenses.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">此工程尚無開銷記錄</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {expenses.map(e => (
              <ExpenseRow key={e.id} expense={e} categories={categories ?? []} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
