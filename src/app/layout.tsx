import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import clsx from 'clsx'
import ThemeToggle from '../components/ThemeToggle'
import Script from 'next/script'
import { cookies } from 'next/headers'
import ActiveLink from '../components/ActiveLink'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Bill Tracker',
  description: 'Track your monthly bills and take notes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const themeCookie = cookies().get('theme')?.value
  const initialClass = themeCookie === 'dark' ? 'dark' : ''
  return (
    <html lang="en" className={initialClass}>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">{`
          (() => {
            try {
              const stored = localStorage.getItem('theme');
              const mql = window.matchMedia('(prefers-color-scheme: dark)');
              const prefersDark = mql.matches;
              const isDark = stored === 'dark' || (!stored && prefersDark);
              if (isDark) {
                document.documentElement.classList.add('dark');
                document.documentElement.style.backgroundColor = '#111827';
              } else {
                document.documentElement.style.backgroundColor = '#ffffff';
              }
            } catch (e) {}
          })();
        `}</Script>
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
          <nav className="bg-white dark:bg-gray-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Bill Tracker</h1>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <ActiveLink href="/">Bills</ActiveLink>
                    <ActiveLink href="/notes">Notes</ActiveLink>
                  </div>
                </div>
                <div className="flex items-center">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
} 