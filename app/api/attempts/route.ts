import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const attempts = await db.getAttempts();
        return NextResponse.json(attempts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch attempts' }, { status: 500 });
    }
}


export async function POST(request: Request) {
    try {
        const { userId, quizId, score, totalQuestions } = await request.json();

        // Security Check: Verify user is a student
        const isStudent = await db.verifyRole(userId, 'student');
        if (!isStudent) {
            return NextResponse.json({ error: 'Unauthorized: Only students can submit attempts' }, { status: 403 });
        }

        // Limit Check: One attempt per quiz
        const alreadyAttempted = await db.checkExistingAttempt(userId, quizId);
        if (alreadyAttempted) {
            return NextResponse.json({ error: 'You have already attempted this quiz' }, { status: 400 });
        }

        // Status Check: Quiz must be active
        const quiz = await db.getQuizById(quizId);
        if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });

        const isEnded = quiz.isEnded || (quiz.endTime && new Date(quiz.endTime) <= new Date());
        if (isEnded) {
            return NextResponse.json({ error: 'This quiz has ended and no longer accepts submissions' }, { status: 403 });
        }



        const attempt = {
            id: uuidv4(),
            userId,
            quizId,
            score,
            totalQuestions,
            timestamp: new Date().toISOString()
        };

        await db.addAttempt(attempt);
        return NextResponse.json(attempt);
    } catch (error) {
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
