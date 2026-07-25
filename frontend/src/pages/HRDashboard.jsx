import React from 'react';
import EqualityScoreRing from '../components/EqualityScoreRing';
import { 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  Users, 
  ArrowUpRight, 
  FileText,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HRDashboard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive HR & DEI Dashboard</h1>
          <p className="page-subtitle">Real-time gender equality index, pay parity analytics, and bias alert stream.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/blind-screening" className="btn btn-primary btn-sm">
            <FileText size={16} />
            <span>Screen Resumes</span>
          </Link>
          <Link to="/compliance-reports" className="btn btn-outline btn-sm">
            <span>Export Audit PDF</span>
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid-4">
        <div className="card stat-card">
          <div className="stat-label">Overall Gender Health</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <div className="stat-value" style={{ color: 'var(--primary-indigo)' }}>84<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span></div>
            <div className="badge badge-teal">+3.2% Q3</div>
          </div>
          <div className="progress-bar-bg" style={{ marginTop: '0.5rem' }}>
            <div className="progress-bar-fill" style={{ width: '84%', background: 'linear-gradient(90deg, #3FA796, #2B2E6B)' }}></div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">Unexplained Pay Gap</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <div className="stat-value" style={{ color: 'var(--accent-coral)' }}>-3.4%</div>
            <div className="badge badge-coral">Flagged</div>
          </div>
          <div className="stat-trend negative">
            <AlertTriangle size={14} />
            <span>Target: &lt; 1.5% parity threshold</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">Blind Screenings Conducted</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <div className="stat-value">342</div>
            <div className="badge badge-teal">100% PII Masked</div>
          </div>
          <div className="stat-trend positive">
            <CheckCircle2 size={14} />
            <span>Zero demographic leaks detected</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">Open Safety Reports</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <div className="stat-value" style={{ color: 'var(--warning-amber)' }}>2</div>
            <div className="badge badge-amber">Triage Active</div>
          </div>
          <div className="stat-trend neutral">
            <ShieldAlert size={14} />
            <span>Avg resolution: 4.2 days</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Score Ring + Donut & Bias Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Equality Score & Sub-Metric Breakdown */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card-header">
            <h3 className="card-title">Equality Index Architecture</h3>
            <span className="badge badge-indigo">Updated 2m ago</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
            <EqualityScoreRing score={84} size={190} label="Gender Parity Score" />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <SubScoreProgress label="Blind Hiring Fairness" score={92} color="var(--secondary-teal)" />
              <SubScoreProgress label="Pay Equity Parity" score={78} color="var(--warning-amber)" />
              <SubScoreProgress label="Promotion Wait Equitability" score={81} color="var(--secondary-teal)" />
              <SubScoreProgress label="Workplace Safety Index" score={85} color="var(--secondary-teal)" />
            </div>
          </div>
        </div>

        {/* Gender Distribution Widget */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Gender Representation Ratio</h3>
            <Link to="/gender-analytics" style={{ fontSize: '0.8rem', color: 'var(--secondary-teal)', textDecoration: 'none' }}>View breakdown ➔</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <GenderRatioBar label="Male" count={412} pct={48} color="#2B2E6B" />
            <GenderRatioBar label="Female" count={378} pct={44} color="#3FA796" />
            <GenderRatioBar label="Non-Binary" count={43} pct={5} color="#E6A100" />
            <GenderRatioBar label="Unspecified / Confidential" count={25} pct={3} color="#94A3B8" />
          </div>

          <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'var(--neutral-bg)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            💡 <strong>Target Goal:</strong> Maintain minimum 45-55% balance across all leadership tiers.
          </div>
        </div>
      </div>

      {/* Bottom Grid: Active Bias Stream & Recent Activity */}
      <div className="grid-2">
        {/* Active Bias Alerts */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="var(--accent-coral)" />
              <h3 className="card-title">Active AI Bias Alerts</h3>
            </div>
            <span className="badge badge-coral">2 Requires Focus</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ padding: '1rem', borderLeft: '4px solid var(--accent-coral)', background: 'var(--accent-coral-light)', borderRadius: '0 8px 8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.9rem' }}>
                <span>Engineering Department Promotion Gap</span>
                <span className="font-mono" style={{ color: 'var(--accent-coral)' }}>-14.2%</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Female engineers remain in Senior L5 title 8.4 months longer than male peers before promotion consideration.
              </p>
              <div style={{ marginTop: '0.5rem' }}>
                <Link to="/promotion-analytics" className="btn btn-coral btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                  Investigate Promotion Analytics
                </Link>
              </div>
            </div>

            <div style={{ padding: '1rem', borderLeft: '4px solid var(--warning-amber)', background: 'var(--warning-amber-light)', borderRadius: '0 8px 8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.9rem' }}>
                <span>Sales Senior Account Exec Salary Disparity</span>
                <span className="font-mono" style={{ color: 'var(--warning-amber)' }}>-$6,400/yr</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Unexplained base compensation variance detected for mid-tier Sales hires after controlling for target attainment.
              </p>
              <div style={{ marginTop: '0.5rem' }}>
                <Link to="/pay-equity" className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                  Audit Pay Gap
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Platform Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Audit Activity</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time log</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ActivityItem 
              time="12 mins ago" 
              title="Blind Screening Complete" 
              desc="Candidate #891 redacted & scored (Senior React Engineer). Merit Index: 94/100."
            />
            <ActivityItem 
              time="1 hour ago" 
              title="Anonymous Report Status Update" 
              desc="Case #SAFE-904 updated to 'Under Investigation' by DEI Officer."
            />
            <ActivityItem 
              time="3 hours ago" 
              title="Quarterly Pay Audit Generated" 
              desc="EEO-1 compliance report generated for Q3 board presentation."
            />
            <ActivityItem 
              time="5 hours ago" 
              title="Candidate Comparison Shared" 
              desc="Blind shortlist comparison table generated for Product Manager role."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SubScoreProgress({ label, score, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span className="font-mono" style={{ fontWeight: 600 }}>{score}/100</span>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${score}%`, backgroundColor: color }}></div>
      </div>
    </div>
  );
}

function GenderRatioBar({ label, count, pct, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
        <span><strong>{label}</strong> ({count} staff)</span>
        <span className="font-mono">{pct}%</span>
      </div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }}></div>
      </div>
    </div>
  );
}

function ActivityItem({ time, title, desc }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--secondary-teal)', marginTop: '0.4rem' }}></div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
          <span>{title}</span>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 400 }}>{time}</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{desc}</p>
      </div>
    </div>
  );
}
