import { NextRequest, NextResponse } from 'next/server'
import { updateUserRole } from '@/lib/user'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    const { email } = await request.json()
    
    if (!userId || !email) {
      return NextResponse.json({ error: 'Unauthorized or missing email' }, { status: 400 })
    }

    // Simple security: only allow if the secret key matches
    const { secret } = await request.json()
    if (secret !== 'make-me-admin-123') {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 })
    }

    // Update user role to admin
    const result = await updateUserRole(email, 'admin')
    
    return NextResponse.json({ 
      success: true, 
      message: `User ${email} is now an admin` 
    })
  } catch (error) {
    console.error('Make admin error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}