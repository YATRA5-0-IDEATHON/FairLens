import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

// Import initial JSON datasets (single canonical dataset via symlink)
import initialEmployees from '../dataset/employees.json';
import initialBiasAlerts from '../dataset/bias_alerts.json';
import initialSafetyReports from '../dataset/safety_reports.json';

const API_BASE = 'http://localhost:5000/api';

const DataContext = createContext();

export function DataProvider({ children }) {
  // Initialize state with localStorage if present, otherwise import file dataset
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('fairlens_employees');
    if (saved) {
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
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return initialSafetyReports;
  });

  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  // Sync to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('fairlens_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('fairlens_bias_alerts', JSON.stringify(biasAlerts));
  }, [biasAlerts]);

  useEffect(() => {
    localStorage.setItem('fairlens_safety_reports', JSON.stringify(safetyReports));
  }, [safetyReports]);

  // Fetch live dataset from backend API on mount
  useEffect(() => {
    fetch(`${API_BASE}/employees`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setEmployees(data);
        }
      })
      .catch(err => console.log('Backend API offline, using local file dataset:', err));
  }, []);

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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salary: updatedSalaryNum })
      });
    } catch (err) {
      console.log('Error writing to disk JSON server:', err);
    }
  };

  const dismissBiasAlert = async (alertId) => {
    setBiasAlerts(prev => prev.filter(a => a.id !== alertId));
    try {
      await fetch(`${API_BASE}/bias-alerts/${alertId}`, { method: 'DELETE' });
    } catch (err) { console.log(err); }
  };

  const resetToJSONFile = () => {
    localStorage.removeItem('fairlens_employees');
    localStorage.removeItem('fairlens_bias_alerts');
    localStorage.removeItem('fairlens_safety_reports');
    setEmployees(initialEmployees);
    setBiasAlerts(initialBiasAlerts);
    setSafetyReports(initialSafetyReports);
  };

  return (
    <DataContext.Provider value={{
      employees,
      filteredEmployees,
      biasAlerts,
      safetyReports,
      genderStats,
      payGapStats,
      overallEqualityScore,
      selectedDeptFilter,
      setSelectedDeptFilter,
      addEmployee,
      updateEmployeeSalary,
      dismissBiasAlert,
      resetToJSONFile
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
