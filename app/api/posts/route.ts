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

    const { content, image, video } = await request.json();
    const client = await clientPromise;
    const db = client.db('tea-stall');

    const post = {
      userId,
      content,
      image: image || null,
      video: video || null,
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('posts').insertOne(post);
    return NextResponse.json({ success: true, postId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('tea-stall');
    
    const posts = await db.collection('posts')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'clerkId',
            as: 'user'
          }
        },
        { $sort: { createdAt: -1 } },
        { $limit: 20 }
      ]).toArray();

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json([]);
  }
}