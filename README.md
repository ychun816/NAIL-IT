# JobMatch Y2K — Alternance Analyzer

AI-powered job analyzer for stage alternance hunting in France.
Paste job URLs or JDs → get a full fit score table, sorted by Cloud/DevOps → Backend → Fullstack.

## Stack
- Next.js 14 (App Router)
- Claude Sonnet via Anthropic API (server-side Edge route)
- Zero external dependencies beyond Next.js

---

## 🚀 Deploy to Vercel (3 steps)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "init jobmatch y2k"
gh repo create jobmatch-y2k --public --push
```

### 2. Import on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy** (it will fail — you need step 3)

### 3. Add your API key
1. In Vercel → your project → **Settings → Environment Variables**
2. Add: `ANTHROPIC_API_KEY` = `sk-ant-...`
3. Click **Save** then **Redeploy**

Done ✦

---

## 🛠 Local Development

```bash
cp .env.example .env.local
# edit .env.local and add your ANTHROPIC_API_KEY

npm install
npm run dev
# → http://localhost:3000
```

---

## Features
- Paste multiple job URLs or raw JDs (separated by `---`)
- AI analysis: title, category, fit score 0-100, salary, location, tech stack
- Auto-sorted: Cloud/DevOps → Backend → Fullstack → Frontend
- Auto-tagged "TO APPLY" for Cloud/DevOps matches (toggleable)
- Click any row to expand details (intro + fit reason + full stack)
- Persistent storage via localStorage
- Risograph / collage design — baby blue · hot pink · neon green · vintage black

---

## test erros 

### test if gemini ai is working
```
cd '/Users/chun/👺CODE/NAIL-IT' && curl -s -X POST http://localhost:3000/api/analyze -H 'Content-Type: application/json' -d '{"input":"test job desc","isUrl":false,"preferences":[]}'

# When the key was missing or wrong, this command returned:
# {"error":"GEMINI_API_KEY missing","status":500}
```
