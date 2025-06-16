import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const note = await prisma.note.update({
      where: { id: parseInt(params.id) },
      // @ts-ignore until prisma types updated
      data: {
        ...(data.resolved !== undefined ? { resolved: data.resolved } : {}),
        ...(data.active !== undefined ? { active: data.active } : {}),
        ...(data.content !== undefined ? { content: data.content } : {}),
        ...(data.order !== undefined ? { order: data.order } : {}),
        ...(data.sticky !== undefined ? { sticky: data.sticky } : {}),
      },
    })
    return NextResponse.json(note)
  } catch (error) {
    return NextResponse.json({ error: 'Error updating note' }, { status: 500 })
  }
} 