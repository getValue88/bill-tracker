// @ts-nocheck
import { prisma } from './prisma'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export async function ensureRecurrentBillsForCurrentMonth() {
  const now = new Date()
  const from = startOfMonth(now)
  const to = endOfMonth(now)

  const prevStart = startOfMonth(subMonths(now,1))
  const prevEnd = endOfMonth(subMonths(now,1))

  // @ts-ignore until prisma types updated
  const recurrentBills = await prisma.bill.findMany({ where: { isRecurrent: true, createdAt: { gte: prevStart, lte: prevEnd } } })

  for (const prev of recurrentBills) {
    // @ts-ignore
    const exists = await prisma.bill.findFirst({ where: { name: prev.name, createdAt:{ gte: from, lte: to } } })
    if (exists) continue

    const amount = prev.fixedAmount ? prev.amount : 0

    // @ts-ignore
    await prisma.bill.create({
      data:{
        name: prev.name,
        amount,
        dueDate:null,
        isPaid:false,
        paymentLink: prev.paymentLink ?? null,
        isRecurrent:true,
        fixedAmount: prev.fixedAmount,
      }
    })
  }
} 