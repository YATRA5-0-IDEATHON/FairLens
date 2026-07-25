import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, UploadCloud, ArrowRight, CheckCircle2, LogIn, Send, MessageSquare, Paperclip, X, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

export default function EmployeeReportingPortal({ embedded, onBackToDashboard }) {
  const { auth, logout } = useAuth();
  const { safetyReports, addSafetyReport, addSafetyMessage } = useData();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("Sexual Harassment / Unwelcome Conduct");
  const [narrative, setNarrative] = useState("");
  const [caseId, setCaseId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Evidence upload state
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [isFormMinimized, setIsFormMinimized] = useState(false);

  // Anonymous chat state for reports linked to this authenticated employee.
  const [chatHistory, setChatHistory] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const myReports = safetyReports.filter(item => item.ownerEmployeeId === auth.employeeId);
  const sharedCase = safetyReports.find(item => item.id === caseId);
  const visibleChatHistory = sharedCase?.chatHistory || chatHistory;

  const handleLogout = () => {
    logout();
    navigate('/login?role=employee');
  };

  const handleBackToDashboard = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      navigate('/employee-dashboard');
    }
  };

  const handleQuickExit = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      navigate('/employee-dashboard');
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      submitReport();
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25MB total
    const newFiles = [];

    for (const file of files) {
      if (evidenceFiles.length + newFiles.length >= 5) {
        alert('Maximum 5 files allowed.');
        break;
      }
      if (!['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
        alert(`File "${file.name}" has an unsupported format. Please use PNG, JPG, PDF, or DOCX.`);
        continue;
      }
      newFiles.push(file);
    }

    const totalSize = evidenceFiles.reduce((sum, f) => sum + f.size, 0) + newFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      alert(`Total file size exceeds 25MB limit. Current: ${(totalSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    // Read files as base64 for sending to backend
    const readPromises = newFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            data: ev.target.result // base64 data URL
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then(results => {
      setEvidenceFiles(prev => [...prev, ...results]);
    });

    // Reset input so the same file can be re-selected if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return '🖼️';
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('word')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const submitReport = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const report = await addSafetyReport({ category, narrative, evidenceFiles, ownerEmployeeId: auth.employeeId });
      setCaseId(report.id);
      setChatHistory(report.chatHistory);
      setStep(4);
    } catch (err) {
      setSubmitError('Could not submit report — the server may be offline. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openMyReport = report => {
    setCaseId(report.id);
    setCategory(report.category);
    setNarrative(report.narrative || '');
    setEvidenceFiles(report.evidenceFiles || []);
    setChatHistory(report.chatHistory || []);
    setStep(5);
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !caseId) return;
    const text = chatMessage.trim();
    setChatMessage("");
    await addSafetyMessage(caseId, 'Anonymous Employee', text);
  };

  const refreshChat = () => {
    if (sharedCase) setChatHistory(sharedCase.chatHistory || []);
  };

  return (
    <div style={{
      minHeight: embedded ? 'auto' : '100vh',
      backgroundColor: embedded ? 'transparent' : 'var(--neutral-bg)',
      color: 'var(--text-dark)',
      padding: embedded ? 0 : '2rem'
    }}>

      {/* Top bar — only when NOT embedded (standalone page) */}
      {!embedded && (
        <div style={{ maxWidth: '800px', margin: '0 auto 2rem auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3FA796, #E85D4E)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: 'var(--font-serif)', color: '#FFF' }}>
              FL
            </div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-indigo)' }}>FairLens Safe Portal</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Back to Dashboard Button */}
            <button
              onClick={handleBackToDashboard}
              className="btn btn-outline btn-sm"
              title="Go back to your employee dashboard"
              style={{ borderColor: 'var(--border-light)' }}
            >
              <ArrowRight size={14} />
              <span>Dashboard</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
              title="Log out and return to login page"
              style={{ borderColor: 'var(--border-light)' }}
            >
              <LogIn size={14} />
              <span>Logout</span>
            </button>

            {/* Quick Exit Button */}
            <button
              onClick={handleQuickExit}
              className="btn btn-outline btn-sm"
              title="Go back to your employee dashboard"
              style={{ borderColor: 'var(--border-light)' }}
            >
              <ArrowRight size={14} />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      )}

      {/* In embedded mode, show a compact header instead */}
      {embedded && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="anonymity-shield-banner" style={{ marginBottom: '0.75rem' }}>
            <Lock size={20} color="var(--secondary-teal)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary-indigo)' }}>
                Zero-Knowledge Encrypted Session
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Your identity remains hidden from case reviewers. Your reports and HR conversations stay available in this signed-in account.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Banner — only when NOT embedded */}
      {!embedded && (
        <div style={{ maxWidth: '800px', margin: '0 auto 1.5rem auto' }}>
          <div className="anonymity-shield-banner">
            <Lock size={24} color="var(--secondary-teal)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-indigo)' }}>
                Zero-Knowledge Encrypted Session
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Your identity remains hidden from case reviewers. This signed-in account securely retains access to your reports and conversations.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Wizard Form Container */}
      <div className="card" style={{
        maxWidth: '800px',
        margin: '0 auto',
        boxShadow: embedded ? 'var(--shadow-sm)' : 'var(--shadow-lg)'
      }}>
        {/* Wizard Steps Header (hidden during anonymous chat) */}
        {step !== 5 && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <StepHeader num={1} label="Category" active={step === 1} done={step > 1} />
            <StepHeader num={2} label="Narrative" active={step === 2} done={step > 2} />
            <StepHeader num={3} label="Evidence Upload" active={step === 3} done={step > 3} />
            <StepHeader num={4} label="Confirmation" active={step === 4} done={step === 4} />
          </div>
        )}

        <form onSubmit={handleNextStep}>
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>Step 1: Select Allegation Category</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Choose the category that best describes the incident.</p>

              {myReports.length > 0 && (
                <div style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '0.9rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.65rem', color: 'var(--primary-indigo)' }}>
                    Your existing reports and conversations
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {myReports.map(report => (
                      <button key={report.id} type="button" onClick={() => openMyReport(report)} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', padding: '0.75rem', border: '1px solid var(--border-light)', borderRadius: '8px', background: '#fff', textAlign: 'left', cursor: 'pointer' }}>
                        <span><strong style={{ display: 'block', color: 'var(--text-dark)', fontSize: '0.83rem' }}>{report.category}</strong><small style={{ color: 'var(--text-muted)' }}>{report.id} · {report.date}</small></span>
                        <span className="badge badge-teal">{report.status}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                <CategoryRadio
                  label="Sexual Harassment / Unwelcome Conduct"
                  desc="Unwanted verbal comments, physical gestures, microaggressions, or pressure."
                  selected={category === "Sexual Harassment / Unwelcome Conduct"}
                  onClick={() => setCategory("Sexual Harassment / Unwelcome Conduct")}
                />
                <CategoryRadio
                  label="Pay & Compensation Discrimination"
                  desc="Disparities in salary, bonuses, or equity grants based on gender."
                  selected={category === "Pay & Compensation Discrimination"}
                  onClick={() => setCategory("Pay & Compensation Discrimination")}
                />
                <CategoryRadio
                  label="Promotion & Advancement Exclusion"
                  desc="Unfair promotion bottlenecks or retaliation following parental/maternity leave."
                  selected={category === "Promotion & Advancement Exclusion"}
                  onClick={() => setCategory("Promotion & Advancement Exclusion")}
                />
                <CategoryRadio
                  label="General Workplace Bullying / Microaggressions"
                  desc="Hostile work environment, public humiliation, or systemic exclusion."
                  selected={category === "General Workplace Bullying / Microaggressions"}
                  onClick={() => setCategory("General Workplace Bullying / Microaggressions")}
                />
              </div>

              <button type="submit" className="btn btn-teal" style={{ width: '100%', padding: '0.75rem' }}>
                <span>Continue to Incident Narrative</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>Step 2: Incident Narrative</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Provide objective details regarding dates, times, and events.</p>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Detailed Incident Narrative</label>
                <textarea
                  className="form-textarea"
                  rows="6"
                  style={{ width: '100%', lineHeight: 1.6 }}
                  placeholder="Describe what occurred, dates, location, and any witnesses involved..."
                  value={narrative}
                  onChange={(e) => setNarrative(e.target.value)}
                  required
                ></textarea>
              </div>

              <div style={{ background: 'var(--warning-amber-light)', padding: '0.85rem', borderRadius: '8px', borderLeft: '4px solid var(--warning-amber)', marginBottom: '2rem', fontSize: '0.8rem', color: 'var(--text-dark)' }}>
                🔒 <strong>FairLens Privacy Guard:</strong> For complete anonymity, avoid including your own full name unless you explicitly wish to be contacted directly.
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>Back</button>
                <button type="submit" className="btn btn-teal" style={{ flex: 2 }}>
                  <span>Continue to Evidence Upload</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>Step 3: Attach Evidence (Optional)</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Upload screenshots, email receipts, or documents. EXIF metadata is automatically stripped.</p>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.pdf,.docx"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--secondary-teal)'; e.currentTarget.style.background = 'var(--secondary-teal-light)'; }}
                onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.background = 'var(--neutral-bg)'; }}
                onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.background = 'var(--neutral-bg)'; handleFileSelect({ target: { files: e.dataTransfer.files } }); }}
                style={{ border: '2px dashed var(--border-light)', borderRadius: 'var(--radius-card)', padding: '3rem 2rem', textAlign: 'center', background: 'var(--neutral-bg)', marginBottom: '1rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                <UploadCloud size={40} color="var(--secondary-teal)" style={{ marginBottom: '0.75rem' }} />
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Drag and drop files here or click to browse</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Supports PNG, JPG, PDF, DOCX (Max 25MB, up to 5 files)</div>
              </div>

              {/* Selected files preview */}
              {evidenceFiles.length > 0 && (
                <div style={{ marginBottom: '1.5rem', background: 'var(--surface-white)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-indigo)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Paperclip size={14} /> {evidenceFiles.length} File{evidenceFiles.length !== 1 ? 's' : ''} Selected
                  </div>
                  {evidenceFiles.map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.5rem', borderRadius: '6px', background: idx % 2 === 0 ? 'transparent' : 'var(--neutral-bg)', fontSize: '0.8rem' }}>
                      <span>{getFileIcon(f.type)}</span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{formatFileSize(f.size)}</span>
                      {f.type?.startsWith('image/') && (
                        <span
                          onClick={() => window.open(f.data, '_blank')}
                          style={{ cursor: 'pointer', color: 'var(--secondary-teal)', display: 'flex', alignItems: 'center' }}
                          title="Preview image"
                        >
                          <Eye size={14} />
                        </span>
                      )}
                      <button type="button" onClick={() => removeFile(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-coral)', padding: '2px', display: 'flex', alignItems: 'center' }} title="Remove file">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {submitError && (
                <div style={{ background: 'var(--warning-amber-light)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-dark)' }}>
                  ⚠️ {submitError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setStep(2)} className="btn btn-outline" style={{ flex: 1 }}>Back</button>
                <button type="submit" disabled={submitting} className="btn btn-coral" style={{ flex: 2, opacity: submitting ? 0.7 : 1 }}>
                  <span>{submitting ? 'Submitting...' : 'Submit Anonymous Report Encrypted'}</span>
                  <ShieldCheck size={16} />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--secondary-teal-light)', color: 'var(--secondary-teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <CheckCircle2 size={36} />
              </div>

              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>
                Report Submitted Securely
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '560px', margin: '0 auto 2rem auto' }}>
                Your report has been encrypted and assigned to the HR case team. It is now saved to your account, so you can return to this conversation whenever you sign in.
              </p>

              <div style={{ background: 'var(--primary-indigo)', color: '#FFF', padding: '1.25rem', borderRadius: 'var(--radius-card)', margin: '0 auto 2rem auto', maxWidth: '600px', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ color: 'var(--secondary-teal)', fontWeight: 700 }}>Case {caseId}</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.68)', marginTop: '0.35rem' }}>Access is linked to your authenticated employee account. No code is required.</div>
              </div>

              <button type="button" onClick={() => setStep(5)} className="btn btn-teal">
                <MessageSquare size={16} />
                <span>Continue to Anonymous Chat with HR</span>
              </button>
            </div>
          )}
        </form>

        {step === 5 && (
          <div>
            {/* Minimized Form Summary — collapsible */}
            <div style={{ marginBottom: '1.5rem', border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden' }}>
              <div
                onClick={() => setIsFormMinimized(!isFormMinimized)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 1rem', background: 'var(--neutral-bg)', cursor: 'pointer',
                  borderBottom: isFormMinimized ? 'none' : '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--secondary-teal)" />
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary-indigo)' }}>
                    Report Submitted — {category}
                  </span>
                  <span className="badge badge-teal" style={{ fontSize: '0.65rem' }}>Case: {caseId}</span>
                </div>
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  {isFormMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>
              </div>
              {!isFormMinimized && (
                <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div><span style={{ color: 'var(--text-muted)' }}>Category:</span> <strong>{category}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Narrative:</span> {narrative.substring(0, 120)}{narrative.length > 120 ? '...' : ''}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Evidence:</span> {evidenceFiles.length} file{evidenceFiles.length !== 1 ? 's' : ''}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Access:</span> <strong>Saved to your employee account</strong></div>
                </div>
              )}
            </div>

            {/* Anonymous Chat Box — prominently displayed */}
            <div style={{ border: '1px solid var(--border-light)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ background: 'var(--primary-indigo)', color: '#FFF', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={16} color="var(--secondary-teal)" />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Anonymous Chat with HR</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Two-way encrypted • Your identity is never revealed</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: 'rgba(255,255,255,0.15)', borderRadius: '20px' }} className="font-mono">{caseId}</span>
                  <button type="button" onClick={refreshChat} className="btn btn-outline btn-sm" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#FFF', padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>↻</button>
                </div>
              </div>

              {/* Chat messages area */}
              <div style={{ padding: '1rem', background: '#FFF', minHeight: '280px', maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {visibleChatHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <MessageSquare size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                    <div>No messages yet. Send a message to start the conversation with HR.</div>
                  </div>
                ) : (
                  visibleChatHistory.map((msg, idx) => (
                    <div key={idx} style={{ alignSelf: msg.sender === 'Anonymous Employee' ? 'flex-end' : (msg.sender === 'System' ? 'center' : 'flex-start'), maxWidth: '85%' }}>
                      {msg.sender === 'System' ? (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--neutral-bg)', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>{msg.text}</div>
                      ) : (
                        <div style={{
                          background: msg.sender === 'Anonymous Employee' ? 'var(--secondary-teal)' : 'var(--neutral-bg)',
                          color: msg.sender === 'Anonymous Employee' ? '#FFF' : 'var(--text-dark)',
                          padding: '0.6rem 0.85rem', borderRadius: '8px', fontSize: '0.825rem', boxShadow: 'var(--shadow-sm)'
                        }}>
                          <div style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.8, marginBottom: '0.2rem' }}>{msg.sender === 'Anonymous Employee' ? 'You (Anonymous)' : msg.sender} • {msg.time}</div>
                          <div style={{ lineHeight: 1.4 }}>{msg.text}</div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Chat input */}
              <form onSubmit={handleSendChat} style={{ display: 'flex', borderTop: '1px solid var(--border-light)', padding: '0.5rem', gap: '0.5rem', background: 'var(--neutral-bg)' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1, border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.7rem 0.85rem', fontSize: '0.875rem' }}
                  placeholder="Send an anonymous message to HR..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <button type="submit" className="btn btn-teal" style={{ borderRadius: '8px', padding: '0.7rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Send size={16} />
                  <span style={{ fontSize: '0.8rem' }}>Send</span>
                </button>
              </form>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setStep(1)} className="btn btn-outline btn-sm">Start another report</button>
              <button type="button" onClick={handleQuickExit} className="btn btn-outline">
                <ArrowRight size={16} />
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepHeader({ num, label, active, done }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: active || done ? 1 : 0.4 }}>
      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: done ? 'var(--secondary-teal)' : (active ? 'var(--primary-indigo)' : 'var(--border-light)'), color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
        {done ? '✓' : num}
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: active ? 600 : 400, color: 'var(--text-dark)' }}>{label}</span>
    </div>
  );
}

function CategoryRadio({ label, desc, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '1rem',
        borderRadius: '8px',
        border: selected ? '2px solid var(--secondary-teal)' : '1px solid var(--border-light)',
        background: selected ? 'var(--secondary-teal-light)' : 'var(--surface-white)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}
    >
      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--secondary-teal)', background: selected ? 'var(--secondary-teal)' : 'transparent', marginTop: '0.1rem', flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-indigo)' }}>{label}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{desc}</div>
      </div>
    </div>
  );
}
