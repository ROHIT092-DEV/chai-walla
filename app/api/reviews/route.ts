import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, rating, comment } = await request.json();
    const client = await clientPromise;
    const db = client.db('tea-stall');

    const review = {
      userId,
      productId,
      rating,
      comment,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('reviews').insertOne(review);
    return NextResponse.json({ success: true, reviewId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('tea-stall');
    
    const reviews = await db.collection('reviews')
      .aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: 'clerkId',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $sort: { createdAt: -1 } },
        { $limit: 50 }
      ]).toArray();

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json([]);
  }
}