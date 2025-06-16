'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function EditableAmount({ id, amount }: { id: number; amount: number }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(amount.toFixed(2))
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const save = () => {
    const num = parseFloat(value)
    if (isNaN(num) || num < 0) {
      setValue(amount.toFixed(2))
      setEditing(false)
      return
    }
    if (num === amount) {
      setEditing(false)
      return
    }
    startTransition(async () => {
      await fetch(`/api/bills/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: num }),
      })
      router.refresh()
      setEditing(false)
    })
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        step="0.01"
        min="0"
        className="w-20 rounded-md border-gray-300 px-1 py-0.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            (e.target as HTMLInputElement).blur()
          }
        }}
      />
    )
  }

  const display = amount === 0 ? (
    <span className="text-red-500">TBD</span>
  ) : (
    `$${amount.toFixed(2)}`
  )

  return (
    <span
      onClick={() => setEditing(true)}
      className="cursor-pointer text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
      title="Click to edit"
    >
      {display}
    </span>
  )
} 