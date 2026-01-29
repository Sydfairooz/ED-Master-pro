'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ChevronLeft, User as UserIcon, Award, Target, Zap, Clock, Calendar } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function StudentProfileAdmin({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [student, setStudent] = useState<any>(null);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            Promise.all([
                fetch(`/api/users`).then(res => res.json()),
                fetch(`/api/attempts/${id}`).then(res => res.json())
            ]).then(([users, attemptsData]) => {
                const foundUser = users.find((u: any) => u.id === id);
                setStudent(foundUser);
                setAttempts(attemptsData);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) return <div className="fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>Pulling performance records...</div>;
    if (!student) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Student not found.</div>;

    const avgScore = attempts.length > 0
        ? (attempts.reduce((a, b) => a + b.score, 0) / attempts.length).toFixed(1)
        : 0;

    const chartData = [...attempts].reverse().map(a => ({
        name: a.quizTitle.substring(0, 10),
        score: a.score,
        total: a.totalQuestions,
        fullTitle: a.quizTitle
    }));

    return (
        <div className="fade-in">
            <Link href="/admin/students" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                <ChevronLeft size={18} /> Back to Students
            </Link>

            <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2.5rem', display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '24px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserIcon size={50} color="var(--accent-primary)" />
                </div>
                <div style={{ flex: 1 }}>
                    <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{student.name}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{student.email} • Student ID: {student.id.substring(0, 8)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>ACCOUNT STATUS</div>
                    <span style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '20px',
                        background: student.status === 'banned' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: student.status === 'banned' ? 'var(--error)' : 'var(--success)',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        border: `1px solid ${student.status === 'banned' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                    }}>
                        {student.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--accent-primary)', marginBottom: '0.75rem' }}><Award size={24} /></div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{attempts.length}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Quizzes Taken</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--success)', marginBottom: '0.75rem' }}><Target size={24} /></div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{avgScore}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg. Points</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ color: 'var(--accent-secondary)', marginBottom: '0.75rem' }}><Zap size={24} /></div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Highest Score</div>
                </div>
            </div>

            {/* Progress Chart */}
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
                <h3 style={{ marginBottom: '2rem' }}>Score Progression</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                                itemStyle={{ color: 'var(--accent-primary)' }}
                            />
                            <Area type="monotone" dataKey="score" stroke="var(--accent-primary)" fill="url(#scoreGrad)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>Individual Performance Breakdown</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
                            <th style={{ padding: '1rem 1.5rem' }}>Quiz Title</th>
                            <th style={{ padding: '1rem 1.5rem' }}>Completion Date</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>Final Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attempts.map((attempt) => (
                            <tr key={attempt.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ fontWeight: 600 }}>{attempt.quizTitle}</div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Calendar size={14} /> {new Date(attempt.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                    <span style={{
                                        padding: '0.4rem 0.75rem',
                                        borderRadius: '8px',
                                        background: 'rgba(16, 185, 129, 0.1)',
                                        color: 'var(--success)',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem'
                                    }}>
                                        {attempt.score} / {attempt.totalQuestions}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {attempts.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        This student hasn't completed any quizzes yet.
                    </div>
                )}
            </div>
        </div>
    );
}
