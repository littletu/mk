'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Plus, Trash2, GripVertical, Pencil, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
  sort_order: number
}

interface Props {
  title: string
  tableName: 'expense_categories' | 'project_categories' | 'company_expense_categories'
  categories: Category[]
  icon?: React.ReactNode
  scope?: string
}

export function CategoryManager({ title, tableName, categories: init, icon, scope }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [categories, setCategories] = useState(init)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  // Drag state
  const dragIndex = useRef<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  function handleDragStart(idx: number) {
    dragIndex.current = idx
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault()
    setDragOverIndex(idx)
  }

  function handleDragLeave() {
    setDragOverIndex(null)
  }

  async function handleDrop(dropIdx: number) {
    setDragOverIndex(null)
    const fromIdx = dragIndex.current
    if (fromIdx === null || fromIdx === dropIdx) return
    dragIndex.current = null

    const reordered = [...categories]
    const [moved] = reordered.splice(fromIdx, 1)
    reordered.splice(dropIdx, 0, moved)

    // Assign new sort_order
    const updated = reordered.map((c, i) => ({ ...c, sort_order: i + 1 }))
    setCategories(updated)

    // Batch update in DB
    const updates = updated.map(c =>
      supabase.from(tableName).update({ sort_order: c.sort_order }).eq('id', c.id)
    )
    const results = await Promise.all(updates)
    const failed = results.find(r => r.error)
    if (failed?.error) {
      toast.error('排序更新失敗：' + failed.error.message)
    } else {
      router.refresh()
    }
  }

  function handleDragEnd() {
    dragIndex.current = null
    setDragOverIndex(null)
  }

  async function handleAdd() {
    if (!newName.trim()) return
    const maxOrder = categories.reduce((m, c) => Math.max(m, c.sort_order), 0)
    const { data, error } = await supabase
      .from(tableName)
      .insert({ name: newName.trim(), sort_order: maxOrder + 1, ...(scope ? { scope } : {}) })
      .select()
      .single()
    if (error) { toast.error('新增失敗：' + error.message); return }
    setCategories(prev => [...prev, data])
    setNewName('')
    setAdding(false)
    toast.success('已新增')
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('確定要刪除這個分類？')) return
    const { error } = await supabase.from(tableName).delete().eq('id', id)
    if (error) { toast.error('刪除失敗：' + error.message); return }
    setCategories(prev => prev.filter(c => c.id !== id))
    toast.success('已刪除')
    router.refresh()
  }

  async function handleEdit(id: string) {
    if (!editName.trim()) return
    const { error } = await supabase.from(tableName).update({ name: editName.trim() }).eq('id', id)
    if (error) { toast.error('更新失敗：' + error.message); return }
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: editName.trim() } : c))
    setEditingId(null)
    toast.success('已更新')
    router.refresh()
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {icon}
          {title}
          <span className="text-xs font-normal text-gray-400 ml-1">{categories.length} 項</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {categories.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">尚無分類，請新增</p>
        )}

        {categories.map((cat, idx) => (
          <div
            key={cat.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={e => handleDragOver(e, idx)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(idx)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-2 p-2.5 rounded-lg group transition-colors ${
              dragOverIndex === idx
                ? 'bg-orange-50 border-2 border-orange-300 border-dashed'
                : 'bg-gray-50 border-2 border-transparent'
            }`}
          >
            <GripVertical className="w-4 h-4 text-gray-300 shrink-0 cursor-grab active:cursor-grabbing" />
            {editingId === cat.id ? (
              <>
                <Input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleEdit(cat.id); if (e.key === 'Escape') setEditingId(null) }}
                  className="h-7 text-sm flex-1"
                  autoFocus
                />
                <button onClick={() => handleEdit(cat.id)} className="text-green-500 hover:text-green-700 p-1">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-800 flex-1">{cat.name}</span>
                <button
                  onClick={() => { setEditingId(cat.id); setEditName(cat.name) }}
                  className="text-gray-300 hover:text-gray-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        ))}

        {adding ? (
          <div className="flex items-center gap-2 pt-1">
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
              placeholder="輸入分類名稱"
              className="h-8 text-sm"
              autoFocus
            />
            <Button size="sm" onClick={handleAdd} className="h-8 shrink-0">新增</Button>
            <Button size="sm" variant="outline" onClick={() => { setAdding(false); setNewName('') }} className="h-8 shrink-0">取消</Button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 w-full py-2 text-sm text-orange-600 hover:text-orange-700 border border-dashed border-orange-200 hover:border-orange-300 rounded-lg justify-center transition-colors mt-1"
          >
            <Plus className="w-4 h-4" />
            新增分類
          </button>
        )}
      </CardContent>
    </Card>
  )
}
