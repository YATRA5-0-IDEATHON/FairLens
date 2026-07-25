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
app.use(express.json());

// Path to single canonical dataset folder
const DATASET_DIR = path.join(__dirname, '..', 'dataset');
const EMPLOYEES_FILE = path.join(DATASET_DIR, 'employees.json');
const BIAS_ALERTS_FILE = path.join(DATASET_DIR, 'bias_alerts.json');
const SAFETY_REPORTS_FILE = path.join(DATASET_DIR, 'safety_reports.json');

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

app.listen(PORT, () => {
  console.log(`FairLens API Server running on http://localhost:${PORT}`);
});
