import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowRight, Building2, Eye, EyeOff, Lock, UserRound } from 'lucide-react';
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
      <section className="login-area">
        <div className="login-card">
          <Link className="login-brand" to="/"><b>FL</b><span>FairLens</span></Link>
          <div className="login-heading">
            <span>Welcome back</span><h2>Sign in</h2><p>Choose your workspace to continue.</p>
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
.login-page{position:relative;min-height:100vh;display:grid;place-items:center;overflow:hidden;padding:40px 18px;background:linear-gradient(145deg,#f4f6f9 0%,#fff 48%,#eef3fb 100%);color:#111827}.login-page:before,.login-page:after{content:"";position:absolute;border-radius:50%;pointer-events:none}.login-page:before{width:340px;height:340px;left:-170px;bottom:-170px;background:rgba(37,99,235,.055)}.login-page:after{width:230px;height:230px;right:-100px;top:-105px;border:42px solid rgba(17,24,39,.025)}.login-area{position:relative;z-index:1;width:100%;display:grid;place-items:center}.login-card{position:relative;overflow:hidden;width:100%;max-width:480px;padding:40px;border:1px solid rgba(213,219,228,.9);border-radius:22px;background:rgba(255,255,255,.96);box-shadow:0 24px 65px rgba(17,24,39,.1);animation:card-in .65s cubic-bezier(.2,.8,.2,1) both}.login-card:before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:#2563eb}.login-brand{display:flex;align-items:center;gap:10px;width:max-content;margin-bottom:35px;color:#111827;text-decoration:none;font-family:var(--font-serif);font-size:21px;font-weight:700}.login-brand b{width:40px;height:40px;display:grid;place-items:center;border-radius:11px;background:#17191d;color:#fff;font-family:Inter,sans-serif;font-size:12px;box-shadow:0 7px 16px rgba(17,24,39,.17)}.login-heading>span{color:#2563eb;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.07em}.login-heading h2{margin:6px 0;color:#111827;font-family:var(--font-serif);font-size:39px;letter-spacing:-.035em}.login-heading p{color:#6b7280;font-size:14px}.role-switch{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:28px 0 24px;padding:5px;border:1px solid #e4e7ec;border-radius:13px;background:#f2f4f7}.role-switch button{display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border:0;border-radius:9px;background:transparent;color:#667085;font-size:13px;font-weight:700;cursor:pointer;transition:color .2s,background .2s,box-shadow .2s,transform .2s}.role-switch button:hover{color:#111827}.role-switch button.active{background:#fff;color:#1d4ed8;box-shadow:0 3px 12px rgba(17,24,39,.1)}.role-switch button.active svg{stroke-width:2.4}.login-error{display:flex;align-items:flex-start;gap:8px;margin-bottom:17px;padding:12px 13px;border:1px solid #fecaca;border-radius:10px;background:#fff5f5;color:#b42318;font-size:13px}.login-card form{display:flex;flex-direction:column;gap:18px}.login-card form>label>span{display:block;margin-bottom:8px;color:#344054;font-size:13px;font-weight:700}.login-card form>label>div{display:flex;align-items:center;gap:10px;padding:0 14px;border:1px solid #d8dde5;border-radius:11px;background:#fff;color:#98a2b3;transition:border-color .2s,box-shadow .2s,color .2s}.login-card form>label>div:hover{border-color:#b9c0cc}.login-card form>label>div:focus-within{border-color:#7da2f7;box-shadow:0 0 0 4px rgba(37,99,235,.09);color:#2563eb}.login-card input{width:100%;padding:14px 0;border:0;outline:0;background:transparent;color:#111827;font-size:15px}.login-card form label button{display:grid;place-items:center;padding:5px;border:0;background:transparent;color:#667085;cursor:pointer}.login-submit{display:flex;align-items:center;justify-content:space-between;margin-top:4px;padding:15px 17px;border:0;border-radius:11px;background:#17191d;color:#fff;font-size:14px;font-weight:800;cursor:pointer;box-shadow:0 10px 22px rgba(17,24,39,.17);transition:transform .25s,box-shadow .25s,background .25s}.login-submit:hover:not(:disabled){transform:translateY(-2px);background:#2563eb;box-shadow:0 15px 28px rgba(37,99,235,.22)}.login-submit:hover svg{transform:translateX(3px)}.login-submit svg{transition:transform .2s}.login-submit:disabled{opacity:.65;cursor:wait}.demo-credential{margin-top:24px;padding:15px;border:1px solid #e1e6ee;border-radius:12px;background:#f8fafc}.demo-credential>div{display:flex;justify-content:space-between;margin-bottom:10px}.demo-credential>div span{color:#2563eb;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.05em}.demo-credential>div b{color:#667085;font-size:11px}.demo-credential p{display:grid;grid-template-columns:72px 1fr;padding:3px 0;font-size:12px}.demo-credential strong{color:#667085}.demo-credential code{overflow:hidden;color:#263244;font-family:inherit;font-weight:700;text-overflow:ellipsis}.candidate-link{margin-top:22px;color:#667085;text-align:center;font-size:13px}.candidate-link a{color:#1d4ed8;font-weight:750;text-decoration:none}.candidate-link a:hover{text-decoration:underline}@keyframes card-in{from{opacity:0;transform:translateY(18px) scale(.985)}to{opacity:1;transform:none}}@media(max-width:520px){.login-page{padding:18px}.login-card{padding:26px 23px;border-radius:18px}.login-brand{margin-bottom:29px}.role-switch button{font-size:12px}.login-heading h2{font-size:34px}}@media(prefers-reduced-motion:reduce){.login-page *{animation:none!important;transition:none!important}}
`;
