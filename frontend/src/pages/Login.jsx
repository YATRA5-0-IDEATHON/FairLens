import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Building2, CheckCircle2, Eye, EyeOff, Lock, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const demoAccounts = {
  hr: { email: 'hr@fairlens.demo', password: 'FairLens@2026', label: 'HR administrator' },
  employee: { email: 'employee@fairlens.demo', password: 'Employee@2026', label: 'Employee' },
};

export default function Login() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'employee' ? 'employee' : 'hr';
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState(demoAccounts[initialRole].email);
  const [password, setPassword] = useState(demoAccounts[initialRole].password);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const changeRole = nextRole => {
    setRole(nextRole);
    setEmail(demoAccounts[nextRole].email);
    setPassword(demoAccounts[nextRole].password);
    setError('');
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const session = await login({ email: email.trim(), password, role });
      navigate(session.role === 'hr' ? '/dashboard' : '/employee-dashboard', { replace: true });
    } catch (err) {
      setError(err.message === 'Failed to fetch'
        ? 'Authentication server is unavailable. Start the backend and try again.'
        : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-story">
        <Link className="login-brand" to="/"><b>FL</b><span>FairLens</span></Link>
        <div>
          <span className="login-eyebrow"><ShieldCheck size={15} /> Secure organization access</span>
          <h1>Fair decisions begin with trusted access.</h1>
          <p>Sign in with a verified prototype account. Your role determines which employee or HR workspace you can access.</p>
          <div className="security-points">
            <span><CheckCircle2 size={16} /> Server-validated credentials</span>
            <span><CheckCircle2 size={16} /> Signed, role-based session token</span>
            <span><CheckCircle2 size={16} /> Protected HR routes and actions</span>
          </div>
        </div>
        <small>Prototype authentication · Credentials are stored in the backend JSON user registry.</small>
      </section>

      <section className="login-area">
        <div className="login-card">
          <div className="login-heading">
            <span>Welcome back</span><h2>Sign in to FairLens</h2><p>Choose your account type and enter its credentials.</p>
          </div>

          <div className="role-switch">
            <button type="button" className={role === 'hr' ? 'active' : ''} onClick={() => changeRole('hr')}><Building2 size={17} /> HR account</button>
            <button type="button" className={role === 'employee' ? 'active' : ''} onClick={() => changeRole('employee')}><UserRound size={17} /> Employee</button>
          </div>

          {error && <div className="login-error"><AlertCircle size={16} /><span>{error}</span></div>}

          <form onSubmit={handleSubmit}>
            <label><span>Email address</span><div><UserRound size={17} /><input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="username" required /></div></label>
            <label><span>Password</span><div><Lock size={17} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            <button className="login-submit" type="submit" disabled={submitting}><span>{submitting ? 'Verifying account…' : `Sign in as ${role === 'hr' ? 'HR' : 'employee'}`}</span><ArrowRight size={17} /></button>
          </form>

          <div className="demo-credential">
            <div><span>Prototype credentials</span><b>{demoAccounts[role].label}</b></div>
            <p><strong>Email</strong><code>{demoAccounts[role].email}</code></p>
            <p><strong>Password</strong><code>{demoAccounts[role].password}</code></p>
          </div>

          <p className="candidate-link">Applying for a role? <Link to="/apply">Submit your resume</Link></p>
        </div>
      </section>
      <style>{styles}</style>
    </main>
  );
}

const styles = `
.login-page{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;background:#f4f5f8}.login-story{display:flex;flex-direction:column;justify-content:space-between;padding:42px 7vw;background:linear-gradient(145deg,#22265c,#343b82);color:#fff}.login-brand{display:flex;align-items:center;gap:10px;width:max-content;color:#fff;text-decoration:none;font-family:var(--font-serif);font-size:20px}.login-brand b{width:40px;height:40px;display:grid;place-items:center;border-radius:11px;background:linear-gradient(135deg,#57bfaa,#e85d4e);font-size:17px}.login-story>div{max-width:560px}.login-eyebrow{display:flex;align-items:center;gap:7px;color:#76d9c7;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.login-story h1{margin:18px 0;font-family:var(--font-serif);font-size:clamp(42px,5vw,68px);line-height:1.02;letter-spacing:-.045em}.login-story>div>p{max-width:520px;color:rgba(255,255,255,.68);font-size:16px;line-height:1.65}.security-points{display:flex;flex-direction:column;gap:12px;margin-top:30px}.security-points span{display:flex;align-items:center;gap:9px;color:rgba(255,255,255,.82);font-size:13px}.security-points svg{color:#76d9c7}.login-story>small{color:rgba(255,255,255,.42);font-size:11px}.login-area{display:grid;place-items:center;padding:35px}.login-card{width:100%;max-width:470px;padding:34px;border:1px solid var(--border-light);border-radius:24px;background:#fff;box-shadow:0 25px 70px rgba(38,42,92,.1)}.login-heading>span{color:var(--secondary-teal);font-size:11px;font-weight:800;text-transform:uppercase}.login-heading h2{margin:5px 0 4px;color:var(--primary-indigo);font-family:var(--font-serif);font-size:31px}.login-heading p{color:var(--text-muted);font-size:13px}.role-switch{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:24px 0;padding:5px;border-radius:13px;background:var(--neutral-bg)}.role-switch button{display:flex;align-items:center;justify-content:center;gap:7px;padding:10px;border:0;border-radius:9px;background:transparent;color:var(--text-muted);font-size:12px;font-weight:700;cursor:pointer}.role-switch button.active{background:#fff;color:var(--primary-indigo);box-shadow:0 3px 12px rgba(37,41,99,.08)}.login-error{display:flex;align-items:center;gap:8px;margin-bottom:16px;padding:11px 12px;border-radius:10px;background:#fbe6e3;color:#a9463b;font-size:12px}.login-card form{display:flex;flex-direction:column;gap:16px}.login-card form>label>span{display:block;margin-bottom:7px;color:var(--text-dark);font-size:12px;font-weight:700}.login-card form>label>div{display:flex;align-items:center;gap:9px;padding:0 12px;border:1px solid var(--border-light);border-radius:11px;color:var(--text-muted)}.login-card input{width:100%;padding:12px 0;border:0;outline:0;background:transparent;color:var(--text-dark);font-size:14px}.login-card form label button{display:grid;place-items:center;border:0;background:transparent;color:var(--text-muted);cursor:pointer}.login-submit{display:flex;align-items:center;justify-content:space-between;margin-top:4px;padding:13px 15px;border:0;border-radius:11px;background:var(--primary-indigo);color:#fff;font-size:13px;font-weight:800;cursor:pointer}.login-submit:disabled{opacity:.65;cursor:wait}.demo-credential{margin-top:22px;padding:14px;border:1px solid #dcece8;border-radius:12px;background:#f4fbf9}.demo-credential>div{display:flex;justify-content:space-between;margin-bottom:9px}.demo-credential>div span{color:#267f70;font-size:10px;font-weight:800;text-transform:uppercase}.demo-credential>div b{color:var(--text-muted);font-size:10px}.demo-credential p{display:grid;grid-template-columns:65px 1fr;padding:3px 0;font-size:11px}.demo-credential strong{color:var(--text-muted)}.demo-credential code{color:var(--primary-indigo);font-weight:700}.candidate-link{margin-top:20px;color:var(--text-muted);text-align:center;font-size:12px}.candidate-link a{color:var(--secondary-teal);font-weight:750;text-decoration:none}@media(max-width:850px){.login-page{grid-template-columns:1fr}.login-story{min-height:330px;padding:30px}.login-story h1{font-size:42px}.login-story>small,.security-points{display:none}.login-area{padding:25px 15px}.login-card{padding:25px}}
`;
