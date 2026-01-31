'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash, CheckCircle, Save, FileText } from 'lucide-react';

interface QuestionDraft {
    text: string;
    options: string[];
    correctOptionIndex: number;
}

function CreateQuizForm() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [endTime, setEndTime] = useState('');
    const [questions, setQuestions] = useState<QuestionDraft[]>([]);

    // Edit Mode State
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const [isEditMode, setIsEditMode] = useState(false);

    // Current Question Form State
    const [qText, setQText] = useState('');
    const [qOptions, setQOptions] = useState<string[]>(['', '', '', '']);
    const [qCorrect, setQCorrect] = useState(0);

    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (editId) {
            setIsEditMode(true);
            fetch(`/api/quizzes/${editId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setTitle(data.title);
                        setDescription(data.description || '');
                        setEndTime(data.endTime || '');
                        setQuestions(data.questions || []);
                    }
                });
        }
    }, [editId]);

    const handleOptionChange = (idx: number, val: string) => {
        const newOpts = [...qOptions];
        newOpts[idx] = val;
        setQOptions(newOpts);
    };

    const addQuestion = () => {
        if (!qText || qOptions.some(o => !o)) return;

        setQuestions([...questions, {
            text: qText,
            options: [...qOptions],
            correctOptionIndex: qCorrect
        }]);

        // Reset form
        setQText('');
        setQOptions(['', '', '', '']);
        setQCorrect(0);
    };

    const removeQuestion = (idx: number) => {
        setQuestions(questions.filter((_, i) => i !== idx));
    };

    const publishQuiz = async () => {
        if (!title || questions.length === 0 || !user) return;

        try {
            const url = isEditMode ? `/api/quizzes/${editId}` : '/api/quizzes';
            const method = isEditMode ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    endTime,
                    createdBy: user.id,
                    questions
                })
            });


            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Operation failed');
            }

            router.push('/admin/dashboard');
        } catch (err: any) {
            alert(err.message);
        }
    };



    return (
        <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '6rem' }}>
            <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 className="title-gradient hero-title" style={{ marginBottom: '0.5rem' }}>
                    {isEditMode ? 'Refine Your Quiz' : 'Assemble a New Challenge'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    {isEditMode ? 'Update your content and keep the learning fresh' : 'Design an engaging experience for your students'}
                </p>
            </div>

            <div className="create-quiz-grid">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Basic Info */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px' }}>
                                <FileText size={20} color="var(--accent-primary)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Quiz Identity</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>TITLE</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. Advanced Quantum Mechanics"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>DESCRIPTION</label>
                                <textarea
                                    className="input-field"
                                    placeholder="Describe what students will learn..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={3}
                                    style={{ fontFamily: 'inherit', resize: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>QUIZ END TIME (OPTIONAL)</label>
                                <input
                                    type="datetime-local"
                                    className="input-field"
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Question Creator */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div style={{ padding: '0.5rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '8px' }}>
                                <Plus size={20} color="var(--accent-secondary)" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem' }}>Construct Question</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <input
                                className="input-field"
                                placeholder="What is the question?"
                                value={qText}
                                onChange={e => setQText(e.target.value)}
                                style={{ fontSize: '1.1rem', padding: '1rem' }}
                            />

                            <div className="options-grid">
                                {qOptions.map((opt, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        gap: '0.75rem',
                                        alignItems: 'center',
                                        padding: '0.5rem',
                                        background: qCorrect === idx ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                                        borderRadius: '12px',
                                        border: qCorrect === idx ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid transparent',
                                        transition: 'all 0.2s'
                                    }}>
                                        <div
                                            onClick={() => setQCorrect(idx)}
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                border: `2px solid ${qCorrect === idx ? 'var(--success)' : 'var(--glass-border)'}`,
                                                background: qCorrect === idx ? 'var(--success)' : 'transparent',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}
                                        >
                                            {qCorrect === idx && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }}></div>}
                                        </div>
                                        <input
                                            className="input-field"
                                            placeholder={`Option ${idx + 1}`}
                                            value={opt}
                                            onChange={e => handleOptionChange(idx, e.target.value)}
                                            style={{ border: 'none', background: 'transparent', padding: '0.5rem 0' }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={addQuestion}
                                className="btn-secondary"
                                disabled={!qText || qOptions.some(o => !o)}
                                style={{
                                    marginTop: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    padding: '1rem',
                                    opacity: (!qText || qOptions.some(o => !o)) ? 0.5 : 1
                                }}
                            >
                                <Plus size={20} /> Add to Quiz Bank
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Question List & Summary */}
                <aside className="sidebar-sticky">
                    <div className="glass-panel" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem' }}>Questions</h3>
                            <span style={{ padding: '0.2rem 0.6rem', background: 'var(--accent-primary)', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {questions.length}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {questions.map((q, idx) => (
                                <div key={idx} className="fade-in" style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--glass-border)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>{idx + 1}.</span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.4, marginBottom: '0.25rem' }}>{q.text}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--success)' }}>
                                            <CheckCircle size={12} /> {q.options[q.correctOptionIndex]}
                                        </div>
                                    </div>
                                    <button onClick={() => removeQuestion(idx)} style={{ color: 'var(--error)', background: 'transparent', padding: '0.2rem' }}>
                                        <Trash size={14} />
                                    </button>
                                </div>
                            ))}
                            {questions.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                    No questions added yet.
                                </div>
                            )}
                        </div>

                        <button
                            onClick={publishQuiz}
                            className="btn-primary"
                            disabled={!title || questions.length === 0}
                            style={{
                                marginTop: '1.5rem',
                                width: '100%',
                                opacity: (!title || questions.length === 0) ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '1rem'
                            }}
                        >
                            {isEditMode ? (
                                <><Save size={20} /> Update Quiz</>
                            ) : (
                                <><CheckCircle size={20} /> Launch Quiz</>
                            )}
                        </button>
                    </div>

                    <div className="glass-panel" style={{ padding: '1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Auto-saving to cloud...
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );

}

export default function CreateQuizPage() {
    return (
        <Suspense fallback={<div className="fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Form...</div>}>
            <CreateQuizForm />
        </Suspense>
    );
}
