'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function TogglePaidButton({ id, isPaid }:{id:number,isPaid:boolean}){
  const router=useRouter()
  const [pending,start]=useTransition()
  const toggle=()=>{
    start(async()=>{
      await fetch(`/api/bills/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({isPaid:!isPaid})})
      router.refresh()
    })
  }
  return (
    <button onClick={toggle} disabled={pending} className={`px-2 py-0.5 rounded-md text-xs font-medium ${isPaid?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'}`}>
      {pending? '...' : (isPaid? 'Paid':'Pending')}
    </button>
  )
} 