import { MongoClient, ObjectId } from 'mongodb'
import type { BaseNode } from '@shared/index'

// Define UserNode interface extending BaseNode
interface UserNode extends BaseNode {
  kind: 'User'
  email: string
  name: string
  avatar?: string
  bio?: string
  isActive: boolean
  lastLoginAt?: Date
  preferences?: {
    theme?: 'light' | 'dark' | 'auto'
    language?: string
    notifications?: {
      email?: boolean
      push?: boolean
    }
  }
}

// Get the appropriate MongoDB URI based on environment
const getMongoUri = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.MONGODB_URI_PROD
  } else {
    return process.env.MONGODB_URI_DEV
  }
}

const mongoUri = getMongoUri()
if (!mongoUri) {
  throw new Error(
    `MongoDB URI not found. Please set ${process.env.NODE_ENV === 'production' ? 'MONGODB_URI_PROD' : 'MONGODB_URI_DEV'} in your environment variables`
  )
}

const client = new MongoClient(mongoUri)
const clientPromise = client.connect()

export async function findOrCreateUser(profile: {
  id: string
  email?: string | null
  name?: string | null
  picture?: string | null
}): Promise<UserNode> {
  const db = (await clientPromise).db()
  const collection = db.collection('nodes')

  // First, try to find existing user by email
  if (profile.email) {
    const existingUser = await collection.findOne({
      kind: 'User',
      email: profile.email.toLowerCase(),
      deletedAt: null
    }) as UserNode | null

    if (existingUser) {
      // Update last login and return existing user
      await collection.updateOne(
        { _id: existingUser._id },
        { 
          $set: { 
            lastLoginAt: new Date(),
            updatedAt: new Date()
          }
        }
      )
      return existingUser
    }
  }

  // Create new user if not found
  const newUser: Omit<UserNode, '_id'> = {
    kind: 'User',
    email: profile.email?.toLowerCase() || '',
    name: profile.name || 'Unknown User',
    avatar: profile.picture || undefined,
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    preferences: {
      theme: 'auto',
      language: 'en',
      notifications: {
        email: true,
        push: true
      }
    }
  }

  const result = await collection.insertOne(newUser)
  
  return {
    ...newUser,
    _id: result.insertedId
  } as UserNode
}

export async function findUserById(id: string): Promise<UserNode | null> {
  const db = (await clientPromise).db()
  const collection = db.collection('nodes')
  
  return await collection.findOne({
    _id: new ObjectId(id),
    kind: 'User',
    deletedAt: null
  }) as UserNode | null
}

export async function findUserByEmail(email: string): Promise<UserNode | null> {
  const db = (await clientPromise).db()
  const collection = db.collection('nodes')
  
  return await collection.findOne({
    email: email.toLowerCase(),
    kind: 'User',
    deletedAt: null
  }) as UserNode | null
}
