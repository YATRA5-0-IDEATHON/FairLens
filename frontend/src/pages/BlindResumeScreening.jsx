import { useState, useMemo, useRef, useCallback } from 'react';
import { useData } from '../context/DataContext';
import {
  EyeOff, ShieldCheck, CheckCircle2, XCircle, Lock, Briefcase,
  Award, BarChart2, Upload, Loader2, ScanLine,
  FileText, Calendar, ChevronRight,
} from 'lucide-react';
import {
  structureRawOcrText,
  anonymizeStructuredText,
  computeSkillLevels,
  computeMeritScore,
  getCandidateMeritScore,
  extractSkillsFromText,
  extractExperienceYears,
  buildResumeTextFromCandidate,
  SECTION_HEADINGS,
} from '../utils/resumeProcessor';

// ---------------------------------------------------------------------------
// PDF text extraction (pdfjs-dist, already installed)
// ---------------------------------------------------------------------------
async function extractTextFromPDF(file) {
  const pdfjsLib = await import('pdfjs-dist');
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url,
    ).href;
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageTexts = await Promise.all(
    Array.from({ length: pdf.numPages }, async (_, i) => {
      const page = await pdf.getPage(i + 1);
      const content = await page.getTextContent();
      // Preserve newlines by checking y-position drops between items
      let lastY = null;
      let pageText = '';
      for (const item of content.items) {
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 4) {
          pageText += '\n';
        }
        pageText += item.str;
        lastY = item.transform[5];
      }
      return pageText;
    }),
  );

  return pageTexts.join('\n');
}

// ---------------------------------------------------------------------------
// Render a single section of structured + anonymized resume text
// ---------------------------------------------------------------------------
function ResumeSection({ title, lines }) {
  const HEADING_LABELS = SECTION_HEADINGS.map(h => h.toUpperCase());
  const isKnownHeading = HEADING_LABELS.includes(title.toUpperCase());

  return (
    <section style={{ marginBottom: '1.6rem' }}>
      <h3 style={{
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--primary-indigo)',
        borderBottom: '1px solid var(--border-light)',
        paddingBottom: '0.3rem',
        marginBottom: '0.65rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
      }}>
        {isKnownHeading && <ShieldCheck size={11} color="var(--secondary-teal)" />}
        {title}
      </h3>
      <div style={{ display: 'grid', gap: '0.32rem' }}>
        {lines.map((line, i) => <ResumeLine key={i} text={line} />)}
      </div>
    </section>
  );
}

// Render one line — highlight redacted tokens, style bullets and date-ranges
function ResumeLine({ text }) {
  const isBullet = text.startsWith('• ');
  const isDateLine = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\b.*\b(present|current|\d{4})\b/i.test(text);
  const isRole = !isBullet && !isDateLine && text.length < 90
    && /\b(engineer|developer|manager|analyst|designer|architect|consultant|specialist|director|lead|intern|scientist|researcher)\b/i.test(text);

  const display = isBullet ? text.slice(2) : text;

  // Split on [REDACTED …] tokens so we can style them inline
  const parts = display.split(/(\[REDACTED[^\]]*\])/g);
  const content = parts.map((part, i) =>
    part.startsWith('[REDACTED')
      ? <span key={i} className="redacted-box" style={{ fontSize: '0.72rem', verticalAlign: 'middle' }}>{part}</span>
      : <span key={i}>{part}</span>,
  );

  if (isBullet) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: '0.3rem', fontSize: '0.875rem', lineHeight: 1.6 }}>
        <span style={{ color: 'var(--secondary-teal)', fontWeight: 700 }}>•</span>
        <span>{content}</span>
      </div>
    );
  }
  if (isDateLine) {
    return (
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.1rem' }}>
        {content}
      </div>
    );
  }
  if (isRole) {
    return (
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-dark)', marginTop: '0.3rem' }}>
        {content}
      </div>
    );
  }
  return (
    <div style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-dark)' }}>
      {content}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Parse structured text into sections for rendering
// ---------------------------------------------------------------------------
function parseSections(text) {
  if (!text.trim()) return [];
  const HEADING_RE = new RegExp(
    `^(${SECTION_HEADINGS.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})[:\\s]*$`,
    'i',
  );

  const sections = [];
  let current = { title: 'Resume', lines: [] };

  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    // Strip the UPPERCASE version we wrote during structuring
    const normalised = line.replace(/[:\s]+$/, '').trim();
    const matchAsHeading = SECTION_HEADINGS.find(
      h => h.toUpperCase() === normalised.toUpperCase(),
    );
    if (matchAsHeading || HEADING_RE.test(normalised)) {
      if (current.lines.length) sections.push({ ...current });
      current = { title: matchAsHeading || normalised, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.length) sections.push({ ...current });
  return sections;
}

// ---------------------------------------------------------------------------
// SkillBar
// ---------------------------------------------------------------------------
function SkillBar({ skill, level }) {
  const color = level >= 80 ? 'var(--secondary-teal)' : level >= 60 ? 'var(--primary-indigo)' : level >= 45 ? 'var(--warning-amber)' : 'var(--accent-coral)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
        <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <ShieldCheck size={12} color={level >= 60 ? 'var(--secondary-teal)' : 'var(--text-muted)'} />
          {skill}
        </span>
        <span className="font-mono" style={{ fontWeight: 700, fontSize: '0.8rem', color }}>{level}%</span>
      </div>
      <div className="progress-bar-bg" style={{ height: '8px' }}>
        <div className="progress-bar-fill" style={{ width: `${level}%`, backgroundColor: color, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function BlindResumeScreening() {
  const { candidates: rawCandidates, updateCandidateStatus } = useData();
  const candidates = useMemo(() => rawCandidates ?? [], [rawCandidates]);
  const [selectedId, setSelectedId] = useState(() => rawCandidates?.[0]?.id || 'CAN-891');

  // Per-candidate: { rawOcr, structuredText, anonymized, redactedCount, skills, expYears, meritScore }
  const [ocrResults, setOcrResults] = useState({});
  const [uploadState, setUploadState] = useState('idle'); // idle | loading | done | error
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef(null);

  // ── selected candidate ──────────────────────────────────────────────────
  const DEFAULT = useMemo(() => ({
    id: 'CAN-891', name: 'Sarah Jenkins', email: 's.jenkins@domain.com',
    location: 'San Francisco, CA', appliedRole: 'Senior Staff Engineer',
    resumeText: '', summary: 'Senior Full-Stack Software Engineer with 6+ years experience.',
    skills: ['Distributed Systems', 'Node.js', 'React', 'PostgreSQL'],
    experience: [], education: {}, meritScore: 94, experienceYears: 6, status: 'Pending Review',
  }), []);

  const candidate = useMemo(
    () => candidates.find(c => c.id === selectedId) || candidates[0] || DEFAULT,
    [candidates, selectedId, DEFAULT],
  );

  const cid = candidate.id;
  const ocr = ocrResults[cid];

  // ── effective values: OCR wins, then stored data, then built from JSON ──
  const effectiveRaw = useMemo(() => {
    if (ocr?.structuredText) return ocr.structuredText;
    if (candidate.resumeText) return structureRawOcrText(candidate.resumeText);
    return buildResumeTextFromCandidate(candidate);
  }, [ocr, candidate]);

  const anonymized = useMemo(() => {
    return anonymizeStructuredText(effectiveRaw, {
      name: candidate.name,
      email: candidate.email,
      location: candidate.location,
      school: candidate.education?.school,
    });
  }, [effectiveRaw, candidate]);

  const sections = useMemo(() => parseSections(anonymized.anonymized), [anonymized.anonymized]);

  const skills = useMemo(() => {
    if (ocr?.skills?.length) return ocr.skills;
    return candidate.skills || [];
  }, [ocr, candidate.skills]);

  const expYears = useMemo(() => {
    if (ocr?.expYears != null) return ocr.expYears;
    return candidate.experienceYears || extractExperienceYears(effectiveRaw);
  }, [ocr, candidate.experienceYears, effectiveRaw]);

  const skillLevels = useMemo(
    () => computeSkillLevels(skills, anonymized.anonymized),
    [skills, anonymized.anonymized],
  );

  const meritScore = useMemo(() => {
    // A fresh PDF upload in this view recalculates from the newly extracted text/skills.
    if (ocr?.meritScore != null) return ocr.meritScore;
    // Otherwise use the same canonical calculation shown everywhere else in the app.
    return getCandidateMeritScore(candidate);
  }, [ocr, candidate]);

  const sortedSkills = useMemo(
    () => [...skills].sort((a, b) => (skillLevels[b] || 50) - (skillLevels[a] || 50)),
    [skills, skillLevels],
  );

  const sourceLabel = ocr ? 'PDF OCR' : candidate.resumeText ? 'Stored' : 'Structured Data';

  // ── PDF upload ──────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are supported.');
      setUploadState('error');
      return;
    }
    setUploadState('loading');
    setUploadError('');
    try {
      const raw = await extractTextFromPDF(file);
      if (!raw || raw.trim().length < 20) {
        throw new Error('Could not extract readable text. The PDF may be image-only — try a text-based PDF.');
      }
      const structured = structureRawOcrText(raw);
      const extracted = extractSkillsFromText(raw);
      const expY = extractExperienceYears(raw);
      const merit = computeMeritScore(raw, extracted);

      setOcrResults(prev => ({
        ...prev,
        [cid]: {
          structuredText: structured,
          skills: extracted.length ? extracted : (candidate.skills || []),
          expYears: expY || candidate.experienceYears || 0,
          meritScore: merit,
        },
      }));
      setUploadState('done');
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Failed to read PDF.');
      setUploadState('error');
    }
  }, [cid, candidate]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <div className="badge badge-teal" style={{ marginBottom: '0.4rem' }}>
            <EyeOff size={14} />
            <span>Blind Bias-Free Screening — PII Auto-Redacted</span>
          </div>
          <h1 className="page-title">Blind Resume Screening Viewport</h1>
          <p className="page-subtitle">
            Upload a PDF to extract, structure, and redact the resume. All PII is masked before display.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-white)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-input)', border: '1px solid var(--border-light)' }}>
          <Briefcase size={14} color="var(--primary-indigo)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {candidates.length} Application{candidates.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="var(--primary-indigo)" />
            <div>
              <h3 className="card-title">Candidate Applications</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                Click a row to open it below and make screening changes
              </p>
            </div>
          </div>
          <span className="badge badge-indigo">{candidates.length} Applications</span>
        </div>

        {candidates.length === 0 ? (
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
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map(cand => {
                  const isSelected = cand.id === cid;
                  const merit = getCandidateMeritScore(cand);
                  return (
                    <tr
                      key={cand.id}
                      onClick={() => { setSelectedId(cand.id); setUploadState('idle'); setUploadError(''); }}
                      style={{
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(99,102,241,0.07)' : 'transparent',
                      }}
                    >
                      <td className="font-mono" style={{ fontWeight: 700, color: 'var(--primary-indigo)' }}>{cand.id}</td>
                      <td><strong>{cand.appliedRole}</strong></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', maxWidth: '220px' }}>
                          {(cand.skills || []).slice(0, 3).map(s => (
                            <span key={s} className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>{s}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${merit >= 80 ? 'badge-teal' : merit >= 60 ? 'badge-amber' : 'badge-coral'}`}>
                          {merit}/100
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          <Calendar size={13} />
                          {formatApplicationDate(cand.appliedDate || cand.createdAt)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${cand.status === 'Shortlisted' ? 'badge-teal' : cand.status === 'Declined' ? 'badge-coral' : 'badge-amber'}`}>
                          {cand.status || 'Pending Review'}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: 'var(--primary-indigo)', fontWeight: 600 }}>
                          View <ChevronRight size={14} />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Split layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ════ LEFT: Resume document ════ */}
        <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-light)' }}>

          {/* Title bar */}
          <div style={{
            background: 'var(--primary-indigo)', color: '#fff',
            padding: '0.85rem 1.25rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
              <Lock size={16} color="var(--secondary-teal)" />
              REDACTED RESUME — #{cid}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="badge badge-teal" style={{ fontSize: '0.7rem' }}>
                {anonymized.redactedCount} PII fields redacted
              </span>
              <span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                {sourceLabel}
              </span>
            </div>
          </div>

          {/* ── PDF upload drop zone ── */}
          <div
            onDrop={onDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => uploadState !== 'loading' && fileRef.current?.click()}
            style={{
              padding: '0.65rem 1.25rem',
              background: uploadState === 'done' ? 'rgba(63,167,150,0.09)'
                : uploadState === 'error' ? 'rgba(220,38,38,0.07)'
                  : 'rgba(99,102,241,0.06)',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex', alignItems: 'center', gap: '0.7rem',
              cursor: uploadState === 'loading' ? 'default' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />
            {uploadState === 'loading'
              ? <Loader2 size={15} color="var(--primary-indigo)" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              : uploadState === 'done'
                ? <ScanLine size={15} color="var(--secondary-teal)" style={{ flexShrink: 0 }} />
                : <Upload size={15} color="var(--primary-indigo)" style={{ flexShrink: 0 }} />}
            <span style={{
              fontSize: '0.8rem', fontWeight: 500, flex: 1,
              color: uploadState === 'error' ? '#DC2626' : 'var(--text-dark)',
            }}>
              {uploadState === 'loading' && 'Extracting and structuring PDF text…'}
              {uploadState === 'done' && `✓ PDF processed — ${skills.length} skills detected, ${anonymized.redactedCount} PII fields redacted`}
              {uploadState === 'error' && (uploadError || 'Upload failed')}
              {uploadState === 'idle' && (ocr ? 'Re-upload a PDF to refresh' : 'Drop or click to upload candidate PDF — text will be extracted, structured, and redacted')}
            </span>
          </div>

          {/* ── Resume body ── */}
          <div className="resume-document-view">
            {/* Anonymised header */}
            <div style={{ borderBottom: '2px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="redacted-box" style={{ fontSize: '1.05rem', padding: '0.15rem 0.7rem' }}>CANDIDATE NAME REDACTED</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 400 }}>| #{cid}</span>
              </h2>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <span>Role: <strong>{candidate.appliedRole}</strong></span>
                <span>Email: <span className="redacted-box" style={{ fontSize: '0.7rem' }}>REDACTED</span></span>
                <span>Location: <span className="redacted-box" style={{ fontSize: '0.7rem' }}>REDACTED</span></span>
                {expYears > 0 && <span>Experience: <strong>{expYears}+ yrs</strong></span>}
              </div>
            </div>

            {sections.length > 0
              ? sections.map((sec, i) => <ResumeSection key={i} title={sec.title} lines={sec.lines} />)
              : (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
                  <Upload size={40} style={{ opacity: 0.25, marginBottom: '1rem' }} />
                  <p style={{ fontWeight: 600 }}>No resume content yet</p>
                  <p style={{ fontSize: '0.82rem', marginTop: '0.4rem' }}>Upload a PDF above to extract and display the anonymised resume.</p>
                </div>
              )
            }
          </div>
        </div>

        {/* ════ RIGHT: Assessment panel ════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Skill assessment */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} color="var(--secondary-teal)" />
                <h3 className="card-title">AI-Extracted Skills Assessment</h3>
              </div>
              <span className="badge badge-teal">Merit: {meritScore}/100</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sortedSkills.length > 0
                ? sortedSkills.map(skill => <SkillBar key={skill} skill={skill} level={skillLevels[skill] || 60} />)
                : (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <BarChart2 size={28} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                    <p>No skills detected yet.</p>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Upload a PDF to auto-extract skills.</p>
                  </div>
                )
              }
            </div>

            {/* Merit bar */}
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                <span>Merit Score</span>
                <span className="font-mono" style={{ fontWeight: 700, color: meritScore >= 80 ? 'var(--secondary-teal)' : meritScore >= 60 ? 'var(--warning-amber)' : 'var(--accent-coral)' }}>
                  {meritScore}/100
                </span>
              </div>
              <div className="progress-bar-bg" style={{ height: '12px' }}>
                <div className="progress-bar-fill" style={{
                  width: `${meritScore}%`,
                  background: meritScore >= 80 ? 'linear-gradient(90deg, var(--secondary-teal), #45B7A0)'
                    : meritScore >= 60 ? 'linear-gradient(90deg, var(--warning-amber), #F5B342)'
                      : 'linear-gradient(90deg, var(--accent-coral), #E85D4E)',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                <span>Skills: +{Math.min(25, sortedSkills.length * 4)}</span>
                <span>Experience: +{Math.min(15, expYears * 2)}</span>
                <span>Education: +{/PhD|Doctorate/i.test(effectiveRaw) ? '10' : /Master|MS|M\.S\./i.test(effectiveRaw) ? '7' : /Bachelor|BS|B\.S\./i.test(effectiveRaw) ? '4' : '0'}</span>
              </div>
            </div>
          </div>


          {/* HR decision */}
          <div className="card" style={{
            background: candidate.status !== 'Pending Review' ? 'var(--secondary-teal-light)' : 'var(--surface-white)',
            border: `1px solid ${candidate.status !== 'Pending Review' ? 'var(--secondary-teal)' : 'var(--border-light)'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Current Status:</span>
              <span className={`badge ${candidate.status === 'Shortlisted' ? 'badge-teal' : candidate.status === 'Declined' ? 'badge-coral' : 'badge-amber'}`}>
                {candidate.status}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button className={`btn ${candidate.status === 'Shortlisted' ? 'btn-teal' : 'btn-outline'}`} onClick={() => updateCandidateStatus(cid, 'Shortlisted')}>
                <CheckCircle2 size={16} /><span>Shortlist</span>
              </button>
              <button className={`btn ${candidate.status === 'Declined' ? 'btn-coral' : 'btn-outline'}`} onClick={() => updateCandidateStatus(cid, 'Declined')}>
                <XCircle size={16} /><span>Decline</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .resume-document-view {
          padding: 2rem 2.5rem;
          background: #fff;
          min-height: 520px;
          max-height: 76vh;
          overflow-y: auto;
          line-height: 1.6;
          color: var(--text-dark);
        }
        .resume-document-view::-webkit-scrollbar { width: 6px; }
        .resume-document-view::-webkit-scrollbar-track { background: var(--neutral-bg); }
        .resume-document-view::-webkit-scrollbar-thumb { background: var(--border-light); border-radius: 3px; }
        .resume-document-view::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function formatApplicationDate(value) {
  if (!value) return 'Not recorded';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsed);
}
