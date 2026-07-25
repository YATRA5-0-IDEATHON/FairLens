import { useState } from 'react';
import { FileCheck2, AlertTriangle } from 'lucide-react';

export default function PerformanceReviewAnalysis() {
  const [sampleText, setSampleText] = useState(
    "Candidate demonstrates strong technical skills, but can sometimes come across as overly aggressive during roadmap debates. She is extremely helpful with team logistics, though could focus more on strategic leadership."
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="badge badge-indigo" style={{ marginBottom: '0.4rem' }}>
            <FileCheck2 size={14} />
            <span>Review Sentiment & Bias Engine</span>
          </div>
          <h1 className="page-title">Performance Review Bias Auditor</h1>
          <p className="page-subtitle">Detect gendered language skew, subjective personality feedback, and rating score deflation.</p>
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid-3">
        <div className="card">
          <div className="stat-label">Gendered Feedback Flag Rate</div>
          <div className="stat-value" style={{ color: 'var(--warning-amber)', marginTop: '0.2rem' }}>8.4%</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Reviews containing subjective gendered terms</p>
        </div>

        <div className="card">
          <div className="stat-label">Personality vs Output Feedback</div>
          <div className="stat-value" style={{ color: 'var(--accent-coral)', marginTop: '0.2rem' }}>3.2x</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Women receive 3.2x more feedback on demeanor than deliverables</p>
        </div>

        <div className="card">
          <div className="stat-label">Rating Parity Score</div>
          <div className="stat-value" style={{ color: 'var(--secondary-teal)', marginTop: '0.2rem' }}>91/100</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Mean rating score difference M vs F: 0.12 pts</p>
        </div>
      </div>

      {/* Interactive Review Bias Auditor Sandbox */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Live Review Feedback Auditor</h3>
          <span className="badge badge-teal">AI Natural Language Audit</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
          <div>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Draft Review Feedback Text</label>
            <textarea 
              className="form-textarea" 
              rows="6"
              style={{ width: '100%', lineHeight: 1.6 }}
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
            ></textarea>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Paste draft evaluation comments to run real-time gendered language scan.
            </div>
          </div>

          <div style={{ background: 'var(--neutral-bg)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-indigo)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={16} color="var(--accent-coral)" />
              <span>Coded Language Diagnostics</span>
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ background: 'var(--accent-coral-light)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--accent-coral)' }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--accent-coral)' }}>
                  Flagged Term: "overly aggressive"
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginTop: '0.2rem' }}>
                  <strong>Bias Indicator:</strong> Frequently applied disproportionately to female staff. Consider replacing with objective metric: <em>"assertive during debates"</em>.
                </div>
              </div>

              <div style={{ background: 'var(--warning-amber-light)', padding: '0.75rem', borderRadius: '6px', borderLeft: '3px solid var(--warning-amber)' }}>
                <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--warning-amber)' }}>
                  Flagged Term: "helpful with team logistics"
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)', marginTop: '0.2rem' }}>
                  <strong>Bias Indicator:</strong> "Office housework" stereotype trap. Shift emphasis to measurable technical contributions.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
