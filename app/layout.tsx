// import type { Metadata } from "next";
// import { Montserrat } from "next/font/google";
// import "./globals.css";
// import ConvexClerkProvider from "./providers/ConvexClerkProvider";

// const font = Montserrat({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Password Manager",
//   description: "A secure and user-friendly password manager application.",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={font.className}>
//         <ConvexClerkProvider>
//           {children}
//         </ConvexClerkProvider>
//       </body>
//     </html>
//   );
// }


// app/layout.tsx

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
            <Link href="/">Home</Link>
            
            {/* 👤 UserButton handles sign-out and profile management */}
            <UserButton afterSignOutUrl="/" />
          </header>
          
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}