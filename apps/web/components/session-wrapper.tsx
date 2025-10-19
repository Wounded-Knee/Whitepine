'use client'

import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import type { ReactNode } from 'react'

interface SessionWrapperProps {
  session: Session | null
  children: ReactNode
}

export function SessionWrapper({ session, children }: SessionWrapperProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>
}

