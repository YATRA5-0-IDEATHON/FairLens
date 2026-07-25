// ---------------------------------------------------------------------------
// Skill keyword database
// ---------------------------------------------------------------------------
const SKILL_DATABASE = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'DynamoDB', 'Elasticsearch',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Terraform', 'Ansible', 'Jenkins', 'CI/CD',
  'Git', 'GitHub Actions', 'GitLab', 'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap',
  'REST API', 'GraphQL', 'gRPC', 'WebSocket', 'OAuth', 'JWT',
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'scikit-learn', 'NLP',
  'Data Analysis', 'Python Pandas', 'NumPy', 'Jupyter', 'Tableau', 'Power BI',
  'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence',
  'Figma', 'UI/UX', 'Sketch', 'Adobe XD', 'Photoshop',
  'System Design', 'Microservices', 'Event-Driven', 'DDD', 'CQRS',
  'Linux', 'Nginx', 'Apache', 'Webpack', 'Vite', 'Babel',
  'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Gatsby', 'Nuxt',
  'Django', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails', 'ASP.NET',
  'Kafka', 'RabbitMQ', 'SQS', 'Pub/Sub',
  'Leadership', 'Team Management', 'Technical Writing', 'Code Review', 'Mentoring',
  'C', 'Swift', 'Kotlin', 'Dart', 'Flutter', 'React Native',
  'Pandas', 'Spark', 'Hadoop', 'Airflow', 'dbt',
  'Selenium', 'Cypress', 'Jest', 'Pytest', 'JUnit',
  'MATLAB', 'R', 'Scala', 'Haskell',
  'Networking', 'TCP/IP', 'DNS', 'Load Balancing', 'CDN',
  'Product Management', 'Roadmapping', 'A/B Testing', 'User Research',
  'Data Engineering', 'ETL', 'Data Warehouse', 'BigQuery', 'Snowflake', 'Redshift',
];

// ---------------------------------------------------------------------------
// PII redaction patterns
// ---------------------------------------------------------------------------
const PII_PATTERNS = [
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,  replacement: '[REDACTED EMAIL]',  type: 'Email' },
  { pattern: /\b(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}\b/g, replacement: '[REDACTED PHONE]', type: 'Phone' },
  { pattern: /https?:\/\/[^\s]+/g, replacement: '[REDACTED URL]', type: 'URL' },
  // LinkedIn / GitHub plain-text handles (no http)
  { pattern: /\b(?:linkedin\.com|github\.com)\/[^\s,)]+/gi, replacement: '[REDACTED URL]', type: 'URL' },
];

const GENDER_PATTERNS = [
  { pattern: /\b(he|she)\b/gi,               replacement: 'they' },
  { pattern: /\b(him|her)\b/gi,              replacement: 'them' },
  { pattern: /\b(his|hers)\b/gi,             replacement: 'their' },
  { pattern: /\b(himself|herself)\b/gi,      replacement: 'themself' },
  { pattern: /\b(male|female)\b/gi,          replacement: '[REDACTED DEMOGRAPHIC]' },
  { pattern: /\b(man|woman|men|women)\b/gi,  replacement: '[REDACTED DEMOGRAPHIC]' },
  { pattern: /\b(Mr|Mrs|Ms|Miss|Dr|Prof)\.?\s+[A-Z][a-z]+/gi, replacement: '[REDACTED NAME]' },
];

// Known section heading labels — used for both structuring and display
export const SECTION_HEADINGS = [
  'Summary', 'Professional Summary', 'Profile', 'Objective', 'Career Objective',
  'Experience', 'Professional Experience', 'Work Experience', 'Employment History', 'Work History',
  'Education', 'Academic Background',
  'Skills', 'Technical Skills', 'Core Competencies', 'Technologies',
  'Projects', 'Personal Projects', 'Side Projects',
  'Certifications', 'Certificates', 'Licenses',
  'Awards', 'Achievements', 'Honors',
  'Publications', 'Research',
  'Languages',
  'Volunteering', 'Volunteer Experience',
  'References',
  'Interests', 'Hobbies',
];

// Build a regex that matches any known heading on its own line
const HEADING_RE = new RegExp(
  `^(${SECTION_HEADINGS.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})[:\\s]*$`,
  'i',
);

// ---------------------------------------------------------------------------
// 1. structureRawOcrText
//    Transforms the messy flat string from pdfjs into clean structured text.
// ---------------------------------------------------------------------------
export function structureRawOcrText(raw) {
  if (!raw || !raw.trim()) return '';

  // ── Step 1: normalise unicode punctuation and strip control chars ──────
  let text = raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\u00ad/g, '')          // soft hyphen
    .replace(/[\u200b-\u200f]/g, '') // zero-width chars
    .replace(/\t/g, ' ')
    .replace(/[ ]{3,}/g, '  ');      // collapse long runs of spaces → 2

  // ── Step 2: split into raw tokens (words / fragments) ─────────────────
  // pdfjs often joins words from different columns with a single space.
  // We rebuild a better line structure by identifying "phrase boundaries".
  const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // ── Step 3: detect & normalise section headings ────────────────────────
  // Some PDFs emit headings without a newline boundary — e.g. "ExperienceSoftware Engineer …"
  // Split them apart using the heading list.
  const headingInsertRe = new RegExp(
    `(${SECTION_HEADINGS.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?=[A-Z\\s])`,
    'g',
  );

  const expandedLines = [];
  for (const line of rawLines) {
    // Insert a newline before any known heading that's been concatenated with next content
    const split = line.replace(headingInsertRe, '\n$1\n').split('\n').map(l => l.trim()).filter(Boolean);
    expandedLines.push(...split);
  }

  // ── Step 4: group into sections ────────────────────────────────────────
  const sections = [];
  let currentSection = { heading: '', lines: [] };

  for (const line of expandedLines) {
    if (HEADING_RE.test(line)) {
      if (currentSection.lines.length || currentSection.heading) {
        sections.push({ ...currentSection });
      }
      currentSection = { heading: line.replace(/[:\s]+$/, '').trim(), lines: [] };
    } else {
      currentSection.lines.push(line);
    }
  }
  if (currentSection.lines.length || currentSection.heading) {
    sections.push(currentSection);
  }

  // If no sections were detected at all, treat everything as a single blob
  if (sections.length === 0) {
    return expandedLines.join('\n');
  }

  // ── Step 5: within each section, clean up the lines ────────────────────
  const cleaned = sections.map(section => {
    const lines = cleanSectionLines(section.lines, section.heading);
    const body = lines.join('\n');
    return section.heading ? `${section.heading.toUpperCase()}\n${body}` : body;
  });

  return cleaned.join('\n\n');
}

/**
 * Heuristically clean the lines within a single resume section.
 * Detects bullets, date-ranges, job titles, and merges orphaned fragments.
 */
function cleanSectionLines(lines, heading) {
  if (!lines.length) return [];

  const isBulletLike = (l) => /^[•●▪◦\-–—*]\s/.test(l) || /^[a-z]\)\s/i.test(l);
  const isDateRange  = (l) => /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\b.*\b(present|current|\d{4})\b/i.test(l);
  const isSummarySection = /summary|profile|objective/i.test(heading || '');
  const isSkillSection   = /skills|competenc|technolog/i.test(heading || '');

  // ── Summary / Profile: output every line verbatim, joined into full paragraphs ──
  // pdfjs sometimes splits one sentence across two lines; re-join them.
  if (isSummarySection) {
    const out = [];
    let buf = '';
    for (const line of lines) {
      const t = line.trim();
      if (!t) { if (buf) { out.push(buf.trim()); buf = ''; } continue; }
      // If previous fragment already ended a sentence, start a new one
      if (buf && /[.!?]$/.test(buf.trim())) {
        out.push(buf.trim());
        buf = t;
      } else {
        buf = buf ? buf + ' ' + t : t;
      }
    }
    if (buf) out.push(buf.trim());
    return out;
  }

  // ── Skills / Competencies: preserve every single item ──────────────────
  // Handle both bullet lists and comma/pipe-delimited inline lists.
  if (isSkillSection) {
    const out = [];
    for (const line of lines) {
      if (isBulletLike(line)) {
        // Already a bullet — each bullet is one skill entry (may itself be comma-separated)
        const body = line.replace(/^[•●▪◦\-–—*]\s*/, '').replace(/^[a-z]\)\s*/i, '');
        // Split on commas/pipes in case the bullet contains multiple skills
        body.split(/[,|]+/).map(s => s.trim()).filter(Boolean).forEach(s => out.push(`• ${s}`));
      } else {
        // Plain line — split on commas/pipes
        const items = line.split(/[,|]+/).map(s => s.trim()).filter(Boolean);
        if (items.length > 1) {
          items.forEach(s => out.push(`• ${s}`));
        } else if (items.length === 1) {
          // Single item — could be a sub-heading like "Programming Languages:" or an actual skill
          out.push(`• ${items[0]}`);
        }
      }
    }
    return out;
  }

  // ── Everything else (Experience, Education, etc.) ──────────────────────
  const out = [];
  let buffer = '';
  const isShortFragment = (l) => l.length < 40 && !/[.!?]$/.test(l) && !/^\d/.test(l);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isBulletLike(line)) {
      if (buffer) { out.push(buffer); buffer = ''; }
      out.push('• ' + line.replace(/^[•●▪◦\-–—*]\s*/, '').replace(/^[a-z]\)\s*/i, ''));
      continue;
    }

    if (isDateRange(line)) {
      if (buffer) { out.push(buffer); buffer = ''; }
      out.push(line);
      continue;
    }

    // Continuation of previous buffer fragment
    if (buffer && isShortFragment(line)) {
      buffer += ' ' + line;
      continue;
    }

    if (buffer) { out.push(buffer); buffer = ''; }

    // Lines that are clearly complete (long or end with punctuation) → emit directly
    if (line.length > 80 || /[.!?]$/.test(line)) {
      out.push(line);
    } else if (isShortFragment(line)) {
      // Short label (company name, job title) — standalone
      out.push(line);
    } else {
      buffer = line;
    }
  }
  if (buffer) out.push(buffer);

  return out;
}

// ---------------------------------------------------------------------------
// 2. anonymizeStructuredText
//    Redacts PII from already-structured text (name, email, phone, location, etc.)
//    Returns { anonymized: string, redactedCount: number, redactedDetails: [] }
// ---------------------------------------------------------------------------
export function anonymizeStructuredText(text, options = {}) {
  if (!text) return { anonymized: '', redactedCount: 0, redactedDetails: [] };

  let out = text;
  const details = [];
  let total = 0;

  const redact = (pattern, replacement, type) => {
    const matches = out.match(pattern) || [];
    if (matches.length) {
      total += matches.length;
      details.push({ type, count: matches.length });
      out = out.replace(pattern, replacement);
    }
  };

  // Name — redact every part of the full name
  if (options.name) {
    const parts = options.name.trim().split(/\s+/).filter(p => p.length > 1);
    parts.forEach(part => {
      const re = new RegExp(`\\b${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = out.match(re) || [];
      if (matches.length) {
        total += matches.length;
        out = out.replace(re, '[REDACTED NAME]');
      }
    });
    if (total > 0) details.push({ type: 'Name', count: total });
  }

  // Email, phone, URL
  PII_PATTERNS.forEach(({ pattern, replacement, type }) => redact(pattern, replacement, type));

  // Location — split on commas and spaces, redact city/state/country words > 3 chars
  if (options.location) {
    const parts = options.location.split(/[,\s]+/).filter(p => p.length > 3);
    parts.forEach(part => {
      const re = new RegExp(`\\b${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = out.match(re) || [];
      if (matches.length) {
        total += matches.length;
        details.push({ type: 'Location', count: matches.length });
        out = out.replace(re, '[REDACTED LOCATION]');
      }
    });
  }

  // School / university
  if (options.school) {
    const re = new RegExp(options.school.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    redact(re, '[REDACTED INSTITUTION]', 'Institution');
  }

  // Gender pronoun neutralisation (not counted as PII redaction)
  GENDER_PATTERNS.forEach(({ pattern, replacement }) => {
    out = out.replace(pattern, replacement);
  });

  return { anonymized: out, redactedCount: total, redactedDetails: details };
}

// Keep the old name as an alias so other files don't break
export const anonymizeText = anonymizeStructuredText;

// ---------------------------------------------------------------------------
// 3. extractSkillsFromText
//    Two-pass: (1) pull every item verbatim from the Skills section lines,
//    (2) supplement with SKILL_DATABASE matches from the full text.
//    This ensures no skill the applicant listed is ever dropped.
// ---------------------------------------------------------------------------
export function extractSkillsFromText(text) {
  if (!text) return [];

  const seen = new Set();
  const results = [];

  const add = (s) => {
    const clean = s.trim().replace(/^[•\-*]\s*/, '').trim();
    if (!clean || clean.length < 2) return;
    const key = clean.toLowerCase();
    if (!seen.has(key)) { seen.add(key); results.push(clean); }
  };

  // Pass 1: extract verbatim from the Skills / Competencies section
  const skillsSectionRe = /(?:^|\n)(skills|technical skills|core competencies|technologies)[:\s]*\n([\s\S]*?)(?=\n[A-Z][A-Z\s]{3,}\n|$)/i;
  const sectionMatch = text.match(skillsSectionRe);
  if (sectionMatch) {
    const sectionText = sectionMatch[2];
    sectionText.split(/\n/).forEach(line => {
      const stripped = line.trim().replace(/^[•\-*]\s*/, '').trim();
      if (!stripped) return;
      // Each line may be a single skill or a comma/pipe-separated list
      stripped.split(/[,|]+/).forEach(add);
    });
  }

  // Pass 2: SKILL_DATABASE scan across full text (catches skills mentioned in Experience)
  SKILL_DATABASE.forEach(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('\\+', '[+]');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(text)) add(skill);
  });

  return results;
}

// ---------------------------------------------------------------------------
// 4. computeMeritScore
// ---------------------------------------------------------------------------
export function computeMeritScore(text, skills) {
  if (!text && (!skills || skills.length === 0)) return 50;
  let score = 50;
  score += Math.min(25, (skills?.length || 0) * 4);
  const expMatches = text?.match(/\b(\d+)\+?\s*(years?|yrs?)\s*(of\s+)?experience\b/gi);
  if (expMatches) score += Math.min(15, parseInt(expMatches[0].match(/\d+/)?.[0] || '0') * 2);
  if (text) {
    if (/\b(PhD|Doctorate)\b/i.test(text))             score += 10;
    else if (/\b(Master|MS|M\.S\.|MBA)\b/i.test(text)) score += 7;
    else if (/\b(Bachelor|BS|B\.S\.|B\.A\.)\b/i.test(text)) score += 4;
  }
  const qMatches = text?.match(/\b\d{2,}%|\$\d+(k|K|M)?\b|\b\d+[kK]\b/g);
  if (qMatches) score += Math.min(10, qMatches.length * 2);
  return Math.min(100, Math.max(30, Math.round(score)));
}

/**
 * Canonical merit score for a candidate object.
 * This is the SINGLE source of truth used across every view (candidate list,
 * blind screening, resume drawer) so the same candidate always shows the
 * same merit score no matter where it's displayed.
 */
export function getCandidateMeritScore(candidate) {
  if (!candidate) return 50;
  const text = candidate.resumeText || buildResumeTextFromCandidate(candidate);
  const skills = candidate.skills || [];
  return computeMeritScore(text, skills);
}

// ---------------------------------------------------------------------------
// 5. computeSkillLevels
// ---------------------------------------------------------------------------
export function computeSkillLevels(skills, text) {
  if (!skills || skills.length === 0) return {};
  const levels = {};
  const lower = (text || '').toLowerCase();
  skills.forEach((skill, idx) => {
    const ls = skill.toLowerCase();
    const re = new RegExp(ls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('+', '[+]'), 'gi');
    const count = (lower.match(re) || []).length;
    let level = 75 - idx * 3;
    level += Math.min(15, count * 5);
    if (new RegExp(`\\b(?:expert|advanced|lead|proficient|strong)\\b.{0,30}${ls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace('+', '[+]')}`, 'i').test(lower)) {
      level += 10;
    }
    levels[skill] = Math.min(100, Math.max(40, level));
  });
  return levels;
}

// ---------------------------------------------------------------------------
// 6. extractExperienceYears
// ---------------------------------------------------------------------------
export function extractExperienceYears(text) {
  if (!text) return 0;
  const m = text.match(/\b(\d+)\+?\s*(years?|yrs?)\s*(of\s+)?experience\b/gi);
  if (m) return Math.min(30, parseInt(m[0].match(/\d+/)?.[0] || '0'));
  return 0;
}

// ---------------------------------------------------------------------------
// 7. buildResumeTextFromCandidate (fallback for structured JSON candidates)
// ---------------------------------------------------------------------------
export function buildResumeTextFromCandidate(candidate) {
  if (!candidate) return '';
  const lines = [];

  lines.push(candidate.name || 'Candidate');
  if (candidate.email)    lines.push(`Email: ${candidate.email}`);
  if (candidate.phone)    lines.push(`Phone: ${candidate.phone}`);
  if (candidate.location) lines.push(`Location: ${candidate.location}`);
  lines.push('');

  if (candidate.appliedRole) {
    lines.push(`Applied For: ${candidate.appliedRole}`);
    lines.push('');
  }

  if (candidate.summary) {
    lines.push('PROFESSIONAL SUMMARY');
    lines.push(candidate.summary);
    lines.push('');
  }

  if (candidate.skills?.length) {
    lines.push('SKILLS');
    candidate.skills.forEach(s => lines.push(`• ${s}`));
    lines.push('');
  }

  if (candidate.experience?.length) {
    lines.push('PROFESSIONAL EXPERIENCE');
    candidate.experience.forEach(exp => {
      if (exp.title)  lines.push(exp.title);
      if (exp.company) lines.push(exp.company);
      if (exp.period) lines.push(exp.period);
      (exp.highlights || []).forEach(h => lines.push(`• ${h}`));
      lines.push('');
    });
  }

  if (candidate.education) {
    lines.push('EDUCATION');
    const e = candidate.education;
    const parts = [e.degree, e.school, e.gradYear].filter(Boolean);
    lines.push(parts.join(' — '));
    lines.push('');
  }

  return lines.join('\n');
}
