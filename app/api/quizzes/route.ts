import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const quizzes = await db.getQuizzes();
        return NextResponse.json(quizzes);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description, createdBy, questions } = body;

        // Security Check: Verify user is an admin
        const isAdmin = await db.verifyRole(createdBy, 'admin');
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        // Basic validation
        if (!title || !questions || !Array.isArray(questions)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }


        const newQuiz = {
            id: uuidv4(),
            title,
            description,
            createdBy,
            questions: questions.map((q: any) => ({
                ...q,
                id: q.id || uuidv4() // Ensure questions have IDs
            }))
        };

        await db.addQuiz(newQuiz);
        return NextResponse.json(newQuiz);
    } catch (error) {

        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}
