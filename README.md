# NAIL-IT — AI Job Analyzer for Alternance Hunters

> Built by a foreigner navigating the French job market
> For IT students drowning in job descriptions (Or students in other fields too!)

---

## Why This Exists

Hunting for an alternance/stage in France as a foreign IT student means reading through **dozens of job posts a day**, each with its own tech stack, vague requirements, and inconsistent formatting. It's exhausting to track which offers fit your profile, and even harder when you're still figuring out what "Bac+3 avec expérience en CI/CD" actually means in practice.

**NAIL-IT** was built to:
- Speed up the daily ritual of reading and evaluating job descriptions
- Make tech stacks easy to parse at a glance — no more googling every acronym
- Let you track and prioritize what to apply to, today

---

## Project Goals

This project was also a learning sandbox:

- Integrate a real AI service (Gemini via Google API) — learn basic API setup end-to-end
- Get hands-on with a frontend stack: **React**, **Next.js** , **vercel** deployment
- Explore **TypeScript** syntax in a real project context
- Try out **Claude Code** as an AI-assisted development workflow

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | JavaScript (JSX) |
| UI Library | React 18 |
| AI / LLM | Gemini 1.5 Flash — Google Generative Language API (Edge route) |
| Styling | Global CSS + custom `Stora` font |
| Deployment | Vercel |
| Storage | `localStorage` (no backend DB) |

---

## App Structure

```
NAIL-IT/
├── app/
│   ├── api/
│   │   └── analyze/            ← Edge API route — sends JD to Gemini, returns structured JSON
│   ├── globals.css             ← Aura-Grit design tokens + base styles
│   ├── layout.jsx              ← Root layout + font loading
│   ├── page.jsx                ← Main app page (input → table → detail panel)
│   └── next.config.js
├── public/
│   ├── fonts/
│   │   ├── Stora.otf
│   │   └── Stora-Light.otf
│   ├── red-pin.png
│   └── red-pin-nobg.png
├── package.json
└── next.config.js
```

---

## Quickstart

### Live App

[https://wow-nail-it.vercel.app](https://wow-nail-it.vercel.app)

### Local Dev

```bash
git clone https://github.com/ychun816/NAIL-IT.git
cd NAIL-IT
# create .env.local and add your key:
echo "GEMINI_API_KEY=AIza..." > .env.local

npm install
npm run dev
# → http://localhost:3000
```

---

## How to Use

- **Paste job descriptions** — drop raw JD text or job URLs into the input box, separated by `---`
- **Hit Analyze** — Gemini reads each offer and returns structured data: title, category, fit score (0–100), salary, location, and tech stack
- **Read the table** — results are auto-sorted by category: Cloud/DevOps → Backend → Fullstack → Frontend
- **Expand a row** — click any offer to see the full breakdown: intro summary, why it fits (or doesn't), and the complete stack list
- **Track applications** — offers flagged "TO APPLY" are auto-tagged for high-fit Cloud/DevOps roles; toggle manually as needed
- **Persist across sessions** — your analyzed offers are saved in `localStorage`, so nothing is lost on refresh
