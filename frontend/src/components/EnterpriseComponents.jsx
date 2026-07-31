import {
  ArrowRight, Bot, CheckCircle2, ChevronDown, Download, Inbox, LoaderCircle,
  MoreHorizontal, Search, Sparkles, TrendingDown, TrendingUp,
} from 'lucide-react';

export function WorkspaceHeader({ eyebrow, title, description, actions, children }) {
  return (
    <header className="workspace-header">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="workspace-header-actions">{actions}{children}</div>
    </header>
  );
}

export function Button({ children, icon: Icon, variant = 'primary', ...props }) {
  return <button className={`enterprise-button ${variant}`} {...props}>{Icon && <Icon size={15} />}{children}</button>;
}

export function MetricCard({ label, value, trend, comparison, icon: Icon, tone = 'indigo', spark = [25, 42, 35, 56, 48, 70, 78] }) {
  const positive = Number.parseFloat(trend) >= 0;
  const points = spark.map((point, index) => `${index * (96 / (spark.length - 1)) + 2},${42 - point * .36}`).join(' ');
  return (
    <article className={`metric-card enterprise-surface ${tone}`}>
      <header><span>{label}</span>{Icon && <i><Icon size={16} /></i>}</header>
      <strong>{value}</strong>
      <footer>
        {trend !== undefined && <b className={positive ? 'positive' : 'negative'}>{positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{trend}</b>}
        <small>{comparison}</small>
      </footer>
      <svg viewBox="0 0 100 44" preserveAspectRatio="none" aria-hidden="true"><polyline points={points} /></svg>
    </article>
  );
}

export function InsightCard({ title, summary, action = 'See details', onAction, onDismiss }) {
  return (
    <article className="ai-recommendation enterprise-surface">
      <i><Sparkles size={19} /></i>
      <div><span>AI insight</span><h2>{title}</h2><p>{summary}</p></div>
      <div className="ai-recommendation-actions">
        <button onClick={onAction}>{action}<ArrowRight size={13} /></button>
        {onDismiss && <button className="ghost" onClick={onDismiss}>Dismiss</button>}
        <button className="ghost"><Download size={13} /> Export</button>
      </div>
    </article>
  );
}

export function StatusBadge({ children, value = children }) {
  const tone = /active|published|accepted|approved|complete|hired|healthy|pass/i.test(value) ? 'success'
    : /urgent|critical|declined|rejected|failed|overdue/i.test(value) ? 'danger'
      : /pending|review|draft|scheduled|progress|negotiation/i.test(value) ? 'warning' : 'neutral';
  return <span className={`enterprise-badge ${tone}`}><i />{children}</span>;
}

export function SkillBadge({ children }) {
  return <span className="skill-badge">{children}</span>;
}

export function ScoreGauge({ value = 0, label = 'score', tone = 'indigo' }) {
  const score = Math.max(0, Math.min(100, Number(value) || 0));
  return <div className={`score-gauge ${tone}`} style={{ '--gauge': `${score * 3.6}deg` }}><strong>{score}</strong><span>{label}</span></div>;
}

export function Toolbar({ query, onQuery, filters = [], children }) {
  return (
    <div className="enterprise-toolbar">
      <label><Search size={15} /><span className="sr-only">Search</span><input value={query} onChange={event => onQuery?.(event.target.value)} placeholder="Search this view…" /></label>
      {filters.map(filter => <label className="toolbar-filter" key={filter.label}><span>{filter.label}</span><select value={filter.value} onChange={event => filter.onChange(event.target.value)}>{filter.options.map(option => <option key={option}>{option}</option>)}</select><ChevronDown size={13} /></label>)}
      <div className="toolbar-actions">{children}</div>
    </div>
  );
}

export function DataTable({ columns, rows, rowKey = 'id', empty = 'No records match this view.', renderActions }) {
  if (!rows.length) return <EmptyState title={empty} />;
  return (
    <div className="enterprise-table-wrap enterprise-surface">
      <div className="enterprise-table" style={{ '--columns': `repeat(${columns.length}, minmax(120px, 1fr)) ${renderActions ? '56px' : ''}` }}>
        <div className="enterprise-table-head">{columns.map(column => <span key={column.key}>{column.label}</span>)}{renderActions && <span />}</div>
        {rows.map(row => <div className="enterprise-table-row" key={row[rowKey]}>{columns.map(column => <div key={column.key}>{column.render ? column.render(row[column.key], row) : row[column.key] ?? '—'}</div>)}{renderActions && <div>{renderActions(row)}</div>}</div>)}
      </div>
    </div>
  );
}

export function CardGrid({ children, className = '' }) {
  return <section className={`enterprise-card-grid ${className}`}>{children}</section>;
}

export function PersonCard({ code, title, subtitle, skills = [], score, status, meta = [], actions }) {
  return (
    <article className="person-card enterprise-surface">
      <header><div className="person-avatar">{String(code || title).slice(0, 2).toUpperCase()}</div><div><small>{code}</small><h3>{title}</h3><p>{subtitle}</p></div>{score !== undefined && <ScoreGauge value={score} label="match" />}</header>
      <div className="person-skills">{skills.slice(0, 5).map(skill => <SkillBadge key={skill}>{skill}</SkillBadge>)}</div>
      <div className="person-meta">{meta.map(item => <span key={item.label}><small>{item.label}</small><strong>{item.value}</strong></span>)}</div>
      <footer>{status && <StatusBadge>{status}</StatusBadge>}<div>{actions}</div></footer>
    </article>
  );
}

export function ActivityFeed({ items }) {
  return (
    <section className="activity-feed enterprise-surface">
      <header><div><span>Live workspace</span><h2>Recent activity</h2></div><button><MoreHorizontal size={16} /></button></header>
      <div>{items.map((item, index) => <article key={`${item.title}-${index}`}><i className={item.tone || 'indigo'}>{item.icon || <CheckCircle2 size={14} />}</i><div><strong>{item.title}</strong><p>{item.detail}</p></div><time>{item.time}</time></article>)}</div>
    </section>
  );
}

export function EmptyState({ title, description = 'Try changing filters or create a new record.', action }) {
  return <div className="enterprise-empty enterprise-surface"><i><Inbox size={23} /></i><strong>{title}</strong><p>{description}</p>{action}</div>;
}

export function SkeletonLoader({ rows = 4 }) {
  return <div className="enterprise-skeleton enterprise-surface" aria-label="Loading"><LoaderCircle className="spin" size={18} />{Array.from({ length: rows }, (_, index) => <i key={index} />)}</div>;
}

export function AIChatPanel({ title = 'FairLens Assistant', prompts = [], response, onPrompt }) {
  return (
    <section className="ai-chat-panel enterprise-surface">
      <header><i><Bot size={18} /></i><div><strong>{title}</strong><span>Grounded in your authorized FairLens data</span></div><em>AI</em></header>
      <div className="ai-chat-body">
        <div className="ai-chat-message"><Sparkles size={15} /><p>{response || 'Ask me to analyze a workflow, explain an equity signal, or prepare an evidence-based summary.'}</p></div>
        <div className="ai-chat-prompts">{prompts.map(prompt => <button key={prompt} onClick={() => onPrompt?.(prompt)}>{prompt}<ArrowRight size={12} /></button>)}</div>
      </div>
      <footer><input aria-label="Message FairLens Assistant" placeholder="Ask FairLens…" /><button><ArrowRight size={15} /></button></footer>
    </section>
  );
}

export function SimpleBarChart({ data, label = 'Distribution', tone = 'indigo' }) {
  const max = Math.max(...data.map(item => item.value), 1);
  return (
    <section className="simple-chart enterprise-surface">
      <header><span>Analytics</span><h2>{label}</h2></header>
      <div>{data.map(item => <div key={item.label}><span>{item.label}</span><i><b className={tone} style={{ width: `${item.value / max * 100}%` }} /></i><strong>{item.value}{item.suffix || ''}</strong></div>)}</div>
    </section>
  );
}
