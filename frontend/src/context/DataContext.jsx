import React, { createContext, useContext, useState, useMemo } from 'react';

// Import initial JSON datasets
import initialEmployees from '../dataset/employees.json';
import initialBiasAlerts from '../dataset/bias_alerts.json';
import initialSafetyReports from '../dataset/safety_reports.json';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [employees, setEmployees] = useState(initialEmployees);
  const [biasAlerts, setBiasAlerts] = useState(initialBiasAlerts);
  const [safetyReports, setSafetyReports] = useState(initialSafetyReports);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

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

  // Dynamic Unexplained Pay Gap Calculation (Male Mean Salary vs Female Mean Salary)
  const payGapStats = useMemo(() => {
    const males = filteredEmployees.filter(e => e.gender === 'Male' && e.salary);
    const females = filteredEmployees.filter(e => e.gender === 'Female' && e.salary);

    const maleAvg = males.length ? males.reduce((acc, curr) => acc + curr.salary, 0) / males.length : 0;
    const femaleAvg = females.length ? females.reduce((acc, curr) => acc + curr.salary, 0) / females.length : 0;

    let gapPct = 0;
    if (maleAvg > 0) {
      gapPct = Math.round(((maleAvg - femaleAvg) / maleAvg) * 1000) / 10; // e.g. 3.4%
    }

    return {
      maleAvgSalary: Math.round(maleAvg),
      femaleAvgSalary: Math.round(femaleAvg),
      gapPct, // positive means male higher than female
      isFlagged: Math.abs(gapPct) > 2.0
    };
  }, [filteredEmployees]);

  // Dynamic Overall Gender Equality Score (0 - 100)
  const overallEqualityScore = useMemo(() => {
    // 1. Gender Balance Score (ideal is 50/50, penalize deviation)
    const balanceDev = Math.abs(genderStats.malePct - 50) + Math.abs(genderStats.femalePct - 50);
    const balanceScore = Math.max(50, 100 - balanceDev * 1.5);

    // 2. Pay Parity Score
    const payScore = Math.max(40, 100 - Math.abs(payGapStats.gapPct) * 6);

    // 3. Safety Index (100 minus active urgent safety reports)
    const urgentSafetyCount = safetyReports.filter(r => r.status !== 'Resolved').length;
    const safetyScore = Math.max(50, 100 - urgentSafetyCount * 7);

    // 4. Bias Alerts Penalty
    const alertPenalty = biasAlerts.filter(a => a.status === 'Active').length * 4;

    const weightedScore = Math.round((balanceScore * 0.3) + (payScore * 0.35) + (safetyScore * 0.35) - alertPenalty);
    return Math.min(100, Math.max(40, weightedScore));
  }, [genderStats, payGapStats, safetyReports, biasAlerts]);

  // Actions to mutate state interactively
  const addEmployee = (newEmp) => {
    const formatted = {
      ...newEmp,
      id: `EMP-${Date.now().toString().slice(-3)}`,
      salary: Number(newEmp.salary),
      experienceYears: Number(newEmp.experienceYears),
      monthsInRole: Number(newEmp.monthsInRole || 12),
      status: 'Active'
    };
    setEmployees(prev => [formatted, ...prev]);
  };

  const updateEmployeeSalary = (empId, newSalary) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        return { ...emp, salary: Number(newSalary) };
      }
      return emp;
    }));
  };

  const dismissBiasAlert = (alertId) => {
    setBiasAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const updateSafetyReportStatus = (caseId, newStatus) => {
    setSafetyReports(prev => prev.map(r => {
      if (r.id === caseId) {
        return { ...r, status: newStatus };
      }
      return r;
    }));
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
      updateSafetyReportStatus
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
