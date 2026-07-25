import { useState, useMemo } from 'react';
import { ShieldAlert, Lock, Paperclip, Send, Clock, CheckCircle2, AlertTriangle, Filter } from 'lucide-react';
import { useData } from '../context/DataContext';

const STATUS_OPTIONS = ['Pending Review', 'Under Investigation', 'Resolved'];
const FILTER_TABS = ['All', 'Pending Review', 'Under Investigation', 'Resolved'];

export default function HarassmentReportingDashboard() {
  const { safetyReports: cases, updateSafetyReportStatus, addSafetyMessage } = useData();
  const [selectedId, setSelectedId] = useState(() => cases[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const selectedCase = useMemo(() => cases.find(c => c.id === selectedId) || cases[0] || null, [cases, selectedId]);

  const filteredCases = useMemo(() => {
    if (statusFilter === 'All') return cases;
    return cases.filter(c => c.status === statusFilter);
  }, [cases, statusFilter]);

  // Summary stats — the "missing" piece: a real triage overview instead of just a raw list
  const stats = useMemo(() => {
    const total = cases.length;
    const urgent = cases.filter(c => c.severity === 'Urgent').length;
    const pending = cases.filter(c => c.status === 'Pending Review').length;
    const investigating = cases.filter(c => c.status === 'Under Investigation').length;
    const resolved = cases.filter(c => c.status === 'Resolved').length;
    return { total, urgent, pending, investigating, resolved };
  }, [cases]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCase) return;
    const text = newMessage.trim();
    setNewMessage('');
    setSending(true);
    await addSafetyMessage(selectedCase.id, 'HR Officer', text);
    setSending(false);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedCase) return;
    await updateSafetyReportStatus(selectedCase.id, newStatus);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="badge badge-coral" style={{ marginBottom: '0.4rem' }}>
            <ShieldAlert size={14} />
            <span>Encrypted Case Triage Platform</span>
          </div>
          <h1 className="page-title">Workplace Safety Case Management</h1>
          <p className="page-subtitle">Confidential triage for employee anonymous reports, evidence verification, and safe two-way communication.</p>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        <StatCard label="Total Cases" value={stats.total} icon={<ShieldAlert size={16} />} tone="indigo" />
        <StatCard label="Urgent" value={stats.urgent} icon={<AlertTriangle size={16} />} tone="coral" />
        <StatCard label="Pending Review" value={stats.pending} icon={<Clock size={16} />} tone="amber" />
        <StatCard label="Under Investigation" value={stats.investigating} icon={<Filter size={16} />} tone="teal" />
        <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircle2 size={16} />} tone="teal" />
      </div>

      {cases.length === 0 ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No workplace safety cases have been submitted.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
          {/* Left Column: Case List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="card" style={{ padding: '1rem', background: 'var(--surface-white)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-indigo)' }}>CASES ({filteredCases.length})</span>
                <span className="badge badge-teal">Zero-Knowledge Protected</span>
              </div>

              {/* Status filter tabs */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.85rem', flexWrap: 'wrap' }}>
                {FILTER_TABS.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={statusFilter === tab ? 'btn btn-teal btn-sm' : 'btn btn-outline btn-sm'}
                    style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredCases.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      border: selectedId === c.id ? '2px solid var(--secondary-teal)' : '1px solid var(--border-light)',
                      background: selectedId === c.id ? 'var(--secondary-teal-light)' : 'var(--surface-white)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-mono" style={{ fontWeight: 'bold', color: 'var(--primary-indigo)' }}>#{c.id}</span>
                      <span className={c.severity === 'Urgent' ? 'badge badge-coral' : 'badge badge-amber'}>{c.severity}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0.4rem 0' }}>{c.category}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Status: {c.status} • {c.evidenceFiles?.length || 0} File{c.evidenceFiles?.length === 1 ? '' : 's'} • {c.date}
                    </div>
                  </div>
                ))}
                {filteredCases.length === 0 && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No cases match this filter.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Case Detail & Two-Way Encrypted Chat */}
          {selectedCase && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-indigo)' }}>#{selectedCase.id}</span>
                    <span className={selectedCase.severity === 'Urgent' ? 'badge badge-coral' : 'badge badge-amber'}>{selectedCase.severity}</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)', marginTop: '0.2rem' }}>{selectedCase.category}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Submitted: {selectedCase.date}</div>
                </div>

                {/* Case status management — the case-owner action that was missing */}
                <div style={{ textAlign: 'right' }}>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Case Status</label>
                  <select
                    value={selectedCase.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.6rem' }}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Narrative */}
              <div style={{ background: 'var(--neutral-bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)', fontSize: '0.875rem' }}>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Report Narrative</h4>
                <p style={{ lineHeight: 1.5 }}>"{selectedCase.narrative}"</p>
              </div>

              {/* Evidence Files Locker */}
              <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Attached Evidence Vault ({selectedCase.evidenceFiles?.length || 0} File{selectedCase.evidenceFiles?.length === 1 ? '' : 's'})
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {(selectedCase.evidenceFiles || []).length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No evidence files attached.</span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
                      {selectedCase.evidenceFiles.map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--neutral-bg)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid var(--border-light)' }}>
                          <Paperclip size={14} color="var(--secondary-teal)" />
                          <span style={{ flex: 1 }}>{f.name || f}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                            {f.size ? (f.size < 1024 ? f.size + ' B' : f.size < 1024*1024 ? (f.size/1024).toFixed(1) + ' KB' : (f.size/(1024*1024)).toFixed(1) + ' MB') : ''}
                          </span>
                          {f.data && f.type?.startsWith('image/') ? (
                            <button
                              type="button"
                              onClick={() => window.open(f.data, '_blank')}
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                            >
                              Preview
                            </button>
                          ) : f.data ? (
                            <button
                              type="button"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = f.data;
                                link.download = f.name || 'evidence_file';
                                link.click();
                              }}
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                            >
                              Download
                            </button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Two-Way Anonymous Encrypted Chat Box */}
              <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: 'var(--primary-indigo)', color: '#FFF', padding: '0.6rem 1rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Lock size={12} color="var(--secondary-teal)" />
                    <span>Anonymous Two-Way Encrypted Chat</span>
                  </span>
                  <span>Identity PII Masked</span>
                </div>

                <div style={{ padding: '1rem', background: '#FFF', minHeight: '160px', maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedCase.chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        alignSelf: msg.sender === 'HR Officer' ? 'flex-end' : (msg.sender === 'System' ? 'center' : 'flex-start'),
                        maxWidth: '85%'
                      }}
                    >
                      {msg.sender === 'System' ? (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--neutral-bg)', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                          {msg.text}
                        </div>
                      ) : (
                        <div style={{
                          background: msg.sender === 'HR Officer' ? 'var(--primary-indigo)' : 'var(--neutral-bg)',
                          color: msg.sender === 'HR Officer' ? '#FFF' : 'var(--text-dark)',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.825rem',
                          boxShadow: 'var(--shadow-sm)'
                        }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.8, marginBottom: '0.2rem' }}>{msg.sender} • {msg.time}</div>
                          <div>{msg.text}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} style={{ display: 'flex', borderTop: '1px solid var(--border-light)' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, border: 'none', borderRadius: 0, padding: '0.6rem 0.85rem', fontSize: '0.85rem' }}
                    placeholder="Send encrypted follow-up message to anonymous employee..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <button type="submit" disabled={sending} className="btn btn-teal" style={{ borderRadius: 0, padding: '0.6rem 1rem', opacity: sending ? 0.7 : 1 }}>
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, tone }) {
  return (
    <div className="card" style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px',
        background: `var(--${tone === 'indigo' ? 'primary-indigo' : tone === 'coral' ? 'accent-coral' : tone === 'amber' ? 'warning-amber' : 'secondary-teal'})`,
        color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{label}</div>
      </div>
    </div>
  );
}
