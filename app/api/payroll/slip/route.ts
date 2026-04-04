import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function fmt(n: number) {
  return 'NT$ ' + Math.round(n).toLocaleString('zh-TW')
}

function row(label: string, value: string, sub?: string, bold = false, color = '') {
  return `
    <div class="row${bold ? ' bold' : ''}${color ? ' ' + color : ''}">
      <span class="label">${label}</span>
      <div class="value-wrap">
        <span class="value">${value}</span>
        ${sub ? `<span class="sub">${sub}</span>` : ''}
      </div>
    </div>`
}

const statusLabel: Record<string, string> = { draft: '草稿', confirmed: '已確認', paid: '已發薪' }
const statusColor: Record<string, string> = {
  draft: 'background:#f3f4f6;color:#6b7280',
  confirmed: 'background:#dbeafe;color:#1d4ed8',
  paid: 'background:#dcfce7;color:#15803d',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return new NextResponse('Missing id', { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: record } = await supabase
    .from('payroll_records')
    .select('*, worker:workers(daily_rate, overtime_rate, profile:profiles(full_name))')
    .eq('id', id)
    .single()

  if (!record) return new NextResponse('Not found', { status: 404 })

  const worker = record.worker as any
  const name = worker?.profile?.full_name ?? '—'
  const period = `${record.period_start.replace(/-/g, '/')} ～ ${record.period_end.replace(/-/g, '/')}`

  const lines: string[] = []
  lines.push(row('日薪薪資', fmt(record.regular_amount), `${record.regular_days}天 × ${fmt(worker?.daily_rate ?? 0)}`))
  if (record.overtime_hours > 0)
    lines.push(row('加班薪資', fmt(record.overtime_amount), `${record.overtime_hours}h × ${fmt(worker?.overtime_rate ?? 0)}`))
  if (record.transportation_total > 0)
    lines.push(row('交通費', fmt(record.transportation_total)))
  if (record.meal_total > 0)
    lines.push(row('餐費', fmt(record.meal_total)))
  if (record.advance_total > 0)
    lines.push(row('代墊費', fmt(record.advance_total)))
  if (record.subsidy_total > 0)
    lines.push(row('補貼', fmt(record.subsidy_total)))
  if (record.other_total > 0)
    lines.push(row('其他費用', fmt(record.other_total)))
  if (record.deduction_amount > 0)
    lines.push(row('扣款', `-${fmt(record.deduction_amount)}`, undefined, false, 'red'))

  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>薪資單 ${name} ${period}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, 'PingFang TC', 'Microsoft JhengHei', sans-serif;
      background: #f5f5f5;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      padding: 40px 16px;
    }
    .card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.08);
      width: 100%;
      max-width: 480px;
      overflow: hidden;
    }
    .card-header {
      padding: 20px 24px 16px;
      border-bottom: 1px solid #f0f0f0;
    }
    .company { font-size: 13px; color: #888; margin-bottom: 4px; }
    .worker-name { font-size: 20px; font-weight: 700; color: #111; }
    .meta { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
    .period { font-size: 13px; color: #555; }
    .badge {
      font-size: 12px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 99px;
    }
    .net-box {
      background: #fff7ed;
      margin: 20px 24px;
      border-radius: 12px;
      padding: 20px;
      text-align: center;
    }
    .net-label { font-size: 13px; color: #c2410c; margin-bottom: 6px; }
    .net-amount { font-size: 36px; font-weight: 800; color: #c2410c; letter-spacing: -1px; }
    .rows { padding: 0 24px 8px; }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      padding: 11px 0;
      border-bottom: 1px solid #f5f5f5;
      font-size: 14px;
    }
    .row:last-child { border-bottom: none; }
    .label { color: #555; }
    .value-wrap { display: flex; align-items: baseline; gap: 8px; }
    .value { font-weight: 500; color: #111; }
    .sub { font-size: 12px; color: #aaa; }
    .row.bold .label,
    .row.bold .value { font-weight: 700; font-size: 15px; color: #111; }
    .row.bold .value { color: #c2410c; }
    .row.red .value { color: #dc2626; }
    .divider { border: none; border-top: 2px solid #f0f0f0; margin: 4px 24px; }
    .notes {
      margin: 0 24px 16px;
      background: #f9fafb;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 13px;
      color: #666;
    }
    .footer {
      padding: 14px 24px;
      border-top: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #bbb;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .card { box-shadow: none; border-radius: 0; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-header">
      <div class="company">妙根塗裝</div>
      <div class="worker-name">${name}</div>
      <div class="meta">
        <span class="period">${period}</span>
        <span class="badge" style="${statusColor[record.status] ?? ''}">${statusLabel[record.status] ?? record.status}</span>
      </div>
    </div>

    <div class="net-box">
      <div class="net-label">實領金額</div>
      <div class="net-amount">${fmt(record.net_amount)}</div>
    </div>

    <div class="rows">
      ${lines.join('')}
    </div>

    <hr class="divider" />

    <div class="rows">
      ${row('實領合計', fmt(record.net_amount), undefined, true)}
    </div>

    ${record.notes ? `<div class="notes">${record.notes}</div>` : ''}

    <div class="footer">
      <span>妙根塗裝管理系統</span>
      <span>${new Date().toLocaleDateString('zh-TW')}</span>
    </div>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
