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

    const { postId } = await request.json();
    const client = await clientPromise;
    const db = client.db('tea-stall');

    const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const likes = post.likes || [];
    const hasLiked = likes.includes(userId);

    if (hasLiked) {
      await db.collection('posts').updateOne(
        { _id: new ObjectId(postId) },
        { $pull: { likes: userId } }
      );
    } else {
      await db.collection('posts').updateOne(
        { _id: new ObjectId(postId) },
        { $push: { likes: userId } }
      );
    }

    return NextResponse.json({ success: true, liked: !hasLiked });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}