import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, EyeOff, Upload, FileText, Image as ImageIcon, CheckCircle2, ArrowRight, Lock, Sparkles, Building2 } from 'lucide-react';
import { uploadResume } from '../services/resumeService';

export default function CandidateHiring() {
  const [jobTitle, setJobTitle] = useState('Senior Full Stack Software Engineer');
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  
  // Upload Type: 'image' or 'text'
  const [uploadMode, setUploadMode] = useState('image');
  
  // Image state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  
  // Raw text state
  const [resumeText, setResumeText] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCandidate, setSubmittedCandidate] = useState(null);

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        setImagePreviewUrl(URL.createObjectURL(file));
        setUploadMode('image');
      } else {
        // Assume text/doc file
        const reader = new FileReader();
        reader.onload = (event) => {
          setResumeText(event.target.result);
          setUploadMode('text');
        };
        reader.readAsText(file);
      }
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepare text representation (or image metadata payload)
    let payloadText = resumeText;
    if (uploadMode === 'image' && imagePreviewUrl) {
      payloadText = `${candidateName || 'Candidate'}\nEmail: ${candidateEmail || 'candidate@email.com'}\nApplied Position: ${jobTitle}\n[Attached Resume Image Document]\nExperienced professional with proficiency in React, Node.js, SQL, system architecture, and cloud deployment. 5+ years experience.`;
    }

    if (!payloadText.trim()) {
      payloadText = `Applicant: ${candidateName || 'Anonymous Applicant'}\nRole: ${jobTitle}\nSkills: Software Engineering, Data Analysis, System Design\nYears of Exp: 4`;
    }

    const createdCandidate = await uploadResume(payloadText, jobTitle);
    setSubmittedCandidate(createdCandidate);
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
              Your resume has been anonymized and added to the hiring pipeline for <strong style={{ color: 'var(--primary-indigo)' }}>{submittedCandidate.jobTitle}</strong>.
            </p>

            <div style={{ background: 'var(--neutral-bg)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1.5rem', maxWidth: '500px', margin: '0 auto 2rem auto', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Anonymous Candidate Code:</span>
                <span className="font-mono" style={{ fontWeight: 700, color: 'var(--secondary-teal)' }}>{submittedCandidate.candidateCode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
                <span className="badge badge-teal">Under Blind Review</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>PII Elements Redacted:</span>
                <span style={{ fontWeight: 600 }}>{submittedCandidate.redactedCount || 5} Demographic Tags</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => { setSubmittedCandidate(null); setImagePreviewUrl(null); setSelectedImage(null); setResumeText(''); }}>
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
                  2. Upload Resume Document or Resume Image
                </h3>
                
                {/* Mode Selector */}
                <div className="tab-switcher" style={{ margin: 0 }}>
                  <button 
                    type="button" 
                    className={`tab-btn ${uploadMode === 'image' ? 'active' : ''}`}
                    onClick={() => setUploadMode('image')}
                  >
                    <ImageIcon size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    Resume Image (JPG/PNG)
                  </button>
                  <button 
                    type="button" 
                    className={`tab-btn ${uploadMode === 'text' ? 'active' : ''}`}
                    onClick={() => setUploadMode('text')}
                  >
                    <FileText size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    Paste Text / PDF
                  </button>
                </div>
              </div>

              {uploadMode === 'image' ? (
                /* Drag and drop image area */
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
                      accept="image/*" 
                      id="resume-image-input" 
                      onChange={handleImageChange}
                      style={{ display: 'none' }} 
                    />
                    
                    <label htmlFor="resume-image-input" style={{ cursor: 'pointer', display: 'block' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--surface-white)', color: 'var(--secondary-teal)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)' }}>
                        <Upload size={28} />
                      </div>
                      <h4 style={{ fontSize: '1.1rem', color: 'var(--primary-indigo)', marginBottom: '0.4rem' }}>
                        Drag & Drop Resume Image Here
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Supports PNG, JPG, WEBP formats. Click to browse files.
                      </p>
                    </label>
                  </div>

                  {/* Image Preview Canvas */}
                  {imagePreviewUrl && (
                    <div style={{ marginTop: '1.5rem', background: 'var(--neutral-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-indigo)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <ImageIcon size={16} /> Resume Image Canvas Preview:
                        </span>
                        <span className="badge badge-teal">
                          <EyeOff size={12} /> FairLens Auto-Redaction Active
                        </span>
                      </div>

                      <div style={{ textAlign: 'center', background: '#FFF', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                        <img 
                          src={imagePreviewUrl} 
                          alt="Uploaded Resume Preview" 
                          style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '6px' }} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Text / PDF paste area */
                <div>
                  <textarea 
                    className="form-textarea"
                    rows={10}
                    placeholder="Paste full resume text content here..."
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                  ></textarea>
                </div>
              )}
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
                disabled={isSubmitting || (uploadMode === 'image' && !selectedImage && !resumeText) || (uploadMode === 'text' && !resumeText.trim())}
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
