'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export default function EditableContent({ note, onUpdated }:{note:any, onUpdated:()=>void}){
  const [editing,setEditing]=useState(false)
  const [value,setValue]=useState(note.content??'')
  const router=useRouter()
  const [pending,start]=useTransition()
  const save=()=>{
    start(async()=>{
      await fetch(`/api/notes/${note.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:value})})
      setEditing(false)
      onUpdated()
    })
  }
  if(editing){
    return (
      <div>
        <textarea className="w-full rounded-md border-gray-300 px-2 py-1 text-sm" rows={4} value={value} onChange={e=>setValue(e.target.value)} />
        <div className="mt-1 flex gap-2">
          <button onClick={save} disabled={pending} className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-md">Save</button>
          <button onClick={()=>setEditing(false)} className="px-2 py-0.5 text-xs">Cancel</button>
        </div>
      </div>
    )
  }
  return (
    <div onClick={()=>setEditing(true)} className="cursor-pointer whitespace-pre-wrap">{note.content || '— (add content)'}</div>
  )
} 