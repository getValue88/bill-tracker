'use client'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function NoteArchiveButton({id,onUpdated}:{id:number,onUpdated?:()=>void}){
  const router=useRouter()
  const [pending,start]=useTransition()
  const archive=()=>{
    if(!confirm('Archive this note?')) return
    start(async()=>{
      await fetch(`/api/notes/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({active:false})})
      if(onUpdated) onUpdated(); else router.refresh()
    })
  }
  return <button onClick={archive} disabled={pending} className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50">Archive</button>
} 