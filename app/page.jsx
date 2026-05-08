"use client";
import { useState, useEffect, useCallback, useRef } from "react";

/* ─── palette ─────────────────────────────────── */
const C = {
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
const CAT_ORDER = ["cloud_devops","backend","fullstack","frontend","other"];
const CAT_META = {
  cloud_devops: { label:"☁ Cloud / DevOps", color: C.blue,   bg:"#5BC8F520" },
  backend:      { label:"⚙ Backend",         color: C.green,  bg:"#BAFF2920" },
  fullstack:    { label:"◈ Fullstack",        color: C.purple, bg:"#C084FC20" },
  frontend:     { label:"✦ Frontend",         color: C.pink,   bg:"#FF6B9D20" },
  other:        { label:"· Other",            color:"#999",    bg:"#99999920" },
};
const fitColor = s =>
  s >= 80 ? C.green : s >= 60 ? C.blue : s >= 40 ? C.yellow : C.pink;

const STORAGE = "jm_jobs_v4";

function isURL(s) { return /^https?:\/\//i.test(s.trim()); }
function parseEntries(txt) {
  const blocks = txt.split(/\n(?:---+|\n+)/).map(b => b.trim()).filter(Boolean);
  if (blocks.length === 1) {
    const lines = blocks[0].split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.every(isURL)) return lines;
  }
  return blocks;
}

/* ─── decorative helpers ──────────────────────── */
const Star = ({ size=40, color=C.yellow, style={} }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink:0, ...style }}>
    <path d="M20 0 L22 16 L38 20 L22 24 L20 40 L18 24 L2 20 L18 16Z"
      fill={color} stroke={C.black} strokeWidth="1.5"/>
  </svg>
);

const Blob = ({ style={} }) => (
  <div style={{
    position:"absolute",
    borderRadius:"60% 40% 70% 30% / 50% 60% 40% 50%",
    background: "radial-gradient(circle, #FDE4C9 0%, #F7A376 50%, #F0949F 100%)",
    opacity: 0.45,
    filter: "blur(40px)",
    animation: "blobFloat 8s ease-in-out infinite",
    pointerEvents: "none",
    ...style,
  }} />
);

/* ─── Panel (cut-paper card) ──────────────────── */
const Panel = ({ children, accent=C.cream, style={} }) => (
  <div style={{
    background: C.paper,
    border: `2px solid ${C.border}`,
    borderRadius: 8,
    boxShadow: `4px 4px 0 ${accent}`,
    overflow:"hidden",
    position:"relative",
    zIndex:1,
    ...style,
  }}>
    {children}
  </div>
);

/* ─── PanelHeader ─────────────────────────────── */
const PanelHeader = ({ children, bg=C.black, color=C.cream }) => (
  <div style={{
    background: bg,
    color,
    fontFamily:"'Stora',sans-serif",
    fontSize: 15,
    letterSpacing: 3,
    padding: "8px 16px",
    borderBottom: `2px solid ${C.border}`,
    display:"flex",
    alignItems:"center",
    gap:8,
  }}>{children}</div>
);

/* ─── Tag/chip ────────────────────────────────── */
const Tag = ({ children, color=C.black, bg=C.yellow, onClick, style={} }) => (
  <button onClick={onClick} style={{
    fontFamily:"'Space Mono',monospace",
    fontSize: 10,
    fontWeight:700,
    letterSpacing:1,
    textTransform:"uppercase",
    padding:"4px 10px",
    borderRadius:20,
    border:`2px solid ${C.black}`,
    background: bg,
    color,
    cursor: onClick ? "pointer" : "default",
    boxShadow:"2px 2px 0 " + C.black,
    whiteSpace:"nowrap",
    transition:"transform .1s, box-shadow .1s",
    ...style,
  }}
  onMouseEnter={e => { if(onClick){ e.currentTarget.style.transform="translate(-1px,-1px)"; e.currentTarget.style.boxShadow="3px 3px 0 "+C.black; }}}
  onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="2px 2px 0 "+C.black; }}
  >{children}</button>
);

/* ─── GlossButton ─────────────────────────────── */
const Btn = ({ children, onClick, disabled, color=C.green, small=false }) => (
  <button onClick={onClick} disabled={disabled} style={{
    fontFamily:"'Stora',sans-serif",
    fontSize: small ? 13 : 15,
    letterSpacing:3,
    padding: small ? "7px 16px" : "10px 24px",
    border:`2.5px solid ${C.black}`,
    borderRadius:4,
    background: disabled ? "#ccc" : color,
    color: C.black,
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : `3px 3px 0 ${C.black}`,
    transition:"transform .1s, box-shadow .1s",
    whiteSpace:"nowrap",
  }}
  onMouseEnter={e => { if(!disabled){ e.currentTarget.style.transform="translate(-2px,-2px)"; e.currentTarget.style.boxShadow=`5px 5px 0 ${C.black}`;}}}
  onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=disabled?"none":`3px 3px 0 ${C.black}`; }}
  >{children}</button>
);

/* ─── FitMeter ────────────────────────────────── */
const FitMeter = ({ score }) => {
  const fc = fitColor(score);
  return (
    <div>
      <div style={{
        fontFamily:"'Bebas Neue',sans-serif",
        fontSize:22,
        color: fc,
        lineHeight:1,
        textShadow:`1px 1px 0 ${C.black}`,
      }}>{score}</div>
      <div style={{
        height:5, width:60, background:"rgba(255,255,255,0.2)",
        border:`1.5px solid rgba(255,255,255,0.3)`, borderRadius:3,
        marginTop:4, overflow:"hidden",
      }}>
        <div style={{ height:"100%", width:`${score}%`, background:fc, borderRadius:2 }} />
      </div>
    </div>
  );
};

/* ─── Main ────────────────────────────────────── */
export default function Home() {
  const [jobs,       setJobs]       = useState([]);
  const [pref1,      setPref1]      = useState("");
  const [pref2,      setPref2]      = useState("");
  const [pref3,      setPref3]      = useState("");
  const [jobLink,    setJobLink]    = useState("");
  const [jobDesc,    setJobDesc]    = useState("");
  const [lastResult, setLastResult] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [progress,   setProgress]   = useState({ done:0, total:0 });
  const [errors,     setErrors]     = useState([]);
  const [sortBy,     setSortBy]     = useState("category");
  const [filter,     setFilter]     = useState("all");
  const [expanded,   setExpanded]   = useState(null);
  const [ready,      setReady]      = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE); if(s) setJobs(JSON.parse(s)); } catch(_){}
    setReady(true);
  }, []);
  useEffect(() => {
    if(!ready) return;
    try { localStorage.setItem(STORAGE, JSON.stringify(jobs)); } catch(_){}
  }, [jobs, ready]);

  const handleAnalyze = useCallback(async () => {
    const links = jobLink.trim()
      ? jobLink.trim().split("\n").map(u => u.trim()).filter(Boolean).slice(0, 15)
      : [];
    const entries = links.length ? links : jobDesc.trim() ? [jobDesc.trim()] : [];
    if (!entries.length) return;
    const prefs = [pref1, pref2, pref3].filter(Boolean);
    setLoading(true); setErrors([]); setProgress({ done:0, total:entries.length });
    const fresh = [];
    let hadErrors = false;
    for (let i = 0; i < entries.length; i++) {
      try {
        const r = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: entries[i], isUrl: isURL(entries[i]), preferences: prefs }),
        });
        const d = await r.json();
        if (d.error) throw new Error(d.details ? `${d.error}: ${d.details}` : d.error);
        fresh.push({ ...d, id: Date.now() + Math.random(), sourceInput: entries[i],
          isUrl: isURL(entries[i]), analyzedAt: new Date().toLocaleDateString("fr-FR") });
        setLastResult(d);
      } catch(e) {
        hadErrors = true;
        setErrors(prev => [...prev, `#${i+1}: ${e.message}`]);
      }
      setProgress({ done: i+1, total: entries.length });
    }
    setJobs(prev => {
      const seen = new Set();
      return [...fresh, ...prev].filter(j => { if (seen.has(j.sourceInput)) return false; seen.add(j.sourceInput); return true; });
    });
    setLoading(false);
    if (!hadErrors && fresh.length > 0) {
      setJobLink("");
      setJobDesc("");
    }
  }, [pref1, pref2, pref3, jobLink, jobDesc]);

  const sorted = [...jobs]
    .filter(j => filter==="all" ? true : filter==="to_apply" ? j.toApply : j.category===filter)
    .sort((a,b) => sortBy==="category"
      ? (CAT_ORDER.indexOf(a.category)-CAT_ORDER.indexOf(b.category)) || b.fitScore-a.fitScore
      : b.fitScore-a.fitScore);

  const toApplyN = jobs.filter(j=>j.toApply).length;

  /* ── render ─────────────────────────────────── */
  return (
    <div style={{ minHeight:"100vh", position:"relative", zIndex:1 }}>

      {/* ── MARQUEE ─────────────────────────────── */}
      <div style={{
        background:"#1A2060", overflow:"hidden", whiteSpace:"nowrap",
        borderBottom:`2px solid rgba(255,255,255,0.12)`, position:"relative", zIndex:10,
      }}>
        <div style={{ display:"inline-flex", animation:"marquee 10s linear infinite" }}>
          {[...Array(2)].map((_,k) => (
            <span key={k} style={{
              fontFamily:"'Bebas Neue',sans-serif", letterSpacing:4,
              fontSize:13, padding:"7px 0", color:C.cream,
            }}>
              &nbsp;&nbsp;★&nbsp; STAGE &nbsp;·&nbsp; ALTERNANCE &nbsp;·&nbsp;
              ★&nbsp;&nbsp;STAGE &nbsp;·&nbsp; ALTERNANCE &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* ── HERO ──────────────────────────────── */}
        <header style={{ padding:"40px 0 32px", display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:24, flexWrap:"wrap", position:"relative" }}>
          <div>
            {/* decorative stars */}
            <Star size={28} color={C.yellow} style={{ position:"absolute", top:-8, left:-12, transform:"rotate(15deg)" }} />
            <Star size={18} color={C.pink}   style={{ position:"absolute", top:20, left:220, transform:"rotate(-10deg)" }} />

            <div style={{
              fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:11,
              letterSpacing:"0.2em", color:C.auraMid, marginBottom:8,
              textTransform:"uppercase", fontStretch:"condensed", fontWeight:900,
            }}>
              // Alternance Stage · France 2026
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <img
                src="/red-pin.png"
                alt="nail it pin"
                style={{ height:"clamp(60px,9vw,100px)", width:"auto", transform:"rotate(-20deg)", flexShrink:0 }}
              />
              <h1 style={{
                fontFamily:"'Stora',sans-serif",
                fontSize:"clamp(52px,8vw,88px)",
                letterSpacing:"-0.02em",
                lineHeight:0.95,
                color:C.auraCore,
                textShadow:`-2px -2px 0 ${C.auraOuter}, 2px -2px 0 ${C.auraOuter}, -2px 2px 0 ${C.auraOuter}, 2px 2px 0 ${C.auraOuter}, -2px 0 0 ${C.auraOuter}, 2px 0 0 ${C.auraOuter}, 0 -2px 0 ${C.auraOuter}, 0 2px 0 ${C.auraOuter}`,
              }}>
                NAIL<span style={{ color:C.auraCore }}> IT</span>
                <span style={{
                  display:"block", fontFamily:"'Playfair Display',serif",
                  fontSize:"clamp(16px,2.2vw,26px)", color:C.auraOuter,
                  letterSpacing:"-0.02em", lineHeight:0.95,
                  fontWeight:700, fontStyle:"italic", marginTop:6,
                  textShadow:"none",
                }}>alternance analyzer ✦</span>
              </h1>
            </div>
          </div>

          {/* stat cards */}
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {[
              { val:jobs.length, label:"ANALYZED", color:C.blue },
              { val:toApplyN,    label:"TO APPLY",  color:C.pink },
            ].map(({ val, label, color }) => (
              <div key={label} style={{
                background:"#1A2060", color:C.cream,
                border:`2px solid rgba(255,255,255,0.2)`,
                borderRadius:6,
                padding:"14px 22px",
                textAlign:"center",
                boxShadow:`4px 4px 0 ${color}`,
              }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:42, lineHeight:1, color }}>{val}</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2, color:C.muted, marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>
        </header>

        {/* ── INPUT ─────────────────────────────── */}
        <Panel accent={C.auraOuter} style={{ marginBottom:20 }}>
          <PanelHeader bg="#1A2060" color={C.auraCore}>
            <span>📡</span> START ANALYSE
          </PanelHeader>

          {/* preference */}
          <div style={{ padding:"12px 16px", borderBottom:`1.5px solid ${C.black}20`, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:12, letterSpacing:2, color:C.muted, flexShrink:0, fontWeight:700 }}>PREFERENCE</span>
            {[["1",pref1,setPref1],["2",pref2,setPref2],["3",pref3,setPref3]].map(([n,val,set])=>(
              <div key={n} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:C.muted }}>{n}</span>
                <input
                  value={val} onChange={e=>set(e.target.value)} disabled={loading}
                  placeholder="e.g. DevOps"
                  style={{
                    fontFamily:"'Space Mono',monospace", fontSize:11, width:110,
                    background:"transparent", border:`1.5px solid ${C.black}40`,
                    borderRadius:4, padding:"5px 10px", outline:"none", color:C.black,
                  }}
                />
              </div>
            ))}
          </div>

          {/* job link */}
          <div style={{ padding:"12px 16px", borderBottom:`1.5px solid ${C.black}20` }}>
            <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:6 }}>
              <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:12, letterSpacing:2, color:C.muted, fontWeight:700 }}>JOB LINK</span>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:C.muted }}>up to 15 URLs · one per line</span>
            </div>
            <textarea
              value={jobLink} onChange={e=>setJobLink(e.target.value)} disabled={loading}
              rows={4}
              placeholder={"https://linkedin.com/jobs/...\nhttps://welcometothejungle.com/...\nhttps://..."}
              style={{
                width:"100%", resize:"vertical",
                background:"transparent", border:`1.5px solid ${C.black}40`,
                borderRadius:4, padding:"8px 12px", outline:"none",
                fontFamily:"'Space Mono',monospace", fontSize:12,
                color:C.blue, caretColor:C.pink, lineHeight:1.8,
              }}
            />
          </div>

          {/* job description */}
          <div style={{ padding:"12px 16px", borderBottom:`1.5px solid ${C.black}20` }}>
            <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:12, letterSpacing:2, color:C.muted, marginBottom:8, fontWeight:700 }}>JOB DESCRIPTION</div>
            <textarea
              value={jobDesc} onChange={e=>setJobDesc(e.target.value)} disabled={loading}
              rows={5}
              placeholder="> Collez la description du poste ici..."
              style={{
                width:"100%", resize:"vertical",
                background:"transparent", border:`1.5px solid ${C.black}40`,
                borderRadius:4, padding:"8px 12px", outline:"none",
                fontFamily:"'Space Mono',monospace", fontSize:12,
                color:C.black, lineHeight:1.6, caretColor:C.pink,
              }}
            />
          </div>

          {/* analysis compatibility */}
          <div style={{ padding:"12px 16px", borderBottom:`2px solid ${C.black}` }}>
            <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:12, letterSpacing:2, color:C.muted, marginBottom:8, fontWeight:700 }}>ANALYSIS COMPATIBILITY</div>
            <div style={{
              minHeight:52, border:`1.5px solid ${C.black}40`, borderRadius:4,
              padding:"10px 14px", background:`${C.black}05`,
              fontFamily:"'Space Mono',monospace", fontSize:12, color:C.black, lineHeight:1.6,
            }}>
              {loading ? (
                <span style={{ color:C.green }}>⟳ analyzing...</span>
              ) : lastResult ? (
                <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                  <div style={{ flexShrink:0 }}>
                    <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:30, lineHeight:1, color:fitColor(lastResult.fitScore||0) }}>{lastResult.fitScore}</span>
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:C.muted }}>/100</span>
                  </div>
                  <div style={{ fontSize:11, color:C.muted, lineHeight:1.7 }}>{lastResult.fitReason}</div>
                </div>
              ) : (
                <span style={{ color:C.muted }}>— awaiting analysis —</span>
              )}
            </div>
          </div>

          {/* actions */}
          <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"flex-end", gap:10, background:`${C.black}08` }}>
            {jobs.length>0 && (
              <Btn color={C.pink} small onClick={()=>{ if(confirm("Supprimer tout?")) setJobs([]); }}>✕ Clear</Btn>
            )}
            <Btn onClick={handleAnalyze} disabled={loading||(!jobLink.trim()&&!jobDesc.trim())}>
              {loading ? `⟳ ${progress.done}/${progress.total}` : "LET'S CHECK!"}
            </Btn>
          </div>

          {loading && (
            <div style={{ padding:"8px 16px", borderTop:`2px solid ${C.black}`, background:`${C.green}18` }}>
              <div style={{ height:6, background:"#333", border:`1.5px solid ${C.border}`, borderRadius:4, overflow:"hidden" }}>
                <div style={{ height:"100%", background:C.green, width:`${progress.total ? (progress.done/progress.total)*100 : 10}%`, borderRadius:3, transition:"width .3s" }} />
              </div>
            </div>
          )}
        </Panel>

        {/* errors */}
        {errors.length>0 && (
          <Panel accent={C.red} style={{ marginBottom:16 }}>
            <PanelHeader bg={C.red} color={C.cream}>⚠ ERRORS</PanelHeader>
            <div style={{ padding:"10px 16px", fontFamily:"'Space Mono',monospace", fontSize:12, color:C.red }}>
              {errors.map((e,i)=><div key={i}>✗ {e}</div>)}
            </div>
          </Panel>
        )}

        {/* ── FILTERS ───────────────────────────── */}
        {jobs.length>0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center", marginBottom:16 }}>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, letterSpacing:3, color:C.auraCore, fontWeight:900 }}>FILTER</span>
            {[
              { key:"all",      label:"TOUS",         bg:C.cream },
              { key:"to_apply", label:"★ TO APPLY",   bg:C.green },
              ...CAT_ORDER.map(c=>({ key:c, label:CAT_META[c].label, bg:CAT_META[c].color })),
            ].map(({ key, label, bg }) => (
              <Tag key={key} onClick={()=>setFilter(key)} bg={filter===key?bg:C.paper}
                color={filter===key?C.black:C.cream} style={{ opacity: filter===key?1:0.55 }}>{label}</Tag>
            ))}
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, letterSpacing:3, color:C.auraCore, marginLeft:8, fontWeight:900 }}>SORT</span>
            {[{key:"category",label:"PRIORITÉ"},{key:"fit",label:"FIT ↓"}].map(({ key, label })=>(
              <Tag key={key} onClick={()=>setSortBy(key)} bg={sortBy===key?C.yellow:C.paper}
                color={sortBy===key?C.black:C.cream} style={{ opacity:sortBy===key?1:0.55 }}>{label}</Tag>
            ))}
          </div>
        )}

        {/* ── TABLE ─────────────────────────────── */}
        <Panel accent={C.auraMid}>
          <PanelHeader bg="#1A2060" color={C.auraCore}>
            📊 OFFERS TO APPLY — {sorted.length}
            <Star size={16} color={C.auraCore} style={{ marginLeft:"auto" }} />
          </PanelHeader>

          {sorted.length===0 ? (
            <div style={{ textAlign:"center", padding:"80px 20px" }}>
              <div style={{ fontSize:60, marginBottom:16,
                animation:"wiggle 2s ease-in-out infinite",
                display:"inline-block" }}>✦</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:3, color:C.muted }}>
                {jobs.length===0 ? "PAS DE DONNÉES" : "AUCUN RÉSULTAT"}
              </div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:C.muted, marginTop:6 }}>
                {jobs.length===0 ? "collez des liens / JDs et cliquez ANALYSER" : "modifiez les filtres"}
              </div>
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
                <thead>
                  <tr style={{ background:C.black }}>
                    {["JOB TITLE","COMPATIBILITY","SALARY","LOCATION","BRIEF INTRO","REQUIRED TECH STACK",""].map(h=>(
                      <th key={h} style={{
                        padding:"10px 14px", textAlign:"left",
                        fontFamily:"'Stora',sans-serif", fontSize:12,
                        letterSpacing:2, color:C.cream, whiteSpace:"nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((job, idx) => {
                    const isExp = expanded===job.id;
                    const rowBg = idx%2===0 ? C.paper : "#1E1914";

                    return (
                      <>
                        <tr key={job.id}
                          onClick={()=>setExpanded(isExp?null:job.id)}
                          style={{
                            background: isExp ? `${C.blue}18` : rowBg,
                            borderBottom:`1.5px solid ${C.border}`,
                            cursor:"pointer",
                            transition:"background .12s",
                          }}
                          onMouseEnter={e=>{ if(!isExp) e.currentTarget.style.background=`${C.blue}12`; }}
                          onMouseLeave={e=>{ if(!isExp) e.currentTarget.style.background=rowBg; }}
                        >
                          {/* JOB TITLE */}
                          <td style={{ padding:"12px 14px", minWidth:160 }}>
                            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:15, letterSpacing:1, color:C.cream }}>{job.title||"—"}</div>
                            {job.company && <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:C.muted, marginTop:2 }}>{job.company}</div>}
                            {job.isUrl && (
                              <a href={job.sourceInput} target="_blank" rel="noopener noreferrer"
                                onClick={e=>e.stopPropagation()}
                                style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:C.blue, textDecoration:"none" }}>
                                ↗ link
                              </a>
                            )}
                          </td>

                          {/* COMPATIBILITY */}
                          <td style={{ padding:"12px 14px" }}><FitMeter score={job.fitScore||0} /></td>

                          {/* SALARY */}
                          <td style={{ padding:"12px 14px", fontFamily:"'Space Mono',monospace", fontSize:11, color:C.muted, whiteSpace:"nowrap" }}>{job.salary||"—"}</td>

                          {/* LOCATION */}
                          <td style={{ padding:"12px 14px", fontFamily:"'Space Mono',monospace", fontSize:11, color:C.muted, whiteSpace:"nowrap" }}>{job.location||"—"}</td>

                          {/* BRIEF INTRO */}
                          <td style={{ padding:"12px 14px", maxWidth:240 }}>
                            <div style={{
                              fontFamily:"'Space Mono',monospace", fontSize:10, color:C.muted,
                              lineHeight:1.6, display:"-webkit-box", WebkitLineClamp:3,
                              WebkitBoxOrient:"vertical", overflow:"hidden",
                            }}>{job.intro||"—"}</div>
                          </td>

                          {/* REQUIRED TECH STACK */}
                          <td style={{ padding:"12px 14px" }}>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:3, maxWidth:200 }}>
                              {(job.techStack||[]).slice(0,6).map((t,i)=>(
                                <span key={i} style={{
                                  fontFamily:"'Space Mono',monospace", fontSize:9,
                                  padding:"2px 6px", border:`1.5px solid ${C.border}`,
                                  borderRadius:3, background:`${C.blue}25`, color:C.cream,
                                }}>{t}</span>
                              ))}
                              {(job.techStack||[]).length>6 && (
                                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:C.muted }}>+{job.techStack.length-6}</span>
                              )}
                            </div>
                          </td>

                          {/* delete */}
                          <td style={{ padding:"12px 14px" }} onClick={e=>e.stopPropagation()}>
                            <button onClick={()=>setJobs(p=>p.filter(j=>j.id!==job.id))}
                              style={{
                                background:"transparent", border:`1.5px solid ${C.border}`,
                                borderRadius:4, width:26, height:26, cursor:"pointer",
                                fontFamily:"'Space Mono',monospace", fontSize:12, color:C.muted,
                                transition:"all .12s", display:"flex", alignItems:"center", justifyContent:"center",
                              }}
                              onMouseEnter={e=>{ e.currentTarget.style.color=C.red; e.currentTarget.style.borderColor=C.red; e.currentTarget.style.background=`${C.red}12`; }}
                              onMouseLeave={e=>{ e.currentTarget.style.color="#555"; e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background="transparent"; }}
                            >✕</button>
                          </td>
                        </tr>

                        {/* expanded row */}
                        {isExp && (
                          <tr key={`${job.id}-exp`}>
                            <td colSpan={7} style={{ padding:"0 14px 18px", background:`${C.blue}10` }}>
                              <div style={{
                                background:C.paper, border:`2px solid ${C.border}`,
                                borderRadius:6, padding:16,
                                display:"grid", gridTemplateColumns:"1fr 1fr", gap:20,
                                animation:"slideUp .2s ease",
                              }}>
                                <div>
                                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:11, letterSpacing:3, color:C.muted, marginBottom:6 }}>▸ RÉSUMÉ DU POSTE</div>
                                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:12, lineHeight:1.7, color:C.muted }}>{job.intro}</div>
                                </div>
                                <div>
                                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:11, letterSpacing:3, color:C.muted, marginBottom:6 }}>▸ POURQUOI CE SCORE ?</div>
                                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:12, lineHeight:1.7, color:C.muted }}>{job.fitReason}</div>
                                </div>
                                {job.techStack?.length>0 && (
                                  <div style={{ gridColumn:"1/-1" }}>
                                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:11, letterSpacing:3, color:C.muted, marginBottom:8 }}>▸ STACK COMPLÈTE</div>
                                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                                      {job.techStack.map((t,i)=>(
                                        <span key={i} style={{
                                          fontFamily:"'Space Mono',monospace", fontSize:11,
                                          padding:"3px 8px", border:`1.5px solid ${C.border}`,
                                          borderRadius:3, background:`${C.blue}25`, color:C.cream,
                                        }}>{t}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        {/* footer */}
        <div style={{
          textAlign:"center", marginTop:40,
          fontFamily:"'Space Mono',monospace", fontSize:10,
          color:C.muted, letterSpacing:2,
          display:"flex", alignItems:"center", justifyContent:"center", gap:12,
        }}>
          <Star size={14} color={C.yellow} />
          NAIL IT · POWERED BY CLAUDE AI · ALTERNANCE 2026
          <Star size={14} color={C.pink} />
        </div>
      </div>

      <style>{`
        @keyframes blobFloat {
          0%,100%{transform:translate(0,0) scale(1)}
          33%{transform:translate(20px,-15px) scale(1.05)}
          66%{transform:translate(-15px,10px) scale(0.97)}
        }
        @keyframes marquee {
          0%{transform:translateX(0)}
          100%{transform:translateX(-50%)}
        }
        @keyframes slideUp {
          from{opacity:0;transform:translateY(12px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes wiggle {
          0%,100%{transform:rotate(-4deg)}
          50%{transform:rotate(4deg)}
        }
        textarea::placeholder { color: #bbb; }
        * { box-sizing: border-box; }
        a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
