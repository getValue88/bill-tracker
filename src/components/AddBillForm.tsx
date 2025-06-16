'use client'

import React, { useState } from 'react'

export default function AddBillForm({ onAdded }: { onAdded?: () => void }) {
  const [amount, setAmount] = useState('')
  const [name, setName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [paymentLink, setPaymentLink] = useState('')
  const [isRecurrent, setIsRecurrent] = useState(false)
  const [fixedAmount, setFixedAmount] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    setLoading(true)
    const body: any = { amount: amount? parseFloat(amount): 0 }
    if (name) body.name = name
    if (dueDate) body.dueDate = dueDate
    if (paymentLink) body.paymentLink = paymentLink
    if (isRecurrent) {
      body.isRecurrent = true
      body.fixedAmount = fixedAmount
    }
    await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setAmount('')
    setName('')
    setDueDate('')
    setPaymentLink('')
    setIsRecurrent(false)
    setFixedAmount(false)
    if (onAdded) {
      onAdded()
    } else {
      window.location.reload()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-center">
      <input
        id="amount"
        type="number"
        step="0.01"
        min="0"
        placeholder="Amount ($)"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="w-28 sm:w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2 py-1"
      />
      <input
        id="name"
        type="text"
        required
        placeholder="Bill name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-32 sm:w-40 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2 py-1"
      />
      <input
        id="due"
        type="date"
        placeholder="Due date (optional)"
        value={dueDate}
        onChange={e => setDueDate(e.target.value)}
        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2 py-1"
      />
      <input
        id="paymentLink"
        type="url"
        placeholder="Payment link (optional)"
        value={paymentLink}
        onChange={e=>setPaymentLink(e.target.value)}
        className="w-52 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-2 py-1"
      />
      <label className="inline-flex items-center gap-1 text-sm text-gray-800 dark:text-gray-200">
        <input type="checkbox" checked={isRecurrent} onChange={e=>setIsRecurrent(e.target.checked)} />
        Recurrent
      </label>
      {isRecurrent && (
        <label className="inline-flex items-center gap-1 text-sm text-gray-800 dark:text-gray-200">
          <input type="checkbox" checked={fixedAmount} onChange={e=>setFixedAmount(e.target.checked)} />
          Fixed amount
        </label>
      )}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? '...' : 'Add'}
      </button>
    </form>
  )
} 