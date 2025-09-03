import { NextResponse } from 'next/server'
import imagekit from '@/lib/imagekit'

export async function GET() {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters()
    return NextResponse.json(authenticationParameters)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get auth parameters' }, { status: 500 })
  }
}