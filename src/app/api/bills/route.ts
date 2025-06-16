import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function GET() {
  try {
    const bills = await prisma.bill.findMany({
      orderBy: {
        dueDate: 'asc',
      },
    })
    return NextResponse.json(bills)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching bills' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const bill = await prisma.bill.create({
      data: {
        name: data.name ?? '',
        amount: data.amount ?? 0,
        ...(data.dueDate ? { dueDate: new Date(data.dueDate) } : {}),
        isPaid: data.isPaid ?? false,
        notes: data.notes ?? null,
        attachmentPath: data.attachmentPath ?? null,
        // @ts-ignore until prisma types updated
        paymentLink: data.paymentLink ?? null,
        // @ts-ignore
        isRecurrent: data.isRecurrent ?? false,
        // @ts-ignore
        fixedAmount: data.fixedAmount ?? false,
      },
    })
    // if recurrent, ensure current month copy exists when needed
    if (data.isRecurrent) {
      const { ensureRecurrentBillsForCurrentMonth } = await import('../../../lib/recurring')
      await ensureRecurrentBillsForCurrentMonth()
    }
    return NextResponse.json(bill)
  } catch (error) {
    return NextResponse.json({ error: 'Error creating bill' }, { status: 500 })
  }
} 