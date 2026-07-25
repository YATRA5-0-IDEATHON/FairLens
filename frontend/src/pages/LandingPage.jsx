import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Briefcase, Building2, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: 'var(--neutral-bg)', minHeight: '100vh', color: 'var(--text-dark)', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ background: 'var(--primary-indigo)', color: '#FFF', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #3FA796, #E85D4E)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#FFF' }}>
            FL
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600 }}>FairLens</span>
            <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>AI</span>
          </div>
        </div>
      </nav>

      {/* Hero / Portal Selection */}
      <header style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 2rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="badge badge-indigo" style={{ marginBottom: '1rem' }}>
            <ShieldCheck size={14} />
            <span>SOC2 & EEO-1 Certified Gender Equality Platform</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', lineHeight: 1.2, color: 'var(--primary-indigo)', marginBottom: '0.75rem' }}>
            See Hiring Clearly. <span style={{ color: 'var(--secondary-teal)' }}>Eliminate Bias.</span>
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Choose a portal to continue.
          </p>
        </div>

        <div className="grid-3" style={{ gap: '1.5rem' }}>
          <PortalCard
            icon={<Building2 size={28} color="var(--primary-indigo)" />}
            title="HR Login"
            desc="For HR leaders and admins to access dashboards, audits, and case management."
            actionLabel="Continue as HR"
            accent="var(--primary-indigo)"
            onClick={() => navigate('/login?role=hr')}
          />
          <PortalCard
            icon={<Lock size={28} color="var(--accent-coral)" />}
            title="Employee Login"
            desc="Secure, anonymous access for employees to report and track workplace concerns."
            actionLabel="Continue as Employee"
            accent="var(--accent-coral)"
            onClick={() => navigate('/login?role=employee')}
          />
          <PortalCard
            icon={<Briefcase size={28} color="var(--secondary-teal)" />}
            title="Hiring / Candidates"
            desc="For applicants to submit resumes into our bias-free, blind screening pipeline."
            actionLabel="Continue to Hiring"
            accent="var(--secondary-teal)"
            onClick={() => navigate('/apply')}
          />
        </div>
      </header>

      {/* Footer */}
      <footer style={{ background: 'var(--primary-indigo)', color: '#FFF', padding: '1.5rem 2rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
          © 2026 FairLens Platform • SOC2 Type II Certified
        </div>
      </footer>
    </div>
  );
}

function PortalCard({ icon, title, desc, actionLabel, accent, onClick }) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem 1.5rem',
        cursor: 'pointer',
        border: '1px solid var(--border-light)',
        background: 'var(--surface-white)',
        transition: 'box-shadow 150ms ease-out, transform 150ms ease-out',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: 'var(--neutral-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: 'var(--primary-indigo)' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>{desc}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: accent, fontSize: '0.9rem' }}>
        <span>{actionLabel}</span>
        <ChevronRight size={16} />
      </div>
    </div>
  );
}