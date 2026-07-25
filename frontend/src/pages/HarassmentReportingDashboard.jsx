import React, { useState } from 'react';
import { ShieldAlert, Lock, MessageSquare, Paperclip, CheckCircle2, Clock, AlertTriangle, Send } from 'lucide-react';

export default function HarassmentReportingDashboard() {
  const [selectedCase, setSelectedCase] = useState({
    id: "SAFE-904",
    category: "Sexual Harassment / Unwelcome Conduct",
    severity: "Urgent",
    date: "July 24, 2026",
    status: "Under Investigation",
    narrative: "During the Q2 offsite team dinner, a senior manager repeatedly made inappropriate comments regarding my personal life and physical appearance after I requested him to stop. Screenshots of follow-up Slack messages attached.",
    evidenceCount: 2,
    chat: [
      { sender: "System", text: "Encrypted two-way channel opened between HR Case Officer and Anonymous Reporter.", time: "10:14 AM" },
      { sender: "HR Officer", text: "Thank you for bringing this forward. We have initiated a formal review under Zero-Tolerance Policy section 4.2. Can you specify if any witnesses were present?", time: "11:30 AM" },
      { sender: "Anonymous Employee", text: "Yes, two team members from the Product team were seated at the same table.", time: "11:42 AM" }
    ]
  });

  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSelectedCase({
      ...selectedCase,
      chat: [
        ...selectedCase.chat,
        { sender: "HR Officer", text: newMessage, time: "Just now" }
      ]
    });
    setNewMessage("");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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

      {/* Main Kanban & Detail Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.5rem' }}>
        {/* Left Column: Kanban Board Cases */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1rem', background: 'var(--surface-white)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-indigo)' }}>ACTIVE CASES (3 Total)</span>
              <span className="badge badge-teal">Zero-Knowledge Protected</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Case 1 */}
              <div 
                onClick={() => setSelectedCase({
                  id: "SAFE-904",
                  category: "Sexual Harassment / Unwelcome Conduct",
                  severity: "Urgent",
                  date: "July 24, 2026",
                  status: "Under Investigation",
                  narrative: "During the Q2 offsite team dinner, a senior manager repeatedly made inappropriate comments regarding my personal life...",
                  evidenceCount: 2,
                  chat: [
                    { sender: "System", text: "Encrypted two-way channel opened.", time: "10:14 AM" },
                    { sender: "HR Officer", text: "Thank you for bringing this forward. We have initiated a formal review.", time: "11:30 AM" },
                    { sender: "Anonymous Employee", text: "Yes, two team members from the Product team were seated at the same table.", time: "11:42 AM" }
                  ]
                })}
                style={{ 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  border: selectedCase.id === "SAFE-904" ? '2px solid var(--secondary-teal)' : '1px solid var(--border-light)',
                  background: selectedCase.id === "SAFE-904" ? 'var(--secondary-teal-light)' : 'var(--surface-white)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-mono" style={{ fontWeight: 'bold', color: 'var(--primary-indigo)' }}>#SAFE-904</span>
                  <span className="badge badge-coral">Urgent</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0.4rem 0' }}>Sexual Harassment Claim</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: Under Investigation • 2 Evidence Files</div>
              </div>

              {/* Case 2 */}
              <div 
                onClick={() => setSelectedCase({
                  id: "SAFE-882",
                  category: "Pay & Promotion Discrimination",
                  severity: "Standard",
                  date: "July 20, 2026",
                  status: "Pending Action",
                  narrative: "Discrimination report filed regarding promotion exclusion following maternity leave return.",
                  evidenceCount: 1,
                  chat: [
                    { sender: "System", text: "Encrypted channel opened.", time: "09:00 AM" }
                  ]
                })}
                style={{ 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  border: selectedCase.id === "SAFE-882" ? '2px solid var(--secondary-teal)' : '1px solid var(--border-light)',
                  background: selectedCase.id === "SAFE-882" ? 'var(--secondary-teal-light)' : 'var(--surface-white)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="font-mono" style={{ fontWeight: 'bold', color: 'var(--primary-indigo)' }}>#SAFE-882</span>
                  <span className="badge badge-amber">Standard</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0.4rem 0' }}>Promotion Exclusion Report</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status: Pending Review • 1 File</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Case Detail & Two-Way Encrypted Chat */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-indigo)' }}>#{selectedCase.id}</span>
                <span className="badge badge-coral">{selectedCase.severity}</span>
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)', marginTop: '0.2rem' }}>{selectedCase.category}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Submitted: {selectedCase.date}
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
              Attached Evidence Vault ({selectedCase.evidenceCount} Files)
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--neutral-bg)', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--border-light)' }}>
                <Paperclip size={14} color="var(--secondary-teal)" />
                <span>Slack_Screenshot_Redacted.png</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--neutral-bg)', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--border-light)' }}>
                <Paperclip size={14} color="var(--secondary-teal)" />
                <span>Offsite_Email_Receipt.pdf</span>
              </div>
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

            <div style={{ padding: '1rem', background: '#FFF', minHeight: '160px', maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedCase.chat.map((msg, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    alignSelf: msg.sender === "HR Officer" ? 'flex-end' : (msg.sender === "System" ? 'center' : 'flex-start'),
                    maxWidth: '85%'
                  }}
                >
                  {msg.sender === "System" ? (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--neutral-bg)', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                      {msg.text}
                    </div>
                  ) : (
                    <div style={{ 
                      background: msg.sender === "HR Officer" ? 'var(--primary-indigo)' : 'var(--neutral-bg)', 
                      color: msg.sender === "HR Officer" ? '#FFF' : 'var(--text-dark)', 
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
              <button type="submit" className="btn btn-teal" style={{ borderRadius: 0, padding: '0.6rem 1rem' }}>
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
