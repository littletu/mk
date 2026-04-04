'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  periodStart: string
  periodEnd: string
  disabled?: boolean
}

export function PayrollPrintButton({ periodStart, periodEnd, disabled }: Props) {
  function handleOpen() {
    window.open(
      `/api/payroll/print?period_start=${periodStart}&period_end=${periodEnd}`,
      '_blank'
    )
  }

  return (
    <Button size="sm" variant="outline" onClick={handleOpen} disabled={disabled} title="開啟薪資報表">
      <Printer className="w-3.5 h-3.5 mr-1.5" />
      列印
    </Button>
  )
}
