'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function PayStatusButtons({ id, isPaid, paymentLink }:{id:number,isPaid:boolean,paymentLink?:string}){
  const router=useRouter()
  const [pending,start]=useTransition()

  const update=(value:boolean)=>{
    if(value===isPaid) return
    if(value && paymentLink){
      window.open(paymentLink,'_blank')
    }
    start(async()=>{
      await fetch(`/api/bills/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({isPaid:value})})
      router.refresh()
    })
  }

  const payButton = (
    <button
      onClick={() => update(true)}
      disabled={pending}
      className="px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-700/30 dark:text-green-300 dark:hover:bg-green-700/60"
    >
      Pay
    </button>
  )

  const undoButton = (
    <button
      onClick={() => update(false)}
      disabled={pending}
      className="px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-700/30 dark:text-yellow-300 dark:hover:bg-yellow-700/60"
    >
      Undo
    </button>
  )

  return <div>{isPaid ? undoButton : payButton}</div>
} 