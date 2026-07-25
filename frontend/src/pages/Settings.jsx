import React, { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Sliders, Lock, CheckCircle2, RefreshCw } from 'lucide-react';

export default function Settings() {
  const [payThreshold, setPayThreshold] = useState(3.0);
  const [redactionStrictness, setRedactionStrictness] = useState('Strict');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Organization Settings & AI Controls</h1>
          <p className="page-subtitle">Configure anonymization strictness, bias alert sensitivity thresholds, and HRIS integrations.</p>
        </div>

        <button className="btn btn-teal btn-sm" onClick={() => alert("Settings saved successfully!")}>
          <span>Save Configuration</span>
        </button>
      </div>

      {/* Main Settings Grid */}
      <div className="grid-2">
        {/* Anonymization Strictness Controls */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sliders size={18} color="var(--secondary-teal)" />
              <h3 className="card-title">Blind Screening Redaction Rules</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
            <div className="form-group">
              <label className="form-label">Default Masking Mode</label>
              <select 
                className="form-select"
                value={redactionStrictness}
                onChange={(e) => setRedactionStrictness(e.target.value)}
              >
                <option value="Strict">Strict (Mask Names, Pronouns, Photos, Alma Mater, Graduation Year)</option>
                <option value="Standard">Standard (Mask Names, Pronouns, Photos)</option>
              </select>
            </div>

            <div style={{ background: 'var(--neutral-bg)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Active Masked Attributes:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span className="badge badge-teal">Candidate Name</span>
                <span className="badge badge-teal">Gender / Pronouns</span>
                <span className="badge badge-teal">Candidate Photo</span>
                <span className="badge badge-teal">Age & Birth Year</span>
                <span className="badge badge-teal">University Name</span>
                <span className="badge badge-teal">Graduation Date</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bias Alert Threshold Sliders */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">AI Alert Sensitivity Thresholds</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '0.5rem' }}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <span>Trigger Pay Gap Warning when Gap &gt;:</span>
                <span className="font-mono" style={{ fontWeight: 600, color: 'var(--accent-coral)' }}>{payThreshold}%</span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="5.0" 
                step="0.5" 
                value={payThreshold}
                onChange={(e) => setPayThreshold(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-coral)', cursor: 'pointer' }}
              />
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Current setting will automatically generate a alert badge whenever a department salary gap exceeds <strong>{payThreshold}%</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* HRIS Integrations Matrix */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Connected HRIS & ATS Integrations</h3>
        </div>

        <div className="grid-4">
          <IntegrationCard name="Workday" status="Connected" synced="5m ago" />
          <IntegrationCard name="Greenhouse ATS" status="Connected" synced="12m ago" />
          <IntegrationCard name="BambooHR" status="Available" synced="Not connected" />
          <IntegrationCard name="Lever ATS" status="Available" synced="Not connected" />
        </div>
      </div>
    </div>
  );
}

function IntegrationCard({ name, status, synced }) {
  const isConnected = status === "Connected";
  return (
    <div style={{ padding: '1rem', background: 'var(--neutral-bg)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{name}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
        <span className={`badge ${isConnected ? 'badge-teal' : 'badge-indigo'}`}>{status}</span>
        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{synced}</span>
      </div>
    </div>
  );
}
