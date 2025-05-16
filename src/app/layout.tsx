import './globals.css'
import type { Metadata } from 'next'
import Provider from '@/components/W3UIProvider'
import Toaster from '@/components/Toaster'
import { Provider as MigrationsProvider } from '@/components/MigrationsProvider'
import PlausibleProvider from 'next-plausible'

export const metadata: Metadata = {
  title: 'w3up console',
  description: 'web3.storage management console',
}

export default function RootLayout ({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className='bg-grad min-h-screen'>
      <PlausibleProvider
          domain='console.web3.storage'
          trackFileDownloads={true}
          trackOutboundLinks={true}
          taggedEvents={true}
          trackLocalhost={false}
          enabled={true}
        >
          <Provider>
            <MigrationsProvider>
              {children}
            </MigrationsProvider>
          </Provider>
          <Toaster />
        </PlausibleProvider>
      </body>
    </html>
  )
}
