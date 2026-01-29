'use client';

import { useEffect, useState } from 'react';
import { Medal, Trophy, User as UserIcon, Award, Target, Star, ChevronUp, ChevronDown } from 'lucide-react';

interface LeaderboardEntry {
    userId: string;
    userName: string;
    totalScore: number;
    gamesPlayed: number;
}

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'points' | 'winner'>('points');
    const [allEnded, setAllEnded] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/leaderboard').then(res => res.ok ? res.json() : []),
            fetch('/api/quizzes').then(res => res.ok ? res.json() : [])
        ]).then(([data, quizzes]) => {
            setEntries(Array.isArray(data) ? data : []);

            // If all quizzes are ended, default to winner view
            const hasActive = quizzes.some((q: any) => !q.isEnded);
            if (!hasActive && quizzes.length > 0) {
                setAllEnded(true);
                setViewMode('winner');
            }

            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div className="loader" style={{ marginBottom: '1rem' }}></div>
            <p style={{ color: 'var(--text-secondary)' }}>Gathering elite performance data...</p>
        </div>
    );

    const topThree = entries.slice(0, 3);
    const winner = entries[0];

    return (
        <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '6rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="title-gradient" style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>
                    {viewMode === 'winner' ? 'Tournament Winner' : 'The Hall of Fame'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    {viewMode === 'winner' ? 'Victory is claimed by the ultimate scholar' : 'Celebrating our top performers and academic champions'}
                </p>

                {/* View Switcher */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem' }}>
                    <button
                        onClick={() => setViewMode('points')}
                        className={viewMode === 'points' ? 'btn-primary' : 'btn-secondary'}
                        style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
                    >
                        Point Table
                    </button>
                    <button
                        onClick={() => setViewMode('winner')}
                        className={viewMode === 'winner' ? 'btn-primary' : 'btn-secondary'}
                        style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }}
                    >
                        {allEnded ? 'Final Winner' : 'Current Leader'}
                    </button>
                </div>
            </div>

            {viewMode === 'winner' ? (
                /* Winner View */
                <div className="fade-in" style={{ textAlign: 'center' }}>
                    {winner ? (
                        <div className="glass-panel" style={{
                            padding: '4rem 2rem',
                            maxWidth: '500px',
                            margin: '0 auto',
                            border: '2px solid rgba(251, 191, 36, 0.4)',
                            boxShadow: '0 0 50px rgba(251, 191, 36, 0.15)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(251, 191, 36, 0.2), transparent)', borderRadius: '50%' }}></div>

                            <Trophy size={80} color="#fbbf24" style={{ marginBottom: '2rem' }} fill="rgba(251, 191, 36, 0.2)" />

                            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 2rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fbbf24' }}>
                                <UserIcon size={60} color="#fbbf24" />
                                <div style={{ position: 'absolute', top: '-15px', right: '-15px', background: '#fbbf24', color: 'var(--bg-primary)', padding: '0.4rem 0.8rem', borderRadius: '12px', fontWeight: 900, fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                                    CHAMPION
                                </div>
                            </div>

                            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{winner.userName}</h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                <Target size={18} /> {winner.gamesPlayed} Quizzes Mastered
                            </div>

                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem 2.5rem',
                                background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                                borderRadius: '16px',
                                color: 'var(--bg-primary)',
                                fontWeight: 900,
                                fontSize: '1.8rem',
                                boxShadow: '0 10px 20px rgba(245, 158, 11, 0.2)'
                            }}>
                                <Star size={24} fill="var(--bg-primary)" /> {winner.totalScore.toLocaleString()}
                            </div>

                            <div style={{ marginTop: '3rem', fontSize: '0.9rem', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>
                                TOTAL ACADEMIC SCORE
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel" style={{ padding: '4rem' }}>
                            <p>No champions recorded yet.</p>
                        </div>
                    )}
                </div>
            ) : (
                /* Point Table View */
                <>
                    {/* Top 3 Spotlight */}
                    {topThree.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '4rem', alignItems: 'flex-end' }}>
                            {/* Rank 2 */}
                            {topThree[1] && (
                                <div className="glass-panel fade-in" style={{ padding: '2rem', textAlign: 'center', height: '260px', order: 1 }}>
                                    <div style={{ position: 'relative', width: '70px', height: '70px', margin: '0 auto 1.5rem', background: 'rgba(148, 163, 184, 0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <UserIcon size={35} color="#94a3b8" />
                                        <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#94a3b8', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '3px solid var(--bg-primary)' }}>2</div>
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{topThree[1].userName}</h3>
                                    <div style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{topThree[1].gamesPlayed} Quizzes Taken</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#94a3b8' }}>{topThree[1].totalScore} PTS</div>
                                </div>
                            )}

                            {/* Rank 1 */}
                            <div className="glass-panel fade-in" style={{
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                height: '320px',
                                order: 2,
                                border: '2px solid rgba(251, 191, 36, 0.3)',
                                boxShadow: '0 0 30px rgba(251, 191, 36, 0.1)'
                            }}>
                                <Star size={24} color="#fbbf24" style={{ marginBottom: '1rem' }} fill="#fbbf24" />
                                <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 1.5rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UserIcon size={45} color="#fbbf24" />
                                    <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#fbbf24', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '3px solid var(--bg-primary)' }}>1</div>
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{topThree[0].userName}</h3>
                                <div style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem' }}>{topThree[0].gamesPlayed} Quizzes Taken</div>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fbbf24' }}>{topThree[0].totalScore} PTS</div>
                            </div>

                            {/* Rank 3 */}
                            {topThree[2] && (
                                <div className="glass-panel fade-in" style={{ padding: '2rem', textAlign: 'center', height: '240px', order: 3 }}>
                                    <div style={{ position: 'relative', width: '60px', height: '60px', margin: '0 auto 1.5rem', background: 'rgba(180, 83, 9, 0.1)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <UserIcon size={30} color="#b45309" />
                                        <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', background: '#b45309', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', border: '2px solid var(--bg-primary)' }}>3</div>
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{topThree[2].userName}</h3>
                                    <div style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>{topThree[2].gamesPlayed} Quizzes Taken</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#b45309' }}>{topThree[2].totalScore} PTS</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Rankings List */}
                    {entries.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <Trophy size={18} color="var(--accent-primary)" />
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Global Rankings</h2>
                            </div>

                            {entries.map((entry, idx) => (
                                <div key={entry.userId} className="glass-panel fade-in" style={{
                                    padding: '1.25rem 2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2rem',
                                    animationDelay: `${idx * 0.05}s`,
                                    background: idx < 3 ? 'rgba(139, 92, 246, 0.03)' : 'var(--glass-bg)',
                                    border: idx < 3 ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid var(--glass-border)'
                                }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: idx < 3 ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', color: idx < 3 ? 'var(--accent-primary)' : 'var(--text-secondary)', flexShrink: 0 }}>{idx + 1}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}><UserIcon size={24} color="var(--text-secondary)" /></div>
                                        <div><div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.2rem' }}>{entry.userName}</div><div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}><Award size={14} /> {entry.gamesPlayed} Quizzes Completed</div></div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 1.25rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: 'var(--accent-primary)', fontWeight: 800, fontSize: '1.1rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}><Star size={18} fill="var(--accent-primary)" /> {entry.totalScore.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.4rem', fontWeight: 600, letterSpacing: '0.05em' }}>TOTAL POINTS</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-panel" style={{ padding: '5rem', textAlign: 'center' }}>
                            <Medal size={48} color="var(--text-secondary)" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>The Arena is Empty</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Be the first champion to take a quiz and claim your throne!</p>
                            <button className="btn-primary" onClick={() => window.location.href = '/student/dashboard'}>Start Your First Challenge</button>
                        </div>
                    )}
                </>
            )}

        </div>
    );
}

