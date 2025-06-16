import { ensureRecurringBillsForCurrentMonth } from './src/lib/recurring'

/*
  Usage:
    npx ts-node autogenerationScript.ts            # uses real today
    npx ts-node autogenerationScript.ts 2026-01-15  # fakes the current date
*/

const arg = process.argv[2]
if (arg) {
  const fakeToday = new Date(arg)
  // monkey-patch global Date so date-based helpers think we are in the given month
  // Only zero-argument constructor & Date.now() are overridden.
  const RealDate = Date
  // @ts-ignore
  global.Date = class extends RealDate {
    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      args.length === 0 ? super(fakeToday) : super(...(args as unknown as [any]))
    }
    static now() {
      return fakeToday.getTime()
    }
  } as unknown as DateConstructor
  console.log('Fake date set to', fakeToday.toISOString().slice(0, 10))
}

ensureRecurringBillsForCurrentMonth()
  .then(() => {
    console.log('Recurring bills ensured for this month.')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  }) 