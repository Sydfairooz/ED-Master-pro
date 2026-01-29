'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, LayoutDashboard, Trophy, BookOpen, PlusCircle, Users, User as UserIcon } from 'lucide-react';

export default function Navbar() {
    const { user, logout, isLoading } = useAuth();

    return (
        <nav className="glass-panel" style={{ margin: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '1rem', zIndex: 50 }}>
            <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="title-gradient">ED Master</span>
            </Link>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                {isLoading ? (
                    <div className="loader"></div>
                ) : (
                    <>
                        {!user ? (
                            <Link href="/login" style={{ fontWeight: 500 }}>Login</Link>
                        ) : (
                            <>
                                <Link href={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <LayoutDashboard size={18} /> Dashboard
                                </Link>

                                {user.role === 'admin' && (
                                    <>
                                        <Link href="/admin/create-quiz" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <PlusCircle size={18} /> Create Quiz
                                        </Link>
                                        <Link href="/admin/students" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <Users size={18} /> Students
                                        </Link>
                                    </>
                                )}

                                {user.role === 'student' && (
                                    <Link href="/student/profile" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <UserIcon size={18} /> My Profile
                                    </Link>
                                )}

                                <Link href="/leaderboard" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Trophy size={18} /> Leaderboard
                                </Link>

                                <button onClick={logout} style={{ background: 'transparent', color: 'var(--error)', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '1rem' }}>
                                    <LogOut size={18} /> Logout
                                </button>


                                <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }}></div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user.role}</span>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </nav>

    );
}
