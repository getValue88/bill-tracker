'use client'

import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import NoteStatusButtons from '../../components/NoteStatusButtons'
import NoteArchiveButton from '../../components/NoteArchiveButton'
import EditableContent from '../../components/EditableContent'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import StickyToggleButton from '../../components/StickyToggleButton'

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState({ title: '', content: '' })
  const [open, setOpen] = useState<Set<number>>(new Set())

  const fetchNotes = async () => {
    const response = await fetch('/api/notes')
    const data = await response.json()
    if (response.ok && Array.isArray(data)) {
      setNotes(data)
    } else {
      setNotes([])
    }
  }

  useEffect(() => {
    fetchNotes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newNote),
    })
    setNewNote({ title: '', content: '' })
    fetchNotes()
  }

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    const regularArr = Array.from(regularNotes)
    const [removed] = regularArr.splice(result.source.index, 1)
    regularArr.splice(result.destination.index, 0, removed)

    // merge back with sticky at top
    const combined = [...stickyNotes, ...regularArr]
    setNotes(combined)

    // persist order
    await Promise.all(
      combined.map((n, idx) =>
        fetch(`/api/notes/${n.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: idx }),
        })
      )
    )
  }

  const onStickyDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    const stickyArr = Array.from(stickyNotes)
    const [removed] = stickyArr.splice(result.source.index,1)
    stickyArr.splice(result.destination.index,0,removed)
    // merge back with regular
    const combined = [...stickyArr, ...regularNotes]
    setNotes(combined)
    await Promise.all(
      combined.map((n, idx) =>
        fetch(`/api/notes/${n.id}`,{
          method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({order: idx})
        })
      )
    )
  }

  const stickyNotes = notes.filter(n=>n.sticky)
  const regularNotes = notes.filter(n=>!n.sticky)

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Content
            </label>
            <textarea
              name="content"
              id="content"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            />
          </div>
          <div>
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add Note
            </button>
          </div>
        </form>

        {stickyNotes.length>0 && (
          <DragDropContext onDragEnd={onStickyDragEnd}>
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700 mt-6 mb-6">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left text-sm font-semibold dark:text-gray-100">Pinned</th>
                <th className="px-3 py-2"></th>
                <th></th>
              </tr>
            </thead>
            <Droppable droppableId="sticky-table" direction="vertical">
            {provided=> (
            <tbody ref={provided.innerRef} {...provided.droppableProps} className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {stickyNotes.map((note,index)=> (
                <Draggable draggableId={`s-${note.id}`} index={index} key={note.id}>
                {prov=>(
                <React.Fragment key={note.id}>
                  <tr ref={prov.innerRef} {...prov.draggableProps}>
                    <td className="px-3 py-2 dark:text-gray-300 cursor-pointer select-none" onClick={()=>{
                      setOpen(prev=>{const s=new Set(prev); s.has(note.id)?s.delete(note.id):s.add(note.id); return s})
                    }}>
                      <div className="flex items-center gap-1 hover:underline" {...prov.dragHandleProps}>
                        <StickyToggleButton id={note.id} sticky={note.sticky} onUpdated={fetchNotes} />
                        <span>{note.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2"><NoteStatusButtons id={note.id} resolved={note.resolved} onUpdated={fetchNotes} /></td>
                    <td className="px-3 py-2 text-right"><NoteArchiveButton id={note.id} onUpdated={fetchNotes} /></td>
                  </tr>
                  {open.has(note.id) && (
                    <tr>
                      <td colSpan={3} className="px-3 py-2 bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-300 border-t">
                        <EditableContent note={note} onUpdated={fetchNotes} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
                )}
                </Draggable>
              ))}
              {provided.placeholder}
            </tbody>
            )}
            </Droppable>
          </table>
          </DragDropContext>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700 mt-6">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3 py-2 text-left text-sm font-semibold dark:text-gray-100">Title</th>
              <th className="px-3 py-2 text-left text-sm font-semibold dark:text-gray-100">Status</th>
              <th className="px-3 py-2 text-right text-sm font-semibold dark:text-gray-100">Actions</th>
            </tr>
          </thead>
          <Droppable droppableId="notes-table" direction="vertical">
          {(provided)=> (
          <tbody ref={provided.innerRef} {...provided.droppableProps} className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {regularNotes.map((note,index) => (
              <Draggable draggableId={note.id.toString()} index={index} key={note.id}>
              {(prov)=> (
              <React.Fragment>
                <tr ref={prov.innerRef} {...prov.draggableProps} >
                  <td className="px-3 py-2 dark:text-gray-300 cursor-pointer select-none" onClick={() => {
                    setOpen(prev => {
                      const s = new Set(prev);
                      s.has(note.id) ? s.delete(note.id) : s.add(note.id);
                      return s;
                    });
                  }}>
                    <div className="flex items-center gap-1 hover:underline" {...prov.dragHandleProps}>
                      <StickyToggleButton id={note.id} sticky={note.sticky} onUpdated={fetchNotes} />
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${open.has(note.id)?'rotate-90':'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      <span>{note.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <NoteStatusButtons id={note.id} resolved={note.resolved} onUpdated={fetchNotes} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <NoteArchiveButton id={note.id} onUpdated={fetchNotes} />
                  </td>
                </tr>
                {open.has(note.id) && (
                  <tr>
                    <td colSpan={3} className="px-3 py-2 bg-gray-50 dark:bg-gray-900 text-sm text-gray-600 dark:text-gray-300 border-t">
                      <EditableContent note={note} onUpdated={fetchNotes} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
              )}
              </Draggable>
            ))}
            {provided.placeholder}
          </tbody>
          )}
          </Droppable>
        </table>
        </DragDropContext>
      </div>
    </div>
  )
} 