import React, { useState } from 'react';
import { EyeOff, ShieldCheck, FileCheck, CheckCircle2, XCircle, HelpCircle, Lock, RefreshCw } from 'lucide-react';

export default function BlindResumeScreening() {
  const [strictness, setStrictness] = useState('Strict');
  const [decision, setDecision] = useState(null);
  const [activeCandidate, setActiveCandidate] = useState('891');

  const handleDecision = (type) => {
    setDecision(type);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="badge badge-teal" style={{ marginBottom: '0.4rem' }}>
            <EyeOff size={14} />
            <span>Blind Recruitment Mode Active</span>
          </div>
          <h1 className="page-title">Blind Resume Screening Viewport</h1>
          <p className="page-subtitle">Demographic indicators (Names, PII, Pronouns, Photos, Alma Maters) are masked to prevent unconscious bias.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-white)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Mask Strictness:</span>
            <select 
              value={strictness} 
              onChange={(e) => setStrictness(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: 600, color: 'var(--primary-indigo)', cursor: 'pointer', outline: 'none' }}
            >
              <option value="Strict">Strict (SOC2 Grade)</option>
              <option value="Balanced">Balanced</option>
            </select>
          </div>

          <button className="btn btn-outline btn-sm" onClick={() => setDecision(null)}>
            <RefreshCw size={14} />
            <span>Next Resume</span>
          </button>
        </div>
      </div>

      {/* Main Split Screen */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Panel: Redacted Document Viewport */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
          <div style={{ background: 'var(--primary-indigo)', color: '#FFF', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
              <Lock size={16} color="var(--secondary-teal)" />
              <span>CONFIDENTIAL RESUME VIEWPORT — ID #{activeCandidate}</span>
            </div>
            <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>7 PII Elements Masked</span>
          </div>

          {/* Document Render Canvas */}
          <div style={{ padding: '2rem', background: '#FFFFFF', minHeight: '520px', fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-dark)' }}>
            {/* Header / PII Blackout Block */}
            <div style={{ borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="redacted-box">FIRST LASTNAME</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>| Candidate #{activeCandidate}</span>
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span>Email: <span className="redacted-box">candidate891@domain.com</span></span>
                <span>Phone: <span className="redacted-box">+1 (555) 019-2834</span></span>
                <span>Location: <span className="redacted-box">San Francisco, CA</span></span>
              </div>
            </div>

            {/* Executive Summary */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>
                Professional Summary
              </h4>
              <p>
                Senior Full-Stack Software Engineer with 6+ years of experience architecting distributed cloud backend services and micro-frontend web applications. Proven track record scaling API throughput from 10k to 250k req/min using Node.js and PostgreSQL. Passionate about automated testing and system parity.
              </p>
            </div>

            {/* Experience (Anonymized) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>
                Work History
              </h4>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>Staff Software Engineer — <span style={{ color: 'var(--primary-indigo)' }}>Tier-1 SaaS Enterprise</span></span>
                  <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>2022 – Present</span>
                </div>
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.3rem', fontSize: '0.85rem' }}>
                  <li>Led cross-functional engineering pod of 8 developers in migrating legacy monolith to AWS ECS microservices.</li>
                  <li>Reduced P99 API latency by 42% by implementing Redis caching layers and GraphQL query batching.</li>
                  <li>Mentored junior engineers and reduced onboarding cycle time by 30%.</li>
                </ul>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>Full Stack Developer — <span style={{ color: 'var(--primary-indigo)' }}>FinTech Unicorn</span></span>
                  <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>2019 – 2022</span>
                </div>
                <ul style={{ paddingLeft: '1.25rem', marginTop: '0.3rem', fontSize: '0.85rem' }}>
                  <li>Built real-time transaction monitoring dashboards serving 40k daily active users using React and WebSockets.</li>
                  <li>Implemented automated CI/CD pipeline achieving 99.98% deployment uptime.</li>
                </ul>
              </div>
            </div>

            {/* Education (Anonymized Tier) */}
            <div>
              <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>
                Education & Credentials
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span><strong>B.S. in Computer Science</strong> — <span style={{ color: 'var(--text-dark)' }}>Accredited Tier-1 Research University</span></span>
                <span className="font-mono" style={{ color: 'var(--text-muted)' }}><span className="redacted-box">GRAD YEAR</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Objective Evaluation Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">AI Extracted Skill Evaluation</h3>
              <span className="badge badge-teal">Merit Match: 94%</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <SkillMatchRow skill="Distributed Systems Architecture" level={95} verified={true} />
              <SkillMatchRow skill="React & Micro-Frontends" level={90} verified={true} />
              <SkillMatchRow skill="PostgreSQL & Redis Optimization" level={92} verified={true} />
              <SkillMatchRow skill="CI/CD & Kubernetes Ops" level={84} verified={false} />
            </div>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Structured Recruiter Assessment Rubric</h3>
            
            <div className="form-group">
              <label className="form-label">Technical Competence (1-5)</label>
              <select className="form-select" defaultValue="5">
                <option value="5">5 — Exceptional mastery shown in past roles</option>
                <option value="4">4 — Strong competency</option>
                <option value="3">3 — Meets role requirements</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Project Impact & Complexity (1-5)</label>
              <select className="form-select" defaultValue="5">
                <option value="5">5 — High scale impact (250k req/min, 42% latency reduction)</option>
                <option value="4">4 — Moderate scale</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Evaluator Evaluation Notes (Non-PII)</label>
              <textarea 
                className="form-textarea" 
                rows="3" 
                placeholder="Enter objective assessment regarding candidate's technical achievements..."
                defaultValue="Candidate demonstrates exceptional backend scalability and microservices migration experience. Highly recommended for technical interview round."
              ></textarea>
            </div>
          </div>

          {/* Decision Action Bar */}
          <div className="card" style={{ background: decision ? 'var(--secondary-teal-light)' : 'var(--surface-white)', border: decision ? '1px solid var(--secondary-teal)' : '1px solid var(--border-light)' }}>
            {decision ? (
              <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: decision === 'shortlist' ? 'var(--secondary-teal)' : 'var(--accent-coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  {decision === 'shortlist' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                  <span>Candidate #{activeCandidate} {decision === 'shortlist' ? 'Shortlisted for Technical Interview' : 'Declined'}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Anonymized evaluation recorded in audit trail log.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <button className="btn btn-teal" onClick={() => handleDecision('shortlist')}>
                  <CheckCircle2 size={16} />
                  <span>Shortlist Candidate</span>
                </button>
                <button className="btn btn-outline" onClick={() => handleDecision('decline')}>
                  <XCircle size={16} />
                  <span>Decline</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillMatchRow({ skill, level, verified }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
        <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {skill}
          {verified && <ShieldCheck size={14} color="var(--secondary-teal)" title="Skills verified via code history" />}
        </span>
        <span className="font-mono" style={{ fontWeight: 600 }}>{level}%</span>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${level}%`, backgroundColor: 'var(--primary-indigo)' }}></div>
      </div>
    </div>
  );
}
