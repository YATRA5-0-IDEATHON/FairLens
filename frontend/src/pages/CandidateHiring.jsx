import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, EyeOff, Upload, CheckCircle2, ArrowRight, Sparkles, Building2, AlertCircle, LoaderCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { buildResumeIntelligence } from '../utils/resumeIntelligence';
import { extractContactDetails, extractResumeFile } from '../utils/resumeFileExtractor';
import { structureRawOcrText, anonymizeStructuredText, computeMeritScore } from '../utils/resumeProcessor';

export default function CandidateHiring() {
  const { addCandidate } = useData();
  const [jobTitle, setJobTitle] = useState('Senior Full Stack Software Engineer');
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

  const navigate = useNavigate();

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

  const handleImageChange = (e) => processFile(e.target.files[0]);

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

    const created = await addCandidate({
      name: candidateName,
      email: candidateEmail,
      appliedRole: jobTitle,
      resumeText,
      summary: analysis.summary,
      skills,
      experienceYears: analysis.experienceYears,
      education: analysis.education,
      // Use the same canonical formula shown everywhere else in the app,
      // so the stored score always matches what HR sees later.
      meritScore: computeMeritScore(resumeText, skills),
    });

    setSubmittedCandidate({ ...created, redactedCount: redactionPreview.redactedCount });
    setIsSubmitting(false);
  };

  return (
    <div style={{ backgroundColor: 'var(--neutral-bg)', minHeight: '100vh', color: 'var(--text-dark)' }}>
      {/* Header Bar */}
      <nav style={{ background: 'var(--primary-indigo)', color: '#FFF', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #3FA796, #E85D4E)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#FFF' }}>
            FL
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', fontWeight: 600 }}>FairLens Hiring</span>
            <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Blind Portal</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.85rem' }}>← Back to Home</Link>
          <Link to="/login?role=hr" className="btn btn-teal btn-sm">
            <Building2 size={14} />
            <span>HR Portal</span>
          </Link>
        </div>
      </nav>

      {/* Main Content Container */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        
        {/* Banner */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div className="badge badge-teal" style={{ marginBottom: '0.75rem', padding: '6px 14px' }}>
            <EyeOff size={14} />
            <span>100% Bias-Protected Blind Application System</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>
            Submit Your Resume for Equal Opportunity Hiring
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', lineHeight: 1.5 }}>
            Our FairLens AI engine redacts your name, photos, gender, age, and demographic identifiers before hiring managers see your application. You will be evaluated strictly on merit.
          </p>
        </div>

        {/* Application Submitted Success View */}
        {submittedCandidate ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface-white)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--secondary-teal-light)', color: 'var(--secondary-teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <CheckCircle2 size={36} />
            </div>
            
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>
              Application Submitted Successfully!
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Your resume has been anonymized and added to the hiring pipeline for <strong style={{ color: 'var(--primary-indigo)' }}>{submittedCandidate.appliedRole}</strong>.
            </p>

            <div style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1.5rem', maxWidth: '500px', margin: '0 auto 2rem auto', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Anonymous Candidate Code:</span>
                <span className="font-mono" style={{ fontWeight: 700, color: 'var(--secondary-teal)' }}>{submittedCandidate.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
                <span className="badge badge-teal">Under Blind Review</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>PII Elements Redacted:</span>
                <span style={{ fontWeight: 600 }}>{submittedCandidate.redactedCount || 0} Fields Masked</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => { setSubmittedCandidate(null); setSelectedImage(null); setResumeText(''); setResumeAnalysis(null); }}>
                Submit Another Resume
              </button>
              <Link to="/blind-screening" className="btn btn-primary">
                <span>View Blind Candidate Queue</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          /* Application Submission Form */
          <form onSubmit={handleSubmitApplication} className="card" style={{ padding: '2.5rem', background: 'var(--surface-white)', boxShadow: 'var(--shadow-lg)' }}>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-indigo)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                1. Job Target & Contact Information
              </h3>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Applying For Position / Role:</label>
                  <select 
                    className="form-select" 
                    value={jobTitle} 
                    onChange={(e) => setJobTitle(e.target.value)}
                  >
                    <option value="Senior Full Stack Software Engineer">Senior Full Stack Software Engineer</option>
                    <option value="Data Scientist & AI Specialist">Data Scientist & AI Specialist</option>
                    <option value="Lead UI/UX Product Designer">Lead UI/UX Product Designer</option>
                    <option value="DevOps & Cloud Infrastructure Lead">DevOps & Cloud Infrastructure Lead</option>
                    <option value="Product Manager">Product Manager</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name (Confidential Audit Log Only):</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Alex Morgan"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Used only for receipt confirmation):</label>
                <input 
                  type="email" 
                  className="form-input" 
                  placeholder="alex.morgan@example.com"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Resume Upload Section */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-indigo)', margin: 0 }}>
                  2. Upload PDF Resume
                </h3>
              </div>

              <div>
                  <div 
                    onDragOver={handleDragOver} 
                    onDrop={handleDrop}
                    style={{
                      border: '2px dashed var(--secondary-teal)',
                      borderRadius: '12px',
                      padding: '2.5rem',
                      textAlign: 'center',
                      background: 'var(--secondary-teal-light)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input 
                      type="file" 
                      accept=".pdf,application/pdf"
                      id="resume-image-input" 
                      onChange={handleImageChange}
                      style={{ display: 'none' }} 
                    />
                    
                    <label htmlFor="resume-image-input" style={{ cursor: 'pointer', display: 'block' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--surface-white)', color: 'var(--secondary-teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                        <Upload size={28} />
                      </div>
                      <h4 style={{ fontSize: '1.1rem', color: 'var(--primary-indigo)', marginBottom: '0.4rem' }}>
                        Drag & Drop Your Resume Here
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        PDF documents only — text is extracted automatically.
                      </p>
                    </label>
                  </div>

                  {extractionStatus && (
                    <div style={{ marginTop: '1rem', color: 'var(--secondary-teal)', display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.85rem', fontWeight: 600 }}>
                      {extractionStatus !== 'Extraction complete' && <LoaderCircle size={16} className="spin" />}
                      {extractionStatus === 'Extraction complete' && <CheckCircle2 size={16} />}
                      {extractionStatus}
                      {selectedImage?.name && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>— {selectedImage.name}</span>}
                    </div>
                  )}
                  {extractionError && (
                    <div style={{ marginTop: '1rem', color: 'var(--accent-coral)', display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.85rem' }}>
                      <AlertCircle size={16} /> {extractionError}
                    </div>
                  )}
              </div>
            </div>

            {/* Blind Guarantee box */}
            <div style={{ background: 'var(--secondary-teal-light)', border: '1px solid var(--secondary-teal)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <ShieldCheck size={24} color="var(--secondary-teal)" style={{ shrink: 0 }} />
              <div style={{ fontSize: '0.825rem', color: 'var(--primary-indigo)', lineHeight: 1.4 }}>
                <strong>FairLens Blind Guarantee:</strong> Your name, email, contact details, pronouns, photo, and age will be redacted automatically before hiring managers evaluate your profile.
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-teal btn-lg"
                disabled={isSubmitting || !resumeText.trim() || !resumeAnalysis}
              >
                <Sparkles size={18} />
                <span>{isSubmitting ? 'Processing Application...' : 'Submit Blind Application'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
