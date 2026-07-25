import React from 'react';
import { BarChart3, TrendingUp, Users, ArrowDownRight, ShieldCheck } from 'lucide-react';

export default function GenderAnalyticsDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="badge badge-teal" style={{ marginBottom: '0.4rem' }}>
            <BarChart3 size={14} />
            <span>Macro Demographics Engine</span>
          </div>
          <h1 className="page-title">Gender Representation & Funnel Analytics</h1>
          <p className="page-subtitle">Track recruitment funnel drop-offs, department representation heatmaps, and leadership parity metrics.</p>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid-3">
        <div className="card">
          <div className="stat-label">Hiring Funnel Retention Parity</div>
          <div className="stat-value" style={{ color: 'var(--secondary-teal)', marginTop: '0.25rem' }}>96.8%</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Equal progression rate between Male & Female applicants across interview stages.
          </p>
        </div>

        <div className="card">
          <div className="stat-label">Leadership Representation (VP+)</div>
          <div className="stat-value" style={{ color: 'var(--primary-indigo)', marginTop: '0.25rem' }}>46.2%</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Target: 50.0% parity by Q4 2026.
          </p>
        </div>

        <div className="card">
          <div className="stat-label">Engineering Department Balance</div>
          <div className="stat-value" style={{ color: 'var(--warning-amber)', marginTop: '0.25rem' }}>38.4%</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Under-represented by 6.6% compared to organization benchmark.
          </p>
        </div>
      </div>

      {/* Hiring Funnel Representation Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recruitment Funnel Stage Conversion by Gender</h3>
          <span className="badge badge-indigo">1,240 Total Applicants (Q3)</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
          <FunnelStageRow stage="1. Applied Candidates" maleCount={620} femaleCount={540} nonBinary={80} />
          <FunnelStageRow stage="2. Blind Screened (Passed)" maleCount={310} femaleCount={285} nonBinary={45} />
          <FunnelStageRow stage="3. Technical Interview Round" maleCount={140} femaleCount={132} nonBinary={20} />
          <FunnelStageRow stage="4. Executive Offer Extended" maleCount={42} femaleCount={40} nonBinary={6} />
          <FunnelStageRow stage="5. Hired & Onboarded" maleCount={38} femaleCount={36} nonBinary={5} />
        </div>
      </div>

      {/* Department Representation Heatmap */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Department Diversity Breakdown Heatmap</h3>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Total Staff</th>
                <th>Male %</th>
                <th>Female %</th>
                <th>Non-Binary %</th>
                <th>Parity Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Engineering & Ops</strong></td>
                <td className="font-mono">320</td>
                <td className="font-mono" style={{ color: 'var(--primary-indigo)' }}>58.6%</td>
                <td className="font-mono" style={{ color: 'var(--secondary-teal)' }}>38.4%</td>
                <td className="font-mono">3.0%</td>
                <td><span className="badge badge-amber">Gap Flagged</span></td>
              </tr>
              <tr>
                <td><strong>Product & Design</strong></td>
                <td className="font-mono">140</td>
                <td className="font-mono">48.2%</td>
                <td className="font-mono" style={{ color: 'var(--secondary-teal)' }}>47.8%</td>
                <td className="font-mono">4.0%</td>
                <td><span className="badge badge-teal">Balanced</span></td>
              </tr>
              <tr>
                <td><strong>Sales & Marketing</strong></td>
                <td className="font-mono">210</td>
                <td className="font-mono">44.0%</td>
                <td className="font-mono" style={{ color: 'var(--secondary-teal)' }}>51.0%</td>
                <td className="font-mono">5.0%</td>
                <td><span className="badge badge-teal">Balanced</span></td>
              </tr>
              <tr>
                <td><strong>Finance & Legal</strong></td>
                <td className="font-mono">85</td>
                <td className="font-mono">49.0%</td>
                <td className="font-mono" style={{ color: 'var(--secondary-teal)' }}>48.0%</td>
                <td className="font-mono">3.0%</td>
                <td><span className="badge badge-teal">Balanced</span></td>
              </tr>
              <tr>
                <td><strong>Executive Leadership</strong></td>
                <td className="font-mono">26</td>
                <td className="font-mono">53.8%</td>
                <td className="font-mono" style={{ color: 'var(--secondary-teal)' }}>46.2%</td>
                <td className="font-mono">0.0%</td>
                <td><span className="badge badge-teal">Near Parity</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FunnelStageRow({ stage, maleCount, femaleCount, nonBinary }) {
  const total = maleCount + femaleCount + nonBinary;
  const malePct = Math.round((maleCount / total) * 100);
  const femalePct = Math.round((femaleCount / total) * 100);
  const nbPct = 100 - malePct - femalePct;

  return (
    <div style={{ padding: '0.85rem', background: 'var(--neutral-bg)', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
        <span>{stage}</span>
        <span className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{total} candidates ({malePct}% M / {femalePct}% F / {nbPct}% NB)</span>
      </div>
      <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
        <div style={{ width: `${malePct}%`, background: 'var(--primary-indigo)' }} title={`Male: ${malePct}%`}></div>
        <div style={{ width: `${femalePct}%`, background: 'var(--secondary-teal)' }} title={`Female: ${femalePct}%`}></div>
        <div style={{ width: `${nbPct}%`, background: 'var(--warning-amber)' }} title={`Non-Binary: ${nbPct}%`}></div>
      </div>
    </div>
  );
}
