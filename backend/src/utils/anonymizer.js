// Redacts PII and gender-identifying language from resume text so HR reviewers
// see skills/experience without demographic bias signals.

const COMMON_GENDER_TERMS = [
  // Pronoun+verb pairs first, so "he is" -> "they are" instead of the
  // grammatically-off "they is". These must run before the lone-pronoun
  // pattern below, since replacement happens on the running mutated text.
  { pattern: /\b(he|she)'s\b/gi, replacement: "they're" },
  { pattern: /\b(he|she)\s+is\b/gi, replacement: 'they are' },
  { pattern: /\b(he|she)\s+was\b/gi, replacement: 'they were' },
  { pattern: /\b(he|she)\s+has\b/gi, replacement: 'they have' },
  { pattern: /\b(he|she)\s+does\b/gi, replacement: 'they do' },
  { pattern: /\b(he|she)\b/gi, replacement: 'they' },
  { pattern: /\b(him|her)\b/gi, replacement: 'them' },
  { pattern: /\b(his|hers)\b/gi, replacement: 'their' },
  { pattern: /\b(himself|herself)\b/gi, replacement: 'themself' },
  { pattern: /\b(male|female|man|woman|men|women|boy|girl)\b/gi, replacement: '[REDACTED DEMOGRAPHIC]' },
  { pattern: /\b(mr|mrs|ms|miss|dr|prof)\.?\s+([A-Z][a-z]+)/gi, replacement: '[REDACTED NAME]' }
];

const SKILL_KEYWORDS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Python', 'Java', 'C++',
  'SQL', 'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'Git', 'HTML', 'CSS', 'Tailwind', 'REST API', 'GraphQL', 'Machine Learning',
  'Data Analysis', 'Agile', 'Scrum', 'Figma', 'UI/UX'
];

export function anonymizeResume(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      anonymizedText: '',
      redactedCount: 0,
      redactedDetails: [],
      extractedSkills: [],
      yearsOfExperience: 0
    };
  }

  let text = rawText;
  const redactedDetails = [];

  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const emailsFound = text.match(emailRegex) || [];
  if (emailsFound.length > 0) {
    redactedDetails.push({ type: 'Email', count: emailsFound.length });
    text = text.replace(emailRegex, '[REDACTED EMAIL]');
  }

  const phoneRegex = /\b(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}\b/g;
  const phonesFound = text.match(phoneRegex) || [];
  if (phonesFound.length > 0) {
    redactedDetails.push({ type: 'Phone', count: phonesFound.length });
    text = text.replace(phoneRegex, '[REDACTED PHONE]');
  }

  COMMON_GENDER_TERMS.forEach(({ pattern, replacement }) => {
    const matches = text.match(pattern) || [];
    if (matches.length > 0) {
      redactedDetails.push({ type: 'Gender/Pronoun', count: matches.length });
      text = text.replace(pattern, replacement);
    }
  });

  const extractedSkills = [];
  SKILL_KEYWORDS.forEach(skill => {
    const skillRegex = new RegExp(`\\b${skill.replace('+', '\\+')}\\b`, 'i');
    if (skillRegex.test(rawText) && !extractedSkills.includes(skill)) {
      extractedSkills.push(skill);
    }
  });

  const totalRedactions = redactedDetails.reduce((sum, item) => sum + item.count, 0);

  return {
    anonymizedText: text,
    redactedCount: totalRedactions,
    redactedDetails,
    extractedSkills,
    yearsOfExperience: estimateYearsOfExperience(rawText)
  };
}

// Looks for patterns like "6 years", "6+ years of experience"
function estimateYearsOfExperience(rawText) {
  const match = rawText.match(/(\d+)\+?\s*years?/i);
  return match ? parseInt(match[1], 10) : 0;
}