import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/user';

export async function GET(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByClerkId(userId);
    return NextResponse.json({ role: user?.role || 'user' });
  } catch (error) {
    return NextResponse.json({ role: 'user' });
  }
}