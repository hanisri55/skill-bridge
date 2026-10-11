# SkillBridge AI — Product Direction & Design Decisions

## Product analysis

SkillBridge AI is a career intelligence operating system for students and early-career professionals. The primary product loop is not conversation-first: it is **claim → evidence → assessment → verified skill → gap → readiness → opportunity → impact → roadmap**. The frontend therefore needs to make that loop visible, explainable, and actionable across a focused dashboard shell. The first implementation uses realistic local demo data and local persistence, while keeping entities and service boundaries explicit for a future FastAPI + AI orchestration + PostgreSQL/Supabase stack.

## Three stylistic approaches

### Theme Name: Signal Atlas

Very Brief Intro: A calm, editorial data-visualization system where navy panels, indigo signals, and cyan wayfinding turn career progress into an intelligible map. It feels like a trusted intelligence console without looking militaristic or overly futuristic.

Probability: 0.04

### Theme Name: Quiet Momentum

Very Brief Intro: A warm, light-first productivity workspace with paper-white surfaces, mineral neutrals, and a single electric blue accent. The tone is optimistic and human, making progress feel achievable through gentle structure.

Probability: 0.07

### Theme Name: Midnight Relay

Very Brief Intro: A restrained dark product system built around deep navy, precise grid lines, and restrained cyan motion. It gives the experience a premium technical edge while keeping content more important than spectacle.

Probability: 0.02

## Chosen approach: Signal Atlas

### Design Movement

Contemporary editorial data design with references to Swiss information systems, modern SaaS command centers, and observability dashboards. The interface treats every metric as a signal with provenance, not as decoration.

### Core Principles

1. Make evidence visible: every strong claim should have a clear source, confidence, or verification state.
2. Use calm hierarchy: navy, indigo, and cyan create directional emphasis without a loud neon aesthetic.
3. Turn progression into a map: skill dependencies, gaps, matches, and roadmap steps should feel connected.
4. Prefer useful density over empty ornament: compact but breathable cards, purposeful whitespace, and short explanatory copy.

### Color Philosophy

Deep navy (#0B1220) is the anchor for trust and focus. Light backgrounds (#F8FAFC) create reading comfort for dense insight pages. Indigo (#4F46E5) marks decisions and primary action. Cyan (#06B6D4) is the ownable signal color for verified evidence, momentum, and live connections. Slate neutrals carry secondary information. Gradients are used sparingly as ambient atmosphere behind network visuals, never as a substitute for hierarchy.

### Layout Paradigm

A persistent left intelligence rail and a wide working canvas. The dashboard uses offset panels, a signal strip, and split compositions rather than a centered marketing grid. Detail pages pair a strong metric column with an evidence/workbench column. On mobile, the rail collapses into a bottom navigation tray and page sections become vertically sequenced signal cards.

### Signature Elements

1. The SkillNetworkBackground: a faint constellation of nodes, curved paths, moving particles, and a low-contrast grid.
2. Signal chips: compact status labels such as VERIFIED, HIGH PRIORITY, and ESTIMATE with a small leading dot and strong semantic color.
3. Atlas connectors: thin indigo/cyan lines and numbered nodes that visually join steps across the roadmap and dependency graph.

### Interaction Philosophy

Interactions should reveal the next layer of reasoning. Hovering a skill previews its evidence; selecting a gap updates the impact simulator; starting an assessment confirms the selected question set and preserves it through refresh. Buttons feel decisive but not theatrical, with tactile press states and short transitions.

### Animation

Use opacity and transform-only motion under 280ms for controls. The SkillNetworkBackground uses slow, low-opacity drift and path traversal, paused or reduced under prefers-reduced-motion. Dashboard cards reveal in a 40ms stagger. Assessment transitions slide a few pixels horizontally and never distract from the question. Roadmap nodes pulse only for the active step. No bouncing, perpetual zooming, or high-frequency particle storms.

### Typography System

Use **Manrope** for interface copy and **Space Grotesk** for display numbers, headlines, and signal labels. Display headlines are tight and slightly letter-spaced; body copy is 14–16px with generous line-height. Numeric metrics use tabular figures. Labels are uppercase, 10–11px, semibold, and tracked for an instrument-panel feel.

### Brand Essence

SkillBridge AI turns uncertain career claims into a clear, evidence-backed path toward the next opportunity for ambitious students and early-career builders.

Personality adjectives: **clear, discerning, catalytic**.

### Brand Voice

Headlines are direct and specific. CTAs describe the next useful action. Microcopy explains why a signal exists and distinguishes estimates from guarantees.

Example line: “Know what you can prove. Then close the gap that matters.”

Example line: “Docker is your highest-impact next move for AI/ML Engineer roles.”

### Wordmark & Logo

The mark is a compact, text-free symbol: two offset indigo rails joined by a cyan diagonal signal node, suggesting a connection without drawing a literal bridge. It sits beside a custom wordmark treatment where “Skill” is set in Manrope semibold and “Bridge” receives a cyan signal underline. The generated symbol is used in the app header and favicon.

### Signature Brand Color

**Signal Cyan #06B6D4** — the visual proof point that a skill has moved from claim to verified signal.

## Architecture vocabulary

The UI is organized around domain concepts that map cleanly to future persistence: User, Profile, Skill, SkillEvidence, Question, Assessment, AssessmentAnswer, AssessmentResult, Job, SkillGap, Roadmap, RoadmapItem, and Notification. Demo services expose deterministic functions for question selection, adaptive difficulty updates, scoring, readiness calculations, job matching, and roadmap priority so they can later be replaced by API clients without rewriting page components.

## Style decisions

- Avoid literal bridge illustrations, robot imagery, fake testimonials, and excessive glassmorphism.
- Keep the assessment background quiet and content-first.
- Treat simulation values as estimates and show the disclaimer wherever simulated outcomes appear.
- Never fabricate customer reviews, ratings, or testimonials.
- Preserve responsive behavior: no horizontal scroll, clipped charts, or inaccessible controls.

## Style Decisions

The first visual review confirmed that the Signal Atlas direction is strongest when it behaves like an intelligence operating system rather than a generic SaaS dashboard. The shell therefore keeps a persistent wide-canvas intelligence rail on desktop, with a fixed overlay only at mobile breakpoints. Atlas visuals are connective: light analytical surfaces use faint cartography grids and signal nodes, while dark surfaces use flowing routes and milestone nodes. The SkillBridge wordmark keeps the compact rail-and-node mark plus a cyan signal underline as a recurring brand anchor. Assessment surfaces use disciplined grid-and-node texture instead of broad decorative washes. The roadmap canvas uses explicit high-contrast light text against its dark network field.

## Living Skill Flow revision

The background language now represents **Skills → Knowledge → Growth → Opportunities** as a calm, connected career environment. Cosmic, galaxy, star-field, cyberpunk, and oversized glow treatments are removed from the active visual system. The reusable background uses slow curved career paths, a restrained set of traveling data points, minimal skill-connection nodes, translucent ambient shapes, and quiet gradient ribbons. Landing and roadmap use rich motion; dashboard, skills, gaps, readiness, jobs, and impact use subtle motion; assessment, forms, and settings use minimal motion. Dark mode is the primary premium experience, while light mode uses the same paths and nodes on a soft blue-gray environment. All motion is low-opacity, purpose-driven, responsive, lightweight, and disabled or reduced under prefers-reduced-motion.
