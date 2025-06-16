'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function BillActions({ id }: { id: number }) {
  const router = useRouter()
  const [pending, start] = useTransition()

  const remove = () => {
    if (!confirm('Delete this bill?')) return
    start(async () => {
      await fetch(`/api/bills/${id}`, { method: 'DELETE' })
      router.refresh()
    })
  }

  return (
    <div className="flex gap-2 justify-end">
      <Link
        href={`/bills/${id}`}
        className="text-indigo-600 hover:text-indigo-900 text-sm"
      >
        Edit
      </Link>
      <button
        onClick={remove}
        disabled={pending}
        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
      >
        {pending ? '...' : 'Delete'}
      </button>
    </div>
  )
} 