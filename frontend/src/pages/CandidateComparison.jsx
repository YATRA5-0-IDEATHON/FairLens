import { useMemo, useState } from 'react';
import { Award, Briefcase, Calendar, CheckCircle2, ChevronDown, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useData } from '../context/DataContext';
import { extractExperienceYears, getCandidateMeritScore } from '../utils/resumeProcessor';

export default function CandidateComparison() {
  const { candidates, updateCandidateStatus } = useData();
  const [roleFilter, setRoleFilter] = useState('All roles');
  const [sortBy, setSortBy] = useState('merit-desc');

  const roles = useMemo(
    () => ['All roles', ...new Set(candidates.map(candidate => candidate.appliedRole).filter(Boolean))],
    [candidates],
  );

  const comparison = useMemo(() => candidates
    .filter(candidate => roleFilter === 'All roles' || candidate.appliedRole === roleFilter)
    .map(candidate => normalizeCandidate(candidate))
    .sort((a, b) => {
      if (sortBy === 'merit-asc') return a.merit - b.merit;
      if (sortBy === 'experience-desc') return b.experience - a.experience;
      if (sortBy === 'date-desc') return new Date(b.appliedDate || 0) - new Date(a.appliedDate || 0);
      return b.merit - a.merit;
    }), [candidates, roleFilter, sortBy]);

  const hiredCount = candidates.filter(candidate => candidate.status === 'Hired').length;
  const topCandidate = comparison[0];

  return (
    <div className="comparison-page">
      <header className="comparison-hero">
        <div>
          <span className="comparison-eyebrow"><ShieldCheck size={14} /> Evidence-only decision workspace</span>
          <h1>Candidate comparison</h1>
          <p>Compare actual resume evidence side by side and make one decision that updates the entire hiring system.</p>
        </div>
        <div className="comparison-summary">
          <Summary icon={Users} label="Candidates" value={comparison.length} />
          <Summary icon={Award} label="Top merit" value={topCandidate ? `${topCandidate.merit}/100` : '—'} />
          <Summary icon={CheckCircle2} label="Hired" value={hiredCount} />
        </div>
      </header>

      <section className="comparison-toolbar">
        <label><Briefcase size={15} /><span>Role</span><select value={roleFilter} onChange={event => setRoleFilter(event.target.value)}>{roles.map(role => <option key={role}>{role}</option>)}</select><ChevronDown size={14} /></label>
        <label><Sparkles size={15} /><span>Sort</span><select value={sortBy} onChange={event => setSortBy(event.target.value)}><option value="merit-desc">Highest merit</option><option value="merit-asc">Lowest merit</option><option value="experience-desc">Most experience</option><option value="date-desc">Newest application</option></select><ChevronDown size={14} /></label>
        <span>{comparison.length} matching candidate{comparison.length === 1 ? '' : 's'}</span>
      </section>

      {!comparison.length ? (
        <section className="comparison-empty"><Users size={34} /><h2>No candidates to compare</h2><p>Submit resumes or choose a different role.</p></section>
      ) : (
        <section className="comparison-grid">
          {comparison.map((candidate, index) => (
            <article className={`comparison-card ${index === 0 ? 'leader' : ''}`} key={candidate.id}>
              <div className="comparison-card-head">
                <div><small>Identity protected</small><h2>{candidate.id}</h2><p>{candidate.role}</p></div>
                <Score value={candidate.merit} />
              </div>
              <div className="comparison-meta">
                <span><Briefcase size={14} /><strong>{candidate.experience || 0}</strong> years</span>
                <span><Calendar size={14} />{formatDate(candidate.appliedDate)}</span>
                <Status value={candidate.status} />
              </div>
              <section>
                <h3>Resume evidence</h3>
                <p>{candidate.summary}</p>
              </section>
              <section>
                <h3>Core skills</h3>
                <div className="comparison-skills">
                  {candidate.skills.length ? candidate.skills.slice(0, 8).map(skill => <span key={skill}>{skill}</span>) : <em>No recognized skills</em>}
                </div>
              </section>
              <section className="comparison-facts">
                <Fact label="Education" value={candidate.education} />
                <Fact label="Strongest impact" value={candidate.impact} />
              </section>
              <button
                className={candidate.status === 'Hired' ? 'hired' : ''}
                disabled={candidate.status === 'Hired'}
                onClick={() => updateCandidateStatus(candidate.id, 'Hired')}
              >
                <CheckCircle2 size={16} />
                {candidate.status === 'Hired' ? 'Hired' : 'Advance and mark as hired'}
              </button>
            </article>
          ))}
        </section>
      )}

      <style>{comparisonStyles}</style>
    </div>
  );
}

function normalizeCandidate(candidate) {
  const resumeText = candidate.resumeText || candidate.anonymizedText || candidate.summary || '';
  const highlights = (candidate.experience || []).flatMap(item => item.highlights || []);
  const education = candidate.education?.degree || candidate.education?.level || 'Not evidenced';
  return {
    ...candidate,
    id: candidate.id || candidate.candidateCode,
    role: candidate.appliedRole || candidate.jobTitle || 'Role not specified',
    merit: getCandidateMeritScore(candidate),
    experience: Number(candidate.experienceYears) || extractExperienceYears(resumeText) || 0,
    skills: candidate.skills || candidate.extractedSkills || [],
    education,
    summary: candidate.summary || resumeText.split('\n').find(line => line.trim().length > 60) || 'No professional summary was extracted.',
    impact: candidate.achievements?.[0] || highlights.find(item => /\d|%|\$|increased|reduced|improved|built|led/i.test(item)) || 'No quantified impact found in the resume.',
  };
}

function Summary({ icon: Icon, label, value }) {
  return <div><Icon size={16} /><span>{label}</span><strong>{value}</strong></div>;
}
function Score({ value }) {
  return <div className="comparison-score" style={{ '--score': `${value * 3.6}deg` }}><strong>{value}</strong><span>/100</span></div>;
}
function Fact({ label, value }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}
function Status({ value = 'Pending Review' }) {
  return <span className={`comparison-status ${value.toLowerCase().replace(/\s+/g, '-')}`}>{value}</span>;
}
function formatDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' });
}

const comparisonStyles = `
.comparison-page{display:flex;flex-direction:column;gap:22px}.comparison-hero{padding:34px;border-radius:24px;background:linear-gradient(120deg,#22265f,#30377c);color:#fff;display:flex;align-items:flex-end;justify-content:space-between;gap:30px;box-shadow:0 18px 45px rgba(34,38,95,.18)}.comparison-eyebrow{display:flex;align-items:center;gap:7px;color:#75ddcb;text-transform:uppercase;letter-spacing:.08em;font-size:10px;font-weight:800}.comparison-hero h1{font-family:var(--font-serif);font-size:38px;margin:8px 0 6px}.comparison-hero p{color:rgba(255,255,255,.68);max-width:610px}.comparison-summary{display:grid;grid-template-columns:repeat(3,110px);gap:8px}.comparison-summary>div{padding:14px;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(255,255,255,.06);display:grid;grid-template-columns:auto 1fr;gap:4px 7px}.comparison-summary svg{color:#75ddcb}.comparison-summary span{font-size:9px;color:rgba(255,255,255,.6)}.comparison-summary strong{grid-column:1/-1;font-size:21px}.comparison-toolbar{display:flex;gap:10px;align-items:center;padding:12px;background:#fff;border:1px solid var(--border-light);border-radius:16px}.comparison-toolbar label{position:relative;display:flex;align-items:center;gap:7px;padding:0 10px;border-right:1px solid var(--border-light)}.comparison-toolbar label span{font-size:10px;color:var(--text-muted);font-weight:700}.comparison-toolbar select{appearance:none;border:0;background:transparent;padding:8px 23px 8px 2px;color:var(--text-dark);font-weight:600;outline:0}.comparison-toolbar label>svg:last-child{position:absolute;right:9px;pointer-events:none}.comparison-toolbar>span{margin-left:auto;font-size:11px;color:var(--text-muted);padding-right:8px}.comparison-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(315px,1fr));gap:16px}.comparison-card{background:#fff;border:1px solid var(--border-light);border-radius:22px;padding:22px;display:flex;flex-direction:column;gap:18px;box-shadow:0 9px 30px rgba(28,32,75,.055);position:relative;overflow:hidden}.comparison-card.leader{border-color:rgba(63,167,150,.5);box-shadow:0 12px 38px rgba(63,167,150,.11)}.comparison-card.leader:before{content:"Top match";position:absolute;right:0;top:0;padding:5px 12px;background:var(--secondary-teal);color:#fff;font-size:9px;font-weight:800;border-radius:0 0 0 10px}.comparison-card-head{display:flex;align-items:center;justify-content:space-between;gap:15px}.comparison-card-head small{color:var(--secondary-teal);font-size:9px;text-transform:uppercase;font-weight:800}.comparison-card-head h2{font-family:var(--font-mono);color:var(--primary-indigo);font-size:20px;margin:4px 0}.comparison-card-head p{font-size:12px;color:var(--text-muted)}.comparison-score{width:66px;height:66px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle closest-side,#fff 78%,transparent 80% 99%),conic-gradient(var(--secondary-teal) var(--score),#edf0f4 0)}.comparison-score strong{font-size:19px;color:var(--primary-indigo)}.comparison-score span{font-size:8px;color:var(--text-muted)}.comparison-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 0;border-top:1px solid var(--border-light);border-bottom:1px solid var(--border-light)}.comparison-meta>span{display:flex;align-items:center;gap:4px;font-size:10px;color:var(--text-muted)}.comparison-status{padding:4px 8px;border-radius:20px;background:#f4f1df!important;color:#8c7418!important;font-weight:700}.comparison-status.hired,.comparison-status.shortlisted{background:#e2f5f0!important;color:#237c6d!important}.comparison-status.declined{background:#fbe7e4!important;color:#b14438!important}.comparison-card section h3{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:7px}.comparison-card section p{font-size:12px;line-height:1.55;color:var(--text-dark)}.comparison-skills{display:flex;flex-wrap:wrap;gap:5px}.comparison-skills span{padding:5px 8px;background:var(--neutral-bg);border:1px solid var(--border-light);border-radius:7px;font-size:9px;font-weight:600}.comparison-skills em{font-size:10px;color:var(--text-muted)}.comparison-facts{display:grid;grid-template-columns:1fr 1.4fr;gap:8px}.comparison-facts>div{padding:10px;border-radius:10px;background:var(--neutral-bg)}.comparison-facts span{display:block;color:var(--text-muted);font-size:9px;margin-bottom:4px}.comparison-facts strong{font-size:10px;line-height:1.4;display:block}.comparison-card>button{margin-top:auto;border:0;border-radius:11px;padding:12px;display:flex;align-items:center;justify-content:center;gap:7px;background:var(--primary-indigo);color:#fff;font-weight:700;cursor:pointer}.comparison-card>button:hover{background:var(--secondary-teal)}.comparison-card>button.hired{background:#e2f5f0;color:#237c6d;cursor:default}.comparison-empty{text-align:center;padding:70px;background:#fff;border:1px dashed var(--border-light);border-radius:22px;color:var(--text-muted)}.comparison-empty h2{color:var(--primary-indigo);margin:10px 0 5px}@media(max-width:850px){.comparison-hero{align-items:flex-start;flex-direction:column}.comparison-summary{width:100%;grid-template-columns:repeat(3,1fr)}}@media(max-width:600px){.comparison-summary{grid-template-columns:1fr}.comparison-toolbar{align-items:stretch;flex-direction:column}.comparison-toolbar label{border-right:0;border-bottom:1px solid var(--border-light)}}
`;
