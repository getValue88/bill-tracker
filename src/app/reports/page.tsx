import React from 'react'
import { prisma } from '../../lib/prisma'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import MonthlyChart from '../../components/MonthlyChart'

async function fetchMonthlyTotals() {
  const bills = await prisma.bill.findMany({
    select: { amount: true, createdAt: true },
  })
  const totals: Record<string, number> = {}
  bills.forEach(b => {
    const key = format(b.createdAt, 'yyyy-MM')
    totals[key] = (totals[key] || 0) + b.amount
  })
  // sort keys ascending
  const labels = Object.keys(totals).sort()
  const data = labels.map(k => totals[k])
  return { labels, data }
}

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const { labels, data } = await fetchMonthlyTotals()
  const nowKey = format(new Date(), 'yyyy-MM')
  const currentTotal = data[labels.indexOf(nowKey)] ?? 0

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Monthly Report</h1>
      <p className="text-gray-700 dark:text-gray-300">
        Total spent this month ({nowKey}): <span className="font-medium">${currentTotal.toFixed(2)}</span>
      </p>
      {labels.length ? (
        <div className="max-w-2xl">
          {/* @ts-ignore type issues until chart deps installed */}
          <MonthlyChart labels={labels} data={data} />
        </div>
      ) : (
        <p className="text-gray-500">No data yet.</p>
      )}
    </div>
  )
} 