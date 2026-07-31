import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, FileWarning, LogOut, 
  User, BadgeCheck, Calendar, Clock, MapPin,
  ChevronRight, Briefcase, Activity, Trophy, TrendingUp, Plus, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import EmployeeReportingPortal from './EmployeeReportingPortal';

export default function EmployeeDashboard() {
  const { auth, logout } = useAuth();
  const { employees } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveFormOpen, setLeaveFormOpen] = useState(false);
  const [leaveError, setLeaveError] = useState('');
  const [leaveBusy, setLeaveBusy] = useState(false);

  // Find employee data from dataset
  const employeeData = useMemo(() => {
    const found = employees.find(emp => emp.id === auth.employeeId);
    return found || null;
  }, [auth.employeeId, employees]);

  const refreshLeave = useCallback(async () => {
    if (!auth.token) return;
    try {
      const response = await fetch('/api/leave-requests/mine', { headers: { Authorization: `Bearer ${auth.token}` } });
      if (response.ok) setLeaveRequests(await response.json());
    } catch {
      // Keep the last confirmed requests visible during a temporary outage.
    }
  }, [auth.token]);

  useEffect(() => {
    const timer = window.setTimeout(refreshLeave, 0);
    const interval = window.setInterval(refreshLeave, 4000);
    return () => { window.clearTimeout(timer); window.clearInterval(interval); };
  }, [refreshLeave]);

  const leaveBalance = useMemo(() => {
    const approved = leaveRequests.filter(item => item.status === 'Approved' && item.type === 'Annual leave').reduce((sum, item) => sum + item.days, 0);
    return Math.max(0, 20 - approved);
  }, [leaveRequests]);

  if (!employeeData) {
    return <div className="employee-loading"><Clock className="spin" size={22} /><strong>Loading your employee record…</strong></div>;
  }

  const readiness = Math.min(100, Math.round(
    ((employeeData.performanceRating || 0) / 5 * 55)
    + (Math.min(employeeData.monthsInRole || 0, 24) / 24 * 45),
  ));

  const handleLogout = () => {
    logout();
    navigate('/login?role=employee', { replace: true });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'leave', label: 'Leave', icon: Calendar },
    { id: 'growth', label: 'Growth', icon: Trophy },
    { id: 'report', label: 'Report a Problem', icon: FileWarning },
  ];

  const submitLeave = async event => {
    event.preventDefault();
    setLeaveBusy(true);
    setLeaveError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/leave-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ type: form.get('type'), startDate: form.get('startDate'), endDate: form.get('endDate'), reason: form.get('reason') }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not submit leave request');
      setLeaveRequests(current => [result, ...current]);
      setLeaveFormOpen(false);
    } catch (error) {
      setLeaveError(error.message);
    } finally {
      setLeaveBusy(false);
    }
  };

  return (
    <div className="employee-workspace">
      <header className="employee-topbar">
        <div className="employee-topbar-inner">
          <div className="employee-brand"><img src="/logo.png" alt="FairLens" /><span>FairLens</span></div>
          <div className="employee-account">
            <span>{employeeData.name}<small>Employee workspace</small></span>
            <button onClick={handleLogout} title="Sign out"><LogOut size={15} /><span>Sign out</span></button>
          </div>
        </div>
      </header>

      <main className="employee-shell">
        <section className="employee-welcome">
          <div>
            <span>Welcome back</span>
            <h1>{employeeData.name.split(' ')[0]}’s workspace</h1>
            <p>{employeeData.role} · {employeeData.department}</p>
          </div>
          <div className="welcome-meta">
            <span><i /> {employeeData.status}</span>
            <small>{employeeData.id}</small>
          </div>
        </section>

        <nav className="employee-tabs" aria-label="Employee workspace sections">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                <Icon size={17} /><span>{tab.label === 'Report a Problem' ? 'Private support' : tab.label}</span>
              </button>
            );
          })}
        </nav>

        {activeTab === 'profile' && (
          <div className="employee-content">
            <section className="employee-panel profile-panel">
              <div className="employee-section-heading">
                <div><span>Your information</span><h2>Work profile</h2></div>
                <span className="employee-status-pill"><i /> {employeeData.status}</span>
              </div>
              <div className="profile-grid">
                <ProfileField icon={User} label="Full name" value={employeeData.name} />
                <ProfileField icon={BadgeCheck} label="Employee ID" value={employeeData.id} />
                <ProfileField icon={Briefcase} label="Department" value={employeeData.department} />
                <ProfileField icon={MapPin} label="Role" value={employeeData.role} />
                <ProfileField icon={Activity} label="Job level" value={employeeData.level} />
                <ProfileField icon={Clock} label="Experience" value={`${employeeData.experienceYears} years`} />
              </div>
            </section>

            <aside className="employee-side">
              <section className="employee-panel role-summary">
                <span>Current role</span>
                <strong>{employeeData.monthsInRole}</strong>
                <p>months in this position</p>
                <div><Calendar size={15} /> Profile data is current</div>
              </section>
              <button className="support-shortcut" onClick={() => setActiveTab('report')}>
                <i><ShieldCheck size={20} /></i>
                <span><strong>Need private support?</strong><small>Contact HR safely at any time.</small></span>
                <ChevronRight size={18} />
              </button>
            </aside>
          </div>
        )}

        {activeTab === 'leave' && <LeaveView requests={leaveRequests} balance={leaveBalance} onApply={() => setLeaveFormOpen(true)} />}

        {activeTab === 'growth' && (
          <div className="promotion-view">
            <div className="promotion-heading">
              <div><span>Your growth</span><h2>Promotion readiness</h2><p>Your own job-related evidence only. Other employees’ names and ratings are private.</p></div>
              <div><Trophy size={19} /><strong>{readiness}%</strong><span>readiness</span></div>
            </div>
            <div className="promotion-explainer">
              <TrendingUp size={17} />
              <p><strong>How this works:</strong> readiness uses your recorded performance and time in role. It supports a growth conversation and never guarantees a promotion.</p>
            </div>
            <section className="employee-panel promotion-board">
              <div className="growth-evidence"><div><span>Performance evidence</span><strong>{employeeData.performanceRating || 'Not rated'}{employeeData.performanceRating ? '/5' : ''}</strong><i><b style={{ width: `${(employeeData.performanceRating || 0) / 5 * 100}%` }} /></i></div><div><span>Time in role</span><strong>{employeeData.monthsInRole || 0} months</strong><i><b style={{ width: `${Math.min(100, (employeeData.monthsInRole || 0) / 24 * 100)}%` }} /></i></div><div><span>Current level</span><strong>{employeeData.level || 'Not recorded'}</strong><p>Talk with your manager to agree on the evidence required for the next level.</p></div></div>
            </section>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="employee-report-view">
            <div className="support-heading">
              <i><ShieldCheck size={22} /></i>
              <div><span>Private support</span><h2>Talk to HR safely.</h2><p>Create a report or return to an existing conversation.</p></div>
            </div>
            <EmployeeReportingPortal embedded onBackToDashboard={() => setActiveTab('profile')} />
          </div>
        )}
      </main>
      {leaveFormOpen && <div className="leave-modal-backdrop" onMouseDown={event => event.target === event.currentTarget && setLeaveFormOpen(false)}><form className="leave-modal" onSubmit={submitLeave}><header><div><span>Leave request</span><h2>Request time away</h2></div><button type="button" onClick={() => setLeaveFormOpen(false)}><X size={17} /></button></header>{leaveError && <p className="leave-error">{leaveError}</p>}<label>Leave type<select name="type" required><option>Annual leave</option><option>Sick leave</option><option>Personal leave</option><option>Unpaid leave</option></select></label><div><label>Start date<input name="startDate" type="date" min={new Date().toISOString().slice(0, 10)} required /></label><label>End date<input name="endDate" type="date" min={new Date().toISOString().slice(0, 10)} required /></label></div><label>Reason<textarea name="reason" maxLength="500" required placeholder="Briefly explain your request." /></label><footer><button type="button" onClick={() => setLeaveFormOpen(false)}>Cancel</button><button disabled={leaveBusy}>{leaveBusy ? 'Submitting…' : 'Submit request'}</button></footer></form></div>}
      <style>{employeeStyles}</style>
    </div>
  );
}

// Sub-components
function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="profile-field">
      <i>{Icon && <Icon size={16} />}</i>
      <div><span>{label}</span><strong>{value}</strong></div>
    </div>
  );
}

function LeaveView({ requests, balance, onApply }) {
  const pending = requests.filter(item => item.status === 'Pending').length;
  const approved = requests.filter(item => item.status === 'Approved').length;
  return <div className="leave-view"><div className="leave-hero"><div><span>Time away</span><h2>Leave requests</h2><p>Submit a request and see HR’s decision here in real time.</p></div><button onClick={onApply}><Plus size={16} /> Apply for leave</button></div><div className="leave-summary"><article><span>Annual balance</span><strong>{balance} days</strong></article><article><span>Pending</span><strong>{pending}</strong></article><article><span>Approved requests</span><strong>{approved}</strong></article></div><section className="employee-panel leave-list"><header><span>Type</span><span>Dates</span><span>Days</span><span>Submitted</span><span>Status</span></header>{requests.map(item => <article key={item.id}><strong>{item.type}</strong><span>{formatDate(item.startDate)} – {formatDate(item.endDate)}</span><span>{item.days}</span><span>{formatDate(item.submittedAt)}</span><em className={item.status.toLowerCase()}>{item.status}</em></article>)}{!requests.length && <div className="leave-empty"><Calendar size={22} /><strong>No leave requests yet</strong><p>Your submitted requests and HR decisions will appear here.</p></div>}</section></div>;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

const employeeStyles = `
.employee-workspace{min-height:100vh;background:#f6f7f9;color:#101828}.employee-topbar{position:sticky;z-index:50;top:0;height:72px;border-bottom:1px solid #e3e6eb;background:rgba(255,255,255,.92);backdrop-filter:blur(16px)}.employee-topbar-inner{width:min(1120px,calc(100% - 36px));height:100%;display:flex;align-items:center;justify-content:space-between;margin:0 auto}.employee-brand{display:flex;align-items:center;gap:10px}.employee-brand img{width:38px;height:38px;border-radius:10px;object-fit:contain;background:#17191d;padding:5px}.employee-brand>span{font-family:var(--font-serif);font-size:19px;font-weight:700}.employee-account{display:flex;align-items:center;gap:14px}.employee-account>span{display:flex;flex-direction:column;text-align:right;font-size:11px;font-weight:700}.employee-account small{margin-top:2px;color:#98a2b3;font-size:9px;font-weight:500}.employee-account button{height:36px;display:flex;align-items:center;gap:7px;padding:0 11px;border:1px solid #dce1e8;border-radius:9px;background:#fff;color:#475467;font-size:11px;font-weight:700;cursor:pointer;transition:.2s}.employee-account button:hover{border-color:#b9c0cc;background:#f8fafc;color:#101828}.employee-shell{width:min(1120px,calc(100% - 36px));margin:0 auto;padding:34px 0 70px}.employee-welcome{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:4px 2px 22px;border-bottom:1px solid #dfe3e8;animation:employee-rise .55s both}.employee-welcome>div:first-child>span,.employee-section-heading>div>span,.support-heading>div>span{color:#4f46e5;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.09em}.employee-welcome h1{margin:7px 0 5px;color:#101828;font-family:var(--font-serif);font-size:35px;letter-spacing:-.035em}.employee-welcome p{color:#667085;font-size:12px}.welcome-meta{display:flex;align-items:center;gap:12px;padding-bottom:3px}.welcome-meta>span{display:flex;align-items:center;gap:6px;padding:7px 10px;border-radius:20px;background:#ecfdf3;color:#16794d;font-size:10px;font-weight:800}.welcome-meta i{width:7px;height:7px;border-radius:50%;background:#22a06b}.welcome-meta small{color:#98a2b3;font-family:var(--font-mono);font-size:9px}.employee-tabs{display:flex;gap:5px;margin:18px 0;padding:5px;border:1px solid #e1e5eb;border-radius:13px;background:#fff}.employee-tabs button{display:flex;align-items:center;justify-content:center;gap:8px;min-width:150px;padding:11px 15px;border:0;border-radius:9px;background:transparent;color:#667085;font-size:12px;font-weight:700;cursor:pointer;transition:.2s}.employee-tabs button:hover{background:#f7f8fa;color:#101828}.employee-tabs button.active{background:#17191d;color:#fff}.employee-content{display:grid;grid-template-columns:minmax(0,1fr) 285px;gap:16px;animation:employee-rise .45s both}.employee-panel{border:1px solid #e1e5eb;border-radius:17px;background:#fff;box-shadow:0 5px 18px rgba(16,24,40,.035)}.profile-panel{padding:27px}.employee-section-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:25px}.employee-section-heading h2{margin-top:3px;font-family:var(--font-serif);font-size:24px}.employee-status-pill{display:flex;align-items:center;gap:7px;padding:7px 10px;border-radius:20px;background:#ecfdf3;color:#16794d;font-size:10px;font-weight:800}.employee-status-pill i{width:7px;height:7px;border-radius:50%;background:#22a06b}.profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.profile-field{display:flex;align-items:center;gap:11px;padding:15px;border:1px solid #e8eaee;border-radius:12px;background:#fafbfc}.profile-field>i{width:34px;height:34px;display:grid;flex:none;place-items:center;border-radius:9px;background:#eef2ff;color:#4f46e5}.profile-field>div{display:flex;min-width:0;flex-direction:column}.profile-field span{color:#98a2b3;font-size:9px;font-weight:750;text-transform:uppercase;letter-spacing:.05em}.profile-field strong{overflow:hidden;margin-top:3px;font-size:12px;text-overflow:ellipsis;white-space:nowrap}.employee-side{display:flex;flex-direction:column;gap:16px}.role-summary{padding:24px}.role-summary>span{color:#667085;font-size:10px;font-weight:700;text-transform:uppercase}.role-summary>strong{display:block;margin:10px 0 2px;font-size:42px;line-height:1}.role-summary>p{color:#667085;font-size:11px}.role-summary>div{display:flex;align-items:center;gap:7px;margin-top:24px;padding-top:15px;border-top:1px solid #e8eaee;color:#667085;font-size:10px}.support-shortcut{display:flex;align-items:center;gap:11px;padding:18px;border:0;border-radius:15px;background:#eef2ff;color:#4338ca;text-align:left;cursor:pointer}.support-shortcut>i{width:38px;height:38px;display:grid;flex:none;place-items:center;border-radius:10px;background:#fff}.support-shortcut>span{display:flex;flex:1;flex-direction:column}.support-shortcut strong{font-size:11px}.support-shortcut small{margin-top:3px;color:#5572ae;font-size:9px;line-height:1.4}.attendance-view,.employee-report-view,.promotion-view{animation:employee-rise .45s both}.employee-section-heading.standalone{margin:27px 2px 16px}.attendance-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;margin-bottom:16px}.attendance-stat{position:relative;overflow:hidden;padding:19px;border:1px solid #e1e5eb;border-radius:14px;background:#fff}.attendance-stat span{color:#667085;font-size:10px;font-weight:700;text-transform:uppercase}.attendance-stat strong{display:block;margin-top:6px;font-size:26px}.attendance-stat>i{position:absolute;right:0;bottom:0;width:46px;height:4px;background:#98a2b3}.attendance-stat.blue>i{background:#4f46e5}.attendance-stat.red>i{background:#d92d20}.attendance-stat.amber>i{background:#d97706}.calendar-panel{padding:25px}.calendar-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}.calendar-heading h2{font-family:var(--font-serif);font-size:21px}.calendar-heading button{width:36px;height:36px;display:grid;place-items:center;border:1px solid #dce1e8;border-radius:9px;background:#fff;color:#667085;cursor:pointer}.calendar-heading button:disabled{border-color:#eaecf0;background:#f8fafc;color:#c5cad2;cursor:not-allowed}.calendar-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}.calendar-days{margin-bottom:6px;color:#98a2b3;font-size:9px;font-weight:800;text-align:center;text-transform:uppercase}.calendar-days>div{padding:8px}.calendar-cell{position:relative;min-height:54px;display:flex;align-items:center;justify-content:center;border:1px solid transparent;border-radius:9px;font-size:12px}.calendar-cell:hover{background:#f8fafc}.calendar-cell.today{border-color:#9db8f7;background:#f6f8ff;font-weight:800}.calendar-cell i{position:absolute;bottom:8px;width:5px;height:5px;border-radius:50%;background:#4f46e5}.calendar-cell.absent i{background:#d92d20}.calendar-cell.leave i{background:#d97706}.calendar-cell.half-day i{background:#98a2b3}.calendar-cell.future{color:#c4c9d1}.calendar-cell.future i{display:none}.calendar-cell.future:hover{background:transparent}.calendar-legend{display:flex;justify-content:center;gap:20px;margin-top:20px;padding-top:17px;border-top:1px solid #e8eaee;color:#667085;font-size:10px}.calendar-legend>div{display:flex;align-items:center;gap:6px}.calendar-legend i{width:7px;height:7px;border-radius:50%;background:#4f46e5}.calendar-legend i.absent{background:#d92d20}.calendar-legend i.leave{background:#d97706}.calendar-legend i.half-day{background:#98a2b3}.promotion-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin:27px 2px 16px}.promotion-heading>div:first-child>span{color:#4f46e5;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.09em}.promotion-heading h2{margin:3px 0;font-family:var(--font-serif);font-size:26px}.promotion-heading p{color:#667085;font-size:11px}.promotion-heading>div:last-child{display:grid;grid-template-columns:auto auto;align-items:center;gap:0 7px;color:#4f46e5}.promotion-heading>div:last-child svg{grid-row:1/3}.promotion-heading>div:last-child strong{font-size:19px;line-height:1}.promotion-heading>div:last-child span{color:#667085;font-size:9px}.promotion-explainer{display:flex;align-items:flex-start;gap:10px;margin-bottom:13px;padding:13px 15px;border:1px solid #dbe5fb;border-radius:12px;background:#f5f8ff;color:#475467}.promotion-explainer svg{flex:none;color:#4f46e5}.promotion-explainer p{font-size:11px;line-height:1.55}.promotion-explainer strong{color:#101828}.promotion-board{overflow:hidden}.promotion-board-head,.promotion-person{min-width:930px;display:grid;grid-template-columns:48px 1.55fr 1.05fr .75fr .65fr 1fr;align-items:center;gap:12px;padding:13px 18px}.promotion-board-head{background:#f8fafc;color:#667085;font-size:9px;font-weight:800;text-transform:uppercase}.promotion-person{border-top:1px solid #e8eaee;font-size:11px}.promotion-person:hover{background:#fafbfc}.promotion-person.current{background:#f5f8ff;box-shadow:inset 3px 0 #4f46e5}.promotion-rank{width:26px;height:26px;display:grid;place-items:center;border-radius:8px;background:#f0f2f5;color:#667085}.promotion-rank.rank-1{background:#fff4cc;color:#8b6513}.promotion-rank.rank-2{background:#eef1f5;color:#596274}.promotion-rank.rank-3{background:#f8e8dc;color:#975b34}.promotion-person-name{display:flex;align-items:center;gap:9px}.promotion-person-name>i{width:32px;height:32px;display:grid;flex:none;place-items:center;border-radius:9px;background:#eef2ff;color:#4f46e5;font-size:9px;font-style:normal;font-weight:800}.promotion-person-name>span{display:flex;min-width:0;flex-direction:column}.promotion-person-name strong{display:flex;align-items:center;gap:6px}.promotion-person-name em{padding:2px 5px;border-radius:8px;background:#4f46e5;color:#fff;font-size:7px;font-style:normal;text-transform:uppercase}.promotion-person-name small{overflow:hidden;margin-top:2px;color:#98a2b3;font-size:9px;text-overflow:ellipsis;white-space:nowrap}.promotion-signal{width:max-content;padding:6px 8px;border-radius:20px;background:#fff7e6;color:#9a6810;font-size:9px;font-weight:800}.promotion-signal.ready{background:#ecfdf3;color:#16794d}.promotion-empty{padding:35px;color:#667085;text-align:center;font-size:12px}.support-heading{display:flex;align-items:center;gap:13px;margin:27px 0 17px}.support-heading>i{width:45px;height:45px;display:grid;place-items:center;border-radius:12px;background:#eef2ff;color:#4f46e5}.support-heading h2{margin:2px 0;font-family:var(--font-serif);font-size:25px}.support-heading p{color:#667085;font-size:11px}@keyframes employee-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@media(max-width:800px){.employee-content{grid-template-columns:1fr}.employee-side{display:grid;grid-template-columns:1fr 1fr}.attendance-stats{grid-template-columns:repeat(2,1fr)}.promotion-board{overflow-x:auto}}@media(max-width:580px){.employee-topbar-inner{width:calc(100% - 28px)}.employee-account>span{display:none}.employee-shell{width:calc(100% - 24px);padding-top:20px}.employee-welcome{align-items:flex-start;flex-direction:column;padding-bottom:18px}.employee-welcome h1{font-size:27px}.welcome-meta{width:100%;justify-content:space-between}.employee-tabs{overflow-x:auto}.employee-tabs button{min-width:max-content}.profile-panel,.calendar-panel{padding:19px}.profile-grid,.employee-side{grid-template-columns:1fr}.calendar-cell{min-height:42px}.calendar-legend{flex-wrap:wrap}.promotion-heading{align-items:flex-start;flex-direction:column}.employee-account button span{display:none}.employee-account button{width:36px;padding:0;justify-content:center}}@media(prefers-reduced-motion:reduce){.employee-workspace *{animation:none!important;transition:none!important}}
.leave-view{display:grid;gap:16px;animation:employee-rise .45s both}.leave-hero{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-top:27px;padding:25px 27px;border-radius:20px;background:linear-gradient(125deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 18px 40px rgba(79,70,229,.2)}.leave-hero span{color:#ccfbf1;font-size:9px;font-weight:800;text-transform:uppercase}.leave-hero h2{margin:4px 0;color:#fff;font-size:27px}.leave-hero p{color:rgba(255,255,255,.72);font-size:11px}.leave-hero button{display:flex;align-items:center;gap:7px;padding:12px 14px;border:0;border-radius:12px;background:#fff;color:#4338ca;font-weight:800;cursor:pointer}.leave-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.leave-summary article{padding:19px;border:1px solid var(--border-light);border-radius:17px;background:var(--surface-white)}.leave-summary span{color:var(--text-muted);font-size:9px;font-weight:750;text-transform:uppercase}.leave-summary strong{display:block;margin-top:5px;color:var(--text-dark);font-size:23px}.leave-list{overflow:hidden}.leave-list>header,.leave-list>article{display:grid;grid-template-columns:1fr 1.6fr .5fr 1fr .7fr;align-items:center;gap:12px;padding:13px 18px}.leave-list>header{background:var(--neutral-bg);color:var(--text-muted);font-size:8px;font-weight:800;text-transform:uppercase}.leave-list>article{border-top:1px solid var(--border-light);color:var(--text-body);font-size:10px}.leave-list>article strong{color:var(--text-dark)}.leave-list em{width:max-content;padding:5px 8px;border-radius:99px;background:#fffbeb;color:#b45309;font-size:8px;font-style:normal;font-weight:800}.leave-list em.approved{background:#ecfdf5;color:#0f8a5f}.leave-list em.declined{background:#fef2f2;color:#dc2626}.leave-empty{display:grid;place-items:center;align-content:center;gap:6px;min-height:220px;color:var(--text-muted)}.leave-empty strong{color:var(--text-dark)}.leave-empty p{font-size:10px}.leave-modal-backdrop{position:fixed;z-index:100;inset:0;display:grid;place-items:center;padding:18px;background:rgba(15,23,42,.65);backdrop-filter:blur(6px)}.leave-modal{width:min(550px,100%);display:grid;gap:16px;padding:23px;border-radius:20px;background:var(--surface-white);box-shadow:0 25px 70px rgba(15,23,42,.3)}.leave-modal header{display:flex;justify-content:space-between;align-items:flex-start}.leave-modal header span{color:#4f46e5;font-size:9px;font-weight:800;text-transform:uppercase}.leave-modal h2{margin-top:3px;color:var(--text-dark)}.leave-modal header button{width:32px;height:32px;display:grid;place-items:center;border:0;border-radius:9px;background:var(--neutral-bg);color:var(--text-muted)}.leave-modal>div:not(header){display:grid;grid-template-columns:1fr 1fr;gap:12px}.leave-modal label{display:grid;gap:6px;color:var(--text-body);font-size:10px;font-weight:750}.leave-modal input,.leave-modal select,.leave-modal textarea{width:100%;padding:11px;border:1px solid var(--border-light);border-radius:11px;background:var(--surface-white);color:var(--text-dark);font:inherit}.leave-modal textarea{min-height:90px;resize:vertical}.leave-modal footer{display:flex;justify-content:flex-end;gap:8px;padding-top:4px}.leave-modal footer button{padding:11px 14px;border:1px solid var(--border-light);border-radius:11px;background:var(--surface-white);color:var(--text-body);font-weight:750}.leave-modal footer button:last-child{border-color:#4f46e5;background:#4f46e5;color:#fff}.leave-error{padding:10px;border-radius:9px;background:#fef2f2;color:#dc2626;font-size:10px}.growth-evidence{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;padding:22px}.growth-evidence>div{padding:17px;border-radius:14px;background:var(--neutral-bg)}.growth-evidence span{color:var(--text-muted);font-size:9px;text-transform:uppercase}.growth-evidence strong{display:block;margin:6px 0;color:var(--text-dark);font-size:19px}.growth-evidence>div>i{display:block;height:7px;border-radius:99px;background:var(--border-light);overflow:hidden}.growth-evidence>div>i b{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#4f46e5,#8b5cf6)}.growth-evidence p{color:var(--text-muted);font-size:10px;line-height:1.5}@media(max-width:650px){.leave-hero{align-items:flex-start;flex-direction:column}.leave-summary,.growth-evidence{grid-template-columns:1fr}.leave-list{overflow-x:auto}.leave-list>header,.leave-list>article{min-width:700px}.leave-modal>div:not(header){grid-template-columns:1fr}}
.employee-workspace{background:#f3f4f6;filter:grayscale(1)}.employee-welcome>div:first-child>span,.employee-section-heading>div>span,.support-heading>div>span,.promotion-heading>div:first-child>span,.leave-modal header span{color:#59616b}.profile-field>i,.support-heading>i,.promotion-person-name>i{background:#eceff1;color:#4b5563}.support-shortcut{background:#e5e7eb;color:#374151}.support-shortcut small{color:#6b7280}.attendance-stat.blue>i,.calendar-cell i,.calendar-legend i{background:#6b7280}.calendar-cell.today{border-color:#9ca3af;background:#f3f4f6}.promotion-heading>div:last-child,.promotion-explainer svg{color:#59616b}.promotion-explainer{border-color:#d1d5db;background:#f3f4f6}.promotion-person.current{background:#f3f4f6;box-shadow:inset 3px 0 #6b7280}.promotion-person-name em{background:#59616b}.leave-hero{background:linear-gradient(125deg,#69727d,#343a42);box-shadow:0 18px 40px rgba(17,24,39,.18)}.leave-hero button{color:#374151}.leave-modal footer button:last-child{border-color:#4b5563;background:#4b5563}.growth-evidence>div>i b{background:linear-gradient(90deg,#4b5563,#9ca3af)}
`;
