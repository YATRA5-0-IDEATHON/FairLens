import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { anonymizeResume } from './src/utils/anonymizer.js';
import { createSessionToken, requireAuth, requireRole } from './src/middleware/session.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // increased limit for base64 evidence uploads

// Path to single canonical dataset folder
const DATASET_DIR = path.join(__dirname, '..', 'dataset');
// Employee records are bundled from this same source by the frontend.
// Keeping the API on that file prevents two employee datasets drifting apart.
const EMPLOYEES_FILE = path.join(__dirname, '..', 'frontend', 'src', 'dataset', 'employees.json');
const BIAS_ALERTS_FILE = path.join(DATASET_DIR, 'bias_alerts.json');
const SAFETY_REPORTS_FILE = path.join(DATASET_DIR, 'safety_reports.json');
const RESUMES_FILE = path.join(DATASET_DIR, 'resumes.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

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

const publicUser = user => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  employeeId: user.employeeId || null,
  companyName: user.companyName || null,
  companyCode: user.companyCode || null,
});

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const role = String(req.body.role || '');
  const users = readJSON(USERS_FILE);
  const user = users.find(item => item.email.toLowerCase() === email && item.role === role);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email, password, or account type' });
  }
  const safeUser = publicUser(user);
  return res.json({ token: createSessionToken(user), user: safeUser });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = readJSON(USERS_FILE).find(item => item.id === req.auth.sub);
  if (!user) return res.status(401).json({ error: 'Account no longer exists' });
  return res.json({ user: publicUser(user) });
});

const requireHR = [requireAuth, requireRole('hr')];

// GET Employees
app.get('/api/employees', (req, res) => {
  const employees = readJSON(EMPLOYEES_FILE);
  res.json(employees);
});

// POST New Employee (Writes directly to dataset/employees.json)
app.post('/api/employees', ...requireHR, (req, res) => {
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
app.put('/api/employees/:id', ...requireHR, (req, res) => {
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
app.delete('/api/bias-alerts/:id', ...requireHR, (req, res) => {
  const { id } = req.params;
  let alerts = readJSON(BIAS_ALERTS_FILE);
  alerts = alerts.filter(a => a.id !== id);
  writeJSON(BIAS_ALERTS_FILE, alerts);
  res.json({ success: true, alerts });
});

// GET Safety Reports (HR view — all cases)
app.get('/api/safety-reports', ...requireHR, (req, res) => {
  const reports = readJSON(SAFETY_REPORTS_FILE);
  res.json(reports);
});

app.get('/api/safety-reports/mine', requireAuth, requireRole('employee'), (req, res) => {
  const user = readJSON(USERS_FILE).find(item => item.id === req.auth.sub);
  if (!user?.employeeId) return res.json([]);
  const reports = readJSON(SAFETY_REPORTS_FILE).filter(report => report.ownerEmployeeId === user.employeeId);
  return res.json(reports);
});

// POST New Safety Report (employee submits anonymously — generates a passkey,
// the only link back to this case. No employee identity is stored.)
app.post('/api/safety-reports', requireAuth, requireRole('employee'), (req, res) => {
  const { category, narrative, severity, evidenceFiles } = req.body;
  if (!category || !narrative) {
    return res.status(400).json({ success: false, error: 'category and narrative are required' });
  }

  const reports = readJSON(SAFETY_REPORTS_FILE);
  const account = readJSON(USERS_FILE).find(item => item.id === req.auth.sub);
  if (!account?.employeeId) {
    return res.status(403).json({ success: false, error: 'Employee account is not linked to an employee record' });
  }
  const passkey = 'FL-PASSKEY-' + Math.random().toString(36).substring(2, 10).toUpperCase() +
    '-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  const newReport = {
    id: `SAFE-${Math.floor(100 + Math.random() * 900)}`,
    passkey,
    category,
    severity: severity || 'Standard',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    status: 'Pending Review',
    narrative,
    ownerEmployeeId: account.employeeId,
    evidenceFiles: Array.isArray(evidenceFiles) ? evidenceFiles.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
      data: f.data // base64 data URL
    })) : [],
    chatHistory: [
      { sender: 'System', text: 'Encrypted two-way channel opened between HR Case Officer and Anonymous Reporter.', time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) }
    ]
  };

  reports.unshift(newReport);
  writeJSON(SAFETY_REPORTS_FILE, reports);

  // Only the passkey and case id go back to the employee — never the full list.
  res.status(201).json({ success: true, id: newReport.id, passkey: newReport.passkey });
});

// POST Chat Message for the assigned employee or an HR account.
app.post('/api/safety-reports/:id/chat', requireAuth, (req, res) => {
  const { sender, text } = req.body;
  if (!sender || !text || !text.trim()) {
    return res.status(400).json({ success: false, error: 'sender and text are required' });
  }
  if (!['HR Officer', 'Anonymous Employee'].includes(sender)) {
    return res.status(400).json({ success: false, error: 'Invalid sender' });
  }

  const reports = readJSON(SAFETY_REPORTS_FILE);
  const index = reports.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Case not found' });
  }
  const account = readJSON(USERS_FILE).find(item => item.id === req.auth.sub);
  if (req.auth.role === 'employee' && reports[index].ownerEmployeeId !== account?.employeeId) {
    return res.status(403).json({ success: false, error: 'This case is not assigned to your account' });
  }
  if (req.auth.role === 'hr' && sender !== 'HR Officer') {
    return res.status(403).json({ success: false, error: 'Invalid HR sender' });
  }
  if (req.auth.role === 'employee' && sender !== 'Anonymous Employee') {
    return res.status(403).json({ success: false, error: 'Invalid employee sender' });
  }

  const message = { sender, text: text.trim(), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };
  reports[index].chatHistory.push(message);
  writeJSON(SAFETY_REPORTS_FILE, reports);
  res.json({ success: true, data: reports[index] });
});

// PUT Update Case Status (HR-side case management — Pending Review -> Under Investigation -> Resolved)
app.put('/api/safety-reports/:id', ...requireHR, (req, res) => {
  const reports = readJSON(SAFETY_REPORTS_FILE);
  const index = reports.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Case not found' });
  }
  reports[index] = { ...reports[index], ...req.body };
  writeJSON(SAFETY_REPORTS_FILE, reports);
  res.json({ success: true, data: reports[index] });
});

// POST Preview Anonymization (no save — used for live preview before upload)
app.post('/api/resumes/preview', (req, res) => {
  const { rawText } = req.body;
  if (!rawText) {
    return res.status(400).json({ success: false, error: 'rawText is required' });
  }
  const result = anonymizeResume(rawText);
  res.json({ success: true, data: result });
});

// POST Upload Resume (anonymizes and persists to dataset/resumes.json)
app.post('/api/resumes/upload', (req, res) => {
  const { rawText, jobTitle } = req.body;
  if (!rawText) {
    return res.status(400).json({ success: false, error: 'rawText is required' });
  }

  const anonymized = anonymizeResume(rawText);
  const resumes = readJSON(RESUMES_FILE);

  const newCandidate = {
    _id: `CAND-${Date.now()}`,
    candidateCode: `CAND-${Math.floor(1000 + Math.random() * 9000)}`,
    jobTitle: jobTitle || 'Unspecified Role',
    anonymizedText: anonymized.anonymizedText,
    redactedCount: anonymized.redactedCount,
    redactedDetails: anonymized.redactedDetails,
    extractedSkills: anonymized.extractedSkills,
    yearsOfExperience: anonymized.yearsOfExperience,
    rating: 0,
    evaluationNotes: '',
    status: 'New',
    createdAt: new Date().toISOString()
  };

  resumes.unshift(newCandidate);
  const success = writeJSON(RESUMES_FILE, resumes);

  if (success) {
    res.status(201).json({ success: true, data: newCandidate });
  } else {
    res.status(500).json({ success: false, error: 'Failed to write to resumes.json' });
  }
});

// GET All Resumes (HR-facing anonymized candidate list)
app.get('/api/resumes', ...requireHR, (req, res) => {
  const resumes = readJSON(RESUMES_FILE);
  res.json({ success: true, data: resumes });
});

// PUT Update Candidate Evaluation (rating, notes, status — set by HR after blind review)
app.put('/api/resumes/:id/evaluate', ...requireHR, (req, res) => {
  const { id } = req.params;
  const resumes = readJSON(RESUMES_FILE);

  const index = resumes.findIndex(r => r._id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Candidate not found' });
  }

  resumes[index] = { ...resumes[index], ...req.body };
  writeJSON(RESUMES_FILE, resumes);
  res.json({ success: true, data: resumes[index] });
});

app.listen(PORT, () => {
  console.log(`FairLens API Server running on http://localhost:${PORT}`);
});
