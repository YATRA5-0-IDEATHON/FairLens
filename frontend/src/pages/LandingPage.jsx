import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import EqualityScoreRing from '../components/EqualityScoreRing';
import { ShieldCheck, EyeOff, BarChart2, Award, Lock, ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const [empCount, setEmpCount] = useState(250);

  // Simple ROI / Risk calculation formula
  const riskReduction = Math.round(empCount * 180);
  const payGapSaved = (empCount * 420).toLocaleString();

  return (
    <div style={{ backgroundColor: 'var(--neutral-bg)', minHeight: '100vh', color: 'var(--text-dark)' }}>
      {/* Navbar */}
      <nav style={{ background: 'var(--primary-indigo)', color: '#FFF', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #3FA796, #E85D4E)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: 'var(--font-serif)', fontSize: '1.3rem' }}>
            FL
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600 }}>FairLens</span>
            <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>AI</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <a href="#features" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Features</a>
          <a href="#calculator" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>ROI Calculator</a>
          <a href="#compliance" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none' }}>Compliance</a>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/employee-portal" className="btn btn-coral btn-sm">
            <Lock size={14} />
            <span>Anonymous Portal</span>
          </Link>
          <Link to="/login" className="btn btn-teal btn-sm">
            <span>HR Dashboard Login</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ padding: '5rem 2rem', maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'center' }}>
        <div>
          <div className="badge badge-indigo" style={{ marginBottom: '1rem' }}>
            <ShieldCheck size={14} />
            <span>SOC2 & EEO-1 Certified Gender Equality Platform</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3.5rem', lineHeight: 1.15, color: 'var(--primary-indigo)', marginBottom: '1.25rem' }}>
            See Hiring Clearly. <br />
            <span style={{ color: 'var(--secondary-teal)' }}>Eliminate Bias.</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '560px' }}>
            FairLens uses audited AI engines to redact demographic identifiers in recruitment, audit pay parity, detect promotion bottlenecks, and protect workplace safety.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              <span>Explore HR Live Platform</span>
              <ChevronRight size={18} />
            </Link>
            <Link to="/blind-screening" className="btn btn-outline btn-lg">
              <EyeOff size={18} />
              <span>Try Blind Screening Demo</span>
            </Link>
          </div>
        </div>

        {/* Interactive Hero Ring Widget */}
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 2rem', background: 'var(--surface-white)', boxShadow: 'var(--shadow-lg)' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-indigo)', marginBottom: '1.5rem' }}>
            Live Equality Index Engine
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <EqualityScoreRing score={88} size={220} label="Org Gender Health Index" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
            <div style={{ background: 'var(--neutral-bg)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--secondary-teal)' }}>+4.2%</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pay Parity</div>
            </div>
            <div style={{ background: 'var(--neutral-bg)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--secondary-teal)' }}>0.0%</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Screening PII</div>
            </div>
            <div style={{ background: 'var(--neutral-bg)', padding: '0.75rem', borderRadius: '8px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary-indigo)' }}>99.4%</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Safety Index</div>
            </div>
          </div>
        </div>
      </header>

      {/* Core Features Grid */}
      <section id="features" style={{ background: 'var(--surface-white)', padding: '5rem 2rem', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="badge badge-teal" style={{ marginBottom: '0.5rem' }}>Core Capability Suite</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: 'var(--primary-indigo)' }}>
              Comprehensive Gender Equality Infrastructure
            </h2>
          </div>

          <div className="grid-3">
            <FeatureCard
              icon={<EyeOff size={24} color="var(--secondary-teal)" />}
              title="Blind Resume Screening"
              desc="Automatic PII masking of names, pronouns, photos, age, and graduation years so recruiters evaluate candidates strictly on skills."
            />
            <FeatureCard
              icon={<BarChart2 size={24} color="var(--primary-indigo)" />}
              title="Pay Equity Audit Engine"
              desc="Statistical model uncovering unexplained salary gaps by role, tenure, and department with remediation cost forecasting."
            />
            <FeatureCard
              icon={<Award size={24} color="var(--accent-coral)" />}
              title="Promotion & Advancement Analytics"
              desc="Tracks time-in-role and objective performance KPIs against actual promotion decisions to eliminate advancement bottlenecks."
            />
            <FeatureCard
              icon={<Lock size={24} color="var(--secondary-teal)" />}
              title="Workplace Safety Portal"
              desc="Encrypted zero-knowledge anonymous reporting for harassment and harassment triage for HR case handlers."
            />
            <FeatureCard
              icon={<ShieldCheck size={24} color="var(--primary-indigo)" />}
              title="Compliance & Audit Scorecard"
              desc="Automated EEO-1, ESG, and regulatory audit report generation with verifiable score metrics."
            />
            <FeatureCard
              icon={<CheckCircle2 size={24} color="var(--accent-coral)" />}
              title="Performance Review Bias Auditor"
              desc="Language sentiment analysis detecting gendered evaluation terms like 'aggressive' vs 'assertive'."
            />
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" style={{ padding: '5rem 2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '3rem', background: 'var(--surface-white)', border: '1px solid var(--border-light)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>
            Calculate Your Organization's Equity Impact
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Adjust your workforce size to estimate bias risk reduction and pay parity compliance benefits.
          </p>

          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
              <span>Total Employees:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary-indigo)', fontSize: '1.2rem' }}>{empCount} staff</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="5000" 
              step="50" 
              value={empCount} 
              onChange={(e) => setEmpCount(Number(e.target.value))}
              style={{ width: '100%', height: '8px', accentColor: 'var(--secondary-teal)', cursor: 'pointer' }}
            />
          </div>

          <div className="grid-2">
            <div style={{ background: 'var(--secondary-teal-light)', padding: '1.5rem', borderRadius: 'var(--radius-card)', border: '1px solid var(--secondary-teal)' }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--secondary-teal)', fontWeight: 600 }}>
                Est. Litigation & Audit Risk Reduction
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--primary-indigo)', margin: '0.5rem 0' }}>
                ${riskReduction.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>Protected through automated EEO-1 and bias audits</div>
            </div>

            <div style={{ background: 'var(--neutral-bg)', padding: '1.5rem', borderRadius: 'var(--radius-card)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                Est. Retained Talent Value
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: 'bold', color: 'var(--accent-coral)', margin: '0.5rem 0' }}>
                ${payGapSaved}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>From equitable retention and promotion pathways</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--primary-indigo)', color: '#FFF', padding: '3rem 2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 600 }}>FairLens (EquiHire AI)</div>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.2rem' }}>AI-Powered Gender Equality & Workplace Fairness Architecture</p>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
            © 2026 FairLens Platform • SOC2 Type II Certified
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--neutral-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-indigo)' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}
