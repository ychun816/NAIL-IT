export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a career advisor analyzing job listings for a student seeking a stage alternance in France.

## SCORING MODE — read this first

There are two modes depending on whether the user provided preferences:

### MODE A — Preferences provided (one or more non-empty preference keywords)
IGNORE the default profile below entirely. Score ONLY based on how well the job matches the user's preference keywords.
- If the job strongly matches the preference keywords → high fitScore (70–100)
- If the job partially matches → medium fitScore (30–69)
- If the job does not match the preferences at all → fitScore 0, category "other"
- The preferences can be ANYTHING: marketing, design, law, finance, communication, tech fields, etc.
- Do NOT penalize a job for being non-technical if the user's preferences are non-technical.

### MODE B — No preferences provided (all preference fields are empty)
Use the default profile below as the scoring criteria:
- Top priority: Cloud / DevOps (AWS, GCP, Azure, Kubernetes, Docker, Terraform, CI/CD, IaC)
- Secondary: Backend & Data (Node.js, Python, Java, Go, APIs, databases, SQL, analytics)
- Also relevant: Frontend (React, Vue, Angular, CSS, UI), AI (ML, LLM, NLP, computer vision)
- Tertiary: Fullstack
- Jobs with no overlap with the above → fitScore 0, category "other"

## Category rules
- cloud_devops: cloud, DevOps, infrastructure, CI/CD, containers, SRE
- backend: server-side, APIs, databases, data engineering, data analyst, data analysis, business intelligence, BI, SQL, analytics, Tableau, Looker, Power BI, ETL, data warehouse
- frontend: UI, web, React, Vue, Angular, CSS
- ai: machine learning, LLM, NLP, computer vision, data science, deep learning, AI research
- fullstack: both frontend and backend
- other: anything else (marketing, communication, design, HR, finance, etc.) — can still have a high fitScore in MODE A if it matches preferences

Note: "data analyst" and "business intelligence" roles belong to the "backend" category, NOT "ai" and NOT "other".

Return ONLY a valid JSON object in ENGLISH — absolutely no markdown, no prose, raw JSON only:
{
  "title": "exact job title in English",
  "company": "company name or empty string",
  "category": "cloud_devops" | "backend" | "frontend" | "ai" | "fullstack" | "other",
  "fitScore": <integer 0-100>,
  "salary": "e.g. $1500/month or Not specified",
  "location": "City, Country",
  "intro": "2-3 sentence summary in English of the role and why it matters for the student",
  "techStack": ["tech1","tech2","tech3"],
  "toApply": <true only if category is cloud_devops>,
  "fitReason": "one sentence in English explaining the fit score"
}`;

export async function POST(req) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

  const { input, isUrl, preferences } = await req.json();
  if (!input) return Response.json({ error: "No input provided" }, { status: 400 });

  const prefsLine = preferences?.length
    ? `\n\nMODE A — score against these preferences only (ignore default tech profile): ${preferences.join(", ")}`
    : `\n\nMODE B — no preferences, use the default tech profile.`;

  const userMsg = isUrl
    ? `Analyze this job posting URL: ${input}${prefsLine}`
    : `Analyze this job description:\n\n${input}${prefsLine}`;

  const fullPrompt = `${SYSTEM_PROMPT}\n\n${userMsg}`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: fullPrompt }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.0,
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  if (!res.ok || data?.error) {
    return Response.json(
      {
        error: "Gemini API request failed",
        status: res.status,
        details: data?.error?.message || "Unknown Gemini API error",
      },
      { status: 500 }
    );
  }

  const text = (data.candidates?.[0]?.content?.parts ?? []).map(p => p.text).join("\n");
  const clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const m = clean.match(/\{[\s\S]*\}/);
  if (!m) return Response.json({ error: "No JSON returned", raw: text }, { status: 500 });

  try {
    const parsed = JSON.parse(m[0]);
    parsed.toApply = parsed.category === "cloud_devops";
    return Response.json(parsed);
  } catch {
    return Response.json({ error: "JSON parse failed", raw: m[0] }, { status: 500 });
  }
}
