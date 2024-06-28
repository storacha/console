import { PropsWithChildren, ReactNode } from 'react'
import SidebarLayout from '@/components/SidebarLayout'

interface LayoutProps extends PropsWithChildren {
  params: {
    id: string
  }
}

export default function Layout ({children}: LayoutProps): ReactNode {
  return (
    <SidebarLayout>
      {children}
    </SidebarLayout>
  )
}
