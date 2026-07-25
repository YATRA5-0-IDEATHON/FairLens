import React from 'react';
import { TrendingUp, Clock, AlertTriangle, CheckCircle2, Award } from 'lucide-react';

export default function PromotionAnalytics() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="badge badge-teal" style={{ marginBottom: '0.4rem' }}>
            <TrendingUp size={14} />
            <span>Advancement & Tenure Engine</span>
          </div>
          <h1 className="page-title">Promotion Fairness Analytics</h1>
          <p className="page-subtitle">Track advancement velocity, time-in-role wait time disparities, and KPI vs promotion correlation.</p>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid-3">
        <div className="card">
          <div className="stat-label">Overall Promotion Parity Rate</div>
          <div className="stat-value" style={{ color: 'var(--secondary-teal)', marginTop: '0.2rem' }}>92.4%</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Equal promotion rate between demographics</p>
        </div>

        <div className="card">
          <div className="stat-label">Avg Time-in-Role Delta</div>
          <div className="stat-value" style={{ color: 'var(--accent-coral)', marginTop: '0.2rem' }}>+5.4 Mos</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Female staff remain in L5 titles 5.4 months longer before promo</p>
        </div>

        <div className="card">
          <div className="stat-label">Performance-to-Promo Alignment</div>
          <div className="stat-value" style={{ color: 'var(--primary-indigo)', marginTop: '0.2rem' }}>94.1%</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>High KPI performers promoted regardless of gender</p>
        </div>
      </div>

      {/* Time in Role Wait Time Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Average Time-in-Role Wait Time Before Promotion (Months)</h3>
          <span className="badge badge-coral">Bottleneck Flagged in Engineering</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
          <WaitTimeBar role="L3 Junior Software Engineer ➔ L4 Engineer" maleMonths={18} femaleMonths={19} />
          <WaitTimeBar role="L4 Senior Engineer ➔ L5 Staff Engineer" maleMonths={26} femaleMonths={34.4} flag={true} />
          <WaitTimeBar role="L5 Staff Engineer ➔ L6 Principal Engineer" maleMonths={36} femaleMonths={38} />
          <WaitTimeBar role="Account Executive ➔ Senior AE (Sales)" maleMonths={22} femaleMonths={23} />
          <WaitTimeBar role="Product Manager ➔ Senior PM (Product)" maleMonths={24} femaleMonths={25} />
        </div>
      </div>
    </div>
  );
}

function WaitTimeBar({ role, maleMonths, femaleMonths, flag }) {
  return (
    <div style={{ padding: '0.85rem', background: 'var(--neutral-bg)', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {role}
          {flag && <span className="badge badge-coral" style={{ fontSize: '0.65rem' }}>+8.4 mo disparity</span>}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
          <span style={{ width: '60px', color: 'var(--text-muted)' }}>Male:</span>
          <div style={{ flex: 1, background: 'var(--border-light)', height: '10px', borderRadius: '5px' }}>
            <div style={{ width: `${(maleMonths / 45) * 100}%`, background: 'var(--primary-indigo)', height: '100%', borderRadius: '5px' }}></div>
          </div>
          <span className="font-mono" style={{ width: '60px', fontWeight: 600 }}>{maleMonths} mos</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
          <span style={{ width: '60px', color: 'var(--text-muted)' }}>Female:</span>
          <div style={{ flex: 1, background: 'var(--border-light)', height: '10px', borderRadius: '5px' }}>
            <div style={{ width: `${(femaleMonths / 45) * 100}%`, background: flag ? 'var(--accent-coral)' : 'var(--secondary-teal)', height: '100%', borderRadius: '5px' }}></div>
          </div>
          <span className="font-mono" style={{ width: '60px', fontWeight: 600, color: flag ? 'var(--accent-coral)' : 'var(--text-dark)' }}>{femaleMonths} mos</span>
        </div>
      </div>
    </div>
  );
}
