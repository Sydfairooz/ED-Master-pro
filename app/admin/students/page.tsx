'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Users, ShieldAlert, ShieldCheck, User as UserIcon, Award, Search, Ban, UserCheck } from 'lucide-react';
import Modal from '@/components/Modal';
import Link from 'next/link';

export default function StudentsManagement() {
    const [students, setStudents] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const { user: admin } = useAuth();

    // Modal State
    const [modalInfo, setModalInfo] = useState<{ isOpen: boolean, userId: string, currentStatus: string } | null>(null);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const res = await fetch('/api/users');
        const data = await res.json();
        // Filter only students
        setStudents(data.filter((u: any) => u.role === 'student'));
        setLoading(false);
    };

    const toggleBan = (userId: string, currentStatus: string) => {
        setModalInfo({ isOpen: true, userId, currentStatus });
    };

    const confirmToggleBan = async () => {
        if (!admin || !modalInfo) return;
        const { userId, currentStatus } = modalInfo;
        const newStatus = currentStatus === 'banned' ? 'active' : 'banned';

        const res = await fetch('/api/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, status: newStatus, adminId: admin.id })
        });

        if (res.ok) {
            fetchUsers();
            setIsSuccessOpen(true);
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>Managing Student Data...</div>;

    return (
        <div className="fade-in">
            <div className="header-responsive">
                <div>
                    <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Student Management</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Review profiles, monitor performance, and manage access</p>
                </div>
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
                    <input
                        className="input-field"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: '3rem', width: '100%' }}
                    />
                </div>
            </div>

            <div className="quiz-card-grid">
                {filteredStudents.map(student => (
                    <div key={student.id} className="glass-panel" style={{ padding: '1.5rem', transition: 'all 0.3s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '16px',
                                background: student.status === 'banned' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <UserIcon color={student.status === 'banned' ? 'var(--error)' : 'var(--accent-primary)'} size={32} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{student.name}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{student.email}</p>
                            </div>
                            {student.status === 'banned' && (
                                <div title="Banned" style={{ padding: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                                    <ShieldAlert size={18} color="var(--error)" />
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>STATUS</div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: student.status === 'banned' ? 'var(--error)' : 'var(--success)' }}>
                                    {student.status?.toUpperCase() || 'ACTIVE'}
                                </div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '10px', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>JOINED</div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    {new Date().toLocaleDateString([], { month: 'short', year: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Link
                                href={`/admin/students/${student.id}`}
                                className="btn-secondary"
                                style={{ flex: 1, textAlign: 'center', padding: '0.6rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            >
                                <Award size={16} /> Performance
                            </Link>
                            <button
                                onClick={() => toggleBan(student.id, student.status || 'active')}
                                style={{
                                    padding: '0.6rem 1rem',
                                    borderRadius: '8px',
                                    background: student.status === 'banned' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: student.status === 'banned' ? 'var(--success)' : 'var(--error)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    border: `1px solid ${student.status === 'banned' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                }}
                                title={student.status === 'banned' ? "Restore Student" : "Ban Student"}
                            >
                                {student.status === 'banned' ? <UserCheck size={18} /> : <Ban size={18} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {filteredStudents.length === 0 && (
                <div style={{ textAlign: 'center', padding: '5rem' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>No students found matching your search.</p>
                </div>
            )}

            <Modal
                isOpen={!!modalInfo?.isOpen}
                onClose={() => setModalInfo(null)}
                onConfirm={confirmToggleBan}
                title={modalInfo?.currentStatus === 'banned' ? "Restore Access?" : "Restrict Student Access?"}
                message={modalInfo?.currentStatus === 'banned'
                    ? "This student will be able to take quizzes and view the leaderboard again."
                    : "This student will be immediately logged out and blocked from taking any quizzes."}
                type={modalInfo?.currentStatus === 'banned' ? "confirm" : "warning"}
                confirmText={modalInfo?.currentStatus === 'banned' ? "Restore Now" : "Ban Student"}
                cancelText="Keep Current"
            />

            <Modal
                isOpen={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                onConfirm={() => setIsSuccessOpen(false)}
                title="Action Successful"
                message="The student's status has been updated. The changes are now live across the platform."
                type="success"
                confirmText="Continue"
            />
        </div>
    );
}
