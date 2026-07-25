import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ArrowRight, Award, BookOpen, Download, Flag, Heart, Medal, Rocket, Sparkles,
  TrendingUp, Users,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { AICopilot } from '../components/ProductPrimitives';

export default function EnterpriseRoleDashboard({ role }) {
  const data = useData();
  const { user } = useAuth();
  return role === 'employee' ? <CareerHome user={user} data={data} /> : <ExecutiveStory user={user} data={data} />;
}

function CareerHome({ user, data }) {
  const employee = data.employees.find(item => item.id === user.employeeId) || data.employees[0] || {};
  const [copilotMessage, setCopilotMessage] = useState('');
  const readiness = Math.min(100, Math.round(((employee.performanceRating || 0) / 5 * 45) + (Math.min(employee.monthsInRole || 0, 24) / 24 * 35) + (Math.min(employee.trainingHours || 0, 40) / 40 * 20)));
  const milestones = [
    { date: employee.startDate || '2022', title: 'Joined the team', detail: employee.role || employee.position || 'Current discipline', icon: Rocket },
    { date: 'Last cycle', title: 'Performance calibrated', detail: `${employee.performanceRating || 'Not yet'} / 5`, icon: Award },
    { date: 'Now', title: readiness >= 75 ? 'Ready for a growth conversation' : 'Building promotion evidence', detail: `${readiness}% readiness`, icon: TrendingUp },
  ];
  const roadmap = [
    { title: 'System design at scale', progress: 72, detail: '2 of 3 learning milestones complete' },
    { title: 'Technical leadership', progress: 44, detail: 'Mentorship evidence in progress' },
    { title: 'Cloud architecture certification', progress: 18, detail: 'Recommended next credential' },
  ];
  const ask = prompt => setCopilotMessage(prompt.includes('promotion') ? `Your readiness is ${readiness}%. Performance contributes 45%, time in role 35%, and completed learning 20%. The strongest next evidence would be a scoped leadership outcome.` : `Based on your current role in ${employee.department || 'the organization'}, system design and technical leadership are the highest-leverage adjacent skills.`);

  return (
    <div className="career-product">
      <header className="career-hero">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          <span className="product-eyebrow"><Sparkles size={14} /> Your career, in motion</span>
          <h1>Build a career<br />you’re proud of.</h1>
          <p>Your progress, recognition, learning, and next opportunity—without the performance-review anxiety.</p>
          <button className="product-action primary">Plan my next chapter <ArrowRight size={15} /></button>
        </motion.div>
        <div className="readiness-constellation">
          <div className="readiness-core"><strong>{readiness}%</strong><span>Promotion readiness</span></div>
          <i className="orbit one"><span><Award size={15} /></span></i><i className="orbit two"><span><BookOpen size={15} /></span></i><i className="orbit three"><span><Users size={15} /></span></i>
        </div>
      </header>

      <section className="career-story">
        <div className="story-heading"><div><span className="product-eyebrow">Your story</span><h2>Momentum is built<br />one milestone at a time.</h2></div><p>Each event is connected to evidence you can revisit during a growth conversation.</p></div>
        <div className="career-timeline">{milestones.map(({ date, title, detail, icon: Icon }, index) => <motion.article key={title} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: index * .08 }} viewport={{ once: true }}><i><Icon size={18} /></i><span>{date}</span><strong>{title}</strong><p>{detail}</p></motion.article>)}</div>
      </section>

      <section className="career-focus">
        <div className="learning-roadmap">
          <div className="story-heading"><div><span className="product-eyebrow">Learning roadmap</span><h2>Skills that unlock<br />your next move.</h2></div></div>
          {roadmap.map(item => <button key={item.title}><span><strong>{item.title}</strong><small>{item.detail}</small></span><i style={{ '--road': `${item.progress * 3.6}deg` }}><b>{item.progress}%</b></i></button>)}
        </div>
        <AICopilot message={copilotMessage || `You’re building strong momentum. The clearest path to the next level is combining system-design depth with one visible leadership outcome.`} evidence={`${readiness}% readiness is calculated from performance, tenure, and completed learning—not manager intuition alone.`} prompts={['How is promotion readiness calculated?', 'Which skill should I learn next?']} onPrompt={ask} />
      </section>

      <section className="opportunity-ribbon">
        <div><span className="product-eyebrow">Internal opportunity</span><h2>Senior Platform Engineer</h2><p>Strong overlap with your current skills · 2 development gaps · Hiring manager open to internal mobility</p></div><button>Explore role <ArrowRight size={15} /></button>
      </section>
      <section className="recognition-wall"><div className="story-heading"><div><span className="product-eyebrow">Recognition</span><h2>Work that mattered.</h2></div></div><div><Recognition icon={Medal} title="Customer impact" text="Recognized for resolving a critical production incident." /><Recognition icon={Heart} title="Team contribution" text="Peer-nominated for thoughtful mentorship." /><Recognition icon={Flag} title="Goal completed" text="Delivered the quarterly reliability initiative." /></div></section>
      <style>{roleStyles}</style>
    </div>
  );
}

function ExecutiveStory({ user, data }) {
  const [copilotMessage, setCopilotMessage] = useState('');
  const departments = useMemo(() => [...new Set(data.employees.map(item => item.department).filter(Boolean))].map(department => {
    const people = data.employees.filter(item => item.department === department);
    const women = people.filter(item => item.gender === 'Female').length;
    return { department, equality: Math.round(65 + (people.length ? women / people.length * 30 : 0)), headcount: people.length, risk: data.biasAlerts.filter(alert => alert.department === department && alert.status === 'Active').length };
  }), [data.employees, data.biasAlerts]);
  const forecast = [{ q: 'Q3', equality: data.overallEqualityScore - 4 }, { q: 'Q4', equality: data.overallEqualityScore - 2 }, { q: 'Now', equality: data.overallEqualityScore }, { q: 'Q+1', equality: Math.min(100, data.overallEqualityScore + 3) }, { q: 'Q+2', equality: Math.min(100, data.overallEqualityScore + 5) }];
  const ask = prompt => setCopilotMessage(prompt.includes('risk') ? `${data.biasAlerts.filter(item => item.status === 'Active').length} active bias findings are the leading controllable risk. The forecast improves if owners close those findings and pay parity remains stable.` : `The equality score is ${data.overallEqualityScore}/100: representation ${data.equalityBreakdown.representation}, pay parity ${data.equalityBreakdown.payParity}, safety resolution ${data.equalityBreakdown.safetyResolution}, and bias control ${data.equalityBreakdown.biasControl}.`);

  return (
    <div className="executive-product">
      <header className="executive-hero">
        <span className="product-eyebrow"><Sparkles size={14} /> Board intelligence · July 2026</span>
        <h1>A healthier company<br />is becoming a <em>stronger company.</em></h1>
        <p>Fairness improved without slowing talent decisions. The remaining risk is concentrated, explainable, and actionable.</p>
        <div className="executive-actions"><button className="product-action primary"><Download size={15} /> Download board narrative</button><span>Prepared for {user.name}</span></div>
      </header>

      <section className="executive-kpis">
        <div className="hero-kpi"><span>Organization equality</span><strong>{data.overallEqualityScore}</strong><small>+4 vs. previous period</small></div>
        <div><span>Unadjusted pay gap</span><strong>{data.payGapStats.gapPct}%</strong><small>{data.payGapStats.isFlagged ? 'Needs investigation' : 'Within review threshold'}</small></div>
        <div><span>Women represented</span><strong>{data.genderStats.femalePct}%</strong><small>{data.genderStats.femaleCount} employees in current dataset</small></div>
      </section>

      <section className="executive-forecast">
        <div><span className="product-eyebrow">Forward view</span><h2>Momentum can compound.</h2><p>The projection is scenario-based, not a promise. It assumes current pay parity holds and active findings are resolved.</p></div>
        <ResponsiveContainer width="100%" height={340}><AreaChart data={forecast}><defs><linearGradient id="execFill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#9484ff" stopOpacity=".45" /><stop offset="1" stopColor="#9484ff" stopOpacity="0" /></linearGradient></defs><CartesianGrid vertical={false} stroke="rgba(255,255,255,.06)" /><XAxis dataKey="q" axisLine={false} tickLine={false} tick={{ fill: '#7f8699' }} /><YAxis domain={[50,100]} hide /><Tooltip contentStyle={{ background:'#171a25',border:'1px solid rgba(255,255,255,.1)',borderRadius:14 }} /><Area type="monotone" dataKey="equality" stroke="#9a8aff" strokeWidth={3} fill="url(#execFill)" /></AreaChart></ResponsiveContainer>
      </section>

      <section className="executive-departments">
        <div className="story-heading"><div><span className="product-eyebrow">Organization heatmap</span><h2>Where fairness is thriving.<br />Where leaders should look closer.</h2></div></div>
        <div className="department-viz"><ResponsiveContainer width="100%" height={330}><BarChart data={departments} layout="vertical" margin={{ left: 20 }}><CartesianGrid horizontal={false} stroke="rgba(255,255,255,.05)" /><XAxis type="number" domain={[0,100]} hide /><YAxis type="category" dataKey="department" width={100} axisLine={false} tickLine={false} tick={{ fill:'#a0a5b2',fontSize:11 }} /><Tooltip contentStyle={{ background:'#171a25',border:'1px solid rgba(255,255,255,.1)',borderRadius:14 }} /><Bar dataKey="equality" radius={[0,9,9,0]}>{departments.map(item => <Cell key={item.department} fill={item.risk ? '#ef9a72' : '#756be2'} />)}</Bar></BarChart></ResponsiveContainer><AICopilot message={copilotMessage || `The organization is at ${data.overallEqualityScore}/100. Department-level risk is concentrated rather than systemic, which makes focused intervention more effective than broad policy changes.`} evidence={data.equalityBreakdown.formula} prompts={['Explain the score', 'Where is the greatest risk?']} onPrompt={ask} /></div>
      </section>
      <style>{roleStyles}</style>
    </div>
  );
}

function Recognition({ icon: Icon, title, text }) { return <motion.article whileHover={{ y: -5 }}><i><Icon size={19} /></i><strong>{title}</strong><p>{text}</p></motion.article>; }

const roleStyles = `
.career-hero{min-height:540px;display:grid;grid-template-columns:1fr 390px;align-items:center;gap:80px}.career-hero h1,.executive-hero h1{font-size:clamp(44px,7vw,86px);line-height:.94;letter-spacing:-.07em;margin:16px 0 22px}.career-hero p,.executive-hero p{max-width:630px;color:var(--px-muted);font-size:17px;line-height:1.65;margin-bottom:28px}.readiness-constellation{width:360px;height:360px;position:relative;display:grid;place-items:center}.readiness-core{width:190px;height:190px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 35% 25%,rgba(146,130,255,.38),rgba(28,30,45,.9));border:1px solid rgba(150,135,255,.24);box-shadow:0 30px 80px rgba(92,74,207,.2)}.readiness-core strong{font-size:52px;letter-spacing:-.07em}.readiness-core span{font-size:11px;color:var(--px-muted)}.readiness-constellation .orbit{position:absolute;inset:25px;border:1px solid rgba(255,255,255,.08);border-radius:50%;animation:spin 18s linear infinite}.readiness-constellation .orbit span{position:absolute;top:-17px;left:50%;width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:#232638;color:var(--px-violet)}.readiness-constellation .orbit.two{inset:2px;animation-duration:25s;animation-direction:reverse}.readiness-constellation .orbit.three{inset:58px;animation-duration:14s}.career-story{margin-top:60px}.career-timeline{display:grid;grid-template-columns:repeat(3,1fr);position:relative}.career-timeline::before{content:"";position:absolute;left:10%;right:10%;top:30px;height:1px;background:linear-gradient(90deg,transparent,var(--px-line-strong),transparent)}.career-timeline article{position:relative;text-align:center;padding:0 25px}.career-timeline article>i{width:60px;height:60px;display:grid;place-items:center;margin:0 auto 18px;border-radius:20px;background:var(--px-surface-strong);border:1px solid var(--px-line);color:var(--px-violet);position:relative;z-index:1}.career-timeline span{font-size:9px;text-transform:uppercase;color:var(--px-dim)}.career-timeline strong{display:block;font-size:16px;margin:5px 0}.career-timeline p{font-size:11px;color:var(--px-muted)}.career-focus{display:grid;grid-template-columns:1.3fr .7fr;gap:14px;margin-top:100px}.learning-roadmap{padding:28px;border:1px solid var(--px-line);border-radius:28px}.learning-roadmap .story-heading h2{font-size:36px;margin-top:8px}.learning-roadmap>button{width:100%;display:flex;align-items:center;gap:15px;border:0;border-top:1px solid var(--px-line);padding:17px 2px;background:transparent;color:var(--px-text);text-align:left;cursor:pointer}.learning-roadmap button>span{display:flex;flex-direction:column;flex:1}.learning-roadmap button strong{font-size:13px}.learning-roadmap button small{font-size:9px;color:var(--px-muted)}.learning-roadmap button>i{--road:0deg;width:46px;height:46px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--px-violet) var(--road),rgba(255,255,255,.06) 0);position:relative}.learning-roadmap button>i::after{content:"";position:absolute;inset:4px;border-radius:50%;background:var(--px-bg)}.learning-roadmap button b{position:relative;z-index:1;font-size:9px;font-style:normal}.opportunity-ribbon{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:100px;padding:35px;border:1px solid rgba(104,213,168,.2);border-radius:28px;background:linear-gradient(110deg,rgba(104,213,168,.1),rgba(111,168,255,.06))}.opportunity-ribbon h2{font-size:32px;margin:7px 0}.opportunity-ribbon p{color:var(--px-muted);font-size:11px}.opportunity-ribbon button{display:flex;align-items:center;gap:7px;border:0;border-radius:13px;padding:13px 16px;background:var(--px-text);color:var(--px-bg);font-weight:700;cursor:pointer}.recognition-wall{margin-top:100px}.recognition-wall>div:last-child{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.recognition-wall article{padding:25px;border:1px solid var(--px-line);border-radius:22px;background:rgba(255,255,255,.025)}.recognition-wall article>i{width:42px;height:42px;display:grid;place-items:center;border-radius:14px;background:rgba(150,136,255,.1);color:var(--px-violet)}.recognition-wall strong{display:block;margin:18px 0 8px}.recognition-wall p{color:var(--px-muted);font-size:11px;line-height:1.6}.executive-hero{min-height:550px;padding-top:40px}.executive-hero h1 em{font-style:normal;background:linear-gradient(90deg,#6fd2c3,#9f8fff);-webkit-background-clip:text;color:transparent}.executive-actions{display:flex;align-items:center;gap:14px}.executive-actions>span{font-size:10px;color:var(--px-dim)}.executive-kpis{display:grid;grid-template-columns:1.4fr 1fr 1fr;border-top:1px solid var(--px-line);border-bottom:1px solid var(--px-line)}.executive-kpis>div{padding:35px;border-right:1px solid var(--px-line);display:flex;flex-direction:column}.executive-kpis>div:last-child{border:0}.executive-kpis span{font-size:10px;text-transform:uppercase;color:var(--px-muted)}.executive-kpis strong{font-size:48px;letter-spacing:-.06em;margin:10px 0}.executive-kpis .hero-kpi strong{font-size:76px;color:var(--px-green)}.executive-kpis small{font-size:9px;color:var(--px-dim)}.executive-forecast{display:grid;grid-template-columns:.6fr 1.4fr;align-items:center;gap:40px;margin-top:100px;padding:35px;border:1px solid var(--px-line);border-radius:28px}.executive-forecast h2{font-size:42px;letter-spacing:-.05em;margin:9px 0}.executive-forecast p{color:var(--px-muted);font-size:12px;line-height:1.6}.executive-departments{margin-top:100px}.department-viz{display:grid;grid-template-columns:1.4fr .6fr;gap:14px}.department-viz>div:first-child{border:1px solid var(--px-line);border-radius:24px;padding:20px}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:950px){.career-hero{grid-template-columns:1fr}.readiness-constellation{width:300px;height:300px}.career-focus,.department-viz,.executive-forecast{grid-template-columns:1fr}.executive-kpis{grid-template-columns:1fr}.executive-kpis>div{border-right:0;border-bottom:1px solid var(--px-line)}}@media(max-width:650px){.career-timeline,.recognition-wall>div:last-child{grid-template-columns:1fr;gap:35px}.career-timeline::before{display:none}.career-hero{gap:0}.opportunity-ribbon{align-items:flex-start;flex-direction:column}.executive-forecast{padding:20px}}
`;
