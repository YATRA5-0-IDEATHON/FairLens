import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// Import initial JSON datasets (single canonical dataset via symlink)
import initialEmployees from '../dataset/employees.json';
import initialBiasAlerts from '../dataset/bias_alerts.json';
import initialSafetyReports from '../dataset/safety_reports.json';
import initialCandidates from '../dataset/candidates.json';

const API_BASE = '/api';

const DataContext = createContext();
const employeeDatasetSignature = JSON.stringify(initialEmployees);
const candidateDatasetSignature = JSON.stringify(initialCandidates);
const safetyDatasetSignature = JSON.stringify(initialSafetyReports);
const protectCandidateIdentity = candidate => /hired/i.test(candidate.status || '') ? candidate : {
  ...candidate,
  name: 'Identity protected',
  email: '',
  phone: '',
  location: '',
  education: candidate.education ? { ...candidate.education, school: undefined } : candidate.education,
};
const authorizedHeaders = () => {
  try {
    const token = JSON.parse(localStorage.getItem('fairlens_auth_session'))?.token;
    return token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
  } catch {
    return { 'Content-Type': 'application/json' };
  }
};

async function fetchJSON(url, options) {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  if (!contentType.includes('application/json')) {
    throw new Error(`Expected JSON but received ${contentType || 'an unknown response type'}`);
  }
  return response.json();
}

export function DataProvider({ children }) {
  // Initialize state with localStorage if present, otherwise import file dataset
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('fairlens_employees');
    const savedSignature = localStorage.getItem('fairlens_employees_dataset_signature');
    if (saved && savedSignature === employeeDatasetSignature) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialEmployees;
  });

  const [biasAlerts, setBiasAlerts] = useState(() => {
    const saved = localStorage.getItem('fairlens_bias_alerts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialBiasAlerts;
  });

  const [safetyReports, setSafetyReports] = useState(() => {
    const saved = localStorage.getItem('fairlens_safety_reports');
    const savedSignature = localStorage.getItem('fairlens_safety_reports_dataset_signature');
    if (saved && savedSignature === safetyDatasetSignature) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialSafetyReports;
  });

  const [candidates, setCandidates] = useState(() => {
    const saved = localStorage.getItem('fairlens_candidates');
    const savedSignature = localStorage.getItem('fairlens_candidates_dataset_signature');
    if (saved && savedSignature === candidateDatasetSignature) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialCandidates.map(protectCandidateIdentity);
  });

  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  // Sync to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('fairlens_employees', JSON.stringify(employees));
    localStorage.setItem('fairlens_employees_dataset_signature', employeeDatasetSignature);
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('fairlens_bias_alerts', JSON.stringify(biasAlerts));
  }, [biasAlerts]);

  useEffect(() => {
    localStorage.setItem('fairlens_safety_reports', JSON.stringify(safetyReports));
    localStorage.setItem('fairlens_safety_reports_dataset_signature', safetyDatasetSignature);
  }, [safetyReports]);

  useEffect(() => {
    localStorage.setItem('fairlens_candidates', JSON.stringify(candidates));
    localStorage.setItem('fairlens_candidates_dataset_signature', candidateDatasetSignature);
  }, [candidates]);

  // Keep separate FairLens tabs in sync without requiring a reload.
  useEffect(() => {
    const syncFromStorage = (event) => {
      if (!event.newValue) return;
      try {
        const value = JSON.parse(event.newValue);
        if (!Array.isArray(value)) return;
        if (event.key === 'fairlens_employees') setEmployees(value);
        if (event.key === 'fairlens_candidates') setCandidates(value);
        if (event.key === 'fairlens_bias_alerts') setBiasAlerts(value);
        if (event.key === 'fairlens_safety_reports') setSafetyReports(value);
      } catch {
        // Ignore incomplete or unrelated browser storage values.
      }
    };
    window.addEventListener('storage', syncFromStorage);
    return () => window.removeEventListener('storage', syncFromStorage);
  }, []);

  // The API is authoritative. Refresh operational data so separate users and
  // devices see the same state without depending on browser storage.
  useEffect(() => {
    const refreshOperationalData = async () => {
      try {
        const session = JSON.parse(localStorage.getItem('fairlens_auth_session') || '{}');
        const [employeeData, candidateData, alertData] = await Promise.all([
          fetchJSON(`${API_BASE}/employees`),
          session.role === 'hr'
            ? fetchJSON(`${API_BASE}/candidates`, { headers: authorizedHeaders() })
            : Promise.resolve(null),
          session.role === 'hr'
            ? fetchJSON(`${API_BASE}/bias-alerts`, { headers: authorizedHeaders() })
            : Promise.resolve(null),
        ]);
        if (Array.isArray(employeeData)) setEmployees(employeeData);
        if (Array.isArray(candidateData)) setCandidates(candidateData.map(protectCandidateIdentity));
        if (Array.isArray(alertData)) setBiasAlerts(alertData);
      } catch {
        // Keep the last confirmed state visible during a temporary outage.
      }
    };
    const timer = window.setTimeout(refreshOperationalData, 0);
    const interval = window.setInterval(refreshOperationalData, 4000);
    const handleAuth = () => refreshOperationalData();
    window.addEventListener('fairlens:auth-changed', handleAuth);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
      window.removeEventListener('fairlens:auth-changed', handleAuth);
    };
  }, []);

  const refreshSafetyReports = useCallback(async () => {
    try {
      const session = JSON.parse(localStorage.getItem('fairlens_auth_session') || '{}');
      if (!session.token || !session.role) return [];
      const endpoint = session.role === 'employee' ? '/safety-reports/mine' : '/safety-reports';
      const data = await fetchJSON(`${API_BASE}${endpoint}`, { headers: authorizedHeaders() });
      if (!Array.isArray(data)) return [];
      setSafetyReports(previous => {
        const localOnly = previous.filter(local => !data.some(remote => remote.id === local.id)
          && (session.role !== 'employee' || local.ownerEmployeeId === session.employeeId));
        const next = [...data, ...localOnly];
        return JSON.stringify(next) === JSON.stringify(previous) ? previous : next;
      });
      return data;
    } catch {
      return [];
    }
  }, []);

  // Refresh immediately when the signed-in role changes, and then poll so HR
  // and employees on different devices receive new messages.
  useEffect(() => {
    const initialTimer = window.setTimeout(refreshSafetyReports, 0);
    const handleAuthChange = () => refreshSafetyReports();
    window.addEventListener('fairlens:auth-changed', handleAuthChange);
    const interval = window.setInterval(refreshSafetyReports, 4000);
    return () => {
      window.clearTimeout(initialTimer);
      window.removeEventListener('fairlens:auth-changed', handleAuthChange);
      window.clearInterval(interval);
    };
  }, [refreshSafetyReports]);

  // Filtered employees by department
  const filteredEmployees = useMemo(() => {
    if (selectedDeptFilter === 'All') return employees;
    return employees.filter(e => e.department === selectedDeptFilter);
  }, [employees, selectedDeptFilter]);

  // Dynamic Gender Ratio Calculation
  const genderStats = useMemo(() => {
    const total = filteredEmployees.length || 1;
    const maleCount = filteredEmployees.filter(e => e.gender === 'Male').length;
    const femaleCount = filteredEmployees.filter(e => e.gender === 'Female').length;
    const nbCount = filteredEmployees.filter(e => e.gender === 'Non-Binary').length;
    const unspecCount = filteredEmployees.filter(e => e.gender === 'Unspecified').length;

    return {
      total,
      maleCount,
      femaleCount,
      nbCount,
      unspecCount,
      malePct: Math.round((maleCount / total) * 100),
      femalePct: Math.round((femaleCount / total) * 100),
      nbPct: Math.round((nbCount / total) * 100),
      unspecPct: Math.round((unspecCount / total) * 100),
    };
  }, [filteredEmployees]);

  // Dynamic Unexplained Pay Gap Calculation
  const payGapStats = useMemo(() => {
    const males = filteredEmployees.filter(e => e.gender === 'Male' && e.salary);
    const females = filteredEmployees.filter(e => e.gender === 'Female' && e.salary);

    const maleAvg = males.length ? males.reduce((acc, curr) => acc + curr.salary, 0) / males.length : 0;
    const femaleAvg = females.length ? females.reduce((acc, curr) => acc + curr.salary, 0) / females.length : 0;

    let gapPct = 0;
    if (maleAvg > 0) {
      gapPct = Math.round(((maleAvg - femaleAvg) / maleAvg) * 1000) / 10;
    }

    return {
      maleAvgSalary: Math.round(maleAvg),
      femaleAvgSalary: Math.round(femaleAvg),
      gapPct,
      isFlagged: Math.abs(gapPct) > 2.0
    };
  }, [filteredEmployees]);

  // Dynamic Overall Gender Equality Score (0 - 100)
  const overallEqualityScore = useMemo(() => {
    const balanceDev = Math.abs(genderStats.malePct - 50) + Math.abs(genderStats.femalePct - 50);
    const balanceScore = Math.max(50, 100 - balanceDev * 1.5);
    const payScore = Math.max(40, 100 - Math.abs(payGapStats.gapPct) * 6);
    const urgentSafetyCount = safetyReports.filter(r => r.status !== 'Resolved').length;
    const safetyScore = Math.max(50, 100 - urgentSafetyCount * 7);
    const alertPenalty = biasAlerts.filter(a => a.status === 'Active').length * 4;

    const weightedScore = Math.round((balanceScore * 0.3) + (payScore * 0.35) + (safetyScore * 0.35) - alertPenalty);
    return Math.min(100, Math.max(40, weightedScore));
  }, [genderStats, payGapStats, safetyReports, biasAlerts]);

  // Actions to mutate state interactively & sync back to disk JSON
  const addEmployee = async (newEmp) => {
    const formatted = {
      ...newEmp,
      id: `EMP-${Date.now().toString().slice(-3)}`,
      salary: Number(newEmp.salary),
      experienceYears: Number(newEmp.experienceYears || 4),
      monthsInRole: Number(newEmp.monthsInRole || 12),
      status: 'Active'
    };

    // Update React state & localStorage
    setEmployees(prev => [formatted, ...prev]);

    // Send POST to API to write directly back to dataset/employees.json on disk
    try {
      await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: authorizedHeaders(),
        body: JSON.stringify(formatted)
      });
    } catch (err) {
      console.log('Error writing to disk JSON server:', err);
    }
  };

  const updateEmployeeSalary = async (empId, newSalary) => {
    const updatedSalaryNum = Number(newSalary);
    
    // Update React state
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        return { ...emp, salary: updatedSalaryNum };
      }
      return emp;
    }));

    // Send PUT to API to write directly back to dataset/employees.json on disk
    try {
      await fetch(`${API_BASE}/employees/${empId}`, {
        method: 'PUT',
        headers: authorizedHeaders(),
        body: JSON.stringify({ salary: updatedSalaryNum })
      });
    } catch (err) {
      console.log('Error writing to disk JSON server:', err);
    }
  };

  const dismissBiasAlert = async (alertId) => {
    setBiasAlerts(prev => prev.filter(a => a.id !== alertId));
    try {
      await fetch(`${API_BASE}/bias-alerts/${alertId}`, { method: 'DELETE', headers: authorizedHeaders() });
    } catch (err) { console.log(err); }
  };

  // Candidate applications are retained locally for offline continuity and
  // also enter the canonical lifecycle workflow when the API is available.
  const addCandidate = async (newCand) => {
    const idNum = Math.floor(100 + Math.random() * 900);
    const formatted = {
      id: `CAN-${idNum}`,
      name: newCand.name || 'Anonymous Applicant',
      email: newCand.email || 'applicant@domain.com',
      phone: newCand.phone || '',
      location: newCand.location || 'Remote',
      appliedRole: newCand.appliedRole || 'Senior Staff Engineer',
      appliedDate: new Date().toISOString().split('T')[0],
      gender: newCand.gender || 'Unspecified',
      summary: newCand.summary || 'Candidate application submitted via public portal.',
      resumeText: newCand.resumeText || newCand.summary || '',
      experienceYears: Number(newCand.experienceYears || 0),
      skills: newCand.skills && newCand.skills.length ? newCand.skills : ['Software Engineering', 'Problem Solving'],
      experience: newCand.experience || [
        {
          title: newCand.appliedRole || 'Software Engineer',
          company: 'Previous Tech Enterprise',
          period: '2021 – Present',
          highlights: [
            'Architected high-throughput services and user interface components.',
            'Consistently delivered sprint features on schedule with high reliability.',
          ],
        },
      ],
      education: newCand.education || {
        degree: 'B.S. in Computer Science',
        gradYear: newCand.gradYear || '2020',
      },
      meritScore: Number.isFinite(newCand.meritScore) ? Math.round(newCand.meritScore) : Math.floor(88 + Math.random() * 10),
      status: 'Pending Review',
    };

    try {
      const response = await fetch(`${API_BASE}/lifecycle/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formatted.name,
          email: formatted.email,
          jobTitle: formatted.appliedRole,
          skills: formatted.skills,
          meritScore: formatted.meritScore,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        const connected = protectCandidateIdentity({ ...formatted, id: result.candidateCode || formatted.id, lifecycleApplicationId: result.id });
        setCandidates(prev => [connected, ...prev.filter(candidate => candidate.id !== connected.id)]);
        return connected;
      }
      throw new Error(result.error || `The application service returned ${response.status}`);
    } catch (error) {
      throw new Error(error.message || 'The application service is unavailable', { cause: error });
    }
  };

  // Update a candidate's screening status (Shortlisted / Declined / Pending Review)
  const updateCandidateStatus = async (candId, status) => {
    setCandidates(prev => prev.map(c => (c.id === candId ? { ...c, status } : c)));
    try {
      await fetch(`${API_BASE}/candidates/${candId}/status`, {
        method: 'PATCH',
        headers: authorizedHeaders(),
        body: JSON.stringify({ status }),
      });
    } catch {
      // The next real-time refresh restores the confirmed server state.
    }
  };

  const addSafetyReport = async (report) => {
    const stamp = Date.now().toString();
    const formatted = {
      id: `SAFE-${stamp.slice(-4)}`,
      passkey: `FL-${stamp.slice(-6)}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      category: report.category,
      severity: report.severity || 'Standard',
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      status: 'Pending Review',
      narrative: report.narrative,
      ownerEmployeeId: report.ownerEmployeeId || null,
      evidenceFiles: report.evidenceFiles || [],
      chatHistory: [{
        sender: 'System',
        text: 'Encrypted two-way channel opened between HR Case Officer and Anonymous Reporter.',
        time: 'Just now',
      }],
    };
    setSafetyReports(prev => [formatted, ...prev]);
    try {
      const response = await fetch(`${API_BASE}/safety-reports`, {
        method: 'POST',
        headers: authorizedHeaders(),
        body: JSON.stringify(formatted),
      });
      if (response.ok) {
        const result = await response.json();
        if (result?.id || result?.passkey) {
          const synced = { ...formatted, id: result.id || formatted.id, passkey: result.passkey || formatted.passkey };
          setSafetyReports(prev => prev.map(item => item.id === formatted.id ? synced : item));
          return synced;
        }
      }
    } catch {
      // Shared local state remains authoritative while the optional API is offline.
    }
    return formatted;
  };

  const updateSafetyReportStatus = async (reportId, status) => {
    setSafetyReports(prev => prev.map(item => item.id === reportId ? { ...item, status } : item));
    try {
      await fetch(`${API_BASE}/safety-reports/${reportId}`, {
        method: 'PUT',
        headers: authorizedHeaders(),
        body: JSON.stringify({ status }),
      });
    } catch {
      // The update is already persisted in the shared local store.
    }
  };

  const addSafetyMessage = async (reportId, sender, text) => {
    const message = { sender, text, time: 'Just now' };
    setSafetyReports(prev => prev.map(item => item.id === reportId
      ? { ...item, chatHistory: [...(item.chatHistory || []), message] }
      : item));
    try {
      const response = await fetch(`${API_BASE}/safety-reports/${reportId}/chat`, {
        method: 'POST',
        headers: authorizedHeaders(),
        body: JSON.stringify({ sender, text }),
      });
      if (response.ok) {
        const result = await response.json();
        if (result?.data) {
          setSafetyReports(prev => prev.map(item => item.id === reportId ? result.data : item));
        }
      }
    } catch {
      // The message is already available to every page through shared state.
    }
    return message;
  };

  const resetToJSONFile = () => {
    localStorage.removeItem('fairlens_employees');
    localStorage.removeItem('fairlens_employees_dataset_signature');
    localStorage.removeItem('fairlens_bias_alerts');
    localStorage.removeItem('fairlens_safety_reports');
    localStorage.removeItem('fairlens_safety_reports_dataset_signature');
    localStorage.removeItem('fairlens_candidates');
    localStorage.removeItem('fairlens_candidates_dataset_signature');
    setEmployees(initialEmployees);
    setBiasAlerts(initialBiasAlerts);
    setSafetyReports(initialSafetyReports);
    setCandidates(initialCandidates.map(protectCandidateIdentity));
  };

  return (
    <DataContext.Provider value={{
      employees,
      filteredEmployees,
      biasAlerts,
      safetyReports,
      candidates,
      genderStats,
      payGapStats,
      overallEqualityScore,
      selectedDeptFilter,
      setSelectedDeptFilter,
      addEmployee,
      updateEmployeeSalary,
      addCandidate,
      updateCandidateStatus,
      addSafetyReport,
      updateSafetyReportStatus,
      addSafetyMessage,
      refreshSafetyReports,
      dismissBiasAlert,
      resetToJSONFile
    }}>
      {children}
    </DataContext.Provider>
  );
}

// This hook intentionally shares the context module with its provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  return useContext(DataContext);
}
