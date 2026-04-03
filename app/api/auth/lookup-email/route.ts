import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { mobile } = await request.json()
    if (!mobile) return NextResponse.json({ error: '請輸入手機號碼' }, { status: 400 })

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const raw = String(mobile).replace(/[\s\-]/g, '')
    const candidates = Array.from(new Set([
      raw,
      raw.startsWith('0') ? raw : '0' + raw,
      raw.startsWith('+886') ? raw.replace('+886', '0') : raw,
    ]))

    // Query phone column only (always exists in original schema)
    let profileId: string | null = null

    for (const c of candidates) {
      const { data } = await adminClient
        .from('profiles')
        .select('id')
        .eq('phone', c)
        .limit(1)
        .single()
      if (data?.id) {
        profileId = data.id
        break
      }
    }

    // Also try mobile column if it exists
    if (!profileId) {
      for (const c of candidates) {
        const { data } = await adminClient
          .from('profiles')
          .select('id')
          .eq('mobile', c)
          .limit(1)
          .single()
        if (data?.id) {
          profileId = data.id
          break
        }
      }
    }

    if (!profileId) {
      return NextResponse.json({ error: '查無此號碼對應的帳號' }, { status: 404 })
    }

    const { data: userResp, error: userError } = await adminClient.auth.admin.getUserById(profileId)
    if (userError || !userResp.user?.email) {
      return NextResponse.json({ error: '帳號設定異常，請聯絡管理員' }, { status: 500 })
    }

    return NextResponse.json({ email: userResp.user.email })
  } catch {
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
