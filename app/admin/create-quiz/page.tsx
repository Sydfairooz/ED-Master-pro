'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash, CheckCircle, Save, FileText, Zap } from 'lucide-react';

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
        <div className="slide-up" style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '6rem' }}>
            <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', padding: '0.5rem 1rem', borderRadius: '30px', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '1.5rem', border: '1px solid rgba(139, 92, 246, 0.2)', letterSpacing: '0.1em' }}>
                    <Zap size={14} fill="var(--accent-primary)" /> {isEditMode ? 'STUDIO MODE: EDITING' : 'STUDIO MODE: CREATION'}
                </div>
                <h1 className="title-gradient hero-title" style={{ marginBottom: '1rem', fontSize: '3.5rem' }}>
                    {isEditMode ? 'Refine Your Quiz' : 'Assemble a New Challenge'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
                    {isEditMode ? 'Update your content and keep the learning fresh' : 'Design an engaging experience for your students with our advanced quiz builder'}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 700px) 350px', gap: '2.5rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {/* Basic Info */}
                    <div className="glass-panel slide-up stagger-1" style={{ padding: '3rem', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(139, 92, 246, 0.2)' }}>
                                <FileText size={24} color="white" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Quiz Identity</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Define the core details of your challenge</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '0.1em' }}>QUIZ TITLE</label>
                                <input
                                    className="input-field hover-glow"
                                    placeholder="e.g. Master Class: Modern Architecture"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    style={{ fontSize: '1.1rem', padding: '1.25rem' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '0.1em' }}>DESCRIPTION & LEARNING OBJECTIVES</label>
                                <textarea
                                    className="input-field hover-glow"
                                    placeholder="What will your students master in this session?"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    rows={4}
                                    style={{ fontFamily: 'inherit', resize: 'none', padding: '1.25rem', fontSize: '1rem' }}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '0.1em' }}>SUBMISSION DEADLINE (OPTIONAL)</label>
                                <input
                                    type="datetime-local"
                                    className="input-field hover-glow"
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                    style={{ padding: '1.25rem' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Question Creator */}
                    <div className="glass-panel slide-up stagger-2" style={{ padding: '3rem', borderRadius: '24px', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, var(--accent-secondary), #0ea5e9)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(6, 182, 212, 0.2)' }}>
                                <Plus size={24} color="white" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Construct Question</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Craft a meaningful challenge for your scholars</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '0.1em' }}>QUESTION TEXT</label>
                                <input
                                    className="input-field hover-glow"
                                    placeholder="Enter your question here..."
                                    value={qText}
                                    onChange={e => setQText(e.target.value)}
                                    style={{ fontSize: '1.2rem', padding: '1.5rem', fontWeight: 600, borderBottom: '2px solid var(--accent-secondary)' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {qOptions.map((opt, idx) => (
                                    <div key={idx} className="hover-lift" style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.5rem',
                                        padding: '1.5rem',
                                        background: qCorrect === idx ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)',
                                        borderRadius: '20px',
                                        border: `2px solid ${qCorrect === idx ? 'var(--success)' : 'var(--glass-border)'}`,
                                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                        cursor: 'pointer'
                                    }} onClick={() => setQCorrect(idx)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: qCorrect === idx ? 'var(--success)' : 'var(--text-secondary)' }}>OPTION {String.fromCharCode(65 + idx)}</span>
                                            {qCorrect === idx && <div style={{ fontSize: '0.65rem', padding: '2px 8px', background: 'var(--success)', color: 'white', borderRadius: '10px', fontWeight: 800 }}>CORRECT</div>}
                                        </div>
                                        <input
                                            className="input-field"
                                            placeholder="Type option..."
                                            value={opt}
                                            onChange={e => handleOptionChange(idx, e.target.value)}
                                            onClick={e => e.stopPropagation()}
                                            style={{ border: 'none', background: 'transparent', padding: '0.5rem 0', fontSize: '1.1rem', fontWeight: 600, color: qCorrect === idx ? 'var(--text-primary)' : 'inherit' }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={addQuestion}
                                className="btn-secondary hover-lift"
                                disabled={!qText || qOptions.some(o => !o)}
                                style={{
                                    marginTop: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem',
                                    padding: '1.25rem',
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    opacity: (!qText || qOptions.some(o => !o)) ? 0.4 : 1,
                                    background: 'rgba(255,255,255,0.05)',
                                    color: 'var(--text-primary)'
                                }}
                            >
                                <Plus size={22} className="float" /> Add to Question Pool
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar: Question List & Summary */}
                <aside className="sidebar-sticky fade-in stagger-3">
                    <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Question Stack</h3>
                            <div style={{ padding: '0.4rem 0.8rem', background: 'var(--accent-primary)', borderRadius: '12px', fontSize: '1rem', fontWeight: 900, color: 'white', boxShadow: '0 4px 10px rgba(139, 92, 246, 0.3)' }}>
                                {questions.length}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.75rem', marginBottom: '2rem' }}>
                            {questions.map((q, idx) => (
                                <div key={idx} className="slide-up hover-lift" style={{
                                    padding: '1.25rem',
                                    background: 'rgba(255,255,255,0.03)',
                                    borderRadius: '16px',
                                    border: '1px solid var(--glass-border)',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'flex-start'
                                }}>
                                    <span style={{ color: 'var(--accent-primary)', fontWeight: 900, fontSize: '1.1rem', opacity: 0.5 }}>{String(idx + 1).padStart(2, '0')}</span>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.5, marginBottom: '0.5rem' }}>{q.text}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 800 }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }}></div>
                                            {q.options[q.correctOptionIndex].substring(0, 20)}...
                                        </div>
                                    </div>
                                    <button onClick={() => removeQuestion(idx)} className="hover-lift" style={{ color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '8px', border: 'none' }}>
                                        <Trash size={16} />
                                    </button>
                                </div>
                            ))}
                            {questions.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', border: '2px dashed var(--glass-border)', borderRadius: '20px' }}>
                                    Your pool is empty.<br />Start adding questions.
                                </div>
                            )}
                        </div>

                        <button
                            onClick={publishQuiz}
                            className="btn-primary hover-lift"
                            disabled={!title || questions.length === 0}
                            style={{
                                width: '100%',
                                opacity: (!title || questions.length === 0) ? 0.3 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                padding: '1.25rem',
                                fontSize: '1.1rem',
                                fontWeight: 800,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                boxShadow: '0 10px 25px rgba(139, 92, 246, 0.2)'
                            }}
                        >
                            {isEditMode ? (
                                <><Save size={22} className="float" /> Update Studio</>
                            ) : (
                                <><CheckCircle size={22} className="float" /> Launch Challenge</>
                            )}
                        </button>
                    </div>

                    <div className="glass-panel slide-up stagger-4" style={{ padding: '1.25rem', textAlign: 'center', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--success)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }}></div>
                            ASSEMBLY AUTO-SAVING
                        </div>
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
