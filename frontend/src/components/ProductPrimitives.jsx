import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, BriefcaseBusiness, FileText, Search, Settings, Sparkles, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AICopilot({ message, evidence, prompts = [], onPrompt, className = '' }) {
  return (
    <motion.aside className={`copilot ${className}`} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}>
      <div className="copilot-header"><i className="copilot-orb"><Sparkles size={16} /></i><div><strong>FairLens Copilot</strong><span>Grounded in workspace evidence</span></div></div>
      <p className="copilot-message">{message}</p>
      {evidence && <div className="copilot-evidence">{evidence}</div>}
      <div className="copilot-prompts">{prompts.map(prompt => <button key={prompt} onClick={() => onPrompt?.(prompt)}>{prompt}</button>)}</div>
    </motion.aside>
  );
}

const COMMANDS = [
  ['/dashboard', BarChart3, 'Hiring health', 'See pipeline, fairness, and next actions'],
  ['/blind-screening', FileText, 'Resume Intelligence', 'Analyze evidence and ask the hiring Copilot'],
  ['/operations', Users, 'People Operations', 'Manage employees, hiring, and audit activity'],
  ['/candidate-comparison', BriefcaseBusiness, 'Compare candidates', 'Open the evidence comparison workspace'],
  ['/settings', Settings, 'Workspace settings', 'Organization, access, and governance'],
];

export function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const results = useMemo(() => COMMANDS.filter(([, , title, detail]) => `${title} ${detail}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <AnimatePresence>
      {open && <motion.div className="command-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={event => event.target === event.currentTarget && onClose()}>
        <motion.div className="command-palette" initial={{ opacity: 0, scale: .96, y: -18 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .97, y: -10 }}>
          <label className="command-search"><Search size={20} /><input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search or jump to…" /><kbd>ESC</kbd><button onClick={onClose} aria-label="Close"><X size={16} /></button></label>
          <div className="command-results">{results.map(([path, Icon, title, detail]) => <button key={path} onClick={() => { navigate(path); onClose(); }}><i><Icon size={16} /></i><span><strong>{title}</strong><small>{detail}</small></span></button>)}</div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  );
}
