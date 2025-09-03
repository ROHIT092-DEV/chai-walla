import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const totalCustomers = await db.collection('users').countDocuments();
    const totalProducts = await db.collection('products').countDocuments();
    const averageRating = 4.8;
    
    return NextResponse.json({
      totalCustomers,
      totalProducts,
      averageRating
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}