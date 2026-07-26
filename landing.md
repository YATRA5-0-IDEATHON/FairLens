# EquiHire AI – Landing Page Design Specification

## Design Philosophy

The landing page should feel like a premium AI SaaS product similar to **Linear, Vercel, Arc Browser, Stripe, and Apple**. The overall experience should be minimal, elegant, modern, and highly polished, with generous whitespace, subtle animations, glassmorphism, and soft gradients. Every section should tell a story rather than simply listing features. The visual language should communicate **trust, fairness, transparency, intelligence, and innovation**.

---

# Overall Style

**Keywords**

- Minimal
- Premium
- Elegant
- Soft
- Airy
- Enterprise
- Human-Centered
- AI-Powered
- Trustworthy
- Accessible

Avoid:

- Heavy admin dashboard aesthetics
- Bootstrap-style layouts
- Excessive borders
- Too many colors
- Overcrowded sections

---

# Color Palette

## Primary

```css
#6C63FF
```

Soft Indigo

---

## Secondary

```css
#A78BFA
```

Lavender

---

## Success

```css
#22C55E
```

---

## Warning

```css
#F59E0B
```

---

## Error

```css
#EF4444
```

---

## Background

```css
#FCFCFF
```

---

## Hero Gradient

```css
#FFFFFF

↓

#F4F2FF

↓

#EEF2FF
```

Add very subtle blurred gradient blobs behind the hero.

---

## Text

Primary

```css
#111827
```

Secondary

```css
#6B7280
```

---

# Typography

## Heading Font

- Playfair Display
- Cormorant Garamond

Large Hero Title

- 68–72px
- Bold
- Tight letter spacing

---

## Body Font

- Inter
- Plus Jakarta Sans

Body

- 16–18px

Small Text

- 14px

---

# Page Structure

---

# Navigation

Floating transparent navbar

Contents:

- Logo
- Features
- Platform
- Solutions
- About
- GitHub
- Login
- Get Started

The "Get Started" button should have a dark background with rounded corners.

Navbar should become slightly blurred on scroll.

---

# Hero Section

Height:

100vh

Background:

- Soft gradient
- Blurred floating blobs
- Tiny animated particles
- Light glassmorphism

Left Side:

Large headline

> AI-powered workplace fairness for every employee.

Subtitle

> Eliminate hiring bias, detect pay disparities, ensure fair promotions, and build a safer, more inclusive workplace.

Buttons

- Try Demo
- Watch Demo

Right Side

Instead of a static dashboard image, display a floating browser window showing:

- Resume upload
- AI anonymization
- Skills extraction
- Technical keywords
- Candidate score
- Hiring recommendation
- Gender identifiers automatically hidden

Around the browser, place floating glass cards containing:

- Equality Score
- ATS Compatibility
- Skills Extracted
- Bias Removed
- Promotion Ready
- Fairness Verified

These cards should gently float using Framer Motion.

---

# Trusted By

Horizontal scrolling company logos.

Monochrome logos with subtle opacity.

Infinite marquee animation.

---

# Problem Statement

Two-column layout.

Left:

Illustration showing the employee lifecycle.

Hiring

↓

Performance Reviews

↓

Promotion

↓

Pay

↓

Workplace Safety

Right:

Animated statistics.

Example:

- 42% report workplace bias
- 15% average unexplained pay gap
- 63% lack fairness analytics

Numbers animate when entering the viewport.

---

# Feature Section

Large Bento Grid.

Cards include:

## Blind Resume Screening

- AI anonymization
- Skill extraction
- Resume scoring

---

## Pay Equity Audit

- Salary comparisons
- Pay gap detection
- Department analysis

---

## Performance Review Analysis

- Bias detection
- Sentiment analysis
- Fairness metrics

---

## Promotion Fairness

- Promotion analytics
- Leadership pipeline
- Career progression

---

## Workplace Safety

- Anonymous reporting
- Case tracking
- Resolution analytics

---

## Compliance Reports

- Equality score
- Audit logs
- Export reports

Each card should have:

- Glass background
- Rounded corners
- Hover lift
- Soft shadow
- Animated icon

---

# Product Preview

Large browser mockup.

Show the actual EquiHire dashboard.

Automatically cycle through:

- HR Dashboard
- Resume Screening
- Pay Equity
- Promotion Analytics
- Performance Review
- Compliance Reports

Smooth fade transitions.

---

# Workflow

Horizontal timeline.

Upload Resume

↓

AI Removes Personal Information

↓

HR Reviews Skills

↓

Candidate Selected

↓

Employee Analytics

↓

Promotion Review

↓

Compliance Report

Each step animates while scrolling.

---

# AI Assistant Section

Glass chat interface.

Example conversation:

**HR**

> Why was Candidate A shortlisted?

**AI**

> Candidate A matched 94% of the required skills, demonstrated stronger project experience, and all personal identifiers were removed to ensure a bias-free evaluation.

Floating chat bubbles with subtle animations.

---

# Statistics

Large centered numbers.

Examples:

- 98% Resume Anonymization Accuracy
- 92% Fairness Score
- 84% Hiring Bias Reduction
- 4× Faster Candidate Review

Use animated counters.

---

# Testimonials

Three large testimonial cards.

Include:

- Employee photo
- Name
- Role
- Company
- Quote

Hover animation with glassmorphism.

---

# Final CTA

Large centered section.

Background:

Soft gradient.

Headline

> Build a Fairer Workplace with AI.

Buttons

- Start Free
- Book Demo

---

# Footer

Minimal footer.

Include:

- Product
- Features
- Resources
- Documentation
- GitHub
- Privacy Policy
- Contact

---

# Animation Guidelines

Use Framer Motion throughout.

Animations should include:

- Fade In
- Slide Up
- Scale
- Parallax
- Floating cards
- Count-up statistics
- Hover lift
- Button ripple
- Smooth page transitions
- Scroll reveal
- Glass hover effects
- Floating gradient blobs

Animations should feel smooth and subtle, never distracting.

---

# UI Libraries

## Components

- shadcn/ui
- Magic UI
- Aceternity UI
- Origin UI

---

## Animations

- Framer Motion
- Motion Primitives
- React Bits

---

## Icons

- Lucide Icons

---

## Charts

- Recharts
- Tremor

---

## Illustrations

- Storyset
- unDraw

---

# Background Effects

Use:

- Aurora Background
- Background Beams
- Animated Grid Pattern
- Particles
- Dot Pattern
- Floating Gradient Blobs
- Soft Shadows
- Glassmorphism
- Mouse-based Parallax

---

# Design Principles

- Use generous whitespace to create a clean, premium feel.
- Limit the color palette to soft indigo, lavender, white, and neutral grays.
- Maintain consistent spacing, rounded corners, and subtle shadows throughout.
- Prioritize smooth, meaningful animations over flashy effects.
- Ensure every section supports the story of building a fair and unbiased workplace.
- Keep the landing page focused on trust, transparency, and AI-driven gender equality rather than generic HR management.