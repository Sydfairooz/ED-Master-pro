import Link from 'next/link';
import { ArrowRight, Zap, Target, Award, Shield, Globe, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', gap: '5rem', paddingTop: '4rem' }}>

      {/* Hero Section */}
      <section style={{ textAlign: 'center', maxWidth: '900px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', padding: '0.5rem 1rem', borderRadius: '30px', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '1.5rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <Zap size={14} fill="var(--accent-primary)" /> NEW: ADVANCED ANALYTICS FOR ADMINS
        </div>
        <h1 style={{ fontSize: '4.5rem', marginBottom: '1.5rem', lineHeight: 1, fontWeight: 900, letterSpacing: '-0.02em' }}>
          Master Every Topic <br />
          <span className="title-gradient">Without Limits.</span>
        </h1>
        <p style={{ fontSize: '1.4rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          The world's most premium platform for knowledge mastery. Expertly crafted quizzes, real-time competition, and detailed performance tracking designed for the elite learner.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <Link href="/login" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Start Challenging Yourself <ArrowRight size={20} />
          </Link>
          <Link href="/leaderboard" className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Browse Rankings
          </Link>
        </div>
      </section>

      {/* Stats / Proof Section */}
      <div className="glass-panel" style={{ padding: '3rem', width: '100%', maxWidth: '1000px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.05), transparent)', pointerEvents: 'none' }}></div>

        <div style={{ textAlign: 'center', position: 'relative' }}>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>100+</h3>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.05em' }}>PREMIUM QUIZZES</p>
        </div>

        <div style={{ textAlign: 'center', borderLeft: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)', position: 'relative' }}>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--accent-secondary)', marginBottom: '0.5rem' }}>10k</h3>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.05em' }}>STUDENT MISSIONS</p>
        </div>

        <div style={{ textAlign: 'center', position: 'relative' }}>
          <h3 style={{ fontSize: '2.5rem', color: 'var(--success)', marginBottom: '0.5rem' }}>#1</h3>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.05em' }}>GLOBAL RANKING</p>
        </div>
      </div>

      {/* Features Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1200px', marginBottom: '4rem' }}>
        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Target color="var(--accent-primary)" size={28} />
          </div>
          <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Precision Mapping</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Track your strengths and weaknesses with pinpoint accuracy through our advanced scoring algorithms.</p>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Globe color="var(--accent-secondary)" size={28} />
          </div>
          <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Elite Community</h4>
          <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Global Competition</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Compete against the brightest minds worldwide and secure your place in the Hall of Fame.</p>
        </div>

        <div className="glass-panel" style={{ padding: '2.5rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Shield color="var(--success)" size={28} />
          </div>
          <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Secure Learning</h4>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>Your progress is safely stored in our secure cloud platform, accessible anywhere on any device.</p>
        </div>
      </section>

      {/* Footer Branding */}
      <footer style={{ marginTop: 'auto', padding: '4rem 0', borderTop: '1px solid var(--glass-border)', width: '100%', textAlign: 'center' }}>
        <div className="title-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>ED MASTER PRO</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem' }}>&copy; 2026 ED Master Platforms. All rights reserved.</p>
      </footer>

    </div>
  );
}

