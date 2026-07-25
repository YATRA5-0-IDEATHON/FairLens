import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import EqualityScoreRing from '../components/EqualityScoreRing';
import {
  AlertTriangle,
  ShieldAlert,
  PlusCircle,
  CheckCircle2,
  Filter,
  X,
  Edit2,
  RotateCcw,
  FileText,
  ChevronRight,
  Lock,
  Award,
  ShieldCheck,
  EyeOff,
  Calendar,
  Briefcase,
} from 'lucide-react';
import {
  buildResumeTextFromCandidate,
  structureRawOcrText,
  anonymizeStructuredText,
  computeSkillLevels,
  getCandidateMeritScore,
  SECTION_HEADINGS,
} from '../utils/resumeProcessor';

export default function HRDashboard() {
  const {
    filteredEmployees,
    genderStats,
    payGapStats,
    overallEqualityScore,
    biasAlerts,
    safetyReports,
    candidates,
    selectedDeptFilter,
    setSelectedDeptFilter,
    addEmployee,
    updateEmployeeSalary,
    updateCandidateStatus,
    dismissBiasAlert,
    resetToJSONFile,
  } = useData();

  const allCandidates = useMemo(() => candidates ?? [], [candidates]);

  // Resume drawer state
  const [drawerCandId, setDrawerCandId] = useState(null);
  const drawerCandidate = useMemo(
    () => allCandidates.find(c => c.id === drawerCandId) || null,
    [allCandidates, drawerCandId],
  );

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

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newEmpName) return;
    await addEmployee({
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

  const handleSalarySave = async (id) => {
    await updateEmployeeSalary(id, editSalaryValue);
    setEditingEmpId(null);
  };

  const openCasesCount = safetyReports.filter(r => r.status !== 'Resolved').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner Header with Interactive Filter & Add Employee Button */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive HR & DEI Dashboard</h1>
          <p className="page-subtitle">Two-way synchronized equality index, pay parity analytics, and dataset engine.</p>
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

          <button className="btn btn-outline btn-sm" onClick={resetToJSONFile} title="Reload fresh data directly from dataset/employees.json file">
            <RotateCcw size={14} />
            <span>Reset to File JSON</span>
          </button>
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
            <div className="badge badge-teal">Live Synchronized</div>
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
            <span>Disk File & API Synced</span>
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
              Edit salary or add employees below — modifications write directly back to <code>dataset/employees.json</code> on disk!
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
              {filteredEmployees.slice(0, 10).map((emp) => (
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
                        Save to Disk
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

      {/* ── Candidate Applications List ── */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--primary-indigo)" />
            <div>
              <h3 className="card-title">Candidate Applications</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Click any row to open the extracted, anonymised resume
              </p>
            </div>
          </div>
          <span className="badge badge-indigo">{allCandidates.length} Applications</span>
        </div>

        {allCandidates.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileText size={36} style={{ opacity: 0.25, marginBottom: '0.75rem' }} />
            <p>No candidate applications yet.</p>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Applied Role</th>
                  <th>Skills</th>
                  <th>Merit Score</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Resume</th>
                </tr>
              </thead>
              <tbody>
                {allCandidates.map(cand => (
                  <tr
                    key={cand.id}
                    style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                    onClick={() => setDrawerCandId(cand.id)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-indigo)' }}>{cand.id}</td>
                    <td><strong>{cand.appliedRole}</strong></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', maxWidth: '220px' }}>
                        {(cand.skills || []).slice(0, 3).map(s => (
                          <span key={s} className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{s}</span>
                        ))}
                        {(cand.skills || []).length > 3 && (
                          <span className="badge" style={{ fontSize: '0.65rem', background: 'var(--neutral-bg)', color: 'var(--text-muted)' }}>
                            +{cand.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {(() => {
                          const merit = getCandidateMeritScore(cand);
                          return (
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: merit >= 80 ? 'rgba(63,167,150,0.12)' : 'rgba(230,161,0,0.12)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.75rem', fontWeight: 700,
                              color: merit >= 80 ? 'var(--secondary-teal)' : 'var(--warning-amber)',
                            }}>
                              {merit}
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={12} />
                        {cand.appliedDate || '—'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        cand.status === 'Shortlisted' ? 'badge-teal'
                        : cand.status === 'Declined'   ? 'badge-coral'
                        : 'badge-amber'
                      }`}>
                        {cand.status || 'Pending Review'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        onClick={e => { e.stopPropagation(); setDrawerCandId(cand.id); }}
                      >
                        <EyeOff size={12} />
                        View
                        <ChevronRight size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Resume Drawer ── */}
      {drawerCandidate && (
        <ResumeDrawer
          candidate={drawerCandidate}
          onClose={() => setDrawerCandId(null)}
          onStatusChange={(id, status) => updateCandidateStatus(id, status)}
        />
      )}

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
                <button type="submit" className="btn btn-teal" style={{ flex: 2 }}>Save to Disk JSON & Recalculate</button>
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

// ───────────────────────────────────────────────────────────────────────────
// Resume Drawer — slide-in panel showing extracted + redacted resume
// ───────────────────────────────────────────────────────────────────────────
function ResumeDrawer({ candidate, onClose, onStatusChange }) {
  const rawText = candidate.resumeText || buildResumeTextFromCandidate(candidate);
  const structured = useMemo(() => structureRawOcrText(rawText), [rawText]);
  const anon = useMemo(() => anonymizeStructuredText(structured, {
    name:     candidate.name,
    email:    candidate.email,
    location: candidate.location,
    school:   candidate.education?.school,
  }), [structured, candidate]);

  const skills  = useMemo(() => candidate.skills || [], [candidate.skills]);
  const levels  = useMemo(() => computeSkillLevels(skills, anon.anonymized), [skills, anon.anonymized]);
  const merit   = useMemo(() => getCandidateMeritScore(candidate), [candidate]);
  const sorted  = useMemo(() => [...skills].sort((a, b) => (levels[b] || 50) - (levels[a] || 50)), [skills, levels]);
  const sections = useMemo(() => parseDrawerSections(anon.anonymized), [anon.anonymized]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(20,21,30,0.55)',
          backdropFilter: 'blur(3px)',
          zIndex: 1100,
        }}
      />

      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(780px, 92vw)',
        background: '#fff',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
        zIndex: 1101,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Drawer header */}
        <div style={{
          background: 'var(--primary-indigo)', color: '#fff',
          padding: '1rem 1.5rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Lock size={16} color="var(--secondary-teal)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>REDACTED RESUME — #{candidate.id}</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: '0.15rem' }}>
                {anon.redactedCount} PII fields redacted · Blind screening mode
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>
              <EyeOff size={11} /> Blind Mode
            </span>
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '6px', padding: '0.35rem 0.5rem', display: 'flex', alignItems: 'center' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer body — two-column split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', flex: 1, overflow: 'hidden' }}>

          {/* Left: resume document */}
          <div style={{ overflowY: 'auto', padding: '2rem 2rem 2rem 2.5rem', borderRight: '1px solid var(--border-light)' }}>

            {/* Anonymised header */}
            <div style={{ borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.35rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="redacted-box" style={{ fontSize: '1rem', padding: '0.15rem 0.65rem' }}>NAME REDACTED</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>| #{candidate.id}</span>
              </h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Briefcase size={12} />
                  <strong>{candidate.appliedRole}</strong>
                </span>
                <span>Email: <span className="redacted-box" style={{ fontSize: '0.68rem' }}>REDACTED</span></span>
                <span>Location: <span className="redacted-box" style={{ fontSize: '0.68rem' }}>REDACTED</span></span>
              </div>
            </div>

            {/* Sections */}
            {sections.length > 0
              ? sections.map((sec, i) => <DrawerSection key={i} title={sec.title} lines={sec.lines} />)
              : <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No resume content available for this candidate.</p>
            }
          </div>

          {/* Right: skill assessment + decision */}
          <div style={{ overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--neutral-bg)' }}>

            {/* Merit score */}
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
                <Award size={15} color="var(--secondary-teal)" />
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Merit Score</span>
                <span className="badge badge-teal" style={{ marginLeft: 'auto', fontSize: '0.72rem' }}>{merit}/100</span>
              </div>
              <div className="progress-bar-bg" style={{ height: '10px' }}>
                <div className="progress-bar-fill" style={{
                  width: `${merit}%`,
                  background: merit >= 80
                    ? 'linear-gradient(90deg, var(--secondary-teal), #45B7A0)'
                    : merit >= 60
                      ? 'linear-gradient(90deg, var(--warning-amber), #F5B342)'
                      : 'linear-gradient(90deg, var(--accent-coral), #E85D4E)',
                }} />
              </div>
            </div>

            {/* Skills */}
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.85rem' }}>
                <ShieldCheck size={14} color="var(--secondary-teal)" />
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Skills ({sorted.length})</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {sorted.length > 0
                  ? sorted.map(skill => <DrawerSkillBar key={skill} skill={skill} level={levels[skill] || 60} />)
                  : <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No skills detected.</span>
                }
              </div>
            </div>

            {/* Decision */}
            <div className="card" style={{ padding: '1rem' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.6rem', color: 'var(--text-dark)' }}>Status</div>
              <div style={{ marginBottom: '0.75rem' }}>
                <span className={`badge ${
                  candidate.status === 'Shortlisted' ? 'badge-teal'
                  : candidate.status === 'Declined'   ? 'badge-coral'
                  : 'badge-amber'
                }`}>
                  {candidate.status || 'Pending Review'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  className={`btn btn-sm ${candidate.status === 'Shortlisted' ? 'btn-teal' : 'btn-outline'}`}
                  onClick={() => onStatusChange(candidate.id, 'Shortlisted')}
                >
                  <CheckCircle2 size={14} /> Shortlist
                </button>
                <button
                  className={`btn btn-sm ${candidate.status === 'Declined' ? 'btn-coral' : 'btn-outline'}`}
                  onClick={() => onStatusChange(candidate.id, 'Declined')}
                >
                  <X size={14} /> Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DrawerSection({ title, lines }) {
  const isKnown = SECTION_HEADINGS.map(h => h.toUpperCase()).includes(title.toUpperCase());
  return (
    <section style={{ marginBottom: '1.5rem' }}>
      <h3 style={{
        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--primary-indigo)',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '0.28rem', marginBottom: '0.6rem',
        display: 'flex', alignItems: 'center', gap: '0.35rem',
      }}>
        {isKnown && <ShieldCheck size={10} color="var(--secondary-teal)" />}
        {title}
      </h3>
      <div style={{ display: 'grid', gap: '0.3rem' }}>
        {lines.map((line, i) => <DrawerLine key={i} text={line} />)}
      </div>
    </section>
  );
}

function DrawerLine({ text }) {
  const isBullet   = text.startsWith('• ');
  const isDateLine = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\b.*\b(present|current|\d{4})\b/i.test(text);
  const isRole     = !isBullet && !isDateLine && text.length < 90
    && /\b(engineer|developer|manager|analyst|designer|architect|consultant|specialist|director|lead|intern|scientist|researcher)\b/i.test(text);

  const display = isBullet ? text.slice(2) : text;
  const parts = display.split(/(\[REDACTED[^\]]*\])/g);
  const content = parts.map((p, i) =>
    p.startsWith('[REDACTED')
      ? <span key={i} className="redacted-box" style={{ fontSize: '0.68rem', verticalAlign: 'middle' }}>{p}</span>
      : <span key={i}>{p}</span>,
  );

  if (isBullet) return (
    <div style={{ display: 'grid', gridTemplateColumns: '12px 1fr', gap: '0.28rem', fontSize: '0.855rem', lineHeight: 1.6 }}>
      <span style={{ color: 'var(--secondary-teal)', fontWeight: 700 }}>•</span>
      <span>{content}</span>
    </div>
  );
  if (isDateLine) return (
    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{content}</div>
  );
  if (isRole) return (
    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-dark)', marginTop: '0.25rem' }}>{content}</div>
  );
  return (
    <div style={{ fontSize: '0.855rem', lineHeight: 1.65, color: 'var(--text-dark)' }}>{content}</div>
  );
}

function DrawerSkillBar({ skill, level }) {
  const color = level >= 80 ? 'var(--secondary-teal)' : level >= 60 ? 'var(--primary-indigo)' : level >= 45 ? 'var(--warning-amber)' : 'var(--accent-coral)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.18rem' }}>
        <span style={{ fontWeight: 500 }}>{skill}</span>
        <span className="font-mono" style={{ fontWeight: 700, color }}>{level}%</span>
      </div>
      <div className="progress-bar-bg" style={{ height: '6px' }}>
        <div className="progress-bar-fill" style={{ width: `${level}%`, backgroundColor: color, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function parseDrawerSections(text) {
  if (!text || !text.trim()) return [];
  const HEADING_RE = new RegExp(
    `^(${SECTION_HEADINGS.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})[:\\s]*$`,
    'i',
  );
  const sections = [];
  let current = { title: 'Resume', lines: [] };
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const normalised = line.replace(/[:\s]+$/, '').trim();
    const matchedHeading = SECTION_HEADINGS.find(h => h.toUpperCase() === normalised.toUpperCase());
    if (matchedHeading || HEADING_RE.test(normalised)) {
      if (current.lines.length) sections.push({ ...current });
      current = { title: matchedHeading || normalised, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.length) sections.push({ ...current });
  return sections;
}
