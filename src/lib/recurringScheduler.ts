import cron from 'node-cron'
import { ensureRecurrentBillsForCurrentMonth } from './recurring'

/**
 * Kicks off a cron job that ensures recurring bills exist.
 *  – Runs immediately at startup.
 *  – Runs every day at 00:05 (server time).
 */
export function startRecurrentScheduler() {
  // Run once immediately (fire-and-forget)
  ensureRecurrentBillsForCurrentMonth().catch((err) => {
    console.error('Failed to ensure recurrent bills on startup', err)
  })

  // Schedule: minute 5 of every day
  cron.schedule('5 0 * * *', () => {
    ensureRecurrentBillsForCurrentMonth().catch((err) => {
      console.error('Failed to ensure recurrent bills in daily job', err)
    })
  })
} 