'use client';

import { useEffect, useState } from 'react';
import { Quiz } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { Target, Zap, Clock, Share2, Instagram, MessageCircle, CheckCircle2 } from 'lucide-react';

export default function TakeQuizPage() {
    const params = useParams();
    const id = params.id as string;
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
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
                    }
                });
        }
    }, [id, user, router]);


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
                <div className="glass-panel fade-in share-card" style={{ animationDelay: '0.2s' }}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Proud of your score?</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Share your achievement with your friends!</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Share2 size={20} />
                        </button>
                        <button style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Instagram size={20} />
                        </button>
                        <button style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#22c55e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageCircle size={20} />
                        </button>
                    </div>
                </div>
            </div>
        );

    }

    const question = quiz.questions[currentQuestion];

    return (
        <div className="quiz-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                <span>Score: {score}</span>
            </div>

            <div className="glass-panel" style={{ padding: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>{question.text}</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {question.options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedOption(idx)}
                            className="input-field" // Reusing input styles for base
                            style={{
                                textAlign: 'left',
                                cursor: 'pointer',
                                background: selectedOption === idx ? 'rgba(139, 92, 246, 0.2)' : 'rgba(0,0,0,0.2)',
                                borderColor: selectedOption === idx ? 'var(--accent-primary)' : 'var(--glass-border)',
                                color: 'white' // force white
                            }}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleNext}
                        className="btn-primary"
                        disabled={selectedOption === null}
                        style={{ opacity: selectedOption === null ? 0.5 : 1, pointerEvents: selectedOption === null ? 'none' : 'auto' }}
                    >
                        {currentQuestion === quiz.questions.length - 1 ? 'Finish' : 'Next Question'}
                    </button>
                </div>
            </div>
        </div>
    );
}
