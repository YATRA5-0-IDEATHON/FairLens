import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, FileWarning, LogOut, 
  User, BadgeCheck, Bell, Calendar, Clock, MapPin, 
  ChevronLeft, ChevronRight, Briefcase, 
  Activity, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import employeesData from '../dataset/employees.json';
import EmployeeReportingPortal from './EmployeeReportingPortal';

// Mock attendance data
const MOCK_ATTENDANCE = {
  '2026-07': { present: 21, absent: 1, leave: 1, halfDay: 1 },
  '2026-06': { present: 22, absent: 0, leave: 0, halfDay: 0 },
  '2026-05': { present: 20, absent: 1, leave: 2, halfDay: 0 },
  '2026-04': { present: 21, absent: 0, leave: 1, halfDay: 1 },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EmployeeDashboard() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [currentMonth, setCurrentMonth] = useState(6); // July (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);

  // Find employee data from dataset
  const employeeData = useMemo(() => {
    const found = employeesData.find(emp => emp.id === auth.employeeId);
    return found || employeesData[0]; // fallback to first employee
  }, [auth.employeeId]);

  const handleLogout = () => {
    logout();
    navigate('/login?role=employee');
  };

  // Calendar helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const attendanceStats = MOCK_ATTENDANCE[monthKey] || { present: 0, absent: 0, leave: 0, halfDay: 0 };

  // Mock calendar events - mark random days as present/absent
  const getDayStatus = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // Simple hash to simulate realistic attendance pattern
    const hash = dateStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    if (hash % 23 === 0) return 'absent';
    if (hash % 17 === 0) return 'leave';
    if (hash % 13 === 0) return 'half-day';
    return 'present';
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'report', label: 'Report a Problem', icon: FileWarning },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--neutral-bg)', color: 'var(--text-dark)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Nav */}
      <nav style={{ 
        background: 'var(--primary-indigo)', 
        color: '#FFF', 
        padding: '0.75rem 2rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: 'var(--shadow-md)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #3FA796, #E85D4E)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#FFF' }}>
            FL
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 600 }}>FairLens</span>
            <span style={{ fontSize: '0.65rem', background: 'rgba(63,167,150,0.3)', color: 'var(--secondary-teal)', padding: '2px 8px', borderRadius: '4px', marginLeft: '8px', fontWeight: 500 }}>
              Employee Portal
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
            {auth.employeeId || 'Anonymous'}
          </span>
          <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ color: '#FFF', borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.08)' }}>
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Body: Sidebar + Content */}
      <div style={{ display: 'flex', flex: 1 }}>
        
        {/* Sidebar */}
        <aside style={{ 
          width: '240px', 
          background: 'var(--surface-white)', 
          borderRight: '1px solid var(--border-light)',
          padding: '1.5rem 0',
          flexShrink: 0
        }}>
          {/* User Summary */}
          <div style={{ padding: '0 1.25rem 1.25rem', borderBottom: '1px solid var(--border-light)', marginBottom: '0.75rem' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, var(--secondary-teal), var(--primary-indigo))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              fontFamily: 'var(--font-serif)',
              marginBottom: '0.75rem'
            }}>
              {employeeData.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--primary-indigo)' }}>{employeeData.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{employeeData.role}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem', fontFamily: 'var(--font-mono)' }}>{employeeData.id}</div>
          </div>

          {/* Navigation Items */}
          <nav>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isReportTab = tab.id === 'report';
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.7rem 1.25rem',
                    border: 'none',
                    background: isActive ? 'var(--secondary-teal-light)' : 'transparent',
                    color: isActive ? 'var(--primary-indigo)' : 'var(--text-muted)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderLeft: isActive ? '3px solid var(--secondary-teal)' : '3px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={18} color={isReportTab ? 'var(--accent-coral)' : (isActive ? 'var(--secondary-teal)' : undefined)} />
                  <span style={{ color: isReportTab ? 'var(--accent-coral)' : undefined }}>{tab.label}</span>
                  {isReportTab && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: 'var(--accent-coral)', color: '#FFF', padding: '1px 6px', borderRadius: '10px' }}>
                      New
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom badge */}
          <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-light)', marginTop: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={11} color="var(--secondary-teal)" />
              End-to-End Encrypted
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', maxWidth: '900px' }}>
          
          {/* ==================== PROFILE TAB ==================== */}
          {activeTab === 'profile' && (
            <div>
              {/* Welcome Banner */}
              <div className="card" style={{ 
                padding: '2rem', 
                background: 'linear-gradient(135deg, var(--primary-indigo), #2D3178)',
                color: '#FFF',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: '0 0 0.25rem 0' }}>
                  Welcome back, {employeeData.name.split(' ')[0]}!
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                  Here's your profile overview and quick links.
                </p>
              </div>

              {/* Profile Details Card */}
              <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary-indigo)', margin: '0 0 1.25rem 0', fontFamily: 'var(--font-serif)' }}>
                  <User size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  Personal Information
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <ProfileField icon={User} label="Full Name" value={employeeData.name} />
                  <ProfileField icon={BadgeCheck} label="Employee ID" value={employeeData.id} />
                  <ProfileField icon={Briefcase} label="Department" value={employeeData.department} />
                  <ProfileField icon={MapPin} label="Role / Title" value={employeeData.role} />
                  <ProfileField icon={Activity} label="Level" value={employeeData.level} />
                  <ProfileField icon={Users} label="Gender" value={employeeData.gender} />
                  <ProfileField icon={Clock} label="Years of Experience" value={`${employeeData.experienceYears} years`} />
                  <ProfileField icon={Bell} label="Status" value={employeeData.status} />
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--secondary-teal)', fontFamily: 'var(--font-mono)' }}>
                    {employeeData.performanceRating}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Performance Rating</div>
                </div>
                <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary-indigo)', fontFamily: 'var(--font-mono)' }}>
                    ${(employeeData.salary / 1000).toFixed(0)}k
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Annual Salary</div>
                </div>
                <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-coral)', fontFamily: 'var(--font-mono)' }}>
                    {employeeData.monthsInRole}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Months in Role</div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== ATTENDANCE TAB ==================== */}
          {activeTab === 'attendance' && (
            <div>
              <div className="card" style={{ 
                padding: '2rem', 
                background: 'linear-gradient(135deg, var(--secondary-teal), #2D8F7A)',
                color: '#FFF',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: '0 0 0.25rem 0' }}>
                  Attendance & Calendar
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                  Track your attendance, leaves, and work schedule.
                </p>
              </div>

              {/* Attendance Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard label="Days Present" value={attendanceStats.present} color="var(--secondary-teal)" />
                <StatCard label="Absent" value={attendanceStats.absent} color="var(--accent-coral)" />
                <StatCard label="On Leave" value={attendanceStats.leave} color="var(--warning-amber)" />
                <StatCard label="Half Days" value={attendanceStats.halfDay} color="var(--primary-indigo)" />
              </div>

              {/* Calendar */}
              <div className="card" style={{ padding: '1.5rem' }}>
                {/* Month Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <button onClick={prevMonth} style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                    <ChevronLeft size={18} />
                  </button>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-indigo)', fontFamily: 'var(--font-serif)', margin: 0 }}>
                    {MONTHS[currentMonth]} {currentYear}
                  </h3>
                  <button onClick={nextMonth} style={{ background: 'none', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.4rem 0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Day Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
                  {DAYS.map(day => (
                    <div key={day} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                  {/* Empty cells for days before month start */}
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} style={{ padding: '0.5rem' }} />
                  ))}
                  
                  {/* Day cells */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const status = getDayStatus(day);
                    const today = new Date();
                    const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;

                    let bgColor = 'transparent';
                    let dotColor = '';
                    if (status === 'present') dotColor = 'var(--secondary-teal)';
                    else if (status === 'absent') dotColor = 'var(--accent-coral)';
                    else if (status === 'leave') dotColor = 'var(--warning-amber)';
                    else if (status === 'half-day') dotColor = 'var(--primary-indigo)';

                    return (
                      <div
                        key={day}
                        style={{
                          textAlign: 'center',
                          padding: '0.5rem 0.25rem',
                          borderRadius: '8px',
                          background: isToday ? 'var(--secondary-teal-light)' : bgColor,
                          border: isToday ? '2px solid var(--secondary-teal)' : 'none',
                          fontSize: '0.85rem',
                          fontWeight: isToday ? 600 : 400,
                          color: 'var(--text-dark)',
                          position: 'relative',
                          cursor: 'default'
                        }}
                      >
                        {day}
                        {dotColor && (
                          <div style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: dotColor,
                            margin: '2px auto 0'
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                  <LegendItem color="var(--secondary-teal)" label="Present" />
                  <LegendItem color="var(--accent-coral)" label="Absent" />
                  <LegendItem color="var(--warning-amber)" label="Leave" />
                  <LegendItem color="var(--primary-indigo)" label="Half Day" />
                </div>
              </div>
            </div>
          )}

          {/* ==================== REPORT A PROBLEM TAB ==================== */}
          {activeTab === 'report' && (
            <div>
              <div className="card" style={{ 
                padding: '1.25rem 1.5rem', 
                background: 'linear-gradient(135deg, var(--accent-coral), #C94D3E)',
                color: '#FFF',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', margin: '0 0 0.15rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileWarning size={22} />
                  Report a Problem
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
                  Submit an anonymous encrypted report. All information remains confidential.
                </p>
              </div>

              <EmployeeReportingPortal embedded={true} onBackToDashboard={() => setActiveTab('profile')} />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

// Sub-components
function ProfileField({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        {Icon && <Icon size={12} />}
        {label}
      </div>
      <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>{value}</div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color, fontFamily: 'var(--font-mono)' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{label}</div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
      {label}
    </div>
  );
}
