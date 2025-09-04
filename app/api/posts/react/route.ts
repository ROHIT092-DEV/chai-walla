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

    const { postId, emoji } = await request.json();
    const client = await clientPromise;
    const db = client.db('tea-stall');

    const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const reactions = post.reactions || {};
    
    // Remove user from all emoji reactions first
    Object.keys(reactions).forEach(key => {
      reactions[key] = reactions[key].filter((id: string) => id !== userId);
      if (reactions[key].length === 0) {
        delete reactions[key];
      }
    });

    // Add user to selected emoji if not already there
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }
    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId);
    }

    await db.collection('posts').updateOne(
      { _id: new ObjectId(postId) },
      { $set: { reactions } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
  }
}