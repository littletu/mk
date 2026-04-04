import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, currentYearMonth, formatDate } from '@/lib/utils/date'
import { TrendingUp, TrendingDown, Wallet, Receipt, Clock, CheckCircle } from 'lucide-react'
import MonthSelector from './MonthSelector'
import Link from 'next/link'

interface SearchParams { view?: string; year?: string; month?: string; quarter?: string }

export default async function AccountingPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const { year: curYear, month: curMonth } = currentYearMonth()
  const view = (sp.view ?? 'month') as 'month' | 'quarter' | 'year'
  const year = parseInt(sp.year ?? String(curYear))
  const month = parseInt(sp.month ?? String(curMonth))
  const quarter = parseInt(sp.quarter ?? String(Math.ceil(curMonth / 3)))
  const pad = (n: number) => String(n).padStart(2, '0')

  // 計算日期範圍
  let periodStart: string
  let periodEnd: string
  let periodLabel: string

  if (view === 'year') {
    periodStart = `${year}-01-01`
    periodEnd = `${year}-12-31`
    periodLabel = `${year} 年`
  } else if (view === 'quarter') {
    const qStartMonth = (quarter - 1) * 3 + 1
    const qEndMonth = quarter * 3
    const lastDay = new Date(year, qEndMonth, 0).getDate()
    periodStart = `${year}-${pad(qStartMonth)}-01`
    periodEnd = `${year}-${pad(qEndMonth)}-${pad(lastDay)}`
    periodLabel = `${year} 年 Q${quarter}`
  } else {
    const lastDay = new Date(year, month, 0).getDate()
    periodStart = `${year}-${pad(month)}-01`
    periodEnd = `${year}-${pad(month)}-${pad(lastDay)}`
    periodLabel = `${year} 年 ${month} 月`
  }

  const monthStart = periodStart
  const monthEnd = periodEnd

  const supabase = await createClient()

  const [
    { data: invoicesThisMonth },
    { data: paymentsThisMonth },
    { data: pendingInvoices },
    { data: payrolls },
    { data: expenses },
    { data: workerReceipts },
  ] = await Promise.all([
    // 本月開立的請款單（非取消）
    supabase.from('invoices')
      .select('id, invoice_number, total, status, customer:customers(name)')
      .gte('issue_date', monthStart)
      .lte('issue_date', monthEnd)
      .neq('status', 'cancelled')
      .order('issue_date', { ascending: false }),

    // 本月收到的款項
    supabase.from('invoice_payments')
      .select('amount, payment_date')
      .gte('payment_date', monthStart)
      .lte('payment_date', monthEnd),

    // 待收款（已送出但尚未付款的請款單）
    supabase.from('invoices')
      .select('id, invoice_number, total, issue_date, customer:customers(name)')
      .eq('status', 'sent')
      .order('issue_date', { ascending: true }),

    // 本月薪資（已確認/已付）
    supabase.from('payroll_records')
      .select('net_amount')
      .in('status', ['confirmed', 'paid'])
      .gte('period_start', monthStart)
      .lte('period_end', monthEnd),

    // 本月開銷（工程+公司）
    supabase.from('expenses')
      .select('amount, category, project_id')
      .gte('date', monthStart)
      .lte('date', monthEnd),

    // 本月師傅發票
    supabase.from('worker_receipts')
      .select('amount')
      .gte('receipt_date', monthStart)
      .lte('receipt_date', monthEnd),
  ])

  // 計算各項數字
  const totalInvoiced = (invoicesThisMonth ?? []).reduce((s, inv) => s + (inv.total || 0), 0)
  const totalCollected = (paymentsThisMonth ?? []).reduce((s, p) => s + (p.amount || 0), 0)
  const totalPending = (pendingInvoices ?? []).reduce((s, inv) => s + (inv.total || 0), 0)
  const totalPayroll = (payrolls ?? []).reduce((s, r) => s + (r.net_amount || 0), 0)
  const totalExpenses = (expenses ?? []).reduce((s, e) => s + (e.amount || 0), 0)
  const totalWorkerReceipts = (workerReceipts ?? []).reduce((s, r) => s + (r.amount || 0), 0)
  const totalCost = totalPayroll + totalExpenses + totalWorkerReceipts
  const netProfit = totalCollected - totalCost

  // 工程 vs 公司開銷拆分
  const projectExpenses = (expenses ?? []).filter((e: any) => e.project_id)
  const companyExpenses = (expenses ?? []).filter((e: any) => !e.project_id)
  const totalProjectExpenses = projectExpenses.reduce((s: number, e: any) => s + (e.amount || 0), 0)
  const totalCompanyExpenses = companyExpenses.reduce((s: number, e: any) => s + (e.amount || 0), 0)

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">帳目總覽</h1>
          <p className="text-sm text-gray-500 mt-0.5">{periodLabel}</p>
        </div>
        <MonthSelector
          curYear={curYear}
          curMonth={curMonth}
          activeView={view}
          activeYear={year}
          activeMonth={month}
          activeQuarter={quarter}
        />
      </div>

      {/* 主要數字卡片 */}
      <div className="grid grid-cols-2 gap-3 mb-3 sm:grid-cols-3 lg:grid-cols-6">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <p className="text-xs text-blue-700">期間請款</p>
            </div>
            <p className="text-lg font-bold text-blue-700">{formatCurrency(totalInvoiced)}</p>
            <p className="text-xs text-blue-500 mt-0.5">{(invoicesThisMonth ?? []).length} 筆</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <p className="text-xs text-green-700">期間收款</p>
            </div>
            <p className="text-lg font-bold text-green-700">{formatCurrency(totalCollected)}</p>
            <p className="text-xs text-green-500 mt-0.5">{(paymentsThisMonth ?? []).length} 筆</p>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-yellow-600" />
              <p className="text-xs text-yellow-700">待收款</p>
            </div>
            <p className="text-lg font-bold text-yellow-700">{formatCurrency(totalPending)}</p>
            <p className="text-xs text-yellow-500 mt-0.5">{(pendingInvoices ?? []).length} 筆</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Wallet className="w-3.5 h-3.5 text-red-600" />
              <p className="text-xs text-red-700">期間薪資</p>
            </div>
            <p className="text-lg font-bold text-red-700">{formatCurrency(totalPayroll)}</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingDown className="w-3.5 h-3.5 text-orange-600" />
              <p className="text-xs text-orange-700">開銷＋發票</p>
            </div>
            <p className="text-lg font-bold text-orange-700">{formatCurrency(totalExpenses + totalWorkerReceipts)}</p>
          </CardContent>
        </Card>

        <Card className={netProfit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className={`w-3.5 h-3.5 ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
              <p className={`text-xs ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>收款淨額</p>
            </div>
            <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {formatCurrency(netProfit)}
            </p>
            <p className={`text-xs mt-0.5 ${netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              收款 − 總支出
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
        {/* 本月請款單 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>期間請款單</span>
              <span className="text-sm font-normal text-gray-500">{formatCurrency(totalInvoiced)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!(invoicesThisMonth ?? []).length ? (
              <p className="text-sm text-gray-400 text-center py-6">此期間尚無請款單</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {invoicesThisMonth!.map((inv: any) => (
                  <Link key={inv.id} href={`/invoices/${inv.id}`}>
                    <div className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-sm font-mono font-semibold text-gray-900">{inv.invoice_number}</p>
                        <p className="text-xs text-gray-400">{inv.customer?.name ?? '—'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                          inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {inv.status === 'paid' ? '已收款' : inv.status === 'sent' ? '待收款' : '草稿'}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">{formatCurrency(inv.total)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 待收款項目 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                待收款
              </span>
              <span className="text-sm font-normal text-yellow-600">{formatCurrency(totalPending)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!(pendingInvoices ?? []).length ? (
              <p className="text-sm text-gray-400 text-center py-6">無待收款項目</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {pendingInvoices!.map((inv: any) => (
                  <Link key={inv.id} href={`/invoices/${inv.id}`}>
                    <div className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="text-sm font-mono font-semibold text-gray-900">{inv.invoice_number}</p>
                        <p className="text-xs text-gray-400">
                          {inv.customer?.name ?? '—'} · {formatDate(inv.issue_date)}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-yellow-700">{formatCurrency(inv.total)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 開銷分類 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">期間支出明細</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-600">薪資支出</span>
                <span className="font-semibold text-red-600">{formatCurrency(totalPayroll)}</span>
              </div>
              {totalProjectExpenses > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">工程開銷</span>
                  <span className="font-medium text-orange-600">{formatCurrency(totalProjectExpenses)}</span>
                </div>
              )}
              {totalCompanyExpenses > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600">公司開銷</span>
                  <span className="font-medium text-orange-600">{formatCurrency(totalCompanyExpenses)}</span>
                </div>
              )}
              {totalWorkerReceipts > 0 && (
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" />
                    師傅發票
                  </span>
                  <span className="font-medium text-orange-600">{formatCurrency(totalWorkerReceipts)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-bold">
                <span>總支出</span>
                <span className="text-red-600">{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 本月收款紀錄 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                期間收款
              </span>
              <span className="text-sm font-normal text-green-600">{formatCurrency(totalCollected)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!(paymentsThisMonth ?? []).length ? (
              <p className="text-sm text-gray-400 text-center py-6">此期間尚無收款記錄</p>
            ) : (
              <div className="space-y-2 text-sm">
                {(paymentsThisMonth ?? []).map((p: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">{formatDate(p.payment_date)}</span>
                    <span className="font-semibold text-green-700">{formatCurrency(p.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 font-bold">
                  <span>合計</span>
                  <span className="text-green-600">{formatCurrency(totalCollected)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
