// import { ClerkProvider, UserButton } from '@clerk/nextjs'
// import './globals.css'
// import ConvexClerkProvider from './providers/ConvexClerkProvider'

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <ConvexClerkProvider
//       signInUrl="/sign-in"
//       signUpUrl="/sign-up"
//       afterSignOutUrl="/"
//     >
//       <html lang="en" suppressHydrationWarning>
//         <body className="bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900" suppressHydrationWarning>
//           <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
//             <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              
//               <UserButton 
//                 appearance={{
//                   elements: {
//                     avatarBox: "w-10 h-10",
//                     userButtonPopoverCard: "bg-slate-800 border border-slate-700",
//                     userButtonPopoverActionButton: "hover:bg-slate-700",
//                     userButtonPopoverActionButtonText: "text-slate-200",
//                     userButtonPopoverFooter: "hidden"
//                   }
//                 }}
//               />
//             </div>
//           </header>
          
//           <main>{children}</main>
//         </body>
//       </html>
//     </ConvexClerkProvider>
//   )
// }

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
          colorBackground: '#15171c',
          colorPrimary: '',
          colorText: 'white',
          colorInputBackground: '#1b1f29',
          colorInputText: 'white',
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
      </ConvexClerkProvider>
    </ClerkProvider>
  )
}