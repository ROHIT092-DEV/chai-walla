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

    const { postId, reaction } = await request.json();
    const client = await clientPromise;
    const db = client.db('tea-stall');

    const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const likes = post.likes || [];
    const dislikes = post.dislikes || [];
    const hasLiked = likes.includes(userId);
    const hasDisliked = dislikes.includes(userId);

    if (reaction === 'like') {
      if (hasLiked) {
        await db.collection('posts').updateOne(
          { _id: new ObjectId(postId) },
          { $pull: { likes: userId } }
        );
      } else {
        await db.collection('posts').updateOne(
          { _id: new ObjectId(postId) },
          { $push: { likes: userId }, $pull: { dislikes: userId } }
        );
      }
    } else if (reaction === 'dislike') {
      if (hasDisliked) {
        await db.collection('posts').updateOne(
          { _id: new ObjectId(postId) },
          { $pull: { dislikes: userId } }
        );
      } else {
        await db.collection('posts').updateOne(
          { _id: new ObjectId(postId) },
          { $push: { dislikes: userId }, $pull: { likes: userId } }
        );
      }
    }

    const updatedPost = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
    return NextResponse.json({ 
      success: true, 
      likes: updatedPost?.likes?.length || 0,
      dislikes: updatedPost?.dislikes?.length || 0,
      userReaction: updatedPost?.likes?.includes(userId) ? 'like' : updatedPost?.dislikes?.includes(userId) ? 'dislike' : null
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 });
  }
}