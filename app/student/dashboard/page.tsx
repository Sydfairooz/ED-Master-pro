'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Quiz } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { PlayCircle, Award, Clock } from 'lucide-react';

export default function StudentDashboard() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [myAttempts, setMyAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        Promise.all([
            fetch('/api/quizzes').then(res => res.ok ? res.json() : []),
            fetch(`/api/attempts/${user.id}`).then(res => res.ok ? res.json() : [])
        ]).then(([quizzesData, attemptsData]) => {
            setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
            setMyAttempts(Array.isArray(attemptsData) ? attemptsData : []);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });

    }, [user]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading...</div>;

    return (
        <div>
            <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Welcome, {user?.name}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={24} color="var(--accent-secondary)" /> Quiz Bank
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {quizzes.map(quiz => {
                            const isAttempted = myAttempts.some(a => a.quizId === quiz.id);
                            const isEnded = quiz.isEnded || (quiz.endTime && new Date(quiz.endTime) <= new Date());

                            return (
                                <div key={quiz.id} className="glass-panel" style={{
                                    padding: '2rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    transition: 'all 0.3s',
                                    opacity: isEnded && !isAttempted ? 0.7 : 1,
                                    border: isEnded && !isAttempted ? '1px solid rgba(239, 68, 68, 0.1)' : '1px solid var(--glass-border)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <h3 style={{ fontSize: '1.5rem', color: isEnded && !isAttempted ? 'var(--text-secondary)' : 'var(--accent-primary)' }}>{quiz.title}</h3>
                                        {isEnded ? (
                                            !isAttempted && (
                                                <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                                    MISSED
                                                </div>
                                            )
                                        ) : (
                                            quiz.endTime && (
                                                <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                                    ENDS SOON
                                                </div>
                                            )
                                        )}
                                    </div>
                                    <p style={{ color: 'var(--text-secondary)', flex: 1 }}>{quiz.description}</p>

                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={14} /> {isEnded ? 'Tournament Closed' : (quiz.endTime ? `Deadline: ${new Date(quiz.endTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}` : 'No Deadline')}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{quiz.questions.length} Questions</span>
                                        {isAttempted ? (
                                            <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                Completed <Award size={16} />
                                            </span>
                                        ) : isEnded ? (
                                            <span style={{ color: 'var(--error)', fontWeight: 600, fontSize: '0.9rem', opacity: 0.8 }}>
                                                Not Completed
                                            </span>
                                        ) : (
                                            <Link href={`/student/quiz/${quiz.id}`} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                Start <PlayCircle size={16} />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {quizzes.length === 0 && (
                            <div className="glass-panel" style={{ padding: '3rem', gridColumn: '1 / -1', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-secondary)' }}>No quizzes available at the moment.</p>
                            </div>
                        )}
                    </div>
                </section>

                <section>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Award size={24} color="var(--success)" /> My Recent Scores
                    </h2>
                    <div className="glass-panel" style={{ overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)' }}>
                                    <th style={{ padding: '1rem' }}>Quiz</th>
                                    <th style={{ padding: '1rem' }}>Date & Time</th>
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myAttempts.map((attempt) => (
                                    <tr key={attempt.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                        <td style={{ padding: '1rem' }}>{attempt.quizTitle}</td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                                            {new Date(attempt.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--success)' }}>
                                            {attempt.score} / {attempt.totalQuestions}
                                        </td>
                                    </tr>
                                ))}
                                {myAttempts.length === 0 && (
                                    <tr>
                                        <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            You haven't taken any quizzes yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

            </div>
        </div>
    );
}
