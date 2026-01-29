import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await params;
        const attempts = await db.getAttemptsByUserId(userId);
        return NextResponse.json(attempts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 });
    }
}
