import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Path to single canonical dataset folder
const DATASET_DIR = path.join(__dirname, '..', 'dataset');
const EMPLOYEES_FILE = path.join(DATASET_DIR, 'employees.json');
const BIAS_ALERTS_FILE = path.join(DATASET_DIR, 'bias_alerts.json');
const SAFETY_REPORTS_FILE = path.join(DATASET_DIR, 'safety_reports.json');
const CANDIDATES_FILE = path.join(DATASET_DIR, 'candidates.json');

// Helper functions to read/write JSON files safely
const readJSON = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
};

const writeJSON = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
    return false;
  }
};

// GET Employees
app.get('/api/employees', (req, res) => {
  const employees = readJSON(EMPLOYEES_FILE);
  res.json(employees);
});

// POST New Employee (Writes directly to dataset/employees.json)
app.post('/api/employees', (req, res) => {
  const employees = readJSON(EMPLOYEES_FILE);
  const newEmp = {
    ...req.body,
    id: req.body.id || `EMP-${Date.now().toString().slice(-3)}`,
    salary: Number(req.body.salary),
    experienceYears: Number(req.body.experienceYears || 4),
    performanceRating: Number(req.body.performanceRating || 4.5),
    monthsInRole: Number(req.body.monthsInRole || 12),
    status: 'Active'
  };

  employees.unshift(newEmp);
  const success = writeJSON(EMPLOYEES_FILE, employees);

  if (success) {
    res.status(201).json({ success: true, employee: newEmp, employees });
  } else {
    res.status(500).json({ error: 'Failed to write to employees.json' });
  }
});

// PUT Update Employee Salary / Details (Writes directly to dataset/employees.json)
app.put('/api/employees/:id', (req, res) => {
  const { id } = req.params;
  const employees = readJSON(EMPLOYEES_FILE);

  const index = employees.findIndex(e => e.id === id);
  if (index !== -1) {
    employees[index] = { ...employees[index], ...req.body };
    writeJSON(EMPLOYEES_FILE, employees);
    res.json({ success: true, employee: employees[index], employees });
  } else {
    res.status(404).json({ error: 'Employee not found' });
  }
});

// GET Bias Alerts
app.get('/api/bias-alerts', (req, res) => {
  const alerts = readJSON(BIAS_ALERTS_FILE);
  res.json(alerts);
});

// DELETE Bias Alert (Dismiss)
app.delete('/api/bias-alerts/:id', (req, res) => {
  const { id } = req.params;
  let alerts = readJSON(BIAS_ALERTS_FILE);
  alerts = alerts.filter(a => a.id !== id);
  writeJSON(BIAS_ALERTS_FILE, alerts);
  res.json({ success: true, alerts });
});

// GET Safety Reports
app.get('/api/safety-reports', (req, res) => {
  const reports = readJSON(SAFETY_REPORTS_FILE);
  res.json(reports);
});

const anonymizeResume = (rawText = '', structuredData = {}) => {
  let text = rawText;
  const redactedDetails = [];
  const redact = (pattern, replacement, type) => {
    const matches = text.match(pattern) || [];
    if (matches.length) {
      text = text.replace(pattern, replacement);
      redactedDetails.push({ type, count: matches.length });
    }
  };

  redact(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED EMAIL]', 'Email');
  redact(/(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s.-]\d{3,4}[\s.-]\d{3,4}/g, '[REDACTED PHONE]', 'Phone');
  redact(/https?:\/\/\S+|\b(?:linkedin|github)\.com\/\S+/gi, '[REDACTED URL]', 'Profile URL');
  if (structuredData.candidateName) {
    structuredData.candidateName.split(/\s+/).filter((part) => part.length > 1).forEach((part) => {
      redact(new RegExp(`\\b${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), '[REDACTED NAME]', 'Name');
    });
  }
  redact(/\b(?:he|she|him|her|his|hers|male|female|mr|mrs|ms)\b/gi, '[REDACTED DEMOGRAPHIC]', 'Demographic');
  return {
    anonymizedText: text,
    redactedDetails,
    redactedCount: redactedDetails.reduce((total, item) => total + item.count, 0),
  };
};

app.get('/api/resumes', (req, res) => {
  res.json({ success: true, data: readJSON(CANDIDATES_FILE) });
});

// Shared candidate endpoints used by screening, comparison, and people operations.
app.get('/api/candidates', (req, res) => {
  res.json(readJSON(CANDIDATES_FILE));
});

app.post('/api/candidates', (req, res) => {
  const candidates = readJSON(CANDIDATES_FILE);
  const candidate = {
    ...req.body,
    id: req.body.id || `CAN-${Date.now().toString().slice(-6)}`,
    appliedDate: req.body.appliedDate || new Date().toISOString().slice(0, 10),
    status: req.body.status || 'Pending Review',
  };
  candidates.unshift(candidate);
  if (!writeJSON(CANDIDATES_FILE, candidates)) {
    return res.status(500).json({ error: 'Could not save candidate.' });
  }
  return res.status(201).json(candidate);
});

app.put('/api/candidates/:id', (req, res) => {
  const candidates = readJSON(CANDIDATES_FILE);
  const index = candidates.findIndex(candidate => candidate.id === req.params.id || candidate._id === req.params.id);
  if (index < 0) return res.status(404).json({ error: 'Candidate not found.' });
  candidates[index] = { ...candidates[index], ...req.body, updatedAt: new Date().toISOString() };
  if (!writeJSON(CANDIDATES_FILE, candidates)) {
    return res.status(500).json({ error: 'Could not update candidate.' });
  }
  return res.json(candidates[index]);
});

app.post('/api/resumes/upload', (req, res) => {
  const { rawText, jobTitle, structuredData = {} } = req.body;
  if (!rawText?.trim()) return res.status(400).json({ error: 'Resume text is required.' });

  const candidates = readJSON(CANDIDATES_FILE);
  const anonymous = anonymizeResume(rawText, structuredData);
  const candidateCode = `CAND-${Date.now().toString().slice(-6)}`;
  const safeIntelligence = structuredData.intelligence
    ? { ...structuredData.intelligence, rawText: undefined }
    : undefined;
  const candidate = {
    _id: candidateCode,
    id: candidateCode,
    candidateCode,
    jobTitle: jobTitle || 'Unspecified role',
    appliedRole: jobTitle || 'Unspecified role',
    appliedDate: new Date().toISOString().slice(0, 10),
    status: 'New',
    createdAt: new Date().toISOString(),
    ...structuredData,
    intelligence: safeIntelligence,
    candidateName: undefined,
    candidateEmail: undefined,
    rawText: undefined,
    ...anonymous,
  };
  candidates.unshift(candidate);
  if (!writeJSON(CANDIDATES_FILE, candidates)) {
    return res.status(500).json({ error: 'Could not save the processed resume.' });
  }
  return res.status(201).json({ success: true, data: candidate });
});

app.put('/api/resumes/:id/evaluate', (req, res) => {
  const candidates = readJSON(CANDIDATES_FILE);
  const index = candidates.findIndex((item) => item._id === req.params.id || item.id === req.params.id);
  if (index < 0) return res.status(404).json({ error: 'Candidate not found.' });
  candidates[index] = {
    ...candidates[index],
    status: req.body.status || candidates[index].status,
    evaluationNotes: req.body.evaluationNotes ?? candidates[index].evaluationNotes,
    evaluatedAt: new Date().toISOString(),
  };
  if (!writeJSON(CANDIDATES_FILE, candidates)) {
    return res.status(500).json({ error: 'Could not save the evaluation.' });
  }
  return res.json({ success: true, data: candidates[index] });
});

app.listen(PORT, () => {
  console.log(`FairLens API Server running on http://localhost:${PORT}`);
});
