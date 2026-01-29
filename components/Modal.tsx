'use client';

import { X, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title: string;
    message: string;
    type?: 'warning' | 'success' | 'confirm';
    confirmText?: string;
    cancelText?: string;
}

export default function Modal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'confirm',
    confirmText = 'Confirm',
    cancelText = 'Cancel'
}: ModalProps) {

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'warning': return <AlertCircle size={48} color="var(--error)" />;
            case 'success': return <CheckCircle size={48} color="var(--success)" />;
            default: return <HelpCircle size={48} color="var(--accent-primary)" />;
        }
    };

    return (
        <div className="fade-in" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }}>
            <div className="glass-panel fade-in" style={{
                maxWidth: '450px',
                width: '100%',
                padding: '2.5rem',
                textAlign: 'center',
                position: 'relative',
                border: type === 'warning' ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--glass-border)',
                boxShadow: type === 'warning' ? '0 0 40px rgba(239, 68, 68, 0.1)' : 'var(--glass-shadow)'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute',
                    top: '1.25rem',
                    right: '1.25rem',
                    background: 'transparent',
                    color: 'var(--text-secondary)'
                }}>
                    <X size={20} />
                </button>

                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    {getIcon()}
                </div>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontWeight: 700 }}>{title}</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem' }}>{message}</p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
                        {cancelText}
                    </button>
                    {onConfirm && (
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="btn-primary"
                            style={{
                                flex: 2,
                                background: type === 'warning' ? 'var(--error)' : 'var(--accent-primary)',
                                borderColor: type === 'warning' ? 'var(--error)' : 'var(--accent-primary)'
                            }}
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
