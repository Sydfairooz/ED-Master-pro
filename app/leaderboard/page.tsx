'use client';

import { useEffect, useState } from 'react';
import { Medal, Trophy, User as UserIcon, Award, Target, Star, ChevronUp, ChevronDown } from 'lucide-react';

interface LeaderboardEntry {
    userId: string;
    userName: string;
    totalScore: number;
    gamesPlayed: number;
}

interface QuizWinner {
    quizId: string;
    quizTitle: string;
    winnerName: string;
    score: number;
    totalQuestions: number;
}

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [quizWinners, setQuizWinners] = useState<QuizWinner[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'points' | 'winner'>('points');
    const [allEnded, setAllEnded] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/leaderboard').then(res => res.ok ? res.json() : []),
            fetch('/api/quizzes').then(res => res.ok ? res.json() : [])
        ]).then(([data, quizzes]) => {
            setEntries(Array.isArray(data.global) ? data.global : []);
            setQuizWinners(Array.isArray(data.quizWinners) ? data.quizWinners : []);

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

    return (
        <div className="slide-up" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '6rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 className="title-gradient hero-title" style={{ marginBottom: '0.5rem' }}>
                    {viewMode === 'winner' ? 'Quiz Champions' : 'The Hall of Fame'}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                    {viewMode === 'winner' ? 'Celebrating the masters of every challenge' : 'Celebrating our top performers and academic champions'}
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
                        {allEnded ? 'Quiz Winners' : 'Quiz Leaders'}
                    </button>
                </div>
            </div>

            {viewMode === 'winner' ? (
                /* Quiz Winners View */
                <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {quizWinners.length > 0 ? (
                        quizWinners.map((winner, idx) => (
                            <div key={winner.quizId} className={`glass-panel hover-lift stagger-${(idx % 4) + 1}`} style={{
                                padding: '2rem',
                                border: '1px solid rgba(251, 191, 36, 0.2)',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1), transparent)', borderRadius: '50%' }}></div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'rgba(251, 191, 36, 0.1)', borderRadius: '12px' }}>
                                        <Trophy size={24} color="#fbbf24" fill="rgba(251, 191, 36, 0.2)" />
                                    </div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{winner.quizTitle}</h3>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                                        <UserIcon size={20} color="var(--text-secondary)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CHAMPION</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{winner.winnerName}</div>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem 1rem',
                                    background: 'rgba(251, 191, 36, 0.05)',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(251, 191, 36, 0.1)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fbbf24' }}>
                                        <Star size={16} fill="#fbbf24" />
                                        <span style={{ fontWeight: 800, fontSize: '1rem' }}>{winner.score} / {winner.totalQuestions}</span>
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SCORE</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="glass-panel" style={{ padding: '4rem', gridColumn: '1 / -1', textAlign: 'center' }}>
                            <p>No quiz winners recorded yet.</p>
                        </div>
                    )}
                </div>
            ) : (
                /* Point Table View */
                <>
                    {/* Top 3 Spotlight - The Grand Podium */}
                    {topThree.length > 0 && (
                        <div className="podium-grid" style={{ marginBottom: '5rem', perspective: '1000px' }}>
                            {/* Rank 2 - Silver Champion */}
                            {topThree[1] && (
                                <div className="glass-panel slide-up stagger-1 hover-lift podium-rank-2" style={{
                                    padding: '2.5rem 1.5rem',
                                    textAlign: 'center',
                                    height: 'auto',
                                    border: '1px solid rgba(148, 163, 184, 0.2)',
                                    background: 'linear-gradient(180deg, rgba(148, 163, 184, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                                    borderRadius: '24px'
                                }}>
                                    <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 1.5rem' }}>
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(148, 163, 184, 0.15)', borderRadius: '22px', transform: 'rotate(45deg)' }}></div>
                                        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <UserIcon size={35} color="#94a3b8" />
                                        </div>
                                        <div style={{ position: 'absolute', bottom: '-8px', right: '-8px', background: '#94a3b8', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, border: '4px solid var(--bg-primary)', zIndex: 2, fontSize: '0.9rem' }}>2</div>
                                    </div>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.2rem' }}>{topThree[1].userName}</h3>
                                    <div style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' }}>SILVER SCHOLAR</div>
                                    <div style={{ padding: '0.75rem', background: 'rgba(148, 163, 184, 0.1)', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Star size={16} fill="#94a3b8" color="#94a3b8" />
                                        <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#94a3b8' }}>{topThree[1].totalScore.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            {/* Rank 1 - Grand Champion */}
                            <div className="glass-panel scale-up hover-lift podium-rank-1" style={{
                                padding: '4rem 2rem',
                                textAlign: 'center',
                                border: '2px solid rgba(251, 191, 36, 0.4)',
                                boxShadow: '0 20px 50px rgba(251, 191, 36, 0.12)',
                                background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0.02) 100%)',
                                transform: 'translateZ(20px)',
                                borderRadius: '32px',
                                position: 'relative'
                            }}>
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#fbbf24', color: 'var(--bg-primary)', padding: '0.4rem 0.8rem', borderRadius: '10px', fontWeight: 900, fontSize: '0.7rem' }}>TOP RANK</div>
                                <Trophy size={40} color="#fbbf24" style={{ marginBottom: '1.5rem' }} fill="rgba(251, 191, 36, 0.2)" />
                                <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto 2rem' }}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(251, 191, 36, 0.2)', borderRadius: '28px', transform: 'rotate(45deg)', animation: 'spin-slow 10s linear infinite' }}></div>
                                    <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <UserIcon size={50} color="#fbbf24" />
                                    </div>
                                    <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: '#fbbf24', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, border: '5px solid var(--bg-primary)', zIndex: 2, fontSize: '1.2rem' }}>1</div>
                                </div>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.2rem', color: '#fbbf24' }}>{topThree[0].userName}</h3>
                                <div style={{ color: '#fbbf24', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.2em', opacity: 0.8 }}>ULTIMATE CHAMPION</div>
                                <div style={{ padding: '1rem 2rem', background: '#fbbf24', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: 'var(--bg-primary)', boxShadow: '0 8px 16px rgba(251, 191, 36, 0.3)' }}>
                                    <Star size={20} fill="var(--bg-primary)" />
                                    <span style={{ fontSize: '1.8rem', fontWeight: 900 }}>{topThree[0].totalScore.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Rank 3 - Bronze Champion */}
                            {topThree[2] && (
                                <div className="glass-panel slide-up stagger-2 hover-lift podium-rank-3" style={{
                                    padding: '2.5rem 1.5rem',
                                    textAlign: 'center',
                                    height: 'auto',
                                    border: '1px solid rgba(180, 83, 9, 0.2)',
                                    background: 'linear-gradient(180deg, rgba(180, 83, 9, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                                    borderRadius: '24px'
                                }}>
                                    <div style={{ position: 'relative', width: '70px', height: '70px', margin: '0 auto 1.5rem' }}>
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(180, 83, 9, 0.15)', borderRadius: '20px', transform: 'rotate(45deg)' }}></div>
                                        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <UserIcon size={30} color="#b45309" />
                                        </div>
                                        <div style={{ position: 'absolute', bottom: '-6px', right: '-6px', background: '#b45309', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, border: '3px solid var(--bg-primary)', zIndex: 2, fontSize: '0.8rem' }}>3</div>
                                    </div>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.2rem' }}>{topThree[2].userName}</h3>
                                    <div style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>BRONZE SCHOLAR</div>
                                    <div style={{ padding: '0.75rem', background: 'rgba(180, 83, 9, 0.1)', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Star size={14} fill="#b45309" color="#b45309" />
                                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#b45309' }}>{topThree[2].totalScore.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Rankings List - The Hall of Champions */}
                    {entries.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ padding: '0 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: '4px', height: '24px', background: 'var(--accent-primary)', borderRadius: '2px' }}></div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Global Leaderboard</h2>
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>{entries.length} ELITE STUDENTS</div>
                            </div>

                            {entries.map((entry, idx) => (
                                <div key={entry.userId} className={`glass-panel slide-up hover-lift stagger-${(idx % 4) + 1} leaderboard-item`} style={{
                                    background: idx === 0 ? 'linear-gradient(90deg, rgba(251, 191, 36, 0.1), transparent)' :
                                        idx === 1 ? 'linear-gradient(90deg, rgba(148, 163, 184, 0.1), transparent)' :
                                            idx === 2 ? 'linear-gradient(90deg, rgba(180, 83, 9, 0.1), transparent)' : 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s ease',
                                    padding: '1rem 2rem'
                                }}>
                                    <div style={{ width: '45px', fontSize: '1.5rem', fontWeight: 900, color: idx < 3 ? (idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : '#b45309') : 'var(--text-secondary)', opacity: 0.6 }}>{String(idx + 1).padStart(2, '0')}</div>
                                    <div className="leaderboard-item-content">
                                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)', position: 'relative' }}>
                                            <UserIcon size={24} color="var(--text-secondary)" />
                                            {idx < 3 && <div style={{ position: 'absolute', top: '-5px', left: '-5px' }}><Star size={14} fill={idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : '#b45309'} color="transparent" /></div>}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{entry.userName}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem', fontWeight: 600 }}>
                                                <Award size={14} color="var(--accent-primary)" /> {entry.gamesPlayed} QUIZZES COMPLETED
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: idx < 3 ? (idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : '#b45309') : 'var(--accent-primary)' }}>{entry.totalScore.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 800, letterSpacing: '0.15em' }}>TOTAL POINTS</div>
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

