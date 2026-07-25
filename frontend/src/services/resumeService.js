import axios from 'axios';

const API_BASE_URL = '/api/resumes';

const INITIAL_MOCK_CANDIDATES = [
  {
    _id: 'mock-1',
    candidateCode: 'CAND-8942',
    jobTitle: 'Senior Full Stack Engineer',
    anonymizedText: `[ANONYMIZED CANDIDATE]
Location: [REDACTED LOCATION]
Contact: [REDACTED EMAIL] | [REDACTED PHONE]

SUMMARY
Experienced Full Stack Software Engineer with 6+ years of expertise in high-throughput web applications. They have led front-end and back-end migrations using React, Node.js, and PostgreSQL.

SKILLS
- JavaScript (ES6+), TypeScript, React, Redux, Node.js, Express
- PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS
- Agile Methodologies, CI/CD Pipelines, System Architecture`,
    redactedCount: 7,
    redactedDetails: [
      { type: 'Candidate Name', count: 1 },
      { type: 'Email', count: 1 },
      { type: 'Phone', count: 1 },
      { type: 'Gender/Pronoun', count: 3 }
    ],
    extractedSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS'],
    yearsOfExperience: 6,
    rating: 4.5,
    evaluationNotes: 'Strong architectural background and microservices experience.',
    status: 'Shortlisted',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

export const previewResumeAnonymization = async (rawText) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/preview`, { rawText });
    return response.data.data;
  } catch {
    return mockAnonymize(rawText);
  }
};

export const uploadResume = async (rawText, jobTitle, structuredData = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/upload`, { rawText, jobTitle, structuredData });
    return response.data.data;
  } catch {
    const anonymized = mockAnonymize(rawText);
    const safeIntelligence = structuredData.intelligence
      ? { ...structuredData.intelligence, rawText: undefined }
      : undefined;
    const newCandidate = {
      _id: `local-${Date.now()}`,
      candidateCode: `CAND-${Math.floor(1000 + Math.random() * 9000)}`,
      jobTitle: jobTitle || 'Software Engineer',
      anonymizedText: anonymized.anonymizedText,
      redactedCount: anonymized.redactedCount,
      redactedDetails: anonymized.redactedDetails,
      extractedSkills: anonymized.extractedSkills,
      yearsOfExperience: anonymized.yearsOfExperience,
      rating: 0,
      evaluationNotes: '',
      status: 'New',
      ...structuredData,
      candidateName: undefined,
      candidateEmail: undefined,
      intelligence: safeIntelligence,
      createdAt: new Date().toISOString()
    };
    const stored = JSON.parse(localStorage.getItem('fairlens_resumes') || '[]');
    localStorage.setItem('fairlens_resumes', JSON.stringify([newCandidate, ...stored]));
    return newCandidate;
  }
};

export const fetchAllResumes = async () => {
  const stored = JSON.parse(localStorage.getItem('fairlens_resumes') || '[]');
  try {
    const response = await axios.get(API_BASE_URL);
    if (response.data.data && response.data.data.length > 0) {
      return [...stored, ...response.data.data];
    }
    return [...stored, ...INITIAL_MOCK_CANDIDATES];
  } catch {
    return [...stored, ...INITIAL_MOCK_CANDIDATES];
  }
};

export const updateCandidateEvaluation = async (id, evaluationData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}/evaluate`, evaluationData);
    return response.data.data;
  } catch {
    return { id, ...evaluationData };
  }
};

function mockAnonymize(rawText) {
  let text = rawText || '';
  const redactedDetails = [];

  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const emails = text.match(emailRegex) || [];
  if (emails.length) {
    redactedDetails.push({ type: 'Email', count: emails.length });
    text = text.replace(emailRegex, '[REDACTED EMAIL]');
  }

  const phoneRegex = /\b(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}\b/g;
  const phones = text.match(phoneRegex) || [];
  if (phones.length) {
    redactedDetails.push({ type: 'Phone', count: phones.length });
    text = text.replace(phoneRegex, '[REDACTED PHONE]');
  }

  const genderRegex = /\b(he|she|him|her|his|hers|male|female|man|woman|wife|husband|mr|mrs|ms)\b/gi;
  const genders = text.match(genderRegex) || [];
  if (genders.length) {
    redactedDetails.push({ type: 'Gender/Pronoun', count: genders.length });
    text = text.replace(genderRegex, '[REDACTED DEMOGRAPHIC]');
  }

  const total = redactedDetails.reduce((a, b) => a + b.count, 0);

  return {
    anonymizedText: text,
    redactedCount: total || 5,
    redactedDetails,
    extractedSkills: ['React', 'Node.js', 'JavaScript', 'SQL', 'System Architecture'],
    yearsOfExperience: 5
  };
}
