import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const [global, quizWinners] = await Promise.all([
            db.getLeaderboard(),
            db.getQuizWinners()
        ]);
        return NextResponse.json({ global, quizWinners });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}
