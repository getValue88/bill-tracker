import React from 'react'
import { prisma } from '../lib/prisma'
import { format, startOfMonth, endOfMonth, parse } from 'date-fns'
import EditableAmount from '../components/EditableAmount'
import PayStatusButtons from '../components/PayStatusButtons'
import BillActions from '../components/BillActions'
import BillsSubnav from '../components/BillsSubnav'

async function getBills() {
  const bills = await prisma.bill.findMany({
    orderBy: {
      dueDate: 'asc',
    },
  })
  return bills
}

async function fetchMonthlyTotals() {
  const bills = await prisma.bill.findMany({ select: { amount: true, createdAt: true } })
  const totals: Record<string, number> = {}
  bills.forEach(b => {
    const key = format(b.createdAt, 'yyyy-MM')
    totals[key] = (totals[key] || 0) + b.amount
  })
  const labels = Object.keys(totals).sort()
  const data = labels.map(k => totals[k])
  return { labels, data }
}

async function fetchMonthSummary() {
  const now = new Date()
  const from = startOfMonth(now)
  const to = endOfMonth(now)

  const [total, paid] = await Promise.all([
    prisma.bill.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: from, lte: to } },
    }),
    prisma.bill.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: from, lte: to }, isPaid: true },
    }),
  ])

  const totalAmt = total._sum.amount ?? 0
  const paidAmt = paid._sum.amount ?? 0
  return { total: totalAmt, paid: paidAmt }
}

export default async function Home({ searchParams }: { searchParams?: Record<string, string | string[]> }) {
  const search = (searchParams?.search ?? '') as string
  const month = (searchParams?.month ?? '') as string // format YYYY-MM
  const status = (searchParams?.status ?? '') as string

  const filters: any = {}
  if (search) {
    filters.name = { contains: search }
  }
  if (month) {
    try {
      const dt = parse(month, 'yyyy-MM', new Date())
      filters.createdAt = { gte: startOfMonth(dt), lte: endOfMonth(dt) }
    } catch {}
  }
  if (status === 'paid') filters.isPaid = true
  if (status === 'unpaid') filters.isPaid = false

  async function getBillsFiltered() {
    const bills = await prisma.bill.findMany({ where: filters, orderBy: { dueDate: 'asc' } })
    return bills
  }

  const [bills, chart, monthSummary] = await Promise.all([
    getBillsFiltered(),
    fetchMonthlyTotals(),
    fetchMonthSummary(),
  ])
  const nowKey = format(new Date(), 'yyyy-MM')
  const currentTotal = chart.data[chart.labels.indexOf(nowKey)] ?? 0

  return (
    <div>
      <BillsSubnav
        defaultTab={(search || month || status) ? 'search' : 'add'}
        search={search}
        month={month}
        status={status}
        monthTotal={monthSummary.total}
        monthPaid={monthSummary.paid}
      />
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg dark:ring-gray-700">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Amount
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Created
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Due Date
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Status
                    </th>
                    <th scope="col" className="py-3.5 pl-3 pr-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 sm:pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {bills.map((bill) => (
                    <tr key={bill.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-6">
                        {bill.paymentLink ? (
                          <a
                            href={bill.paymentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                          >
                            {bill.name}
                          </a>
                        ) : (
                          <span className="text-gray-900 dark:text-gray-100">{bill.name}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <EditableAmount id={bill.id} amount={bill.amount} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {format(bill.createdAt,'MMM d, yyyy')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {bill.dueDate ? format(bill.dueDate, 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {/* @ts-ignore until prisma types updated */}
                        <PayStatusButtons id={bill.id} isPaid={bill.isPaid} paymentLink={bill.paymentLink} />
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-sm sm:pr-6">
                        <BillActions id={bill.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}