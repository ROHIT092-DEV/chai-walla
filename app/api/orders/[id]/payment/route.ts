import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { broadcast } from '@/app/api/sse/route';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { paymentStatus } = await request.json();
    const client = await clientPromise;
    const db = client.db('tea-stall');

    const updates: any = { paymentStatus, updatedAt: new Date() };
    
    if (paymentStatus === 'completed') {
      updates.status = 'paid';
    }

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await db.collection('orders').findOne({ _id: new ObjectId(id) });
    
    // Broadcast real-time update
    broadcast({
      type: 'payment_update',
      orderId: id,
      paymentStatus,
      order: updatedOrder
    });
    
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
  }
}