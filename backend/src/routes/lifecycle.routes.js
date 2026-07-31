import express from 'express';
import fs from 'fs';
import path from 'path';
import { createHash, randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { requireAuth, requireRole } from '../middleware/session.middleware.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATASET_DIR = path.resolve(__dirname, '../../../dataset');
const LIFECYCLE_FILE = path.join(DATASET_DIR, 'lifecycle.json');
const AUDIT_FILE = path.join(DATASET_DIR, 'audit_logs.json');
const EMPLOYEES_FILE = path.resolve(__dirname, '../../../frontend/src/dataset/employees.json');

const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Declined'];
const allowedTransitions = {
  Applied: ['Screening', 'Declined'],
  Screening: ['Interview', 'Declined'],
  Interview: ['Offer', 'Declined'],
  Offer: ['Hired', 'Declined'],
  Hired: [],
  Declined: [],
};

function readJSON(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJSON(file, value) {
  const temporary = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2), 'utf8');
  fs.renameSync(temporary, file);
}

function nextId(prefix) {
  return `${prefix}-${randomUUID().split('-')[0].toUpperCase()}`;
}

function audit(req, action, entityType, entityId, details = {}) {
  const logs = readJSON(AUDIT_FILE, []);
  const previousHash = logs[0]?.hash || 'GENESIS';
  const event = {
    id: nextId('AUD'),
    action,
    entityType,
    entityId,
    actor: req.auth?.email || 'public candidate',
    role: req.auth?.role || 'candidate',
    timestamp: new Date().toISOString(),
    details,
    previousHash,
  };
  event.hash = createHash('sha256').update(JSON.stringify(event)).digest('hex');
  logs.unshift(event);
  writeJSON(AUDIT_FILE, logs.slice(0, 1000));
  return event;
}

function requireText(value, name, max = 200) {
  const text = String(value || '').trim();
  if (!text) {
    const error = new Error(`${name} is required`);
    error.status = 400;
    throw error;
  }
  if (text.length > max) {
    const error = new Error(`${name} must be ${max} characters or fewer`);
    error.status = 400;
    throw error;
  }
  return text;
}

function handler(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message || 'Unexpected server error' });
    }
  };
}

const requireHR = [requireAuth, requireRole('hr')];

router.get('/jobs/public', handler((req, res) => {
  const data = readJSON(LIFECYCLE_FILE, { jobs: [] });
  res.json(data.jobs
    .map(({ id, title, department, location, employmentType }) => ({
      id,
      title,
      department,
      location,
      employmentType,
    })));
}));

router.get('/overview', ...requireHR, handler((req, res) => {
  const data = readJSON(LIFECYCLE_FILE, { jobs: [], applications: [], interviews: [], offers: [], onboarding: [] });
  const safeData = {
    ...data,
    applications: data.applications.map(application => application.stage === 'Hired' ? application : {
      ...application,
      candidateName: 'Identity protected',
      candidateEmail: '',
    }),
  };
  const activeJobs = data.jobs.filter(job => job.status === 'Published').length;
  const openApplications = data.applications.filter(application => !['Hired', 'Declined'].includes(application.stage)).length;
  const upcomingInterviews = data.interviews.filter(interview => interview.status === 'Scheduled').length;
  const pendingOffers = data.offers.filter(offer => ['Draft', 'Pending approval', 'Sent'].includes(offer.status)).length;
  res.json({
    data: safeData,
    metrics: {
      activeJobs,
      openApplications,
      upcomingInterviews,
      pendingOffers,
      hires: data.applications.filter(application => application.stage === 'Hired').length,
    },
    stageCounts: stages.map(stage => ({
      stage,
      count: data.applications.filter(application => application.stage === stage).length,
    })),
  });
}));

router.post('/jobs', ...requireHR, handler((req, res) => {
  const title = requireText(req.body.title, 'title');
  const department = requireText(req.body.department, 'department');
  const salaryMin = Number(req.body.salaryMin);
  const salaryMax = Number(req.body.salaryMax);
  if (!Number.isFinite(salaryMin) || !Number.isFinite(salaryMax) || salaryMin < 0 || salaryMax <= salaryMin) {
    return res.status(400).json({ error: 'salaryMax must be greater than salaryMin' });
  }
  const criteria = Array.isArray(req.body.criteria)
    ? req.body.criteria.map(item => String(item).trim()).filter(Boolean)
    : String(req.body.criteria || '').split(',').map(item => item.trim()).filter(Boolean);
  if (!criteria.length) return res.status(400).json({ error: 'At least one job-related criterion is required' });
  const data = readJSON(LIFECYCLE_FILE, { jobs: [], applications: [], interviews: [], offers: [], onboarding: [] });
  const job = {
    id: nextId('JOB'),
    title,
    department,
    location: requireText(req.body.location || 'Remote', 'location'),
    employmentType: req.body.employmentType || 'Full-time',
    status: req.body.status === 'Published' ? 'Published' : 'Draft',
    openings: Math.max(1, Number(req.body.openings) || 1),
    salaryMin,
    salaryMax,
    criteria,
    owner: req.auth.email,
    createdAt: new Date().toISOString(),
  };
  data.jobs.unshift(job);
  writeJSON(LIFECYCLE_FILE, data);
  audit(req, 'job.created', 'job', job.id, { status: job.status, criteriaCount: criteria.length });
  res.status(201).json(job);
}));

router.patch('/jobs/:id', ...requireHR, handler((req, res) => {
  const data = readJSON(LIFECYCLE_FILE, { jobs: [] });
  const job = data.jobs.find(item => item.id === req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  const allowed = ['Draft', 'Published', 'Paused', 'Closed'];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ error: 'Invalid job status' });
  const previous = job.status;
  job.status = req.body.status;
  job.updatedAt = new Date().toISOString();
  writeJSON(LIFECYCLE_FILE, data);
  audit(req, 'job.status_changed', 'job', job.id, { from: previous, to: job.status });
  res.json(job);
}));

router.post('/applications', handler((req, res) => {
  const data = readJSON(LIFECYCLE_FILE, { jobs: [], applications: [], interviews: [], offers: [], onboarding: [] });
  const requestedTitle = requireText(req.body.jobTitle, 'jobTitle');
  const job = data.jobs.find(item =>
    item.id === req.body.jobId || item.title.toLowerCase() === requestedTitle.toLowerCase()
  );
  const email = requireText(req.body.email, 'email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address' });
  const application = {
    id: nextId('APP'),
    candidateCode: nextId('CAND'),
    candidateName: requireText(req.body.name, 'name'),
    candidateEmail: email,
    jobId: job?.id || null,
    jobTitle: job?.title || requestedTitle,
    stage: 'Applied',
    meritScore: Number.isFinite(Number(req.body.meritScore)) ? Math.min(100, Math.max(0, Number(req.body.meritScore))) : null,
    skills: Array.isArray(req.body.skills) ? req.body.skills.map(String).slice(0, 30) : [],
    appliedAt: new Date().toISOString(),
    lastDecisionReason: 'Candidate submitted application.',
  };
  data.applications.unshift(application);
  writeJSON(LIFECYCLE_FILE, data);
  audit(req, 'application.submitted', 'application', application.id, { jobId: application.jobId, jobTitle: application.jobTitle });
  res.status(201).json({ id: application.id, candidateCode: application.candidateCode, stage: application.stage });
}));

router.patch('/applications/:id/stage', ...requireHR, handler((req, res) => {
  const nextStage = req.body.stage;
  const reason = requireText(req.body.reason, 'decision reason', 500);
  const data = readJSON(LIFECYCLE_FILE, { applications: [], interviews: [], offers: [], onboarding: [] });
  const application = data.applications.find(item => item.id === req.params.id);
  if (!application) return res.status(404).json({ error: 'Application not found' });
  if (!allowedTransitions[application.stage]?.includes(nextStage)) {
    return res.status(409).json({ error: `Cannot move an application from ${application.stage} to ${nextStage}` });
  }
  const previous = application.stage;
  application.stage = nextStage;
  application.lastDecisionReason = reason;
  application.updatedAt = new Date().toISOString();
  if (nextStage === 'Interview' && !data.interviews.some(item => item.applicationId === application.id)) {
    data.interviews.unshift({
      id: nextId('INT'),
      applicationId: application.id,
      candidateCode: application.candidateCode,
      jobTitle: application.jobTitle,
      scheduledAt: null,
      interviewer: '',
      format: 'Video',
      status: 'Needs scheduling',
      rubric: 'Use the approved job criteria and record evidence for every rating.',
      rating: null,
      feedback: '',
    });
  }
  if (nextStage === 'Offer' && !data.offers.some(item => item.applicationId === application.id)) {
    const job = data.jobs.find(item => item.id === application.jobId);
    data.offers.unshift({
      id: nextId('OFF'),
      applicationId: application.id,
      candidateCode: application.candidateCode,
      jobTitle: application.jobTitle,
      salary: job?.salaryMin || 0,
      status: 'Draft',
      createdAt: new Date().toISOString(),
    });
  }
  if (nextStage === 'Hired' && !data.onboarding.some(item => item.applicationId === application.id)) {
    const onboarding = {
      id: nextId('ONB'),
      applicationId: application.id,
      candidateCode: application.candidateCode,
      employeeName: application.candidateName,
      jobTitle: application.jobTitle,
      startDate: req.body.startDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: 'Not started',
      tasks: [
        { id: nextId('TASK'), title: 'Verify employment documents', owner: 'People Ops', completed: false },
        { id: nextId('TASK'), title: 'Provision workspace access', owner: 'IT', completed: false },
        { id: nextId('TASK'), title: 'Schedule manager welcome', owner: 'Hiring manager', completed: false }
      ],
    };
    data.onboarding.unshift(onboarding);
    const employees = readJSON(EMPLOYEES_FILE, []);
    if (!employees.some(employee => employee.sourceApplicationId === application.id)) {
      employees.unshift({
        id: nextId('EMP'),
        name: application.candidateName,
        gender: 'Unspecified',
        department: data.jobs.find(item => item.id === application.jobId)?.department || 'Unassigned',
        role: application.jobTitle,
        level: 'New hire',
        salary: data.offers.find(item => item.applicationId === application.id)?.salary || 0,
        experienceYears: 0,
        performanceRating: 0,
        monthsInRole: 0,
        status: 'Onboarding',
        sourceApplicationId: application.id,
      });
      writeJSON(EMPLOYEES_FILE, employees);
    }
  }
  writeJSON(LIFECYCLE_FILE, data);
  audit(req, 'application.stage_changed', 'application', application.id, { from: previous, to: nextStage, reason });
  res.json(application);
}));

router.patch('/interviews/:id', ...requireHR, handler((req, res) => {
  const data = readJSON(LIFECYCLE_FILE, { interviews: [] });
  const interview = data.interviews.find(item => item.id === req.params.id);
  if (!interview) return res.status(404).json({ error: 'Interview not found' });
  const allowedFields = ['scheduledAt', 'interviewer', 'format', 'status', 'rating', 'feedback'];
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) interview[field] = req.body[field];
  });
  if (interview.rating !== null && (Number(interview.rating) < 1 || Number(interview.rating) > 5)) {
    return res.status(400).json({ error: 'rating must be between 1 and 5' });
  }
  interview.updatedAt = new Date().toISOString();
  writeJSON(LIFECYCLE_FILE, data);
  audit(req, 'interview.updated', 'interview', interview.id, { status: interview.status, hasFeedback: Boolean(interview.feedback) });
  res.json(interview);
}));

router.patch('/offers/:id', ...requireHR, handler((req, res) => {
  const data = readJSON(LIFECYCLE_FILE, { offers: [] });
  const offer = data.offers.find(item => item.id === req.params.id);
  if (!offer) return res.status(404).json({ error: 'Offer not found' });
  const salary = Number(req.body.salary ?? offer.salary);
  if (!Number.isFinite(salary) || salary <= 0) return res.status(400).json({ error: 'A valid salary is required' });
  const allowedStatuses = ['Draft', 'Pending approval', 'Sent', 'Accepted', 'Declined'];
  if (req.body.status && !allowedStatuses.includes(req.body.status)) return res.status(400).json({ error: 'Invalid offer status' });
  offer.salary = salary;
  offer.status = req.body.status || offer.status;
  offer.updatedAt = new Date().toISOString();
  writeJSON(LIFECYCLE_FILE, data);
  audit(req, 'offer.updated', 'offer', offer.id, { status: offer.status, salary });
  res.json(offer);
}));

router.patch('/onboarding/:id/tasks/:taskId', ...requireHR, handler((req, res) => {
  const data = readJSON(LIFECYCLE_FILE, { onboarding: [] });
  const plan = data.onboarding.find(item => item.id === req.params.id);
  const task = plan?.tasks.find(item => item.id === req.params.taskId);
  if (!plan || !task) return res.status(404).json({ error: 'Onboarding task not found' });
  task.completed = Boolean(req.body.completed);
  plan.status = plan.tasks.every(item => item.completed) ? 'Complete' : plan.tasks.some(item => item.completed) ? 'In progress' : 'Not started';
  writeJSON(LIFECYCLE_FILE, data);
  audit(req, 'onboarding.task_updated', 'onboarding', plan.id, { taskId: task.id, completed: task.completed });
  res.json(plan);
}));

router.get('/audit-logs', ...requireHR, handler((req, res) => {
  const limit = Math.min(250, Math.max(1, Number(req.query.limit) || 100));
  res.json(readJSON(AUDIT_FILE, []).slice(0, limit));
}));

export default router;
