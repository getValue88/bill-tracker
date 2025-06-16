'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function NoteStatusButtons({ id, resolved, onUpdated }:{id:number,resolved:boolean,onUpdated?:()=>void}){
  const router=useRouter()
  const [pending,start]=useTransition()
  const update=(value:boolean)=>{
    if(value===resolved) return
    start(async()=>{
      await fetch(`/api/notes/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({resolved:value})})
      if(onUpdated) onUpdated()
      else router.refresh()
    })
  }
  const resolveBtn = (
    <button onClick={()=>update(true)} disabled={pending} className="px-2 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-700/30 dark:text-green-300 dark:hover:bg-green-700/60">Resolve</button>
  )
  const undoBtn = (
    <button onClick={()=>update(false)} disabled={pending} className="px-2 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-700/30 dark:text-yellow-300 dark:hover:bg-yellow-700/60">Undo</button>
  )
  return <div>{resolved? undoBtn: resolveBtn}</div>
} 