'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
  fullName: string
  phone: string
  email: string
  idNumber: string
  birthday: string
  gender: string
  bloodType: string
  address: string
  mobile: string
  emergencyContact: string
  emergencyPhone: string
}

const selectCls = 'w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export function WorkerProfileForm({
  fullName, phone, email, idNumber, birthday, gender,
  bloodType, address, mobile, emergencyContact, emergencyPhone,
}: Props) {
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState({
    full_name: fullName,
    phone,
    id_number: idNumber,
    birthday,
    gender,
    blood_type: bloodType,
    address,
    mobile,
    emergency_contact: emergencyContact,
    emergency_phone: emergencyPhone,
  })
  const [password, setPassword] = useState({ new_password: '', confirm_password: '' })
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setProfile(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!profile.full_name.trim()) { toast.error('請輸入姓名'); return }
    setLoadingProfile(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name,
      phone: profile.phone || null,
      id_number: profile.id_number || null,
      birthday: profile.birthday || null,
      gender: profile.gender || null,
      blood_type: profile.blood_type || null,
      address: profile.address || null,
      mobile: profile.mobile || null,
      emergency_contact: profile.emergency_contact || null,
      emergency_phone: profile.emergency_phone || null,
    }).eq('id', user!.id)

    if (error) { toast.error('更新失敗：' + error.message) }
    else { toast.success('資料已更新'); router.refresh() }
    setLoadingProfile(false)
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.new_password.length < 6) { toast.error('密碼至少需要 6 個字元'); return }
    if (password.new_password !== password.confirm_password) { toast.error('兩次密碼不一致'); return }
    setLoadingPassword(true)

    const { error } = await supabase.auth.updateUser({ password: password.new_password })
    if (error) { toast.error('密碼更新失敗：' + error.message) }
    else {
      toast.success('密碼已更新')
      setPassword({ new_password: '', confirm_password: '' })
    }
    setLoadingPassword(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">基本資料</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label>電子郵件（登入帳號）</Label>
              <Input value={email} disabled className="bg-gray-50 text-gray-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="full_name">姓名 *</Label>
                <Input id="full_name" name="full_name" value={profile.full_name} onChange={handleChange} placeholder="姓名" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="id_number">身分證字號</Label>
                <Input id="id_number" name="id_number" value={profile.id_number} onChange={handleChange} placeholder="A123456789" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="birthday">生日</Label>
                <Input id="birthday" name="birthday" type="date" value={profile.birthday} onChange={handleChange} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="gender">性別</Label>
                <select id="gender" name="gender" value={profile.gender} onChange={handleChange} className={selectCls}>
                  <option value="">請選擇</option>
                  <option value="male">男</option>
                  <option value="female">女</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="blood_type">血型</Label>
                <select id="blood_type" name="blood_type" value={profile.blood_type} onChange={handleChange} className={selectCls}>
                  <option value="">請選擇</option>
                  <option value="A">A 型</option>
                  <option value="B">B 型</option>
                  <option value="O">O 型</option>
                  <option value="AB">AB 型</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mobile">手機</Label>
                <Input id="mobile" name="mobile" type="tel" value={profile.mobile} onChange={handleChange} placeholder="09xxxxxxxx" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">電話</Label>
                <Input id="phone" name="phone" type="tel" value={profile.phone} onChange={handleChange} placeholder="市話" />
              </div>

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="address">地址</Label>
                <Input id="address" name="address" value={profile.address} onChange={handleChange} placeholder="戶籍地址" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emergency_contact">緊急聯絡人</Label>
                <Input id="emergency_contact" name="emergency_contact" value={profile.emergency_contact} onChange={handleChange} placeholder="姓名" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emergency_phone">緊急聯絡人電話</Label>
                <Input id="emergency_phone" name="emergency_phone" type="tel" value={profile.emergency_phone} onChange={handleChange} placeholder="電話" />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loadingProfile}>
              {loadingProfile ? '儲存中...' : '儲存基本資料'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">修改密碼</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="new_password">新密碼</Label>
              <Input
                id="new_password"
                type="password"
                value={password.new_password}
                onChange={e => setPassword(p => ({ ...p, new_password: e.target.value }))}
                placeholder="至少 6 個字元"
                minLength={6}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm_password">確認新密碼</Label>
              <Input
                id="confirm_password"
                type="password"
                value={password.confirm_password}
                onChange={e => setPassword(p => ({ ...p, confirm_password: e.target.value }))}
                placeholder="再次輸入新密碼"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loadingPassword}>
              {loadingPassword ? '更新中...' : '更新密碼'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
