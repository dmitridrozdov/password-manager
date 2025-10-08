import { ClerkProvider, UserButton } from '@clerk/nextjs'
import './globals.css'
import Link from 'next/link'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // 🔑 The required wrapper to enable Clerk throughout the app
    <ClerkProvider>
      <html lang="en">
        <body>
          <header style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #ccc' }}>

            {/* 👤 UserButton handles sign-out and profile management */}
            <UserButton afterSignOutUrl="/" />
          </header>
          
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}