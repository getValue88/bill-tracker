import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bill = await prisma.bill.findUnique({
      where: {
        id: parseInt(params.id),
      },
    })
    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }
    return NextResponse.json(bill)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching bill' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const bill = await prisma.bill.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.amount !== undefined ? { amount: data.amount } : {}),
        ...(data.dueDate ? { dueDate: new Date(data.dueDate) } : {}),
        ...(data.isPaid !== undefined ? { isPaid: data.isPaid } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.attachmentPath !== undefined ? { attachmentPath: data.attachmentPath } : {}),
        ...(data.paymentLink !== undefined ? { paymentLink: data.paymentLink } : {}),
        ...(data.isRecurrent !== undefined ? { isRecurrent: data.isRecurrent } : {}),
        ...(data.fixedAmount !== undefined ? { fixedAmount: data.fixedAmount } : {}),
      },
    })
    return NextResponse.json(bill)
  } catch (error) {
    return NextResponse.json({ error: 'Error updating bill' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.bill.delete({
      where: {
        id: parseInt(params.id),
      },
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting bill' }, { status: 500 })
  }
} 