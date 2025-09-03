import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('tea-stall');
    
    const products = await db.collection('products')
      .find({ featured: true })
      .limit(12)
      .toArray();
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json([], { status: 200 });
  }
}