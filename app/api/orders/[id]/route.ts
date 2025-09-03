import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { broadcast } from '@/app/api/sse/route';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db('tea-stall');
    const order = await db.collection('orders').findOne({ _id: new ObjectId(params.id) });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json();
    const client = await clientPromise;
    const db = client.db('tea-stall');

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { ...updates, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await db.collection('orders').findOne({ _id: new ObjectId(params.id) });
    
    // Broadcast real-time update
    broadcast({
      type: 'order_update',
      orderId: params.id,
      order: updatedOrder
    });
    
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}