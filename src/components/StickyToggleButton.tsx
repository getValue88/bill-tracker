'use client'
import { useTransition } from 'react'

export default function StickyToggleButton({id,sticky,onUpdated}:{id:number,sticky:boolean,onUpdated:()=>void}){
  const [pending,start]=useTransition()
  const toggle=()=>{
    start(async()=>{
      await fetch(`/api/notes/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({sticky:!sticky})})
      onUpdated()
    })
  }
  return (
    <button onClick={(e)=>{e.stopPropagation(); toggle();}} disabled={pending} title={sticky?'Unpin':'Pin'} className="text-yellow-400 hover:text-yellow-500">
      {sticky? '★':'☆'}
    </button>
  )
} 