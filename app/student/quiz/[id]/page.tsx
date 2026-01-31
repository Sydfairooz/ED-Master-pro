'use client';

import { useEffect, useState } from 'react';
import { Quiz } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { Target, Zap, Clock, Share2, Instagram, MessageCircle, CheckCircle2, Download, X, Trophy, ArrowRight, ChevronLeft } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function TakeQuizPage() {
    const params = useParams();
    const id = params.id as string;
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPoster, setShowPoster] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    // Time tracking
    const [startTime] = useState<number>(() => Date.now());
    const [endTime, setEndTime] = useState<number | null>(null);

    useEffect(() => {
        if (id && user) {
            // Check if already attempted
            fetch(`/api/attempts/${user.id}`)
                .then(res => res.json())
                .then(attempts => {
                    if (attempts.some((a: any) => a.quizId === id)) {
                        router.push('/student/dashboard');
                    }
                });

            fetch(`/api/quizzes/${id}`)
                .then(res => res.json())
                .then(data => {
                    // Check if quiz is ended
                    const isEnded = data.isEnded || (data.endTime && new Date(data.endTime) <= new Date());
                    if (isEnded) {
                        router.push('/student/dashboard');
                    } else {
                        setQuiz(data);
                        // Optional: Set a timer if quiz has time limit or just track time
                    }
                });
        }
    }, [id, user, router]);

    // Timer effect
    useEffect(() => {
        if (!isFinished) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev + 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isFinished]);


    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isFinished || showExitModal) return;

            if (e.key >= '1' && e.key <= '4') {
                const idx = parseInt(e.key) - 1;
                if (quiz && quiz.questions[currentQuestion].options[idx]) {
                    setSelectedOption(idx);
                }
            } else if (e.key === 'Enter' && selectedOption !== null) {
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFinished, showExitModal, currentQuestion, selectedOption, quiz]);

    const handleNext = () => {
        if (!quiz || selectedOption === null) return;

        if (selectedOption === quiz.questions[currentQuestion].correctOptionIndex) {
            setScore(s => s + 1);
        }

        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(c => c + 1);
            setSelectedOption(null);
        } else {
            finishQuiz();
        }
    };

    const [attemptNumber, setAttemptNumber] = useState(1);

    const finishQuiz = async () => {
        const finalEndTime = Date.now();
        setEndTime(finalEndTime);

        // Calculate final score logic
        let finalScore = score;
        if (quiz && selectedOption === quiz.questions[currentQuestion].correctOptionIndex) {
            finalScore += 1;
        }
        setScore(finalScore);
        setIsFinished(true);

        if (user && quiz) {
            await fetch('/api/attempts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    quizId: quiz.id,
                    score: finalScore,
                    totalQuestions: quiz.questions.length
                })
            });

            // Fetch updated attempts to determine current attempt number
            try {
                const res = await fetch(`/api/attempts/${user.id}`);
                if (res.ok) {
                    const attempts = await res.json();
                    // filter attempts for this quiz
                    const thisQuizAttempts = attempts.filter((a: any) => a.quizId === quiz.id);
                    setAttemptNumber(thisQuizAttempts.length);
                }
            } catch (err) {
                console.error("Failed to fetch attempts", err);
            }
        }
    };

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m < 10 ? '0' + m : m}m ${s < 10 ? '0' + s : s}s`;
    };

    const shareOnWhatsApp = async () => {
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(document.getElementById('share-poster')!);
            const image = canvas.toDataURL('image/png');
            const blob = await (await fetch(image)).blob();
            const file = new File([blob], 'quiz-result.png', { type: 'image/png' });

            const text = `I just scored ${score}/${quiz?.questions.length} in the ${quiz?.title} quiz! 🎯 Check it out!`;

            if (navigator.share) {
                await navigator.share({
                    files: [file],
                    title: 'My Quiz Achievement',
                    text: text,
                });
            } else {
                const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const shareOnInstagram = async () => {
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(document.getElementById('share-poster')!);
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = 'my-quiz-achievement.png';
            link.click();
            alert('Poster downloaded! You can now upload it to your Instagram Story.');
        } catch (err) {
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!quiz) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading Quiz...</div>;

    if (isFinished) {
        const totalQuestions = quiz.questions.length;
        const correct = score;
        const wrong = totalQuestions - correct;
        const percentage = Math.round((correct / totalQuestions) * 100);

        const totalTimeMs = (endTime || Date.now()) - startTime;
        const timePerQuestionMs = totalTimeMs / totalQuestions;
        const secondsPerQuestion = Math.round(timePerQuestionMs / 1000);

        // Chart calculations
        // We use conic-gradient for the donut chart
        // Green starts at 0, ends at percentage
        // Gray/Red starts at percentage, ends at 100%

        return (
            <div className="fade-in" style={{ paddingBottom: '4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 className="title-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Quiz Results</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Here is how you performed in {quiz.title}</p>
                </div>

                <div className="results-grid">
                    {/* Overview Card */}
                    <div className="glass-panel results-card">
                        <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                            <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                background: `conic-gradient(var(--success) 0% ${percentage}%, var(--error) ${percentage}% 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '12px',
                                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'var(--bg-secondary)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--success)' }}>{percentage}%</span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Score</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{correct}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Correct</div>
                            </div>
                            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--error)' }}>{wrong}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Wrong</div>
                            </div>
                        </div>
                    </div>

                    {/* Analytics Card */}
                    <div className="glass-panel results-card" style={{ display: 'block' }}>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Target size={24} color="var(--accent-primary)" /> Performance
                            </h3>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Zap size={20} color="#f59e0b" fill="#f59e0b" />
                                    </div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Avg. Time</span>
                                </div>
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{secondsPerQuestion}s/q</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Clock size={20} color="#3b82f6" />
                                    </div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Total Duration</span>
                                </div>
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{formatTime(totalTimeMs)}</span>
                            </div>

                            <div style={{ marginTop: 'auto' }}>
                                <button onClick={() => router.push('/student/dashboard')} className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Share Card */}
                <div className="glass-panel slide-up share-card" style={{ animationDelay: '0.2s' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Proud of your score?</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Share your achievement as a poster!</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setShowPoster(true)}
                            className="btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem' }}
                        >
                            <Share2 size={18} /> View Poster
                        </button>
                    </div>
                </div>

                {/* Poster Modal */}
                {showPoster && (
                    <div className="scale-up" style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.85)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem'
                    }}>
                        <div className="glass-panel" style={{ maxWidth: '450px', width: '100%', padding: '2rem', position: 'relative' }}>
                            <button
                                onClick={() => setShowPoster(false)}
                                style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', color: 'var(--text-secondary)' }}
                            >
                                <X size={24} />
                            </button>

                            {/* Hidden poster for capture */}
                            <div id="share-poster" style={{
                                width: '400px',
                                height: '600px',
                                background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
                                borderRadius: '24px',
                                padding: '3rem 2rem',
                                color: 'white',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                border: '2px solid rgba(139, 92, 246, 0.3)',
                                position: 'absolute',
                                left: '-10000px', // Hide from view
                                top: 0
                            }}>
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    background: 'rgba(139, 92, 246, 0.1)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '2rem',
                                    border: '2px solid #8b5cf6'
                                }}>
                                    <Trophy size={50} color="#8b5cf6" fill="rgba(139, 92, 246, 0.2)" />
                                </div>

                                <h2 style={{ fontSize: '1.2rem', color: '#8b5cf6', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>QUIZ ACHIEVEMENT</h2>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem' }}>{user?.name}</h1>

                                <div style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '2rem',
                                    borderRadius: '20px',
                                    width: '100%',
                                    marginBottom: '2rem',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>QUIZ COMPLETED</div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem', color: '#f8fafc' }}>{quiz.title}</div>

                                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '0.5rem' }}>FINAL SCORE</div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#10b981' }}>{score}/{quiz.questions.length}</div>
                                </div>

                                <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', width: '100%' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#8b5cf6' }}>ED-Master Pro</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Challenging minds, mastering goals</div>
                                </div>
                            </div>

                            {/* Preview (Simplified version for modal) */}
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '1/1',
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1))',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '2rem',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>{user?.name}</h4>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>{score}/{quiz.questions.length}</div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Score in {quiz.title}</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button
                                    onClick={shareOnWhatsApp}
                                    disabled={isGenerating}
                                    style={{
                                        padding: '0.8rem',
                                        borderRadius: '12px',
                                        background: '#22c55e',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.9rem',
                                        fontWeight: 600
                                    }}
                                >
                                    <MessageCircle size={18} /> WhatsApp
                                </button>
                                <button
                                    onClick={shareOnInstagram}
                                    disabled={isGenerating}
                                    style={{
                                        padding: '0.8rem',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        fontSize: '0.9rem',
                                        fontWeight: 600
                                    }}
                                >
                                    <Instagram size={18} /> Instagram
                                </button>
                            </div>
                            {isGenerating && (
                                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                    <div className="loader" style={{ margin: '0 auto' }}></div>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Preparing poster...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );

    }

    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    const handleExit = () => {
        setShowExitModal(true);
    };

    return (
        <div className="slide-up immersive-quiz-container" style={{ maxWidth: '850px', margin: '0 auto', paddingTop: '1rem', position: 'relative' }}>
            {/* Top Navigation Bar */}
            <div className="quiz-nav-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={handleExit}
                    className="hover-lift"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}
                >
                    <ChevronLeft size={18} /> Leave Quiz
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 1rem', borderRadius: '30px', border: '1px solid var(--glass-border)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 1.5s infinite' }}></div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)' }}>LIVE SESSION</span>
                    </div>
                </div>
            </div>

            {/* Immersive Header / Progress */}
            <div style={{ marginBottom: '2.5rem' }}>
                <div className="quiz-header-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>{quiz.title}</h1>
                        <div className="quiz-progress-mini" style={{ display: 'flex', gap: '0.4rem' }}>
                            {quiz.questions.map((_, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        width: '20px',
                                        height: '4px',
                                        borderRadius: '2px',
                                        background: idx < currentQuestion ? 'var(--success)' : (idx === currentQuestion ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'),
                                        transition: 'all 0.3s',
                                        flexShrink: 0
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div className="quiz-timer-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: timeLeft > 300 ? 'var(--error)' : 'var(--text-secondary)', fontWeight: 800, fontSize: '1.4rem' }}>
                            <Clock size={22} className={timeLeft > 300 ? '' : 'float'} /> {formatTime(timeLeft * 1000)}
                        </div>
                    </div>
                </div>
            </div>

            <div key={currentQuestion} className="glass-panel scale-up quiz-main-card" style={{
                padding: '3rem',
                borderRadius: '32px',
                border: '1px solid var(--glass-border)',
                background: 'linear-gradient(165deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
                boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.6)',
                position: 'relative'
            }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ color: 'var(--accent-primary)', fontWeight: 900, fontSize: '0.9rem', marginBottom: '1rem', letterSpacing: '0.1em' }}>QUESTION {currentQuestion + 1} OF {quiz.questions.length}</div>
                    <h2 className="quiz-question-text" style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.35 }}>{question.text}</h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1rem' }}>
                    {question.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedOption(idx)}
                            className={`hover-lift option-button ${selectedOption === idx ? 'scale-up active-glow' : ''}`}
                            style={{
                                textAlign: 'left',
                                cursor: 'pointer',
                                padding: '1.25rem 2rem',
                                borderRadius: '20px',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1.5rem',
                                border: selectedOption === idx ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                                background: selectedOption === idx ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                                color: selectedOption === idx ? 'white' : 'var(--text-secondary)'
                            }}
                        >
                            <div className="option-index" style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '12px',
                                background: selectedOption === idx ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${selectedOption === idx ? 'white' : 'var(--glass-border)'}`,
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1rem',
                                fontWeight: 900,
                                flexShrink: 0
                            }}>
                                {idx + 1}
                            </div>
                            <span style={{ flex: 1 }}>{option}</span>
                            {selectedOption === idx && <CheckCircle2 size={24} className="scale-up" color="var(--accent-primary)" />}

                            {/* Keyboard hint */}
                            <div className="nav-links-desktop" style={{ fontSize: '0.7rem', opacity: 0.3, fontWeight: 800 }}>PRESS {idx + 1}</div>
                        </button>
                    ))}
                </div>

                <div style={{ marginTop: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700 }}>
                        <Zap size={14} fill="var(--accent-primary)" /> Keyboard shortcuts enabled
                    </div>
                    <button
                        onClick={handleNext}
                        className="btn-primary hover-lift quiz-footer-btn"
                        disabled={selectedOption === null}
                        style={{
                            padding: '1.25rem 3rem',
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            opacity: selectedOption === null ? 0.3 : 1,
                            pointerEvents: selectedOption === null ? 'none' : 'auto',
                            boxShadow: selectedOption !== null ? '0 10px 30px rgba(139, 92, 246, 0.4)' : 'none'
                        }}
                    >
                        {currentQuestion === quiz.questions.length - 1 ? 'FINISH ATTEMPT' : 'CONFIRM ANSWER'} <ArrowRight size={22} />
                    </button>
                </div>
            </div>

            {/* Exit Confirmation Modal */}
            {showExitModal && (
                <div className="fade-in" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-panel scale-up" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--error)' }}>
                            <X size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>Abandon Quiz?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>Your current progress will be lost. Are you sure you want to exit the session?</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button onClick={() => setShowExitModal(false)} className="btn-secondary" style={{ padding: '0.8rem' }}>Stay</button>
                            <button onClick={() => router.push('/student/dashboard')} className="btn-primary" style={{ background: 'var(--error)', padding: '0.8rem' }}>Exit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
