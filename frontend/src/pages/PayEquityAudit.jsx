import React, { useState } from 'react';
import { DollarSign, AlertTriangle, Calculator, ShieldCheck, ArrowRight, TrendingUp } from 'lucide-react';

export default function PayEquityAudit() {
  const [remediationTarget, setRemediationTarget] = useState(100);

  const totalUnexplainedGap = 142000;
  const targetBudget = Math.round((totalUnexplainedGap * remediationTarget) / 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="badge badge-coral" style={{ marginBottom: '0.4rem' }}>
            <DollarSign size={14} />
            <span>Audited Pay Parity Model</span>
          </div>
          <h1 className="page-title">Pay Equity Audit Engine</h1>
          <p className="page-subtitle">Identify and remediate statistically unexplained compensation gaps controlling for role, tenure, and performance.</p>
        </div>
      </div>

      {/* Top Stat Overview */}
      <div className="grid-4">
        <div className="card">
          <div className="stat-label">Org Overall Pay Gap</div>
          <div className="stat-value" style={{ color: 'var(--accent-coral)' }}>-3.4%</div>
          <div className="badge badge-coral" style={{ marginTop: '0.4rem' }}>Flagged for Remediation</div>
        </div>

        <div className="card">
          <div className="stat-label">Controlled Unexplained Gap</div>
          <div className="stat-value" style={{ color: 'var(--warning-amber)' }}>-1.8%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Adjusted for tenure & level</div>
        </div>

        <div className="card">
          <div className="stat-label">High Risk Roles Count</div>
          <div className="stat-value" style={{ color: 'var(--primary-indigo)' }}>3</div>
          <div className="badge badge-amber" style={{ marginTop: '0.4rem' }}>Sales & Engineering</div>
        </div>

        <div className="card">
          <div className="stat-label">Total Parity Remediation Pool</div>
          <div className="stat-value font-mono" style={{ color: 'var(--secondary-teal)' }}>$142,000</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Est. annual budget required</div>
        </div>
      </div>

      {/* Main Grid: Scatter Plot Simulation + Remediation Calculator */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Scatter Plot Simulation View */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Salary vs Years Experience (Senior Software Engineers)</h3>
            <span className="badge badge-indigo">Controlled Regression</span>
          </div>

          <div style={{ padding: '1rem', background: 'var(--neutral-bg)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <div style={{ height: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              {/* Y Axis Grid lines */}
              <div style={{ borderBottom: '1px dashed var(--border-light)', paddingBottom: '0.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>$200k/yr</div>
              <div style={{ borderBottom: '1px dashed var(--border-light)', paddingBottom: '0.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>$170k/yr</div>
              <div style={{ borderBottom: '1px dashed var(--border-light)', paddingBottom: '0.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>$140k/yr</div>
              <div style={{ borderBottom: '1px dashed var(--border-light)', paddingBottom: '0.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>$110k/yr</div>

              {/* Data points */}
              <div style={{ position: 'absolute', inset: 0, padding: '2rem 1rem' }}>
                <ScatterDot x="20%" y="65%" gender="M" title="Male, 3 yrs exp, $155k" />
                <ScatterDot x="25%" y="75%" gender="F" title="Female, 3 yrs exp, $142k" alert={true} />
                <ScatterDot x="45%" y="45%" gender="M" title="Male, 5 yrs exp, $178k" />
                <ScatterDot x="50%" y="55%" gender="F" title="Female, 5 yrs exp, $166k" alert={true} />
                <ScatterDot x="75%" y="25%" gender="M" title="Male, 8 yrs exp, $195k" />
                <ScatterDot x="80%" y="30%" gender="F" title="Female, 8 yrs exp, $190k" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              <span>0 Yrs Exp</span>
              <span>4 Yrs Exp</span>
              <span>8 Yrs Exp</span>
              <span>12+ Yrs Exp</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-indigo)' }}></span> Male Comp Points
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--secondary-teal)' }}></span> Female Comp Points
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-coral)' }}></span> Gap Alert Point
            </span>
          </div>
        </div>

        {/* Remediation Cost Calculator */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calculator size={18} color="var(--secondary-teal)" />
              <h3 className="card-title">Parity Remediation Budget Planner</h3>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Calculate budget required to adjust salaries for employees affected by statistically unexplained gaps.
          </p>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
              <span>Target Gap Parity Closure:</span>
              <span className="font-mono" style={{ fontWeight: 600, color: 'var(--primary-indigo)' }}>{remediationTarget}% Closure</span>
            </div>
            <input 
              type="range" 
              min="25" 
              max="100" 
              step="25"
              value={remediationTarget}
              onChange={(e) => setRemediationTarget(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--secondary-teal)', cursor: 'pointer' }}
            />
          </div>

          <div style={{ background: 'var(--secondary-teal-light)', padding: '1.25rem', borderRadius: 'var(--radius-card)', border: '1px solid var(--secondary-teal)', margin: '1.5rem 0' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--secondary-teal)', fontWeight: 600 }}>Required Allocation</div>
            <div className="font-mono" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-indigo)', margin: '0.2rem 0' }}>
              ${targetBudget.toLocaleString()} / yr
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>Resolves 100% of high-risk department gaps in 2026.</div>
          </div>

          <button className="btn btn-teal" style={{ width: '100%' }}>
            <span>Submit Pay Adjustment Plan to Board</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Department Risk Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Department Pay Disparity Risk Matrix</h3>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Role / Department</th>
                <th>Staff Count</th>
                <th>Mean Salary Delta (F vs M)</th>
                <th>Controlled Gap %</th>
                <th>Parity Risk Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Senior Account Executive (Sales)</strong></td>
                <td className="font-mono">42</td>
                <td className="font-mono" style={{ color: 'var(--accent-coral)' }}>-$6,400 / yr</td>
                <td className="font-mono" style={{ color: 'var(--accent-coral)' }}>-4.1%</td>
                <td><span className="badge badge-coral">High Risk</span></td>
                <td><button className="btn btn-coral btn-sm">Adjust Parity</button></td>
              </tr>
              <tr>
                <td><strong>Staff Engineer (L5 Engineering)</strong></td>
                <td className="font-mono">88</td>
                <td className="font-mono" style={{ color: 'var(--warning-amber)' }}>-$4,200 / yr</td>
                <td className="font-mono" style={{ color: 'var(--warning-amber)' }}>-2.6%</td>
                <td><span className="badge badge-amber">Moderate Risk</span></td>
                <td><button className="btn btn-outline btn-sm">Review</button></td>
              </tr>
              <tr>
                <td><strong>Product Manager (Product)</strong></td>
                <td className="font-mono">35</td>
                <td className="font-mono" style={{ color: 'var(--secondary-teal)' }}>+$800 / yr</td>
                <td className="font-mono" style={{ color: 'var(--secondary-teal)' }}>+0.5%</td>
                <td><span className="badge badge-teal">Parity Verified</span></td>
                <td><button className="btn btn-outline btn-sm" disabled>Cleared</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ScatterDot({ x, y, gender, title, alert }) {
  const bg = alert ? 'var(--accent-coral)' : (gender === 'M' ? 'var(--primary-indigo)' : 'var(--secondary-teal)');
  return (
    <div 
      title={title}
      style={{ 
        position: 'absolute', 
        left: x, 
        top: y, 
        width: alert ? '14px' : '10px', 
        height: alert ? '14px' : '10px', 
        borderRadius: '50%', 
        backgroundColor: bg,
        boxShadow: alert ? '0 0 0 4px rgba(232, 93, 78, 0.3)' : 'none',
        cursor: 'pointer'
      }}
    />
  );
}
