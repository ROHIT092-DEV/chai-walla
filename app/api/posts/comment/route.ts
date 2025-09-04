import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId, comment } = await request.json();
    const client = await clientPromise;
    const db = client.db('tea-stall');

    const newComment = {
      _id: new ObjectId(),
      userId,
      comment,
      createdAt: new Date()
    };

    await db.collection('posts').updateOne(
      { _id: new ObjectId(postId) },
      { $push: { comments: newComment } }
    );

    return NextResponse.json({ success: true, comment: newComment });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}