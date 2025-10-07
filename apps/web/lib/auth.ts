import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { findOrCreateUser, findUserById } from "./user-service"

// Get the appropriate NextAuth secret based on environment
const getNextAuthSecret = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXTAUTH_SECRET_PROD || process.env.NEXTAUTH_SECRET
  } else {
    return process.env.NEXTAUTH_SECRET_DEV || process.env.NEXTAUTH_SECRET
  }
}

// Get the base URL dynamically based on environment
const getNextAuthUrl = () => {
  // If explicitly set, use it
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // Otherwise construct it dynamically
  if (process.env.NODE_ENV === 'production') {
    return `http://localhost:${process.env.PROD_WEB_PORT || 3000}`
  } else {
    return `http://localhost:${process.env.DEV_WEB_PORT || 3000}`
  }
}

export const authOptions: NextAuthOptions = {
  secret: getNextAuthSecret(),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && profile) {
        try {
          // Find or create user in database
          const dbUser = await findOrCreateUser({
            id: profile.sub || user.id,
            email: profile.email || user.email || undefined,
            name: profile.name || user.name || undefined,
            picture: (profile as any).picture || user.image || undefined
          })
          
          // Store the database user ID in the token
          user.id = dbUser._id.toString()
          return true
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }
      return true
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        try {
          // Fetch user from database to get latest info
          const dbUser = await findUserById(token.sub)
          if (dbUser) {
            session.user.id = dbUser._id.toString()
            session.user.email = dbUser.email
            session.user.name = dbUser.name
            session.user.image = dbUser.avatar
          }
        } catch (error) {
          console.error('Error fetching user in session callback:', error)
        }
      }
      return session
    },
    async jwt({ token, user, account, profile }) {
      // Initial sign in
      if (account && user) {
        return {
          ...token,
          sub: user.id,
        }
      }
      
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
}
