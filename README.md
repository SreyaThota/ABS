# ABS AI — Academic-to-Career AI

**Top 5 at the GDG BTU "Build with AI" hackathon (April 2026, team of 5).**
Live demo: https://abs-zeta.vercel.app

Upload lecture notes and the app generates a summary, key concepts, next steps, skill mapping, career-relevance insights, resume-ready bullet points and a career-readiness score, plus a quiz and a career chat.

## My part
CI/CD and deployment (build pipeline and deployment on Google Cloud). I did not write the application code. The front end was generated with Lovable and shaped by the team, which is why most commits are from `gpt-engineer-app[bot]`.

## How it works
- React + Vite + TypeScript front end (shadcn/ui, Tailwind).
- Supabase backend with three edge functions: `process-learning`, `generate-quiz`, `career-chat`.
- The functions call a hosted LLM (`google/gemini-2.5-flash` appears in the code).

## Run locally
```bash
npm install
cp .env.example .env     # then fill in your own Supabase project values
npm run dev
npm test
```

## Notes
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`. Real values are not committed.
- Hackathon prototype: no evaluation of the generated insights or the readiness score has been done.
