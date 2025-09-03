import clientPromise from './mongodb'

export interface User {
  _id?: string
  clerkId: string
  email: string
  role: 'admin' | 'user'
  createdAt: Date
  updatedAt: Date
}

export async function createUser(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) {
  const client = await clientPromise
  const db = client.db('tea-stall')
  
  const user = {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  const result = await db.collection('users').insertOne(user)
  return result
}

export async function getUserByClerkId(clerkId: string) {
  const client = await clientPromise
  const db = client.db('tea-stall')
  
  const user = await db.collection('users').findOne({ clerkId })
  return user as User | null
}

export async function updateUserRole(identifier: string, role: 'admin' | 'user') {
  const client = await clientPromise
  const db = client.db('tea-stall')
  
  // Try to update by clerkId first, then by email
  const result = await db.collection('users').updateOne(
    { $or: [{ clerkId: identifier }, { email: identifier }] },
    { 
      $set: { 
        role,
        updatedAt: new Date()
      }
    }
  )
  return result
}