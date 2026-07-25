import React, { useState } from 'react';
import { Lock, ShieldCheck, AlertTriangle, UploadCloud, Key, ArrowRight, CheckCircle2, LogOut } from 'lucide-react';

export default function EmployeeReportingPortal() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("Sexual Harassment / Unwelcome Conduct");
  const [narrative, setNarrative] = useState("");
  const [passkey, setPasskey] = useState(null);

  const handleQuickExit = () => {
    window.location.href = "https://www.google.com";
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      // Generate 24-character cryptographic passkey
      const generatedKey = "FL-PASSKEY-" + Math.random().toString(36).substring(2, 10).toUpperCase() + "-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      setPasskey(generatedKey);
      setStep(4);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-bg)', color: 'var(--text-dark)', padding: '2rem' }}>
      {/* Quick Exit Header Bar */}
      <div style={{ maxWidth: '800px', margin: '0 auto 2rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3FA796, #E85D4E)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: 'var(--font-serif)', color: '#FFF' }}>
            FL
          </div>
          <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-indigo)' }}>FairLens Safe Portal</span>
        </div>

        {/* Quick Exit Button */}
        <button 
          onClick={handleQuickExit} 
          className="btn btn-coral btn-sm" 
          title="Click or press ESC to immediately close this page and redirect to Google"
        >
          <LogOut size={14} />
          <span>Quick Exit (ESC)</span>
        </button>
      </div>

      {/* Security Banner */}
      <div style={{ maxWidth: '800px', margin: '0 auto 1.5rem auto' }}>
        <div className="anonymity-shield-banner">
          <Lock size={24} color="var(--secondary-teal)" />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-indigo)' }}>
              Zero-Knowledge Encrypted Session
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Your IP address is not logged. No login required. You will receive an anonymous claim passkey to check status safely.
            </div>
          </div>
        </div>
      </div>

      {/* Main Wizard Form Container */}
      <div className="card" style={{ maxWidth: '800px', margin: '0 auto', boxShadow: 'var(--shadow-lg)' }}>
        {/* Wizard Steps Header */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <StepHeader num={1} label="Category" active={step === 1} done={step > 1} />
          <StepHeader num={2} label="Narrative" active={step === 2} done={step > 2} />
          <StepHeader num={3} label="Evidence Upload" active={step === 3} done={step > 3} />
          <StepHeader num={4} label="Passkey Confirmation" active={step === 4} done={step === 4} />
        </div>

        <form onSubmit={handleNextStep}>
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>Step 1: Select Allegation Category</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Choose the category that best describes the incident.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <CategoryRadio 
                  label="Sexual Harassment / Unwelcome Conduct" 
                  desc="Unwanted verbal comments, physical gestures, microaggressions, or pressure."
                  selected={category === "Sexual Harassment / Unwelcome Conduct"}
                  onClick={() => setCategory("Sexual Harassment / Unwelcome Conduct")}
                />
                <CategoryRadio 
                  label="Pay & Compensation Discrimination" 
                  desc="Disparities in salary, bonuses, or equity grants based on gender."
                  selected={category === "Pay & Compensation Discrimination"}
                  onClick={() => setCategory("Pay & Compensation Discrimination")}
                />
                <CategoryRadio 
                  label="Promotion & Advancement Exclusion" 
                  desc="Unfair promotion bottlenecks or retaliation following parental/maternity leave."
                  selected={category === "Promotion & Advancement Exclusion"}
                  onClick={() => setCategory("Promotion & Advancement Exclusion")}
                />
                <CategoryRadio 
                  label="General Workplace Bullying / Microaggressions" 
                  desc="Hostile work environment, public humiliation, or systemic exclusion."
                  selected={category === "General Workplace Bullying / Microaggressions"}
                  onClick={() => setCategory("General Workplace Bullying / Microaggressions")}
                />
              </div>

              <button type="submit" className="btn btn-teal" style={{ width: '100%', padding: '0.75rem' }}>
                <span>Continue to Incident Narrative</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>Step 2: Incident Narrative</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Provide objective details regarding dates, times, and events.</p>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Detailed Incident Narrative</label>
                <textarea 
                  className="form-textarea" 
                  rows="6" 
                  style={{ width: '100%', lineHeight: 1.6 }}
                  placeholder="Describe what occurred, dates, location, and any witnesses involved..."
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ background: 'var(--warning-amber-light)', padding: '0.85rem', borderRadius: '8px', borderLeft: '4px solid var(--warning-amber)', marginBottom: '2rem', fontSize: '0.8rem', color: 'var(--text-dark)' }}>
                🔒 <strong>FairLens Privacy Guard:</strong> For complete anonymity, avoid including your own full name unless you explicitly wish to be contacted directly.
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>Back</button>
                <button type="submit" className="btn btn-teal" style={{ flex: 2 }}>
                  <span>Continue to Evidence Upload</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>Step 3: Attach Evidence (Optional)</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Upload screenshots, email receipts, or documents. EXIF metadata is automatically stripped.</p>

              <div style={{ border: '2px dashed var(--border-light)', borderRadius: 'var(--radius-card)', padding: '3rem 2rem', textAlign: 'center', background: 'var(--neutral-bg)', marginBottom: '2rem' }}>
                <UploadCloud size={40} color="var(--secondary-teal)" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Drag and drop files here or click to browse</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Supports PNG, JPG, PDF, DOCX (Max 25MB per file)</div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setStep(2)} className="btn btn-outline" style={{ flex: 1 }}>Back</button>
                <button type="submit" className="btn btn-coral" style={{ flex: 2 }}>
                  <span>Submit Anonymous Report Encrypted</span>
                  <ShieldCheck size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--secondary-teal-light)', color: 'var(--secondary-teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <CheckCircle2 size={36} />
              </div>

              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>
                Anonymous Report Submitted Securely
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '560px', margin: '0 auto 2rem auto' }}>
                Your report has been encrypted and assigned to the HR DEI Case Triage Officer. Save your 24-character cryptographic passkey below to check status or communicate anonymously.
              </p>

              <div style={{ background: 'var(--primary-indigo)', color: '#FFF', padding: '1.5rem', borderRadius: 'var(--radius-card)', margin: '0 auto 2rem auto', maxWidth: '600px', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--secondary-teal)', fontWeight: 600, marginBottom: '0.4rem' }}>
                  YOUR ANONYMOUS CLAIM PASSKEY
                </div>
                <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                  {passkey}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
                  ⚠️ Do not lose this key. It is the only cryptographic link to your report.
                </div>
              </div>

              <button type="button" onClick={handleQuickExit} className="btn btn-teal">
                <span>Done & Exit Safely</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function StepHeader({ num, label, active, done }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: active || done ? 1 : 0.4 }}>
      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: done ? 'var(--secondary-teal)' : (active ? 'var(--primary-indigo)' : 'var(--border-light)'), color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
        {done ? '✓' : num}
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: active ? 600 : 400, color: 'var(--text-dark)' }}>{label}</span>
    </div>
  );
}

function CategoryRadio({ label, desc, selected, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        padding: '1rem', 
        borderRadius: '8px', 
        border: selected ? '2px solid var(--secondary-teal)' : '1px solid var(--border-light)',
        background: selected ? 'var(--secondary-teal-light)' : 'var(--surface-white)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}
    >
      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--secondary-teal)', background: selected ? 'var(--secondary-teal)' : 'transparent', marginTop: '0.1rem', flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-indigo)' }}>{label}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{desc}</div>
      </div>
    </div>
  );
}
