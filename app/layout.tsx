import { ClerkProvider, UserButton } from '@clerk/nextjs'
import './globals.css'
import ConvexClerkProvider from './providers/ConvexClerkProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
      appearance={{
        layout: { 
          socialButtonsVariant: 'iconButton',
          logoImageUrl: '/icons/auth-logo.svg'
        },
        variables: {
          colorBackground: '#ffffff',
          colorPrimary: '#2563eb', // Blue accent color
          colorText: '#0f172a', // Dark slate text
          colorInputBackground: '#f8fafc',
          colorInputText: '#0f172a',
          colorTextSecondary: '#64748b',
          borderRadius: '0.5rem',
        }
      }}
    >
      <ConvexClerkProvider>
        <html lang="en" suppressHydrationWarning>
          <body className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" suppressHydrationWarning>
            <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 ring-2 ring-slate-200",
                      userButtonPopoverCard: "bg-white border border-slate-200 shadow-lg",
                      userButtonPopoverActionButton: "hover:bg-slate-50 text-slate-700",
                      userButtonPopoverActionButtonText: "text-slate-700",
                      userButtonPopoverFooter: "hidden"
                    }
                  }}
                />
              </div>
            </header>
            
            <main>{children}</main>
          </body>
        </html>
      </ConvexClerkProvider>
    </ClerkProvider>
  )
}