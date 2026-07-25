import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { anonymizeResume } from './src/utils/anonymizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

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

// GET Safety Reports (HR view — all cases)
app.get('/api/safety-reports', (req, res) => {
  const reports = readJSON(SAFETY_REPORTS_FILE);
  res.json(reports);
});

// POST New Safety Report (employee submits anonymously — generates a passkey,
// the only link back to this case. No employee identity is stored.)
app.post('/api/safety-reports', (req, res) => {
  const { category, narrative, severity, evidenceFiles } = req.body;
  if (!category || !narrative) {
    return res.status(400).json({ success: false, error: 'category and narrative are required' });
  }

  const reports = readJSON(SAFETY_REPORTS_FILE);
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

// GET Single Case by Passkey (anonymous employee-side lookup — no auth, no identity)
app.get('/api/safety-reports/lookup/:passkey', (req, res) => {
  const reports = readJSON(SAFETY_REPORTS_FILE);
  const report = reports.find(r => r.passkey === req.params.passkey);
  if (!report) {
    return res.status(404).json({ success: false, error: 'No case found for this passkey' });
  }
  res.json({ success: true, data: report });
});

// POST Chat Message (used by both HR dashboard and the anonymous employee passkey view)
app.post('/api/safety-reports/:id/chat', (req, res) => {
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

  const message = { sender, text: text.trim(), time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };
  reports[index].chatHistory.push(message);
  writeJSON(SAFETY_REPORTS_FILE, reports);
  res.json({ success: true, data: reports[index] });
});

// PUT Update Case Status (HR-side case management — Pending Review -> Under Investigation -> Resolved)
app.put('/api/safety-reports/:id', (req, res) => {
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
app.get('/api/resumes', (req, res) => {
  const resumes = readJSON(RESUMES_FILE);
  res.json({ success: true, data: resumes });
});

// PUT Update Candidate Evaluation (rating, notes, status — set by HR after blind review)
app.put('/api/resumes/:id/evaluate', (req, res) => {
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