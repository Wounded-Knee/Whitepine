"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

interface AuthButtonProps {
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  fullWidth?: boolean
}

export function AuthButton({ 
  className = "", 
  size = "sm", 
  variant = "default",
  fullWidth = false 
}: AuthButtonProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className={`w-20 h-8 bg-muted animate-pulse rounded ${className}`} />
    )
  }

  if (session) {
    return (
      <div className={`flex items-center space-x-2 ${fullWidth ? 'flex-col space-y-2' : ''}`}>
        <span className={`text-sm text-muted-foreground ${fullWidth ? 'text-center' : ''}`}>
          {session.user?.name || session.user?.email}
        </span>
        <Button
          variant="outline"
          size={size}
          onClick={() => signOut()}
          className={fullWidth ? 'w-full' : ''}
        >
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => signIn()}
      className={fullWidth ? 'w-full' : ''}
    >
      Sign In
    </Button>
  )
}
