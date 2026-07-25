import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Shield, ArrowRight, UserCheck, Building2, Key, CheckCircle, AlertCircle } from 'lucide-react';

// Mock Company Code Database for Authentication
const MOCK_COMPANY_DATABASE = [
  { code: 'COMP-101', name: 'Acme Global Corp', password: 'admin123', plan: 'Enterprise Pro' },
  { code: 'COMP-777', name: 'FairLens Tech Inc', password: 'fairlens2026', plan: 'DEI Leader Suite' },
  { code: 'EQUI-999', name: 'Nexus Innovations', password: 'equi2026', plan: 'Standard Org' }
];

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'employee' ? 'employee' : 'hr';
  
  const [activeTab, setActiveTab] = useState(initialRole);
  
  // HR Form Inputs
  const [companyCode, setCompanyCode] = useState('COMP-101');
  const [password, setPassword] = useState('admin123');
  
  // Employee Form Inputs
  const [employeeId, setEmployeeId] = useState('EMP-4092');

  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'employee' || roleParam === 'hr') {
      setActiveTab(roleParam);
    }
  }, [searchParams]);

  const handleHRLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    // Check against Company Database
    const matchedCompany = MOCK_COMPANY_DATABASE.find(
      (c) => c.code.toUpperCase() === companyCode.trim().toUpperCase() && c.password === password
    );

    if (matchedCompany) {
      setAuthSuccess(`Authenticated successfully for ${matchedCompany.name} (${matchedCompany.code})!`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    } else {
      setAuthError('Invalid Company Code or Password. Try preset COMP-101 / admin123');
    }
  };

  const handleEmployeeLogin = (e) => {
    e.preventDefault();
    setAuthSuccess('Anonymous Access Granted');
    setTimeout(() => {
      navigate('/employee-portal');
    }, 600);
  };

  const fillQuickPreset = (preset) => {
    setCompanyCode(preset.code);
    setPassword(preset.password);
    setAuthError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--neutral-bg)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #3FA796, #E85D4E)', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: '#FFF', marginBottom: '0.75rem' }}>
              FL
            </div>
          </Link>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--primary-indigo)' }}>FairLens Access Portal</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>AI-Powered Gender Equality & Workplace Safety Architecture</p>
        </div>

        {/* Auth Card */}
        <div className="card" style={{ boxShadow: 'var(--shadow-lg)' }}>
          
          {/* Role Switcher */}
          <div className="tab-switcher" style={{ marginBottom: '1.5rem' }}>
            <button 
              className={`tab-btn ${activeTab === 'hr' ? 'active' : ''}`}
              onClick={() => { setActiveTab('hr'); setAuthError(''); setAuthSuccess(''); }}
            >
              <Building2 size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              HR & Org Login
            </button>
            <button 
              className={`tab-btn ${activeTab === 'employee' ? 'active' : ''}`}
              onClick={() => { setActiveTab('employee'); setAuthError(''); setAuthSuccess(''); }}
            >
              <Lock size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Employee Portal
            </button>
          </div>

          {authError && (
            <div style={{ background: 'var(--accent-coral-light)', border: '1px solid var(--accent-coral)', color: 'var(--accent-coral)', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div style={{ background: 'var(--secondary-teal-light)', border: '1px solid var(--secondary-teal)', color: 'var(--secondary-teal)', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* HR Login Form */}
          {activeTab === 'hr' ? (
            <form onSubmit={handleHRLogin}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Company Code / Org Identifier</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--secondary-teal)', fontWeight: 400 }}>Format: COMP-XXX</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value)}
                    placeholder="e.g. COMP-101"
                    required
                    style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 600 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Company Account Password</label>
                  <a href="#forgot" style={{ fontSize: '0.75rem', color: 'var(--secondary-teal)', textDecoration: 'none' }}>Forgot pass?</a>
                </div>
                <input 
                  type="password" 
                  className="form-input" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>
                <Building2 size={16} />
                <span>Authenticate Company Account</span>
                <ArrowRight size={16} />
              </button>

              {/* Quick Select Company Code Database Widget */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🔑 Quick Select Demo Company Codes:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {MOCK_COMPANY_DATABASE.map((company) => (
                    <button
                      key={company.code}
                      type="button"
                      onClick={() => fillQuickPreset(company)}
                      style={{
                        display: 'flex',
                        justify: 'space-between',
                        alignItems: 'center',
                        background: companyCode === company.code ? 'var(--secondary-teal-light)' : 'var(--neutral-bg)',
                        border: companyCode === company.code ? '1px solid var(--secondary-teal)' : '1px solid var(--border-subtle)',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div>
                        <strong style={{ color: 'var(--primary-indigo)' }}>{company.code}</strong> — {company.name}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Pass: {company.password}</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            /* Employee Form */
            <form onSubmit={handleEmployeeLogin}>
              <div className="form-group">
                <label className="form-label">Employee / Staff ID (Optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. EMP-4092 or Leave Blank"
                  style={{ fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--secondary-teal-light)', color: 'var(--secondary-teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                  <Lock size={26} />
                </div>
                <h3 style={{ fontSize: '1.05rem', color: 'var(--primary-indigo)', marginBottom: '0.4rem' }}>Zero-Knowledge Anonymous Access</h3>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  You will be issued an anonymous encrypted token to safely submit workplace feedback or harassment reports.
                </p>
                <button type="submit" className="btn btn-coral" style={{ width: '100%', padding: '0.75rem', fontWeight: 600 }}>
                  <Lock size={16} />
                  <span>Enter Anonymous Safety Portal</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Candidate hiring prompt */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Are you a job seeker / candidate? </span>
          <Link to="/apply" style={{ fontSize: '0.85rem', color: 'var(--secondary-teal)', fontWeight: 600, textDecoration: 'none' }}>
            Submit your Resume here →
          </Link>
        </div>

        {/* Footer badges */}
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Shield size={12} /> SOC2 Type II</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><UserCheck size={12} /> GDPR Compliant</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Lock size={12} /> 256-Bit Encrypted</span>
        </div>
      </div>
    </div>
  );
}
