import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import EqualityScoreRing from '../components/EqualityScoreRing';
import { 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  ShieldAlert, 
  Users, 
  PlusCircle, 
  FileText,
  CheckCircle2,
  Filter,
  X,
  RefreshCw,
  Edit2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HRDashboard() {
  const { 
    filteredEmployees,
    genderStats,
    payGapStats,
    overallEqualityScore,
    biasAlerts,
    safetyReports,
    selectedDeptFilter,
    setSelectedDeptFilter,
    addEmployee,
    updateEmployeeSalary,
    dismissBiasAlert
  } = useData();

  // State for Add Employee Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpGender, setNewEmpGender] = useState('Female');
  const [newEmpDept, setNewEmpDept] = useState('Engineering & Ops');
  const [newEmpRole, setNewEmpRole] = useState('Senior Software Engineer');
  const [newEmpSalary, setNewEmpSalary] = useState(160000);

  // State for Editing Employee Salary
  const [editingEmpId, setEditingEmpId] = useState(null);
  const [editSalaryValue, setEditSalaryValue] = useState(160000);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newEmpName) return;
    addEmployee({
      name: newEmpName,
      gender: newEmpGender,
      department: newEmpDept,
      role: newEmpRole,
      salary: newEmpSalary,
      level: 'L4',
      experienceYears: 5,
      monthsInRole: 14
    });
    setNewEmpName('');
    setShowAddModal(false);
  };

  const handleSalarySave = (id) => {
    updateEmployeeSalary(id, editSalaryValue);
    setEditingEmpId(null);
  };

  const openCasesCount = safetyReports.filter(r => r.status !== 'Resolved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner Header with Interactive Filter & Add Employee Button */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive HR & DEI Dashboard</h1>
          <p className="page-subtitle">Real-time reactive equality index, pay parity analytics, and bias stream powered by JSON dataset.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Interactive Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--surface-white)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-light)' }}>
            <Filter size={14} color="var(--primary-indigo)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Dept:</span>
            <select 
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: 600, color: 'var(--primary-indigo)', cursor: 'pointer', outline: 'none' }}
            >
              <option value="All">All Departments ({genderStats.total} staff)</option>
              <option value="Engineering & Ops">Engineering & Ops</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Sales & Marketing">Sales & Marketing</option>
              <option value="Finance & Legal">Finance & Legal</option>
              <option value="Executive Leadership">Executive Leadership</option>
            </select>
          </div>

          <button className="btn btn-teal btn-sm" onClick={() => setShowAddModal(true)}>
            <PlusCircle size={16} />
            <span>+ Add Employee</span>
          </button>

          <Link to="/blind-screening" className="btn btn-outline btn-sm">
            <FileText size={16} />
            <span>Screen Resumes</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Reactive KPI Cards */}
      <div className="grid-4">
        <div className="card stat-card">
          <div className="stat-label">Overall Equality Index</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <div className="stat-value" style={{ color: 'var(--primary-indigo)' }}>
              {overallEqualityScore}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div className="badge badge-teal">Live Reactive</div>
          </div>
          <div className="progress-bar-bg" style={{ marginTop: '0.5rem' }}>
            <div className="progress-bar-fill" style={{ width: `${overallEqualityScore}%`, background: 'linear-gradient(90deg, #3FA796, #2B2E6B)' }}></div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">Unexplained Pay Gap</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <div className="stat-value" style={{ color: payGapStats.gapPct > 0 ? 'var(--accent-coral)' : 'var(--secondary-teal)' }}>
              {payGapStats.gapPct > 0 ? `-${payGapStats.gapPct}%` : `+${Math.abs(payGapStats.gapPct)}%`}
            </div>
            <div className={`badge ${payGapStats.isFlagged ? 'badge-coral' : 'badge-teal'}`}>
              {payGapStats.isFlagged ? 'Flagged' : 'In Range'}
            </div>
          </div>
          <div className="stat-trend negative">
            <AlertTriangle size={14} />
            <span>Avg Male: ${payGapStats.maleAvgSalary.toLocaleString()} vs Female: ${payGapStats.femaleAvgSalary.toLocaleString()}</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">Active Headcount ({selectedDeptFilter})</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <div className="stat-value">{genderStats.total}</div>
            <div className="badge badge-teal">{genderStats.femalePct}% Female</div>
          </div>
          <div className="stat-trend positive">
            <CheckCircle2 size={14} />
            <span>Dataset Synchronized</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">Open Safety Reports</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
            <div className="stat-value" style={{ color: openCasesCount > 0 ? 'var(--warning-amber)' : 'var(--secondary-teal)' }}>
              {openCasesCount}
            </div>
            <div className={`badge ${openCasesCount > 0 ? 'badge-amber' : 'badge-teal'}`}>
              {openCasesCount > 0 ? 'Triage Active' : 'All Clear'}
            </div>
          </div>
          <div className="stat-trend neutral">
            <ShieldAlert size={14} />
            <span>Zero-Knowledge Encryption</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Score Ring + Donut & Bias Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Equality Score & Sub-Metric Breakdown */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Live Equality Index Architecture</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Recalculates instantly when JSON dataset or filters change</div>
            </div>
            <span className="badge badge-indigo">{selectedDeptFilter} View</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
            <EqualityScoreRing score={overallEqualityScore} size={190} label="Equal Index" />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <SubScoreProgress label="Gender Balance Score" score={Math.min(100, Math.max(40, 100 - Math.abs(genderStats.femalePct - 50) * 2))} color="var(--secondary-teal)" />
              <SubScoreProgress label="Pay Parity Metric" score={Math.min(100, Math.max(40, Math.round(100 - Math.abs(payGapStats.gapPct) * 6)))} color="var(--warning-amber)" />
              <SubScoreProgress label="Workplace Safety Index" score={Math.max(50, 100 - openCasesCount * 10)} color="var(--secondary-teal)" />
            </div>
          </div>
        </div>

        {/* Gender Distribution Widget */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Gender Representation Ratio</h3>
            <span className="badge badge-teal">{genderStats.total} Staff Plotted</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <GenderRatioBar label="Male" count={genderStats.maleCount} pct={genderStats.malePct} color="#2B2E6B" />
            <GenderRatioBar label="Female" count={genderStats.femaleCount} pct={genderStats.femalePct} color="#3FA796" />
            <GenderRatioBar label="Non-Binary" count={genderStats.nbCount} pct={genderStats.nbPct} color="#E6A100" />
            <GenderRatioBar label="Unspecified" count={genderStats.unspecCount} pct={genderStats.unspecPct} color="#94A3B8" />
          </div>
        </div>
      </div>

      {/* Interactive Employee Dataset Table with Live Salary Editor */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Interactive Employee Dataset</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Edit salary or demographics below to see the Overall Equality Score & Pay Gap update in real-time.
            </p>
          </div>
          <span className="badge badge-indigo">{filteredEmployees.length} Records Shown</span>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee Name</th>
                <th>Gender</th>
                <th>Department</th>
                <th>Role Title</th>
                <th>Annual Salary</th>
                <th>Performance</th>
                <th>Interactive Edit</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.slice(0, 8).map((emp) => (
                <tr key={emp.id}>
                  <td className="font-mono" style={{ fontWeight: 'bold' }}>{emp.id}</td>
                  <td><strong>{emp.name}</strong></td>
                  <td>
                    <span className={`badge ${emp.gender === 'Female' ? 'badge-teal' : (emp.gender === 'Male' ? 'badge-indigo' : 'badge-amber')}`}>
                      {emp.gender}
                    </span>
                  </td>
                  <td>{emp.department}</td>
                  <td>{emp.role}</td>
                  <td className="font-mono" style={{ fontWeight: 600 }}>
                    {editingEmpId === emp.id ? (
                      <input 
                        type="number" 
                        value={editSalaryValue}
                        onChange={(e) => setEditSalaryValue(Number(e.target.value))}
                        style={{ width: '100px', padding: '0.2rem 0.4rem', border: '1px solid var(--secondary-teal)', borderRadius: '4px' }}
                      />
                    ) : (
                      `$${emp.salary?.toLocaleString()}`
                    )}
                  </td>
                  <td className="font-mono">{emp.performanceRating} / 5.0</td>
                  <td>
                    {editingEmpId === emp.id ? (
                      <button className="btn btn-teal btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleSalarySave(emp.id)}>
                        Save
                      </button>
                    ) : (
                      <button className="btn btn-outline btn-sm" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setEditingEmpId(emp.id); setEditSalaryValue(emp.salary); }}>
                        <Edit2 size={12} /> Edit Salary
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Bias Alerts Stream */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} color="var(--accent-coral)" />
            <h3 className="card-title">Active AI Bias Alert Feed ({biasAlerts.length})</h3>
          </div>
          <span className="badge badge-coral">Real-Time Detection</span>
        </div>

        <div className="grid-3">
          {biasAlerts.map((alert) => (
            <div key={alert.id} style={{ padding: '1rem', borderLeft: '4px solid var(--accent-coral)', background: 'var(--accent-coral-light)', borderRadius: '0 8px 8px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '0.9rem' }}>
                  <span>{alert.title}</span>
                  <span className="font-mono" style={{ color: 'var(--accent-coral)' }}>{alert.metric}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem', lineHeight: 1.4 }}>
                  {alert.description}
                </p>
              </div>
              <div style={{ marginTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-coral" style={{ fontSize: '0.65rem' }}>{alert.department}</span>
                <button className="btn btn-outline btn-sm" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }} onClick={() => dismissBiasAlert(alert.id)}>
                  Dismiss Flag
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30, 31, 38, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary-indigo)' }}>Add New Employee Record</h3>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Maya Lin"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={newEmpGender} onChange={(e) => setNewEmpGender(e.target.value)}>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Unspecified">Unspecified</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Annual Salary ($)</label>
                  <input 
                    type="number" 
                    className="form-input font-mono" 
                    value={newEmpSalary}
                    onChange={(e) => setNewEmpSalary(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-select" value={newEmpDept} onChange={(e) => setNewEmpDept(e.target.value)}>
                  <option value="Engineering & Ops">Engineering & Ops</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                  <option value="Finance & Legal">Finance & Legal</option>
                  <option value="Executive Leadership">Executive Leadership</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Role Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newEmpRole}
                  onChange={(e) => setNewEmpRole(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-teal" style={{ flex: 2 }}>Add Record & Recalculate</button>
              </div>
            </form>
          </div>
        </div>
      )}
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
