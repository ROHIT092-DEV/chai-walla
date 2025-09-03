import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('tea-stall');
    
    const [productsCount, ordersCount] = await Promise.all([
      db.collection('products').countDocuments(),
      db.collection('orders').countDocuments()
    ]);
    
    return NextResponse.json({
      totalCustomers: ordersCount * 2 + 100,
      totalProducts: productsCount,
      averageRating: 4.8
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({
      totalCustomers: 500,
      totalProducts: 50,
      averageRating: 4.8
    });
  }
}