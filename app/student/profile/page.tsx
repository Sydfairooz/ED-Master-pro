'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Award, Target, Zap, Clock, Calendar, Mail, Shield } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function StudentProfile() {
    const { user } = useAuth();
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetch(`/api/attempts/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    setAttempts(data);
                    setLoading(false);
                });
        }
    }, [user]);

    if (!user || loading) return <div className="fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>Loading personal workspace...</div>;

    const avgScore = attempts.length > 0
        ? (attempts.reduce((a, b) => a + b.score, 0) / attempts.length).toFixed(1)
        : 0;

    const chartData = [...attempts].reverse().map(a => ({
        name: a.quizTitle.substring(0, 10),
        score: a.score,
        total: a.totalQuestions
    }));

    return (
        <div className="fade-in">
            <div className="glass-panel" style={{ padding: '3rem', marginBottom: '3rem', display: 'flex', gap: '3rem', alignItems: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '30px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={60} color="var(--accent-primary)" />
                </div>
                <div style={{ flex: 1 }}>
                    <h1 className="title-gradient" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{user.name}</h1>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                            <Mail size={18} /> {user.email}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                            <Shield size={18} /> Student Member
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}><Award size={32} /></div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{attempts.length}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Total Challenges Finished</div>
                </div>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ color: 'var(--success)', marginBottom: '1rem' }}><Target size={32} /></div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{avgScore}</div>
                    <div style={{ color: 'var(--text-secondary)' }}>Overall Average Score</div>
                </div>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <div style={{ color: 'var(--accent-secondary)', marginBottom: '1rem' }}><Zap size={32} /></div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0}
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>Personal Best Score</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', alignItems: 'start' }}>
                {/* Score Chart */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '2rem' }}>Performance History</h3>
                    <div style={{ width: '100%', height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
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
                                <Area type="monotone" dataKey="score" stroke="var(--accent-primary)" fill="url(#scoreColor)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Score List */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '2rem' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {attempts.slice(0, 5).map((a) => (
                            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.25rem', borderBottom: '1px solid var(--glass-border)' }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>{a.quizTitle}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Calendar size={12} /> {new Date(a.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--success)' }}>
                                    {a.score} / {a.totalQuestions}
                                </div>
                            </div>
                        ))}
                        {attempts.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                                No attempts recorded yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
