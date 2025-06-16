'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export default function ActiveLink({ href, children }:{href:string, children:React.ReactNode}){
  const pathname = usePathname()
  const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
  return (
    <Link href={href} className={clsx(
      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
      active ? 'border-indigo-500 text-gray-900 dark:text-white':'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
    )}>{children}</Link>
  )
} 