# FairLens (EquiHire AI) — Comprehensive Design System & UI/UX Specification

## 1. Executive Summary & Design Philosophy

**FairLens (EquiHire AI)** is an AI-powered gender equality and workplace fairness platform. Its primary purpose is to help organizations identify, analyze, and eliminate systemic gender bias across the entire employee lifecycle—from hiring and compensation to promotions, performance reviews, and workplace safety.

### Tone & Visual Identity
Because FairLens deals with critical workplace dynamics (bias audits, pay parity, harassment reporting), the visual design leans **clinical, calm, transparent, and authoritative**. It avoids hyper-saturated startup clichés in favor of a clean, structured, data-driven aesthetic reminiscent of high-end financial audit tools merged with modern web applications.

- **Visual Metaphor:** The *Clear Lens* — removing distortion to present clear, objective, unmanipulated truth.
- **Design Principles:**
  1. **Objective Clarity:** High contrast, legible typography, and structured grids.
  2. **Human-Centric Safety:** Generous white space, comforting UI affordances, and unmistakable anonymity cues for sensitive reporting.
  3. **Actionable Insights:** Bias is flagged with clear visual priority without alarming color overload.

---

## 2. Design Tokens & Fundamentals

### 2.1 Color Palette

| Token Name | Hex Code | Visual Purpose | Accessibility / Usage |
|---|---|---|---|
| `primary-indigo` | `#2B2E6B` | Brand identity, top navbar, primary headers, dark sidebar | High contrast text/background (8.9:1 ratio) |
| `secondary-teal` | `#3FA796` | High equity scores, positive trends, verified status | Primary brand accent for success states |
| `accent-coral` | `#E85D4E` | Pay gap flags, high-risk bias alerts, critical notifications | Used sparingly to draw immediate focus |
| `warning-amber` | `#E6A100` | Moderate risk, pending reviews, items requiring attention | Secondary alert indicator |
| `neutral-bg` | `#F7F5F2` | Page background canvas (soft warm off-white) | Reduces eye strain compared to pure `#FFFFFF` |
| `surface-white` | `#FFFFFF` | Card backgrounds, modal windows, table rows | Clean container background |
| `text-dark` | `#1E1F26` | Primary body text, headings | Charcoal ink for soft contrast against off-white |
| `text-muted` | `#656B7C` | Subtitles, labels, secondary metadata | Medium contrast secondary text |
| `border-light` | `#D8DCE3` | Table dividers, card borders, input borders | Subtle structural lines |

### 2.2 Typography Architecture

| Category | Font Family | Weights | Usage Scope |
|---|---|---|---|
| **Display / Headlines** | **Fraunces** (Serif) | 600 (Semibold), 500 (Medium) | Page H1 titles, Hero headlines, Equality Score numbers |
| **Interface / Body** | **Inter** (Sans-Serif) | 400 (Regular), 500 (Medium), 600 (Semibold) | Navigation, body copy, form inputs, button text |
| **Data / Figures** | **IBM Plex Mono** (Monospace) | 500 (Medium), 600 (Semibold) | Percentages, salary figures, candidate scores, code/audit IDs |

**Type Scale:**
- **H1 Display:** `36px` / `44px` line-height — Fraunces Semibold
- **H2 Section Header:** `24px` / `32px` line-height — Fraunces Medium
- **H3 Card Title:** `18px` / `24px` line-height — Inter Semibold
- **Body Regular:** `15px` / `22px` line-height — Inter Regular
- **Body Small / Meta:** `13px` / `18px` line-height — Inter Medium
- **Data Stat Display:** `32px` – `48px` — IBM Plex Mono Semibold

### 2.3 Layout Grid & Spacing System
- **Grid Layout:** 12-column grid with `24px` gutters, maximum content container width `1280px`.
- **Sidebar:** Fixed left navigation panel (`260px` width) for administrative and HR views.
- **Card Radii:**
  - `12px` for dashboard widgets, stat cards, and interactive modal dialogs (approachable, modern).
  - `4px` for data tables and code/redacted document viewports (structured, precise, audited).
- **Elevation / Shadows:**
  - `shadow-sm`: `0 1px 3px rgba(30, 31, 38, 0.05)` (Cards, static containers)
  - `shadow-md`: `0 4px 12px rgba(30, 31, 38, 0.08)` (Hover states, dropdowns)
  - `shadow-lg`: `0 12px 32px rgba(30, 31, 38, 0.12)` (Modals, flyouts)

---

## 3. Signature UI Components

### 3.1 The Equality Score Ring
- **Description:** A custom circular progress ring displayed prominently on the HR Dashboard, Compliance Scorecard, and Landing Page.
- **Visual Design:** A thick concentric ring segmenting four sub-scores (Hiring, Pay Equity, Promotion Fairness, Safety Index).
- **Dynamic Gradient:** Shifts smoothly from Soft Teal (`#3FA796`) for high equity scores (80-100) down to Warm Coral (`#E85D4E`) if scores drop below 60.
- **Center Display:** Prominent score out of 100 set in **Fraunces** with a smaller subtext label ("Overall Gender Equality Index").

### 3.2 Redacted Resume Viewer (Blind Screening)
- **Description:** A dual-layer document display component.
- **Visual Design:** PII (Personally Identifiable Information) such as names, pronouns, photos, age, address, and graduation dates are overlayed with dark strike-pattern blocks (`rgba(30,31,38,0.95)` with a faint diagonal mesh pattern).
- **Transparency Tooltip:** Hovering over a redacted block displays a privacy badge: `🔒 Anonymized by FairLens AI Engine`.

### 3.3 Bias Alert Badge & Card
- **Description:** Contextual notification card triggered when statistical anomalies indicate potential bias.
- **Visual Elements:** Left border color stripe (`#E85D4E`), warning icon, bold issue header, IBM Plex Mono deviation metric (e.g., `-14.2% promotion gap`), and a direct "Investigate Department" action button.

### 3.4 Anonymous Safety Shield
- **Description:** Visual trust badge displayed continuously in the Employee Anonymous Reporting Portal.
- **Visual Elements:** Encrypted lock symbol in Teal, prominent badge text: `Zero-Knowledge Encryption Active • IP Not Logged • Anonymous Session ID: #8F-9021`.

---

## 4. Page-by-Page UI/UX Specifications

### Page 1: Landing Page
- **Purpose:** Public introduction, value proposition, live interactive demo snippet, trust metrics.
- **Header:** Sticky navbar with FairLens logo (balanced lens emblem), features dropdown, pricing, and two buttons: "Anonymous Report Portal" (Ghost button) & "HR Login" (Solid Indigo button).
- **Hero Section:**
  - Headline (Fraunces): *"Eliminate Bias. Measure Equity. See Hiring Clearly."*
  - Subtitle: *"AI-powered blind screening, pay gap audits, promotion analytics, and anonymous workplace safety reporting."*
  - Hero Right Graphic: Live animating Equality Score Ring surrounded by floating mini-cards (Redacted Resume Card, Pay Gap Alert Card).
- **Interactive Feature Highlights Grid:**
  - 6 Feature cards corresponding to the core platform engines.
- **Compliance & ROI Calculator:** Interactive slider allowing visitors to estimate compliance risk reduction based on employee count.

### Page 2: Login / Authentication
- **Purpose:** Secure access portal for HR Administrators, Recruiters, and DEI Executives.
- **Layout:** Centered single-card layout on warm off-white canvas.
- **Features:**
  - SSO buttons (Google Workspace, Microsoft Entra ID, Okta).
  - Standard Email / Password inputs with clear focus states.
  - Role switcher tab bar at top: `[ HR & Leadership Portal ]` | `[ Employee Anonymous Portal ]`.
  - Privacy and security compliance badges at footer (SOC2, GDPR, HIPAA ready).

### Page 3: HR Master Dashboard
- **Purpose:** Central command center for HR leaders and DEI managers.
- **Layout:** Fixed left sidebar navigation + 3-column top widget grid + 2-column detailed breakdown below.
- **Widgets Included:**
  1. **Equality Score Widget:** Large Equality Score Ring (Center 84/100) with quarterly delta (+3.2%).
  2. **Gender Distribution Card:** Donut chart showing overall M / F / Non-Binary / Unspecified ratios.
  3. **Pay Gap Summary Card:** Key metric highlight (`-3.4% Unexplained Gap`) with target threshold line.
  4. **Active Bias Alerts Panel:** Scrollable list of flagged department metrics (e.g., "Engineering Promo Bottleneck").
  5. **Workplace Safety Cases:** Summary counter of open, pending, and resolved anonymous reports.
  6. **Recent Activity Feed:** Audit trail of recent blind resumes evaluated and report statuses updated.

### Page 4: Blind Resume Screening
- **Purpose:** Remove non-job-related demographic bias from initial candidate selection.
- **Layout:** Split-screen layout (`50%` Document Viewer / `50%` Scoring & Evaluation Matrix).
- **Left Panel (Redacted Document Viewport):**
  - Rendered PDF/Resume with active anonymization mask.
  - Controls: Zoom, Redaction Strictness Selector (`Strict` / `Balanced`), Original vs Anonymized preview toggle (restricted to authorized roles).
- **Right Panel (Skills & Qualifications Matrix):**
  - Extracted Core Skills tagged with competence ratings.
  - Relevant Experience Timeline (company names replaced with anonymized descriptions like "Tier-1 Tech Enterprise, 4 yrs").
  - Standardized Evaluation Form: Structured rubric (Technical Competence, Problem Solving, Communication) with numerical scale inputs.
  - Decision Bar: `[ Shortlist Candidate ]` (Teal), `[ Request Additional Work Sample ]`, `[ Decline ]`.

### Page 5: Candidate Comparison
- **Purpose:** Compare shortlisted candidates purely on merit and competency without demographic markers.
- **Layout:** Side-by-side multi-column comparison table (up to 4 candidates simultaneously).
- **Features:**
  - Anonymized Candidate IDs (e.g., `Candidate #402`, `Candidate #719`).
  - Competency Radar Chart overlaying skill signatures.
  - Row-by-row comparison matrix: Experience years, Key technical skills, Project achievements, Education level (demapped from university names to degree tiers).
  - Blended Skill Score indicator (IBM Plex Mono).

### Page 6: Gender Analytics Dashboard
- **Purpose:** Macro-level organizational analytics on gender representation across departments and tiers.
- **Layout:** Full-width analytics view with filter bar (Department, Location, Timeframe, Seniority Level).
- **Sections:**
  - **Hiring Funnel Bar Chart:** Multi-stage representation tracking (Applied ➔ Screened ➔ Interviewed ➔ Offered ➔ Hired) with drop-off rate callouts by gender.
  - **Department Diversity Heatmap:** Grid matrix comparing representation across Engineering, Product, Sales, Operations, Executive Leadership.
  - **Leadership Representation Gauge:** Progress bar toward 50/50 target for Senior Management and Board roles.

### Page 7: Pay Equity Audit Page
- **Purpose:** Uncover, visualize, and calculate compensation disparities across equivalent roles.
- **Layout:** Data-dense analytics interface with tabbed views (`Role Comparison`, `Department Risk Matrix`, `Statistical Model`).
- **Features:**
  - **Scatter Plot (Salary vs Experience):** Plotted data points categorized by role tier with regression trend lines per gender group.
  - **Unexplained Pay Gap Highlight Cards:** Cards calling out specific roles with high variance after controlling for tenure, performance rating, and location.
  - **Department Risk Table:** Searchable table listing Department, Role Title, Employee Count, Mean Salary Delta, and Risk Score (`Low`, `Medium`, `High`).
  - **Remediation Cost Calculator:** Interactive tool estimating budget required to achieve equal pay parity.

### Page 8: Performance Review Analysis
- **Purpose:** Detect subjective language bias and rating skews in annual and quarterly performance evaluations.
- **Layout:** Split view of review text analytics and rating distribution charts.
- **Features:**
  - **Review Sentiment & Keyword Bias Engine:** Highlights coded language in performance feedback (e.g., flagging words like "aggressive" vs "assertive", "helpful" vs "strategic").
  - **Rating Skew Distribution Chart:** Visualizing performance score distributions across gender demographics to spot systemic grade deflation.
  - **Evaluator Bias Breakdown:** Identifies manager-level review trends requiring bias awareness coaching.

### Page 9: Promotion Analytics
- **Purpose:** Ensure equal advancement opportunities and detect promotion bottlenecks.
- **Layout:** Trend line graphs and career velocity heatmaps.
- **Features:**
  - **Promotion Rate Comparison:** Historical line chart comparing promotion rates year-over-year.
  - **Time-in-Role Wait Time Chart:** Horizontal bar chart displaying average months spent in title before promotion by gender.
  - **KPI vs Promotion Decision Matrix:** Scatter plot mapping objective performance metrics against actual promotion outcomes to spot unmerited advancement gaps.

### Page 10: Workplace Safety Portal (HR Case Management View)
- **Purpose:** Confidential administration and resolution portal for HR case officers.
- **Layout:** Kanban board + Detail Drawer layout (`New Reports` ➔ `Under Investigation` ➔ `Action Required` ➔ `Resolved`).
- **Features:**
  - **Case Cards:** Display Case ID (e.g., `#SAFE-8821`), Severity Tag (`Urgent`, `Standard`), Allegation Category (`Harassment`, `Discrimination`, `Bullying`), Submission Date, and Status.
  - **Encrypted Evidence Vault:** Secure viewer for submitted documents, screenshots, and text logs.
  - **Anonymous Communication Channel:** Two-way encrypted chat window allowing HR to communicate with the anonymous reporter without exposing identities.
  - **Investigation Audit Trail:** Timestamped log of internal notes and actions taken.

### Page 11: Employee Anonymous Reporting Portal (Employee View)
- **Purpose:** Safe, untraceable submission channel for employees reporting workplace harassment or bias.
- **Layout:** Single column focused wizard with soothing colors, high whitespace, and non-intrusive fonts.
- **Features:**
  - **Safety Header:** Quick Exit button (`Esc` key closes tab instantly and redirects to Google.com).
  - **Step 1: Incident Categorization:** Select category chips (Sexual Harassment, Pay Discrimination, Promotion Bias, Retaliation).
  - **Step 2: Incident Narrative:** Rich text editor for details with automatic PII warning prompt.
  - **Step 3: Evidence Attachment:** Drag-and-drop file uploader with automated EXIF metadata stripping.
  - **Step 4: Unique Claim Passkey Generation:** Generates a 24-character cryptographic key for the employee to return and check status anonymously.

### Page 12: Compliance & Reports
- **Purpose:** Automated report generation for regulatory compliance (ESG, EEO-1, Corporate Social Responsibility).
- **Layout:** Document preview style page with export controls.
- **Features:**
  - **Overall Scorecard Summary Card:** Displaying overall Equality Score (Hiring, Pay, Promotion, Safety).
  - **Compliance Standard Selector:** Toggles for EEO-1 standard, ESG Gender Inclusion Framework, or Custom Org Metrics.
  - **Report Builder Controls:** Checkbox selection for metrics to include in generated executive PDFs.
  - **One-Click Export:** `[ Export PDF Audit Report ]` and `[ Export Anonymized CSV ]`.

### Page 13: Settings / Organization Profile
- **Purpose:** Admin settings for configuring platform rules, thresholds, and integrations.
- **Layout:** Standard settings sidebar menu (Org Profile, Bias Thresholds, Anonymization Rules, User Roles, Integrations).
- **Features:**
  - **Anonymization Strictness Controls:** Sliders adjusting which resume fields are auto-redacted.
  - **Bias Alert Sensitivity Sliders:** Set threshold percentages for automated pay gap and promotion warnings (e.g., trigger alert when gap > 5%).
  - **Role-Based Access Control (RBAC):** Permission matrix for HR Admins, Department Managers, and External Auditors.
  - **HRIS Integration Connections:** Status badges for integrations (Workday, BambooHR, Greenhouse, Lever).

---

## 5. Dashboard Widgets Specification Matrix

| Widget Name | Target Page | Primary Graphic Type | Key Metrics Displayed | Interactive Action |
|---|---|---|---|---|
| **Equality Score Ring** | HR Dashboard, Compliance | Circular SVG Gauge | Overall Score (0-100), Delta vs Last Qtr | Click to expand sub-score modal |
| **Gender Ratio Donut** | HR Dashboard, Analytics | Donut Chart | M/F/Non-Binary/Unspecified % | Filter by Department |
| **Hiring Funnel Bar** | HR Dashboard, Analytics | Horizontal Funnel Bar | Applied ➔ Offered ratio by gender | Click stage for candidate details |
| **Pay Gap Flag Card** | HR Dashboard, Pay Equity | Stat Display + Coral Flag | Unexplained pay gap % (IBM Plex Mono) | Click "Run Pay Audit" |
| **Department Diversity** | Analytics | Stacked Horizontal Bar | Dept breakdown vs Company target | Hover for headcounts |
| **Bias Alert Stream** | HR Dashboard | Notification Feed Card | Department name, alert severity, anomaly delta | Click to open investigation view |
| **Open Safety Cases** | HR Dashboard, Safety | Counter Badge Matrix | Open / Pending / Resolved count | Click to switch to Safety Portal |
| **Promo Wait-Time Chart**| Promotion Analytics | Grouped Bar Chart | Months in position by demographic | Filter by seniority band |
| **Recent Activity Audit** | HR Dashboard, Settings | Timeline List | Timestamp, Action Taken, User ID | Filter activity type |

---

## 6. Motion, Transitions & Micro-Interactions

- **Page Load:** Micro-fade-in (`150ms ease-out`) on main content panels to prevent layout shift.
- **Equality Score Ring Animation:** Clockwise sweep fill on load (`600ms cubic-bezier(0.16, 1, 0.3, 1)`). Rings pause at target percentage with a subtle count-up timer on the number display.
- **Redaction Strike Animation:** When switching to Anonymized view, redaction blocks slide horizontally over PII text with a sleek scanner line effect (`300ms`).
- **Alert Badge Pulse:** Critical bias alert badges feature a single gentle glow ripple on page load to draw focus without recurring distraction.
- **Reduced Motion:** Fully complies with `prefers-reduced-motion: reduce`. All structural animations collapse to instant state switches when enabled.

---

## 7. Accessibility (a11y) & Safety Principles

1. **Color Contrast & Readability:**
   - All text combinations strictly maintain a contrast ratio higher than **4.5:1** for standard text and **3.0:1** for large metrics, fulfilling WCAG 2.1 AA standards.
   - Information is never encoded by color alone; every alert or metric badge features dual-encoding (icon + text label + numeric figure).
2. **Keyboard Navigation & Screen Readers:**
   - Logical tab order across all dashboards, data tables, and modal drawers.
   - All interactive elements feature custom visible focus outlines (`2px solid #3FA796`).
   - Accessible ARIA attributes (`aria-expanded`, `aria-label`, `role="status"`, `role="progressbar"`) applied across all widgets.
3. **Psychological Safety in Harassment Portal:**
   - High whitespace, neutral calm color palette (avoiding alarming red/coral in reporting flows).
   - "Quick Exit" button persistently pinned to upper right corner.
   - Zero client-side session history caching during reporting flows.