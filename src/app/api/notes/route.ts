import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    // @ts-ignore until prisma types updated
    const notes = await prisma.note.findMany({
      where: { active: true },
      // Sticky first, then unresolved, then by order field
      orderBy: [
        { sticky: 'desc' },
        { resolved: 'asc' },
        { order: 'asc' },
      ],
    })
    return NextResponse.json(notes)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching notes' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    // @ts-ignore until prisma types updated
    const max = await prisma.note.aggregate({ _max: { order: true } })
    const note = await prisma.note.create({
      data: {
        ...data,
        // @ts-ignore until prisma types updated
        order: (max._max.order ?? 0) + 1,
        sticky: false,
      },
    })
    return NextResponse.json(note)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating note' }, { status: 500 })
  }
} 