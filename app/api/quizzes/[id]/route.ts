import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const quiz = await db.getQuizById(id);
    if (!quiz) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(quiz);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { createdBy, ...updateData } = body;

        // Security Check: Verify user is an admin
        const isAdmin = await db.verifyRole(createdBy, 'admin');
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const quizRef = await db.getQuizById(id);
        if (!quizRef) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const updatedQuiz = {
            ...quizRef,
            ...updateData,
            id
        };

        await db.addQuiz(updatedQuiz);
        return NextResponse.json(updatedQuiz);
    } catch (error) {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
