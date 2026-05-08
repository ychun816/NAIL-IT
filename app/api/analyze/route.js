export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a career advisor analyzing job listings for a student seeking a stage alternance in France.

Default profile:
- Seeking "stage alternance" in France (work-study program)
- Top priority: Cloud / DevOps (AWS, GCP, Azure, Kubernetes, Docker, Terraform, CI/CD, IaC)
- Secondary: Backend & Data (Node.js, Python, Java, Go, APIs, databases, SQL, analytics)
- Also relevant: Frontend (React, Vue, Angular, CSS, UI), AI (ML, LLM, NLP, computer vision)
- Tertiary: Fullstack

Preference rules:
- If the user provides preferences, treat the top 3 preference inputs as the primary search keywords and matching criteria.
- Build the compatibility score, category, and fitReason mostly from those keywords.
- Match the job title, summary, responsibilities, and tech stack against those keywords.
- Examples of valid preferences include 3D, Angular, frontend, backend, data, data analyst, data scientist, Java, React, Python, AWS, or Kubernetes.
- If the preference list is empty, fall back to the default priority above.
- When preferences are present, they should drive the result more strongly than the default profile.
- When preferences are present, treat the default profile as a weak fallback only.
- If preferences mention technical fields, classify them according to the best matching domain.
- If preferences are empty, use the default profile above as the main matching logic.
- If preferences mention a niche area like data, data analyst, data scientist, or 3D, score them directly from the job content.
- If the job has no meaningful overlap with the candidate's preferences (or the default profile when no preferences are given), set category to "other" and fitScore to 0.

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
    ? `\n\nCandidate preferences (primary matching keywords): ${preferences.join(", ")}`
    : "";

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
