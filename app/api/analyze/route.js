export const runtime = "edge";

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
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return Response.json({ error: "ANTHROPIC_API_KEY missing" }, { status: 500 });

  const { input, isUrl } = await req.json();
  if (!input) return Response.json({ error: "No input provided" }, { status: 400 });

  const userMsg = isUrl
    ? `Analyze this job posting URL: ${input}`
    : `Analyze this job description:\n\n${input}`;

  const tryFetch = async (withSearch) => {
    const body = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMsg }],
      ...(withSearch ? { tools: [{ type: "web_search_20250305", name: "web_search" }] } : {}),
    };
    return fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        ...(withSearch ? { "anthropic-beta": "web-search-2025-03-05" } : {}),
      },
      body: JSON.stringify(body),
    });
  };

  let res = await tryFetch(isUrl);
  if (!res.ok) res = await tryFetch(false);

  const data = await res.json();
  const text = (data.content ?? []).filter(b => b.type === "text").map(b => b.text).join("\n");
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
