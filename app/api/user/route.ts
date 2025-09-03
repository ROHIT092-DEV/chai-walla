import { auth, currentUser } from '@clerk/nextjs/server'
import { getUserByClerkId, createUser } from '@/lib/user'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = await auth()
    const clerkUser = await currentUser()
    
    if (!userId || !clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let user = await getUserByClerkId(userId)
    
    // Create user if doesn't exist
    if (!user) {
      await createUser({
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        role: 'user'
      })
      user = await getUserByClerkId(userId)
    }

    return NextResponse.json({ role: user?.role || 'user' })
  } catch (error) {
    console.error('User API error:', error)
    return NextResponse.json({ role: 'user' })
  }
}