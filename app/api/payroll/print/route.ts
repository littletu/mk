import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function fmt(n: number) {
  return n > 0 ? 'NT$ ' + Math.round(n).toLocaleString('zh-TW') : '—'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period_start = searchParams.get('period_start')
  const period_end = searchParams.get('period_end')

  if (!period_start || !period_end) {
    return new NextResponse('Missing parameters', { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: records } = await supabase
    .from('payroll_records')
    .select('*, worker:workers(daily_rate, overtime_rate, profile:profiles(full_name))')
    .eq('period_start', period_start)
    .eq('period_end', period_end)
    .order('worker_id')

  if (!records?.length) {
    return new NextResponse('No records found', { status: 404 })
  }

  const period = `${period_start.replace(/-/g, '/')} ～ ${period_end.replace(/-/g, '/')}`

  const cards = records.map(r => {
    const name = (r.worker as any)?.profile?.full_name ?? '—'
    const expenses =
      (r.transportation_total ?? 0) + (r.meal_total ?? 0) +
      (r.advance_total ?? 0) + (r.subsidy_total ?? 0) + (r.other_total ?? 0)

    return `
      <div class="card">
        <div class="card-header">${period}</div>
        <table>
          <tr><td class="lbl">姓名</td><td class="val bold">${name}</td></tr>
          <tr><td class="lbl">出工天數</td><td class="val">${r.regular_days} 天</td></tr>
          <tr><td class="lbl">日薪薪資</td><td class="val">${fmt(r.regular_amount)}</td></tr>
          <tr><td class="lbl">加班時數</td><td class="val">${r.overtime_hours > 0 ? r.overtime_hours + ' h' : '—'}</td></tr>
          <tr><td class="lbl">加班薪資</td><td class="val">${fmt(r.overtime_amount)}</td></tr>
          <tr><td class="lbl">費用合計</td><td class="val">${fmt(expenses)}</td></tr>
          ${r.deduction_amount > 0 ? `<tr><td class="lbl">扣款</td><td class="val red">-${fmt(r.deduction_amount)}</td></tr>` : ''}
          <tr class="total-row"><td class="lbl bold">實領金額</td><td class="val bold orange">${fmt(r.net_amount)}</td></tr>
        </table>
      </div>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <title>薪資報表 ${period}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, 'PingFang TC', 'Microsoft JhengHei', sans-serif;
      font-size: 12px;
      background: #fff;
      padding: 20px;
    }
    h1 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
    .subtitle { font-size: 12px; color: #555; margin-bottom: 16px; }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .card {
      border: 1px solid #333;
    }
    .card-header {
      background: #e5e7eb;
      font-weight: 700;
      font-size: 11px;
      padding: 4px 8px;
      border-bottom: 1px solid #333;
    }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 4px 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    tr:last-child td { border-bottom: none; }
    .lbl { color: #333; width: 50%; }
    .val { text-align: right; }
    .bold { font-weight: 700; }
    .orange { color: #c2410c; }
    .red { color: #dc2626; }
    .total-row td { border-top: 2px solid #333; }
    footer {
      margin-top: 20px;
      padding-top: 8px;
      border-top: 1px solid #ccc;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #999;
    }
    @media print {
      @page { margin: 10mm; size: A4; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <h1>妙根塗裝　薪資報表</h1>
  <p class="subtitle">${period}　共 ${records.length} 位師傅</p>
  <div class="grid">
    ${cards}
  </div>
  <footer>
    <span>妙根塗裝管理系統</span>
    <span>產生時間：${new Date().toLocaleString('zh-TW')}</span>
  </footer>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
