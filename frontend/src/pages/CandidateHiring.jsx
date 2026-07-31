import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, EyeOff, Upload, CheckCircle2, ArrowRight, Sparkles, Building2, AlertCircle, LoaderCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { buildResumeIntelligence } from '../utils/resumeIntelligence';
import { extractContactDetails, extractResumeFile } from '../utils/resumeFileExtractor';
import { structureRawOcrText, anonymizeStructuredText, computeMeritScore } from '../utils/resumeProcessor';

export default function CandidateHiring() {
  const { addCandidate } = useData();
  const [jobTitle, setJobTitle] = useState('Senior Full Stack Software Engineer');
  const [openJobs, setOpenJobs] = useState([]);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  
  const [selectedImage, setSelectedImage] = useState(null);
  
  // Raw text state
  const [resumeText, setResumeText] = useState('');
  const [extractionStatus, setExtractionStatus] = useState('');
  const [extractionError, setExtractionError] = useState('');
  const [resumeAnalysis, setResumeAnalysis] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCandidate, setSubmittedCandidate] = useState(null);
  const resumeInputRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    fetch('/api/lifecycle/jobs/public')
      .then(async response => {
        const body = await response.json().catch(() => []);
        if (!response.ok) throw new Error(body.error || 'Could not load open roles.');
        return body;
      })
      .then(jobs => {
        if (!active || !Array.isArray(jobs)) return;
        setOpenJobs(jobs);
        if (jobs.length) {
          setJobTitle(current => jobs.some(job => job.title === current) ? current : jobs[0].title);
        }
      })
      .catch(() => {
        if (active) setOpenJobs([{ id: 'fallback', title: 'Senior Full Stack Software Engineer' }]);
      });
    return () => { active = false; };
  }, []);

  const processFile = async (file) => {
    if (!file) return;
    setSelectedImage(file);
    setExtractionError('');
    setResumeAnalysis(null);
    try {
      const text = await extractResumeFile(file, setExtractionStatus);
      setResumeText(text);
      const contact = extractContactDetails(text);
      if (!candidateName && contact.name) setCandidateName(contact.name);
      if (!candidateEmail && contact.email) setCandidateEmail(contact.email);
      setResumeAnalysis(buildResumeIntelligence({
        id: `preview-${Date.now()}`,
        name: contact.name,
        email: contact.email,
        resumeText: text,
        appliedRole: jobTitle,
      }));
      setExtractionStatus('Extraction complete');
    } catch (error) {
      setExtractionError(error.message || 'Could not read this resume.');
      setExtractionStatus('');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    await processFile(file);
    // Allow the same PDF to be selected again after an error or a new submission.
    e.target.value = '';
  };

  const resetApplication = () => {
    setSubmittedCandidate(null);
    setCandidateName('');
    setCandidateEmail('');
    setSelectedImage(null);
    setResumeText('');
    setResumeAnalysis(null);
    setExtractionStatus('');
    setExtractionError('');
    if (resumeInputRef.current) resumeInputRef.current.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const analysis = resumeAnalysis || buildResumeIntelligence({
      id: `candidate-${Date.now()}`, name: candidateName, email: candidateEmail,
      resumeText, appliedRole: jobTitle,
    });

    // Structure + redact now so we can show the applicant how many PII fields were masked
    const structured = structureRawOcrText(resumeText);
    const redactionPreview = anonymizeStructuredText(structured, {
      name: candidateName,
      email: candidateEmail,
    });

    const skills = Object.values(analysis.categorizedSkills).flat();

    try {
      const created = await addCandidate({
        name: candidateName,
        email: candidateEmail,
        appliedRole: jobTitle,
        resumeText,
        summary: analysis.summary,
        skills,
        experienceYears: analysis.experienceYears,
        education: analysis.education,
        meritScore: computeMeritScore(resumeText, skills),
      });
      setSubmittedCandidate({ ...created, redactedCount: redactionPreview.redactedCount });
    } catch (error) {
      setExtractionError(error.message || 'The application could not be submitted.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="apply-page">
      <nav className="apply-nav">
        <Link className="apply-brand" to="/"><img src="/logo.png" alt="FairLens" /><span>FairLens</span></Link>
        <div>
          <Link to="/">Home</Link>
          <Link className="hr-link" to="/login?role=hr"><Building2 size={15} /> HR sign in</Link>
        </div>
      </nav>

      <main className="apply-shell">
        <header className="apply-intro">
          <span><EyeOff size={15} /> Blind application</span>
          <h1>Apply for your next role.</h1>
          <p>Your resume is reviewed for skills and experience. Personal details stay hidden from the hiring team.</p>
        </header>

        {submittedCandidate ? (
          <section className="apply-card success-card">
            <i className="success-icon"><CheckCircle2 size={32} /></i>
            <span className="success-label">Application received</span>
            <h2>You’re all set.</h2>
            <p>Your application for <strong>{submittedCandidate.appliedRole}</strong> is now under blind review.</p>
            <div className="receipt">
              <div><span>Candidate code</span><strong>{submittedCandidate.id}</strong></div>
              <div><span>Status</span><strong className="status">Under review</strong></div>
              <div><span>Details protected</span><strong>{submittedCandidate.redactedCount || 0} fields</strong></div>
            </div>
            <div className="success-actions">
              <button type="button" onClick={resetApplication}>Submit another</button>
              <Link to="/">Back home <ArrowRight size={15} /></Link>
            </div>
          </section>
        ) : (
          <form onSubmit={handleSubmitApplication} className="apply-card">
            <section className="form-section">
              <div className="section-title"><b>01</b><div><h2>Your application</h2><p>Tell us where we can contact you.</p></div></div>
              <div className="apply-grid">
                <label><span>Role</span>
                  <select value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}>
                    {openJobs.length === 0 && <option value={jobTitle}>Loading open roles…</option>}
                    {openJobs.map(job => <option key={job.id} value={job.title}>{job.title}</option>)}
                  </select>
                </label>
                <label><span>Full name <small>kept private</small></span><input type="text" placeholder="Alex Morgan" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} required /></label>
                <label className="full"><span>Email address</span><input type="email" placeholder="alex@example.com" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} required /></label>
              </div>
            </section>

            <section className="form-section resume-section">
              <div className="section-title"><b>02</b><div><h2>Your resume</h2><p>Upload one PDF document.</p></div></div>
              <div className={`pdf-drop ${selectedImage ? 'has-file' : ''}`} onDragOver={handleDragOver} onDrop={handleDrop}>
                <input ref={resumeInputRef} type="file" accept=".pdf,application/pdf" id="resume-image-input" onChange={handleImageChange} />
                <label htmlFor="resume-image-input">
                  <i>{extractionStatus === 'Extraction complete' ? <CheckCircle2 size={25} /> : <Upload size={25} />}</i>
                  <div><strong>{selectedImage ? selectedImage.name : 'Drop your PDF here'}</strong><span>{selectedImage ? 'Click to replace this file' : 'or click to choose a file'}</span></div>
                  <em>PDF only</em>
                </label>
              </div>
              {extractionStatus && <div className="file-message success">{extractionStatus !== 'Extraction complete' && <LoaderCircle size={16} className="spin" />}{extractionStatus === 'Extraction complete' && <CheckCircle2 size={16} />}{extractionStatus}</div>}
              {extractionError && <div className="file-message error"><AlertCircle size={16} /> {extractionError}</div>}
            </section>

            <div className="privacy-note"><ShieldCheck size={21} /><p><strong>Your personal details stay private.</strong> HR receives an anonymized profile focused on your experience and skills.</p></div>
            <div className="apply-actions">
              <button type="button" className="cancel-button" onClick={() => navigate('/')}>Cancel</button>
              <button type="submit" className="submit-button" disabled={isSubmitting || !resumeText.trim() || !resumeAnalysis}>
                <Sparkles size={17} /><span>{isSubmitting ? 'Submitting…' : 'Submit application'}</span><ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </main>
      <style>{styles}</style>
    </div>
  );
}

const styles = `
.apply-page{min-height:100vh;background:#f8fafc;color:#111827}.apply-nav{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 max(5vw,24px);border-bottom:1px solid #e5e7eb;background:rgba(255,255,255,.9);backdrop-filter:blur(14px)}.apply-brand{display:flex;align-items:center;gap:10px;color:#111827;font-family:var(--font-serif);font-size:20px;font-weight:700;text-decoration:none}.apply-brand img{width:38px;height:38px;border-radius:10px;object-fit:contain;background:#111827;padding:5px}.apply-nav>div{display:flex;align-items:center;gap:24px}.apply-nav>div a{color:#667085;font-size:13px;font-weight:650;text-decoration:none}.apply-nav .hr-link{display:flex;align-items:center;gap:7px;padding:10px 13px;border:1px solid #d9dee7;border-radius:10px;background:#fff;color:#111827}.apply-shell{width:min(900px,calc(100% - 32px));margin:0 auto;padding:62px 0 90px}.apply-intro{max-width:680px;margin:0 auto 34px;text-align:center;animation:apply-rise .55s both}.apply-intro>span{display:flex;align-items:center;justify-content:center;gap:7px;color:#4f46e5;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.07em}.apply-intro h1{margin:12px 0 10px;font-family:var(--font-serif);font-size:clamp(40px,6vw,58px);line-height:1;letter-spacing:-.05em}.apply-intro p{max-width:610px;margin:auto;color:#667085;font-size:16px;line-height:1.65}.apply-card{overflow:hidden;padding:0;border:1px solid #e1e5eb;border-radius:22px;background:#fff;box-shadow:0 24px 65px rgba(17,24,39,.08);animation:apply-rise .65s .08s both}.form-section{padding:30px 34px;border-bottom:1px solid #e8eaee}.section-title{display:flex;align-items:flex-start;gap:13px;margin-bottom:24px}.section-title>b{width:30px;height:30px;display:grid;place-items:center;border-radius:8px;background:#eef3ff;color:#4f46e5;font-size:11px}.section-title h2{margin:0 0 3px;font-family:var(--font-serif);font-size:21px}.section-title p{color:#98a2b3;font-size:12px}.apply-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.apply-grid label{display:block}.apply-grid label.full{grid-column:1/-1}.apply-grid label>span{display:flex;justify-content:space-between;margin-bottom:8px;color:#344054;font-size:13px;font-weight:700}.apply-grid label small{color:#98a2b3;font-size:10px;font-weight:600}.apply-grid input,.apply-grid select{width:100%;height:47px;padding:0 13px;border:1px solid #d8dde5;border-radius:10px;outline:none;background:#fff;color:#111827;font:inherit;font-size:14px;transition:.2s}.apply-grid input:focus,.apply-grid select:focus{border-color:#818cf8;box-shadow:0 0 0 4px rgba(37,99,235,.08)}.resume-section{border-bottom:0}.pdf-drop{border:1.5px dashed #aeb7c5;border-radius:14px;background:#fafbfc;transition:.25s}.pdf-drop:hover{border-color:#4f46e5;background:#f7f9ff}.pdf-drop.has-file{border-style:solid;border-color:#a9bce9;background:#f8faff}.pdf-drop input{display:none}.pdf-drop label{display:flex;align-items:center;gap:14px;padding:22px;cursor:pointer}.pdf-drop label>i{width:46px;height:46px;display:grid;flex:none;place-items:center;border-radius:11px;background:#eef3ff;color:#4f46e5}.pdf-drop label>div{display:flex;min-width:0;flex:1;flex-direction:column;gap:3px}.pdf-drop strong{overflow:hidden;font-size:14px;text-overflow:ellipsis;white-space:nowrap}.pdf-drop label span{color:#98a2b3;font-size:12px}.pdf-drop em{padding:5px 8px;border-radius:6px;background:#eceff3;color:#667085;font-size:10px;font-style:normal;font-weight:800;text-transform:uppercase}.file-message{display:flex;align-items:center;gap:7px;margin-top:11px;font-size:12px;font-weight:700}.file-message.success{color:#207a55}.file-message.error{color:#b42318}.privacy-note{display:flex;align-items:flex-start;gap:12px;margin:0 34px;padding:17px 0;color:#475467}.privacy-note svg{flex:none;color:#4f46e5}.privacy-note p{font-size:12px;line-height:1.55}.privacy-note strong{color:#111827}.apply-actions{display:flex;justify-content:flex-end;gap:10px;padding:20px 34px;border-top:1px solid #e8eaee;background:#fafbfc}.apply-actions button,.success-actions>*{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px 16px;border-radius:10px;font-size:13px;font-weight:750;cursor:pointer;text-decoration:none}.cancel-button{border:1px solid #d7dce4;background:#fff;color:#475467}.submit-button{min-width:205px;border:0;background:#111827;color:#fff;box-shadow:0 8px 18px rgba(17,24,39,.16);transition:.2s}.submit-button:hover:not(:disabled){transform:translateY(-2px);background:#4f46e5}.submit-button:disabled{opacity:.45;cursor:not-allowed}.success-card{padding:55px 45px;text-align:center}.success-icon{width:62px;height:62px;display:grid;place-items:center;margin:0 auto 17px;border-radius:50%;background:#eaf8f1;color:#23845e}.success-label{color:#23845e;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.success-card h2{margin:8px 0;font-family:var(--font-serif);font-size:38px}.success-card>p{color:#667085;font-size:14px}.receipt{max-width:540px;margin:27px auto;padding:5px 20px;border:1px solid #e3e6eb;border-radius:13px;background:#f8fafc}.receipt>div{display:flex;justify-content:space-between;padding:13px 0;border-bottom:1px solid #e5e7eb;font-size:12px}.receipt>div:last-child{border:0}.receipt span{color:#667085}.receipt strong{color:#111827}.receipt .status{color:#4f46e5}.success-actions{display:flex;justify-content:center;gap:10px}.success-actions button{border:1px solid #d7dce4;background:#fff;color:#475467}.success-actions a{background:#111827;color:#fff}@keyframes apply-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}@media(max-width:650px){.apply-nav{padding:0 16px}.apply-nav>div>a:first-child{display:none}.apply-shell{padding-top:42px}.apply-intro h1{font-size:40px}.apply-intro p{font-size:14px}.form-section{padding:25px 20px}.apply-grid{grid-template-columns:1fr}.apply-grid label.full{grid-column:auto}.pdf-drop label{padding:17px}.pdf-drop em{display:none}.privacy-note{margin:0 20px}.apply-actions{padding:17px 20px}.submit-button{min-width:0;flex:1}.success-card{padding:42px 20px}.receipt{padding:4px 13px}.success-actions{flex-direction:column}}@media(prefers-reduced-motion:reduce){.apply-page *{animation:none!important;transition:none!important}}
`;
