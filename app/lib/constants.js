/* ─── palette ─────────────────────────────────── */
export const C = {
  /* Aura-Grit tokens */
  cobalt:    "#4A72E4",
  auraOuter: "#F0949F",
  auraMid:   "#F7A376",
  auraCore:  "#FDE4C9",
  /* UI */
  cream:  "#FFFFFF",
  black:  "#1A2060",
  paper:  "#3A5AC4",
  border: "rgba(255,255,255,0.18)",
  muted:  "rgba(255,255,255,0.5)",
  /* accents */
  blue:   "#5BC8F5",
  pink:   "#F0949F",
  green:  "#BAFF29",
  yellow: "#FFE135",
  purple: "#C084FC",
  red:    "#FF5555",
};

/* ─── constants ───────────────────────────────── */
export const CAT_ORDER = ["cloud_devops","backend","frontend","ai","fullstack","other"];
export const CAT_META = {
  cloud_devops: { label:"☁ Cloud & DevOps",   color:"#4ECDC4", bg:"#4ECDC420" },
  backend:      { label:"⚙ Backend & Data",   color: C.green,  bg:"#BAFF2920" },
  frontend:     { label:"◻ Frontend",         color: C.purple, bg:"#C084FC20" },
  ai:           { label:"✦ AI",               color: C.auraMid,bg:"#F7A37620" },
  fullstack:    { label:"◈ Fullstack",        color: C.pink,   bg:"#F0949F20" },
  other:        { label:"· Other",            color:"#AAA",    bg:"#AAAAAA20" },
};
export const fitColor = s =>
  s >= 80 ? C.green : s >= 60 ? C.blue : s >= 40 ? C.yellow : C.pink;

export const STORAGE = "jm_jobs_v4";

export function isURL(s) { return /^https?:\/\//i.test(s.trim()); }
export function parseEntries(txt) {
  const blocks = txt.split(/\n(?:---+|\n+)/).map(b => b.trim()).filter(Boolean);
  if (blocks.length === 1) {
    const lines = blocks[0].split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.every(isURL)) return lines;
  }
  return blocks;
}
