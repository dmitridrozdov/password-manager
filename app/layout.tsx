import { ClerkProvider, UserButton } from '@clerk/nextjs'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      <html lang="en">
        <body className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <div className="text-white text-xl font-semibold">
                Password Manager
              </div>
              
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                    userButtonPopoverCard: "bg-slate-800 border border-slate-700",
                    userButtonPopoverActionButton: "hover:bg-slate-700",
                    userButtonPopoverActionButtonText: "text-slate-200",
                    userButtonPopoverFooter: "hidden"
                  }
                }}
              />
            </div>
          </header>
          
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}