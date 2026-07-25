export const TAXONOMY = {
  languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Kotlin', 'Swift', 'SQL', 'MATLAB', 'R'],
  frameworks: ['React', 'Next.js', 'Angular', 'Vue', 'Svelte', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Laravel', 'ASP.NET'],
  libraries: ['Redux', 'NumPy', 'Pandas', 'TensorFlow', 'PyTorch', 'scikit-learn', 'OpenCV', 'Hugging Face', 'Tailwind', 'Bootstrap'],
  databases: ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'DynamoDB', 'SQLite', 'Elasticsearch', 'Cassandra', 'Snowflake'],
  cloud: ['AWS', 'Azure', 'GCP', 'Firebase', 'Cloudflare', 'Vercel', 'Heroku'],
  devops: ['Docker', 'Kubernetes', 'Git', 'GitHub Actions', 'GitLab CI', 'Jenkins', 'Terraform', 'Ansible', 'Kafka', 'RabbitMQ', 'Nginx'],
  operatingSystems: ['Linux', 'Ubuntu', 'Windows', 'macOS', 'Unix', 'FreeRTOS'],
  embedded: ['Arduino', 'Raspberry Pi', 'ESP32', 'STM32', 'IoT', 'ROS', 'Verilog', 'VHDL', 'PCB'],
  aiMl: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'LLM', 'RAG', 'Generative AI', 'Data Science'],
  softSkills: ['Leadership', 'Communication', 'Mentoring', 'Collaboration', 'Problem Solving', 'Team Management', 'Technical Writing', 'Stakeholder Management'],
};

const LABELS = {
  languages: 'Programming Languages', frameworks: 'Frameworks', libraries: 'Libraries',
  databases: 'Databases', cloud: 'Cloud Platforms', devops: 'DevOps Tools',
  operatingSystems: 'Operating Systems', embedded: 'Embedded Systems', aiMl: 'AI / ML',
  softSkills: 'Soft Skills',
};

const MONTHS = { jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3, may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, sept: 8, september: 8, oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11 };
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const includesTerm = (text, term) => new RegExp(`(^|\\W)${escapeRegex(term)}(?=\\W|$)`, 'i').test(text);
const unique = list => [...new Set(list.filter(Boolean))];
const clamp = value => Math.max(0, Math.min(100, Math.round(value)));

function categorizeSkills(text, supplied = []) {
  return Object.fromEntries(Object.entries(TAXONOMY).map(([category, terms]) => [
    category,
    terms.filter(term => includesTerm(text, term) || supplied.some(skill => skill.toLowerCase() === term.toLowerCase())),
  ]));
}

function parseDate(value, isEnd = false) {
  if (/present|current|now/i.test(value)) return new Date();
  const year = Number(value.match(/\b(?:19|20)\d{2}\b/)?.[0]);
  if (!year) return null;
  const monthWord = value.match(/[A-Za-z]{3,9}/)?.[0]?.toLowerCase();
  const month = monthWord in MONTHS ? MONTHS[monthWord] : (isEnd ? 11 : 0);
  return new Date(year, month, isEnd ? 28 : 1);
}

function intervalFromPeriod(period, source = '') {
  const matches = period?.match(/(?:[A-Za-z]{3,9}\s+)?(?:19|20)\d{2}|present|current|now/gi) || [];
  if (matches.length < 2) return null;
  const start = parseDate(matches[0]);
  const end = parseDate(matches[1], true);
  if (!start || !end || end < start) return null;
  const type = /intern/i.test(source) ? 'Internship' : /research|fellow/i.test(source) ? 'Research' : /volunteer/i.test(source) ? 'Volunteering' : 'Full-time / professional';
  return { start, end, type, period, source };
}

function extractExperience(candidate, text) {
  const structured = (candidate.experience || []).map(item => ({
    ...item,
    interval: intervalFromPeriod(item.period, `${item.title || ''} ${item.company || ''}`),
  }));
  const datePattern = /((?:[A-Za-z]{3,9}\s+)?(?:19|20)\d{2})\s*(?:–|-|—|to)\s*((?:[A-Za-z]{3,9}\s+)?(?:19|20)\d{2}|present|current|now)/gi;
  const headingPattern = /^(professional\s+)?(experience|employment|work history|career history)\s*:?\s*$/i;
  const excludedHeading = /^(education|projects?|certifications?|awards?|volunteer(?:ing)?|publications?|training)\s*:?\s*$/i;
  const jobSignal = /\b(engineer|developer|manager|analyst|consultant|designer|architect|specialist|officer|director|lead|intern|associate|administrator|coordinator|researcher|employment|experience)\b/i;
  let inExperienceSection = false;
  const detected = [];
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

  lines.forEach((line, index) => {
    if (headingPattern.test(line)) {
      inExperienceSection = true;
      return;
    }
    if (excludedHeading.test(line)) {
      inExperienceSection = false;
      return;
    }
    const context = lines.slice(Math.max(0, index - 2), index + 1).join(' ');
    [...line.matchAll(datePattern)].forEach(match => {
      if (!inExperienceSection && !jobSignal.test(context)) return;
      if (/\b(?:degree|university|college|school|project|certification|course)\b/i.test(context)) return;
      const interval = intervalFromPeriod(match[0], context);
      if (interval) detected.push({ title: context.slice(-100), period: match[0], interval });
    });
  });
  return structured.length ? structured : detected;
}

function calculateNonOverlappingExperience(entries) {
  const intervals = entries.map(item => item.interval).filter(Boolean).sort((a, b) => a.start - b.start);
  if (!intervals.length) return { months: 0, years: 0, intervals: [], method: 'No parseable date ranges found' };
  const merged = [];
  intervals.forEach(interval => {
    const last = merged.at(-1);
    if (!last || interval.start > last.end) merged.push({ start: interval.start, end: interval.end });
    else if (interval.end > last.end) last.end = interval.end;
  });
  const months = merged.reduce((total, interval) => total + Math.max(1,
    (interval.end.getFullYear() - interval.start.getFullYear()) * 12 + interval.end.getMonth() - interval.start.getMonth() + 1
  ), 0);
  return { months, years: Math.round(months / 12 * 10) / 10, intervals: merged, method: `${intervals.length} dated role interval${intervals.length === 1 ? '' : 's'} merged to remove overlap` };
}

function extractEvidence(text) {
  const quantified = unique((text.match(/[^.!?\n]*(?:\b\d+(?:\.\d+)?%|\$\s?\d+(?:[kKmMbB])?|\b\d+[kKmM]\+?\b|(?:reduced|increased|improved|grew|saved|optimized)[^.!?\n]*\d+)[^.!?\n]*/gi) || []).map(item => item.trim()).filter(item => item.length > 12)).slice(0, 8);
  const patterns = {
    certifications: /\b(?:AWS Certified[^,.;\n]*|PMP|CKA|CKAD|CISSP|Azure Certified[^,.;\n]*|Google Cloud Certified[^,.;\n]*|CompTIA[^,.;\n]*)/gi,
    publications: /\b(?:publication|published|paper|journal|conference proceeding)s?\b[^.;\n]*/gi,
    patents: /\b(?:patent|inventor)s?\b[^.;\n]*/gi,
    awards: /\b(?:award|winner|won|scholarship|honou?r|recognition)s?\b[^.;\n]*/gi,
    leadership: /\b(?:led|managed|mentored|owned|directed|coached|spearheaded|team lead|president|chair)\b[^.;\n]*/gi,
    volunteering: /\b(?:volunteer|community service|nonprofit|ngo)\b[^.;\n]*/gi,
    hackathons: /\b(?:hackathon|hack day|codefest)\b[^.;\n]*/gi,
    research: /\b(?:research|researcher|research assistant|thesis)\b[^.;\n]*/gi,
  };
  const result = { quantified };
  Object.entries(patterns).forEach(([key, pattern]) => { result[key] = unique((text.match(pattern) || []).map(item => item.trim())).slice(0, 5); });
  return result;
}

function extractProjects(text, categorized) {
  const lines = text.split(/\n|(?<=[.!?])\s+/).map(line => line.trim()).filter(Boolean);
  const starts = lines.map((line, index) => /\b(?:project|projects|built|developed|implemented|created|architected|launched|designed)\b/i.test(line) ? index : -1).filter(index => index >= 0);
  const allSkills = Object.values(categorized).flat();
  return starts.slice(0, 8).map((start, projectIndex) => {
    const block = lines.slice(start, Math.min(lines.length, start + 3)).join(' ');
    const technologies = allSkills.filter(skill => includesTerm(block, skill));
    const inferred = unique([
      /REST|API/i.test(block) && 'API design',
      /deploy|cloud|AWS|Azure|GCP/i.test(block) && 'Cloud deployment',
      /test|quality|coverage/i.test(block) && 'Software testing',
      /scale|distributed|microservice/i.test(block) && 'Distributed systems',
      /user|UX|frontend|React|Vue|Angular/i.test(block) && 'Product engineering',
      /data|analytics|model|ML|AI/i.test(block) && 'Data engineering',
    ]);
    const measurable = extractEvidence(block).quantified;
    const architectureSignals = (block.match(/\b(?:architecture|distributed|real-time|microservice|pipeline|concurrent|scalable|embedded|model)\b/gi) || []).length;
    const innovationSignals = (block.match(/\b(?:novel|first|automated|intelligent|AI|machine learning|optimized|patent)\b/gi) || []).length;
    const techDepth = clamp((technologies.length * 9) + architectureSignals * 12);
    const impact = clamp(measurable.length * 28 + (/launched|production|users|revenue|saved/i.test(block) ? 28 : 0));
    const innovation = clamp(innovationSignals * 18 + inferred.length * 5);
    const quality = clamp(techDepth * .45 + impact * .35 + innovation * .2);
    const dateRange = block.match(/(?:[A-Za-z]{3,9}\s+)?(?:19|20)\d{2}\s*(?:–|-|—|to)\s*(?:(?:[A-Za-z]{3,9}\s+)?(?:19|20)\d{2}|present)/i)?.[0];
    const name = block.match(/(?:project|built|developed|created|designed)\s*[:—-]?\s*(?:an?\s+)?([^,.;|]{3,55})/i)?.[1]?.trim();
    const domain = /health|medical/i.test(block) ? 'HealthTech' : /finance|payment|bank/i.test(block) ? 'FinTech' : /education|learning/i.test(block) ? 'EdTech' : /AI|machine learning|model|NLP|vision/i.test(block) ? 'AI / Data' : /IoT|embedded|sensor|robot/i.test(block) ? 'Embedded / IoT' : /commerce|marketplace|retail/i.test(block) ? 'Commerce' : 'Software Engineering';
    return {
      id: `project-${projectIndex + 1}`, name: name || `Project evidenced in resume`, duration: dateRange || 'Not specified',
      role: block.match(/\b(?:lead|developer|engineer|researcher|designer|architect)\b/i)?.[0] || 'Not specified',
      summary: block.length > 260 ? `${block.slice(0, 257)}…` : block, technologies, inferredSkills: inferred,
      domain, difficulty: techDepth >= 70 ? 'Advanced' : techDepth >= 40 ? 'Intermediate' : 'Foundational',
      complexity: architectureSignals >= 3 ? 'High' : architectureSignals ? 'Moderate' : 'Low evidence',
      businessImpact: measurable[0] || (/production|launched|users/i.test(block) ? 'Production/user impact mentioned without a measurable value' : 'No quantified impact stated'),
      measurable, scores: { innovation, technicalDepth: techDepth, impact, quality },
      confidence: clamp(45 + technologies.length * 7 + measurable.length * 8 + architectureSignals * 5),
    };
  });
}

function deriveDomains(text, projects) {
  const domains = {
    'Backend & APIs': /\b(?:backend|API|microservice|server)\b/gi, 'Frontend & Product': /\b(?:frontend|React|Vue|Angular|UI|UX)\b/gi,
    'Cloud & DevOps': /\b(?:cloud|AWS|Azure|GCP|Docker|Kubernetes|CI\/CD)\b/gi, 'AI & Data': /\b(?:AI|machine learning|data|analytics|NLP|model)\b/gi,
    'Embedded & IoT': /\b(?:embedded|IoT|sensor|Arduino|robot|firmware)\b/gi, 'Leadership': /\b(?:led|managed|mentored|stakeholder)\b/gi,
  };
  return Object.entries(domains).map(([name, regex]) => ({ name, evidence: (text.match(regex) || []).length + projects.filter(project => project.domain.includes(name.split(' ')[0])).length })).filter(item => item.evidence > 0).sort((a, b) => b.evidence - a.evidence);
}

function buildScores({ skills, experience, projects, evidence, education, domains }) {
  const technicalCount = new Set(Object.values(skills).filter((_, key) => key !== 'softSkills').flat()).size;
  const technical = clamp(technicalCount / 20 * 100);
  const experienceScore = clamp(experience.years / 8 * 100);
  const projectQuality = projects.length ? clamp(projects.reduce((sum, project) => sum + project.scores.quality, 0) / projects.length) : 0;
  const leadership = clamp(evidence.leadership.length * 18 + skills.softSkills.filter(skill => /lead|mentor|team|stakeholder/i.test(skill)).length * 8);
  const achievement = clamp(evidence.quantified.length * 18 + evidence.publications.length * 10 + evidence.patents.length * 18 + evidence.awards.length * 8);
  const educationScore = education.level === 'Doctorate' ? 100 : education.level === 'Masters' ? 82 : education.level === 'Bachelors' ? 68 : education.level === 'Diploma' ? 48 : 20;
  const certifications = clamp(evidence.certifications.length * 25);
  const domainExpertise = clamp(domains.reduce((sum, domain) => sum + Math.min(domain.evidence, 5), 0) / 20 * 100);
  const values = { technical, experience: experienceScore, projectQuality, leadership, achievements: achievement, education: educationScore, certifications, domainExpertise };
  const weights = { technical: .24, experience: .18, projectQuality: .18, leadership: .10, achievements: .10, education: .08, certifications: .05, domainExpertise: .07 };
  const explanations = {
    technical: `${technicalCount} distinct technical skills detected; full credit at 20.`,
    experience: `${experience.years} non-overlapping years calculated from dated roles; full credit at 8 years.`,
    projectQuality: projects.length ? `Mean evidence-based quality across ${projects.length} detected projects.` : 'No independently detectable project evidence.',
    leadership: `${evidence.leadership.length} leadership or mentoring statements detected.`,
    achievements: `${evidence.quantified.length} quantified outcomes, ${evidence.publications.length} publications, ${evidence.patents.length} patents and ${evidence.awards.length} awards detected.`,
    education: `${education.level} is the highest degree level detected.`,
    certifications: `${evidence.certifications.length} recognized certifications detected.`,
    domainExpertise: `${domains.length} domains supported by repeated resume evidence.`,
  };
  const overall = clamp(Object.entries(weights).reduce((sum, [key, weight]) => sum + values[key] * weight, 0));
  return { values, weights, explanations, overall };
}

export function buildResumeIntelligence(candidate) {
  const text = candidate.resumeText || candidate.summary || '';
  const skills = categorizeSkills(text, candidate.skills || []);
  const experienceEntries = extractExperience(candidate, text);
  const experience = calculateNonOverlappingExperience(experienceEntries);
  const evidence = extractEvidence(text);
  const projects = extractProjects(text, skills);
  const domains = deriveDomains(text, projects);
  const education = {
    ...(candidate.education || {}),
    level: /\b(?:PhD|Doctorate)\b/i.test(text) ? 'Doctorate' : /\b(?:Master|M\.?S\.?|MBA)\b/i.test(text) ? 'Masters' : /\b(?:Bachelor|B\.?S\.?|B\.?A\.?)\b/i.test(text) ? 'Bachelors' : /\b(?:Diploma|Associate)\b/i.test(text) ? 'Diploma' : 'Not evidenced',
  };
  const scoring = buildScores({ skills, experience, projects, evidence, education, domains });
  const topSkills = Object.values(skills).flat().slice(0, 6);
  const topDomain = domains[0]?.name;
  const seniority = experience.years >= 7 || scoring.values.leadership >= 65 ? 'Senior' : experience.years >= 3 ? 'Mid-level' : 'Junior';
  const seniorityConfidence = clamp(45 + (experience.intervals.length ? 25 : 0) + evidence.leadership.length * 5 + projects.length * 3);
  const summaryParts = [
    `${seniority} ${candidate.appliedRole || 'candidate'} with ${experience.years || 'no reliably dated'} years of non-overlapping experience`,
    topSkills.length ? `evidenced expertise in ${topSkills.join(', ')}` : null,
    topDomain ? `strongest domain signal in ${topDomain}` : null,
    evidence.leadership.length ? `${evidence.leadership.length} leadership or mentoring indicator${evidence.leadership.length === 1 ? '' : 's'}` : null,
    evidence.quantified.length ? `${evidence.quantified.length} quantified achievement${evidence.quantified.length === 1 ? '' : 's'}` : null,
  ].filter(Boolean);
  const suggestedRoles = unique([
    skills.aiMl.length && 'Machine Learning Engineer', skills.cloud.length && skills.devops.length && 'Cloud / Platform Engineer',
    skills.frameworks.length && 'Full-Stack Engineer', skills.embedded.length && 'Embedded Systems Engineer',
    skills.databases.length && 'Backend Engineer', scoring.values.leadership >= 65 && 'Technical Lead',
    candidate.appliedRole,
  ]).slice(0, 4);
  const baseSalary = seniority === 'Senior' ? 135000 : seniority === 'Mid-level' ? 95000 : 70000;
  const premium = Math.min(30000, new Set(Object.values(skills).flat()).size * 900 + scoring.values.leadership * 100);
  const salaryEstimate = { low: Math.round((baseSalary + premium * .45) / 5000) * 5000, high: Math.round((baseSalary + premium) / 5000) * 5000, currency: 'USD', basis: `Role-agnostic benchmark adjusted by ${seniority.toLowerCase()} level, detected skill breadth, and leadership evidence; location and company data are not available.`, confidence: 42 };
  const strengths = [
    scoring.values.technical >= 60 && `Broad technical coverage (${new Set(Object.values(skills).flat()).size} detected skills)`,
    scoring.values.projectQuality >= 60 && `Projects show evidence of technical depth`,
    evidence.quantified.length && `${evidence.quantified.length} quantified outcomes`,
    evidence.leadership.length && `Leadership evidenced in ${evidence.leadership.length} resume statements`,
  ].filter(Boolean);
  const weaknesses = [
    !evidence.quantified.length && 'Impact is not quantified; ask for scale, latency, revenue, or user outcomes.',
    !evidence.certifications.length && 'No certifications detected; validate platform depth through technical discussion.',
    projects.length < 2 && 'Limited independently detectable project detail.',
    experience.intervals.length === 0 && 'Experience dates could not be reliably parsed.',
  ].filter(Boolean);
  const interviewQuestions = [
    projects[0] && `Walk us through the architecture and key trade-offs in “${projects[0].name}”.`,
    topSkills[0] && `Describe a difficult production problem you solved using ${topSkills[0]}.`,
    evidence.quantified[0] && `How was this outcome measured and what was your individual contribution: “${evidence.quantified[0]}”?`,
    evidence.leadership[0] && `What leadership decision had the largest effect in: “${evidence.leadership[0]}”?`,
    topDomain && `Which constraints are unique to your work in ${topDomain}?`,
  ].filter(Boolean);
  const detectedPII = [
    ['Name', Boolean(candidate.name), 99], ['Email', Boolean(candidate.email || /@/.test(text)), 98],
    ['Phone', /\b(?:\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}/.test(text), 94], ['Location / address', Boolean(candidate.location), 88],
    ['Portfolio & social links', /https?:\/\/|linkedin|github|portfolio/i.test(text), 96],
    ['Education institution', /\b(?:university|college|institute|academy|school|polytechnic)\b/i.test(text) || Boolean(candidate.education?.school), 91],
    ['Gender & pronouns', /\b(?:he|she|him|her|his|hers|male|female)\b/i.test(text), 86], ['Photo / portrait region', Boolean(candidate.pdfObjectUrl), 68],
  ].map(([field, detected, confidence]) => ({ field, detected, removed: detected, confidence, note: field.includes('Photo') ? 'Likely portrait-shaped images in the resume header are masked using layout heuristics.' : detected ? 'Coordinate mask applied where text coordinates are available.' : 'No matching evidence detected.' }));

  return {
    candidateId: candidate.id, role: candidate.appliedRole, rawText: text, summary: `${summaryParts.join('; ')}.`,
    categorizedSkills: skills, categoryLabels: LABELS, experienceEntries, experience, experienceYears: experience.years,
    evidence, achievements: evidence.quantified, certifications: evidence.certifications, education, projects, domains,
    leadershipSignals: evidence.leadership.length, scoring, scores: scoring.values, overall: scoring.overall,
    seniority: { level: seniority, confidence: seniorityConfidence }, suggestedRoles, salaryEstimate, strengths, weaknesses,
    hiringRecommendation: scoring.overall >= 75 ? 'Advance to structured technical interview' : scoring.overall >= 55 ? 'Proceed with targeted evidence validation' : 'Hold pending clarification of missing evidence',
    interviewQuestions, anonymization: detectedPII,
  };
}

export function matchJobDescription(intelligence, jobDescription) {
  const required = unique(Object.values(TAXONOMY).flat().filter(skill => includesTerm(jobDescription, skill)));
  const candidateSkills = Object.values(intelligence.categorizedSkills).flat();
  const matched = required.filter(skill => candidateSkills.some(candidate => candidate.toLowerCase() === skill.toLowerCase()));
  const missing = required.filter(skill => !matched.includes(skill));
  const atsScore = required.length ? clamp(matched.length / required.length * 100) : 0;
  const recommendations = [
    !required.length && 'Paste a job description containing concrete technical requirements to calculate ATS compatibility.',
    missing.length && `Validate or develop evidence for: ${missing.slice(0, 5).join(', ')}.`,
    matched.length && `Keep matched terms contextualized with outcomes rather than listing keywords: ${matched.slice(0, 4).join(', ')}.`,
    intelligence.achievements.length < 2 && 'Add measurable scope or outcomes to improve evidence quality.',
  ].filter(Boolean);
  return { required, matched, missing, atsScore, recommendations, formula: `${matched.length} matched required keywords ÷ ${required.length} detected required keywords`, confidence: required.length >= 5 ? 90 : required.length ? 70 : 0 };
}

export const technicalKeywords = Object.values(TAXONOMY).flat();
