import EqualityScoreRing from '../components/EqualityScoreRing';
import { Download, ShieldCheck, Printer } from 'lucide-react';

export default function ComplianceReports() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="badge badge-teal" style={{ marginBottom: '0.4rem' }}>
            <ShieldCheck size={14} />
            <span>Audited Compliance Generator</span>
          </div>
          <h1 className="page-title">Compliance & Regulatory Reports</h1>
          <p className="page-subtitle">Generate exportable EEO-1, ESG inclusion scorecards, and executive audit documentation.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
            <Printer size={14} />
            <span>Print Preview</span>
          </button>
          <button className="btn btn-teal btn-sm" onClick={() => alert("Downloading FairLens_Audit_Scorecard_Q3.pdf...")}>
            <Download size={14} />
            <span>Export Audit PDF</span>
          </button>
        </div>
      </div>

      {/* Main Scorecard Report Document Card */}
      <div className="card" style={{ background: '#FFF', padding: '3rem', border: '1px solid var(--border-light)' }}>
        {/* Document Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--primary-indigo)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3FA796, #E85D4E)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: 'var(--font-serif)', color: '#FFF' }}>FL</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--primary-indigo)', margin: 0 }}>FairLens Corporate Scorecard</h2>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Official Regulatory Audit Report • Q3 2026 Assessment</div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Audit ID: #AUD-2026-9921</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--secondary-teal)', fontWeight: 600, marginTop: '0.25rem' }}>Status: SOC2 Verifiable Passed</div>
          </div>
        </div>

        {/* Executive Summary Ring & Overall Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '3rem', alignItems: 'center', marginBottom: '3rem' }}>
          <EqualityScoreRing score={84} size={200} label="Overall Equality Score" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            <ScoreCardMetric title="Hiring Fairness Score" score={92} status="Exceeds Benchmark" color="var(--secondary-teal)" />
            <ScoreCardMetric title="Pay Equity Score" score={78} status="Action Plan Required" color="var(--warning-amber)" />
            <ScoreCardMetric title="Promotion Fairness Score" score={81} status="Meets Benchmark" color="var(--secondary-teal)" />
            <ScoreCardMetric title="Workplace Safety Index" score={85} status="Exceeds Benchmark" color="var(--secondary-teal)" />
          </div>
        </div>

        {/* Regulatory Breakdown Table */}
        <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-indigo)', marginBottom: '1rem' }}>EEO-1 & ESG Framework Compliance Matrix</h3>
        
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Compliance Dimension</th>
                <th>Standard Target</th>
                <th>FairLens Calculated Metric</th>
                <th>Audit Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Demographic Masking in Screening</strong></td>
                <td>100% PII Masked</td>
                <td className="font-mono" style={{ color: 'var(--secondary-teal)', fontWeight: 'bold' }}>100.0% Redacted</td>
                <td><span className="badge badge-teal">Compliant</span></td>
              </tr>
              <tr>
                <td><strong>Controlled Unexplained Pay Gap</strong></td>
                <td>&lt; 2.0% Parity Gap</td>
                <td className="font-mono" style={{ color: 'var(--warning-amber)', fontWeight: 'bold' }}>1.8% Gap</td>
                <td><span className="badge badge-amber">Near Benchmark</span></td>
              </tr>
              <tr>
                <td><strong>Harassment Incident Resolution Time</strong></td>
                <td>&lt; 7 Days Avg Triage</td>
                <td className="font-mono" style={{ color: 'var(--secondary-teal)', fontWeight: 'bold' }}>4.2 Days Avg</td>
                <td><span className="badge badge-teal">Exceeds Standard</span></td>
              </tr>
              <tr>
                <td><strong>Leadership Gender Balance</strong></td>
                <td>45-55% Balance</td>
                <td className="font-mono" style={{ color: 'var(--secondary-teal)', fontWeight: 'bold' }}>46.2% Female</td>
                <td><span className="badge badge-teal">Compliant</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ScoreCardMetric({ title, score, status, color }) {
  return (
    <div style={{ background: 'var(--neutral-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{title}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
        <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: color }}>{score}<span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/100</span></div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: color }}>{status}</span>
      </div>
    </div>
  );
}
