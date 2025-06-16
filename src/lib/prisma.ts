import { PrismaClient } from '@prisma/client'
import { startRecurrentScheduler } from './recurringScheduler'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Kick off recurring bill scheduler exactly once per process
const globalScheduler = global as unknown as { _recurrentSchedulerStarted?: boolean }
if (!globalScheduler._recurrentSchedulerStarted) {
  startRecurrentScheduler()
  globalScheduler._recurrentSchedulerStarted = true
} 