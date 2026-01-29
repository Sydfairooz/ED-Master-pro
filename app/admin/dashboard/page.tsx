'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, Users, BarChart3, ChevronRight, FileText, Edit, Timer, Square, Clock } from 'lucide-react';
import { Quiz, Attempt } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/Modal';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    AreaChart,
    Area
} from 'recharts';

export default function AdminDashboard() {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

    useEffect(() => {
        Promise.all([
            fetch('/api/quizzes').then(res => res.json()),
            fetch('/api/attempts').then(res => {
                // We need an endpoint to get ALL attempts for admin
                // Let's assume we can fetch all from /api/attempts mapping to db.getAttempts()
                return res.ok ? res.json() : [];
            })
        ]).then(([quizzesData, attemptsData]) => {
            setQuizzes(quizzesData);
            setAttempts(attemptsData);
            setLoading(false);
        });
    }, []);

    if (loading) return <div className="fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Admin Panel...</div>;

    // Helper to get participants for a quiz
    const getQuizParticipants = (quizId: string) => {
        return attempts.filter(a => a.quizId === quizId);
    };

    const handleEndQuiz = (quizId: string) => {
        setSelectedQuizId(quizId);
        setIsModalOpen(true);
    };

    const confirmEndQuiz = async () => {
        if (!selectedQuizId || !user) return;

        try {
            const res = await fetch(`/api/quizzes/${selectedQuizId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isEnded: true, createdBy: user.id })
            });

            if (res.ok) {
                const updatedQuiz = await res.json();
                // Optimistically update the list
                setQuizzes(prev => prev.map(q => q.id === selectedQuizId ? { ...q, ...updatedQuiz } : q));
                setIsSuccessOpen(true);
            } else {
                const errorData = await res.json();
                alert(`Failed to end quiz: ${errorData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Failed to end quiz', err);
            alert('A network error occurred while ending the quiz.');
        }
    };

    const isQuizEnded = (quiz: Quiz) => quiz.isEnded || (quiz.endTime && new Date(quiz.endTime) <= new Date());

    // Data for Graphs
    const chartData = quizzes.map(quiz => {
        const quizAttempts = attempts.filter(a => a.quizId === quiz.id);
        const avgScore = quizAttempts.length > 0
            ? (quizAttempts.reduce((acc, curr) => acc + curr.score, 0) / quizAttempts.length).toFixed(1)
            : 0;

        return {
            name: quiz.title.length > 15 ? quiz.title.substring(0, 15) + '...' : quiz.title,
            participants: quizAttempts.length,
            averageScore: parseFloat(avgScore.toString()),
            fullTitle: quiz.title
        };
    });

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Admin Console</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage your educational content and track performance</p>
                </div>
                <Link href="/admin/create-quiz" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PlusCircle size={20} /> Create New Quiz
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px' }}>
                        <FileText color="var(--accent-primary)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{quizzes.length}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Quizzes</div>
                    </div>
                </div>
                <Link href="/admin/students" className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)', transition: 'all 0.3s' }}>
                    <div style={{ padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '12px' }}>
                        <Users color="var(--accent-secondary)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{Array.from(new Set(attempts.map(a => a.userId))).length}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Active Students</div>
                    </div>
                </Link>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                        <BarChart3 color="var(--success)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                            {attempts.length > 0 ? (attempts.reduce((a, b) => a + b.score, 0) / attempts.length).toFixed(1) : 0}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg. System Score</div>
                    </div>
                </div>
            </div>

            {/* Performance Graph */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart3 size={20} color="var(--accent-primary)" /> Participation Analytics
                    </h3>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Students per Quiz</div>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)'
                                }}
                                itemStyle={{ color: 'var(--accent-primary)' }}
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            />
                            <Bar dataKey="participants" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--accent-primary)' : 'var(--accent-secondary)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            {/* Submissions Over Time Graph */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} color="var(--accent-secondary)" /> Activity Trends
                    </h3>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Daily Submissions</div>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={(() => {
                            const dailyData: Record<string, number> = {};
                            const last7Days = Array.from({ length: 7 }, (_, i) => {
                                const d = new Date();
                                d.setDate(d.getDate() - i);
                                return d.toISOString().split('T')[0];
                            }).reverse();

                            last7Days.forEach(date => dailyData[date] = 0);

                            attempts.forEach(a => {
                                try {
                                    const dateStr = a.timestamp;
                                    if (dateStr) {
                                        const d = new Date(dateStr);
                                        if (!isNaN(d.getTime())) {
                                            const date = d.toISOString().split('T')[0];
                                            if (dailyData[date] !== undefined) {
                                                dailyData[date]++;
                                            }
                                        }
                                    }
                                } catch (e) {
                                    console.error("Invalid date found in attempt:", a);
                                }
                            });


                            return Object.keys(dailyData).map(date => ({
                                date: new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
                                count: dailyData[date]
                            }));
                        })()}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent-secondary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="var(--accent-secondary)"
                                fillOpacity={1}
                                fill="url(#colorCount)"
                                strokeWidth={3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>


            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Active Quizzes & Participation</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {quizzes.map(quiz => {
                    const quizAttempts = getQuizParticipants(quiz.id);
                    return (
                        <div key={quiz.id} className="glass-panel" style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                        <h3 style={{ fontSize: '1.25rem' }}>{quiz.title}</h3>
                                        <span style={{
                                            padding: '0.2rem 0.6rem',
                                            background: isQuizEnded(quiz) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                            color: isQuizEnded(quiz) ? 'var(--error)' : 'var(--success)',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            border: `1px solid ${isQuizEnded(quiz) ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                                        }}>
                                            {isQuizEnded(quiz) ? 'NON ACTIVE' : 'ACTIVE'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Timer size={14} /> {quiz.endTime ? new Date(quiz.endTime).toLocaleString() : 'No Schedule Set'} • {quiz.questions.length} Questions
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                                    {!isQuizEnded(quiz) && (
                                        <button
                                            onClick={() => handleEndQuiz(quiz.id)}
                                            className="btn-secondary"
                                            style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        >
                                            <Square size={16} fill="var(--error)" /> End Quiz
                                        </button>
                                    )}
                                    <Link
                                        href={`/admin/create-quiz?edit=${quiz.id}`}
                                        className="btn-secondary"
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <Edit size={16} /> Edit
                                    </Link>
                                </div>
                            </div>

                            {quizAttempts.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--glass-border)' }}>
                                            <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Student Name</th>
                                            <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Date & Time</th>
                                            <th style={{ padding: '0.75rem 1.5rem', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right' }}>Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quizAttempts.map(attempt => (
                                            <tr key={attempt.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                <td style={{ padding: '1rem 1.5rem' }}>{attempt.userName || 'Anonymous'}</td>
                                                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                                                    {new Date(attempt.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </td>
                                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--success)' }}>
                                                    {attempt.score} / {quiz.questions.length}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                    No one has taken this quiz yet.
                                </div>
                            )}
                        </div>
                    );
                })}

                {quizzes.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You haven't created any quizzes yet.</p>
                        <Link href="/admin/create-quiz" className="btn-secondary">Create Your First Quiz</Link>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmEndQuiz}
                title="End Tournament Now?"
                message="This will immediately stop all submissions and lock the quiz for all students. This action is permanent."
                type="warning"
                confirmText="Terminate Quiz"
                cancelText="Keep Active"
            />

            <Modal
                isOpen={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                onConfirm={() => setIsSuccessOpen(false)}
                title="Tournament Terminated"
                message="The quiz has been successfully ended. Students can no longer submit new attempts, and winners are now finalized on the leaderboard."
                type="success"
                confirmText="Perfect"
            />
        </div>
    );
}

