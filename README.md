# SkillBridge AI

SkillBridge AI is an evidence-first career intelligence workspace for early-career technologists. It connects claimed skills to supporting evidence, adaptive assessment results, skill gaps, career readiness, job opportunities, estimated skill impact, and a personalized learning roadmap. The current release is a polished frontend demo powered by realistic local data and browser persistence, with service boundaries designed for a future FastAPI, AI orchestration, and Supabase/PostgreSQL implementation.

## Product capabilities

The application includes a branded landing experience, login and registration flows, profile onboarding, resume-analysis simulation, a skills portfolio, evidence signals, skill-gap analysis, career-readiness scoring, explainable job matching, a skill-impact simulator, a personalized roadmap, analytics, market intelligence, a contextual career assistant, notifications, and settings. The assessment engine creates exactly ten questions per attempt from a larger topic-diverse question bank, avoids recent repetition, adapts difficulty based on responses, randomizes answer options, persists an attempt through refreshes, and stores completed history locally.

The visual system is a single dark navy **Living Skill Flow** environment. Slow curved paths, skill nodes, data points, and restrained gradient ribbons express the relationship between skills, knowledge, growth, and opportunities. Rich, subtle, and minimal motion levels are used according to context, and non-essential motion respects `prefers-reduced-motion`.

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS 4, custom CSS design tokens |
| Routing | Wouter |
| UI primitives | shadcn/ui and Radix UI |
| Icons and motion | Lucide React, CSS transitions and keyframes |
| Data visualization | Recharts |
| Notifications | Sonner |
| Current data layer | Typed mock data and localStorage adapters |
| Future backend target | FastAPI, AI orchestration, Supabase/PostgreSQL |

## Getting started

Use Node.js 20 or newer and pnpm. From the project root, install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

The development server runs on the Vite host URL shown in the terminal. To validate the project before deployment, run:

```bash
pnpm check
pnpm build
```

The production build creates the browser bundle in `dist/public` and bundles the lightweight server entrypoint into `dist/index.js`. Start the built application with:

```bash
pnpm start
```

No environment file is required for the current demo. If future integrations need secrets, keep them in an ignored `.env` file and add only non-sensitive variable names and safe placeholders to `.env.example`. Never commit API keys, access tokens, passwords, private keys, or production credentials.

## Project structure

```text
client/
  public/                 Small public configuration files only
  src/
    components/           App shell, shared visuals, and UI primitives
    contexts/             Theme and application contexts
    data/                 Domain types and realistic demo datasets
    lib/                  Assessment engine, storage, and utility adapters
    pages/                Landing, auth, assessment, and workspace pages
    App.tsx               Route map and top-level providers
    index.css             Living Skill Flow design system and responsive CSS
  index.html              Document shell, metadata, and font loading
server/
  index.ts                Static production server entrypoint
shared/
  const.ts                Shared compatibility constants
ideas.md                  Product and visual design contract
todo.md                   Implementation and delivery checklist
package.json              Scripts and dependencies
vite.config.ts            Vite configuration
tsconfig.json              TypeScript configuration
```

## Architecture notes

Domain vocabulary is centralized in `client/src/data/types.ts`, while demo data is isolated in `client/src/data/mockData.ts`. `client/src/lib/assessmentEngine.ts` owns question selection, adaptive difficulty, scoring, and attempt persistence. `client/src/lib/storage.ts` is the browser persistence boundary for profile and assessment state; it can later be replaced with API clients without rewriting page components. This separation keeps the current static experience functional while leaving clear seams for authentication, resume parsing, AI recommendations, evidence uploads, jobs data, and database synchronization.

## Security and repository hygiene

The repository excludes dependency directories, build output, environment files, logs, screenshots, local databases, credentials, keys, and generated Manus metadata through `.gitignore`. Review `git diff --cached` before committing any integration changes, and use a secret manager or deployment environment variables for production credentials rather than source files.

## License

No license has been selected yet. Add the project’s intended license before public distribution.
