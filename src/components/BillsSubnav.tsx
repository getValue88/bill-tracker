'use client'

import { useState } from 'react'
import AddBillForm from './AddBillForm'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BillsSubnav({
  defaultTab = 'add',
  search,
  month,
  status,
  monthTotal,
  monthPaid,
}: {
  defaultTab?: 'add' | 'search'
  search: string
  month: string
  status: string
  monthTotal: number
  monthPaid: number
}) {
  const [tab, setTab] = useState<'add' | 'search'>(defaultTab)
  const router = useRouter()

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="inline-flex rounded-md shadow-sm overflow-hidden">
          <button
            className={`h-9 px-4 text-sm font-medium focus:outline-none ${
              tab === 'add'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'
            }`}
            onClick={() => setTab('add')}
          >
            Add Bill
          </button>
          <button
            className={`h-9 px-4 text-sm font-medium focus:outline-none ${
              tab === 'search'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'
            }`}
            onClick={() => setTab('search')}
          >
            Search Bills
          </button>
        </div>
        <span className="ml-auto text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          This month: <span className="text-red-400">${monthPaid.toFixed(2)}</span>/<span className="text-green-400">${monthTotal.toFixed(2)}</span>. Remains: <span className="text-red-400">${(monthTotal - monthPaid).toFixed(2)}</span>
        </span>
        <Link href="/reports" title="View reports" className="ml-2 flex items-center text-indigo-500 hover:text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M7 13v5m4-9v9m4-6v6" />
          </svg>
        </Link>
      </div>

      {tab === 'add' ? (
        <AddBillForm onAdded={() => router.refresh()} />
      ) : (
        <form method="get" className="flex flex-wrap gap-2 items-end">
          <input
            id="search"
            name="search"
            defaultValue={search}
            placeholder="Name"
            aria-label="Name"
            className="w-40 h-9 rounded-md border-gray-300 px-3 text-sm"
          />
          <input
            type="month"
            id="month"
            name="month"
            defaultValue={month}
            aria-label="Month"
            className="w-40 h-9 rounded-md border-gray-300 px-3 text-sm"
          />
          <select
            id="status"
            name="status"
            aria-label="Status"
            defaultValue={status}
            className="w-32 h-9 rounded-md border-gray-300 px-3 text-sm bg-white dark:bg-white text-gray-900 dark:text-gray-900"
          >
            <option value="" hidden>Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <button
            type="submit"
            className="h-9 inline-flex items-center justify-center rounded-md bg-indigo-600 text-white px-4 text-sm hover:bg-indigo-700"
          >
            Apply
          </button>
        </form>
      )}
    </div>
  )
} 