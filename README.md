# NAIL-IT — AI Job Analyzer for Stage / Alternance Hunters

> Built by a foreigner navigating the French job market
> For IT students drowning in job descriptions (Or students in other fields too!)

---

<p align="center">
  <img width="892" src="https://github.com/user-attachments/assets/8a221613-7e7a-414c-9b16-b78a12c0e600" alt="image" />
</p>

  
## Index
- [Why Create This App](#why-create-this-app)
- [Project Goals](#project-goals)
- [Tech Stack](#tech-stack)
- [App Structure](#app-structure)
- [Quickstart](#quickstart)
  - [Live App](#live-app)
  - [Local Dev](#local-dev)
- [How to Use](#how-to-use)


---

## Why Create This App

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
- Get familiar **Javascriptt** syntax in a real project context
- Try out **Claude Code** as an AI-assisted development workflow

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | File-based routing + built-in API routes — no separate backend needed |
| Language | JavaScript (JSX) | Faster to iterate without type overhead for a small solo project |
| UI Library | React 18 | Component model makes it easy to break UI into reusable pieces |
| AI / LLM | Gemini 1.5 Flash — Google Generative Language API | Free tier available, fast inference, good structured JSON output |
| Styling | Global CSS + custom `Stora` font | No framework overhead — full control, keeps the custom aesthetic |
| Deployment | Vercel | Zero-config Next.js hosting, automatic deploys from GitHub |
| Storage | `localStorage` (no backend DB) | No auth, no server cost — good enough for a personal daily tool |

---

## App Structure

```
NAIL-IT/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.js        ← Edge API route — sends JD to Gemini, returns structured JSON
│   ├── components/
│   │   ├── ui.jsx              ← Star, Panel, PanelHeader, Tag, Btn, FitMeter
│   │   └── JobRow.jsx          ← Table row + expanded detail row
│   ├── lib/
│   │   ├── constants.js        ← Palette, category data, helpers
│   │   └── translations.js     ← EN / FR / CH strings
│   ├── globals.css             ← Aura-Grit design tokens + base styles
│   ├── layout.jsx              ← Root layout + font loading
│   └── page.jsx                ← State, effects, top-level layout
├── public/
│   ├── fonts/
│   │   ├── Stora.otf
│   │   └── Stora-Light.otf
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

---

## Other Notes 

### Git — Revert to a Specific Commit

```bash
# See the commit history
git log --oneline

# Reset your local branch to a specific commit (replaces all files)
git reset --hard <commit-hash>

# Force push to update GitHub (overwrites remote history)
git push --force
```

> Example: `git reset --hard b70316f && git push --force`
> Warning: force push removes all commits after the target. Make sure you want to lose them.
