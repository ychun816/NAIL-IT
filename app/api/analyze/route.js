export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are a career advisor analyzing job listings for a frontend/cloud engineering student seeking a stage alternance in France.

Student profile:
- Seeking "stage alternance" in France (work-study program)
- Top priority: Cloud / DevOps (AWS, GCP, Azure, Kubernetes, Docker, Terraform, CI/CD, IaC)
- Secondary: Backend (Node.js, Python, Java, Go, APIs, databases)
- Tertiary: Fullstack
- Also considers: Frontend (React, Vue, TypeScript)

Return ONLY a valid JSON object — absolutely no markdown, no prose, raw JSON only:
{
  "title": "exact job title",
  "company": "company name or empty string",
  "category": "cloud_devops" | "backend" | "fullstack" | "frontend" | "other",
  "fitScore": <integer 0-100>,
  "salary": "e.g. 1200€/mois or Non précisé",
  "location": "City, Country",
  "intro": "2-3 sentence summary of the role and why it matters for the student",
  "techStack": ["tech1","tech2","tech3"],
  "toApply": <true only if category is cloud_devops>,
  "fitReason": "one sentence explaining the fit score"
}`;

export async function POST(req) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });

  const { input, isUrl, preferences } = await req.json();
  if (!input) return Response.json({ error: "No input provided" }, { status: 400 });

  const prefsLine = preferences?.length
    ? `\n\nCandidate preferences: ${preferences.join(", ")}`
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
      maxOutputTokens: 200,
      temperature: 0.0,
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${key}`,
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
