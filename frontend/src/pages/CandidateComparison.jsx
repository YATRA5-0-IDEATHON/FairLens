import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CandidateComparison() {
  const candidates = [
    {
      id: "Candidate #891",
      score: 94,
      tier: "Tier-1 Top Match",
      exp: "6 Years",
      role: "Staff Software Engineer",
      education: "B.S. Computer Science (Tier-1 University)",
      skills: ["Distributed Systems", "Node.js", "React", "PostgreSQL"],
      impact: "Scaled API from 10k to 250k req/min, reduced latency by 42%",
      salaryExpectation: "$165,000 / yr",
      blindStatus: "Fully Redacted"
    },
    {
      id: "Candidate #402",
      score: 91,
      tier: "Strong Match",
      exp: "7 Years",
      role: "Lead Full Stack Engineer",
      education: "M.S. Software Engineering (Tier-1 University)",
      skills: ["React", "Python", "Kubernetes", "AWS Architecture"],
      impact: "Built real-time analytics streaming engine serving 80k DAU",
      salaryExpectation: "$170,000 / yr",
      blindStatus: "Fully Redacted"
    },
    {
      id: "Candidate #719",
      score: 87,
      tier: "Qualified",
      exp: "5 Years",
      role: "Senior Backend Developer",
      education: "B.S. Information Tech (Accredited University)",
      skills: ["Node.js", "GraphQL", "Redis", "Docker"],
      impact: "Maintained 99.99% infrastructure uptime across microservices",
      salaryExpectation: "$155,000 / yr",
      blindStatus: "Fully Redacted"
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div className="badge badge-indigo" style={{ marginBottom: '0.4rem' }}>
            <Users size={14} />
            <span>Merit-Based Comparison Engine</span>
          </div>
          <h1 className="page-title">Candidate Merit Matrix</h1>
          <p className="page-subtitle">Side-by-side evaluation of top shortlisted talent without demographic exposure.</p>
        </div>

        <Link to="/blind-screening" className="btn btn-outline btn-sm">
          <span>+ Add Candidate to Matrix</span>
        </Link>
      </div>

      {/* Main Comparison Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', background: 'var(--primary-indigo)', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem' }}>Anonymized Shortlist Comparison — Senior Staff Engineer Role</h3>
          <span className="badge badge-teal">Zero Demographics Exposed</span>
        </div>

        <div className="data-table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Evaluation Metric</th>
                {candidates.map((c) => (
                  <th key={c.id} style={{ width: '26.6%', textAlign: 'center', background: '#F8F9FD' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--primary-indigo)', fontWeight: 'bold' }}>{c.id}</div>
                    <div className="badge badge-teal" style={{ marginTop: '0.25rem', fontSize: '0.7rem' }}>{c.tier}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>FairLens Merit Index</strong></td>
                {candidates.map((c) => (
                  <td key={c.id} style={{ textAlign: 'center' }}>
                    <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--secondary-teal)' }}>
                      {c.score}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/100</span>
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td><strong>Relevant Experience</strong></td>
                {candidates.map((c) => (
                  <td key={c.id} style={{ textAlign: 'center', fontWeight: 600 }}>
                    {c.exp} ({c.role})
                  </td>
                ))}
              </tr>

              <tr>
                <td><strong>Verified Core Skills</strong></td>
                {candidates.map((c) => (
                  <td key={c.id}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center' }}>
                      {c.skills.map((s) => (
                        <span key={s} style={{ background: 'var(--neutral-bg)', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td><strong>Engineering Impact Record</strong></td>
                {candidates.map((c) => (
                  <td key={c.id} style={{ fontSize: '0.825rem', lineHeight: 1.4, color: 'var(--text-dark)' }}>
                    "{c.impact}"
                  </td>
                ))}
              </tr>

              <tr>
                <td><strong>Education Level</strong></td>
                {candidates.map((c) => (
                  <td key={c.id} style={{ textAlign: 'center', fontSize: '0.825rem' }}>
                    {c.education}
                  </td>
                ))}
              </tr>

              <tr>
                <td><strong>Compensation Range</strong></td>
                {candidates.map((c) => (
                  <td key={c.id} style={{ textAlign: 'center' }} className="font-mono">
                    {c.salaryExpectation}
                  </td>
                ))}
              </tr>

              <tr>
                <td><strong>Action Decision</strong></td>
                {candidates.map((c) => (
                  <td key={c.id} style={{ textAlign: 'center' }}>
                    <button className="btn btn-teal btn-sm" style={{ width: '90%' }}>
                      <span>Advance to Final Interview</span>
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
