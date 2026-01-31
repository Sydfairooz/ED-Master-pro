'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, LayoutDashboard, Trophy, BookOpen, PlusCircle, Users, User as UserIcon, Menu, X } from 'lucide-react';

export default function Navbar() {
    const { user, logout, isLoading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav className="glass-panel" style={{
            margin: '0.5rem',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: '0.5rem',
            zIndex: 100
        }}>
            <Link href="/" onClick={closeMenu} style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 101 }}>
                <span className="title-gradient">ED Master</span>
            </Link>

            <div className="nav-links-desktop">
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

            {/* Mobile Menu Button - "Toggle Bar" style */}
            {!isLoading && (
                <button
                    className="nav-mobile-btn"
                    onClick={toggleMenu}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        color: 'white',
                        zIndex: 101,
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px',
                        border: '1px solid var(--glass-border)',
                        gap: '0.5rem'
                    }}
                >
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>{isMenuOpen ? 'CLOSE' : 'MENU'}</span>
                    {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            )}

            {/* Mobile Sidebar */}
            {isMenuOpen && (
                <div className="glass-panel" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100vh',
                    background: 'var(--bg-primary)',
                    padding: '6rem 2rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2rem',
                    zIndex: 100
                }}>
                    {!user ? (
                        <Link href="/login" onClick={closeMenu} style={{ fontSize: '1.25rem', fontWeight: 600 }}>Login</Link>
                    ) : (
                        <>
                            {/* User Info Mobile */}
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UserIcon size={20} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 600 }}>{user.name}</span>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{user.role}</span>
                                </div>
                            </div>

                            <Link href={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} onClick={closeMenu} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '1.1rem' }}>
                                <LayoutDashboard size={20} /> Dashboard
                            </Link>

                            {user.role === 'admin' && (
                                <>
                                    <Link href="/admin/create-quiz" onClick={closeMenu} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '1.1rem' }}>
                                        <PlusCircle size={20} /> Create Quiz
                                    </Link>
                                    <Link href="/admin/students" onClick={closeMenu} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '1.1rem' }}>
                                        <Users size={20} /> Students
                                    </Link>
                                </>
                            )}

                            <Link href="/leaderboard" onClick={closeMenu} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '1.1rem' }}>
                                <Trophy size={20} /> Leaderboard
                            </Link>

                            <button onClick={() => { logout(); closeMenu(); }} style={{ marginTop: 'auto', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '1.1rem', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <LogOut size={20} /> Logout
                            </button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
