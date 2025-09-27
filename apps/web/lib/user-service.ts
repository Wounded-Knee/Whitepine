import { MongoClient, ObjectId } from 'mongodb'
import type { UserNode } from '@whitepine/types'
import { NODE_TYPES } from '@whitepine/types'

// Get the appropriate MongoDB URI based on environment
const getMongoUri = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.MONGODB_URI_PROD
  } else {
    return process.env.MONGODB_URI_DEV
  }
}

// Lazy MongoDB connection - only connect when actually needed
let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

const getMongoClient = async () => {
  if (!clientPromise) {
    const mongoUri = getMongoUri()
    if (!mongoUri) {
      throw new Error(
        `MongoDB URI not found. Please set ${process.env.NODE_ENV === 'production' ? 'MONGODB_URI_PROD' : 'MONGODB_URI_DEV'} in your environment variables`
      )
    }
    client = new MongoClient(mongoUri)
    clientPromise = client.connect()
  }
  return clientPromise
}

export async function findOrCreateUser(profile: {
  id: string
  email?: string | null
  name?: string | null
  picture?: string | null
}): Promise<UserNode> {
  const client = await getMongoClient()
  const db = client.db('whitepine')
  const collection = db.collection<UserNode>('users')

  // First, try to find existing user by email
  if (profile.email) {
    const existingUser = await collection.findOne({
      kind: NODE_TYPES.USER,
      email: profile.email.toLowerCase(),
      deletedAt: null
    }) as UserNode | null

    if (existingUser) {
      // Update last login and return existing user
      await collection.updateOne(
        { _id: existingUser._id as any },
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
    kind: NODE_TYPES.USER,
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

  const result = await collection.insertOne(newUser as any)
  
  return {
    ...newUser,
    _id: result.insertedId.toString()
  } as UserNode
}

export async function findUserById(id: string): Promise<UserNode | null> {
  const client = await getMongoClient()
  const db = client.db('whitepine')
  const collection = db.collection<UserNode>('users')
  
  return await collection.findOne({
    _id: new ObjectId(id) as any,
    kind: NODE_TYPES.USER,
    deletedAt: null
  }) as UserNode | null
}

export async function findUserByEmail(email: string): Promise<UserNode | null> {
  const client = await getMongoClient()
  const db = client.db('whitepine')
  const collection = db.collection<UserNode>('users')
  
  return await collection.findOne({
    email: email.toLowerCase(),
    kind: NODE_TYPES.USER,
    deletedAt: null
  }) as UserNode | null
}
