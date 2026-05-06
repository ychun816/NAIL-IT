"use client";
import { useState, useEffect, useCallback, useRef } from "react";

/* ─── palette ─────────────────────────────────── */
const C = {
  cream:  "#F2EBD9",
  black:  "#1A1A18",
  blue:   "#5BC8F5",
  pink:   "#FF6B9D",
  green:  "#BAFF29",
  yellow: "#FFE135",
  purple: "#C084FC",
  red:    "#FF3B3B",
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

const Blob = ({ color, style={} }) => (
  <div style={{
    position:"absolute",
    borderRadius:"60% 40% 70% 30% / 50% 60% 40% 50%",
    background: color,
    opacity: 0.18,
    filter: "blur(40px)",
    animation: "blobFloat 8s ease-in-out infinite",
    pointerEvents: "none",
    ...style,
  }} />
);

/* ─── Panel (cut-paper card) ──────────────────── */
const Panel = ({ children, accent=C.black, style={} }) => (
  <div style={{
    background: C.cream,
    border: `2.5px solid ${C.black}`,
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
    fontFamily:"'Bebas Neue',sans-serif",
    fontSize: 15,
    letterSpacing: 3,
    padding: "8px 16px",
    borderBottom: `2px solid ${C.black}`,
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
    fontFamily:"'Bebas Neue',sans-serif",
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
        height:5, width:60, background:"#ddd",
        border:`1.5px solid ${C.black}`, borderRadius:3,
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
    const src = jobLink.trim() || jobDesc.trim();
    if (!src) return;
    const prefs = [pref1, pref2, pref3].filter(Boolean);
    setLoading(true); setErrors([]);
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: src, isUrl: isURL(src), preferences: prefs }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      const job = { ...d, id: Date.now() + Math.random(), sourceInput: src,
        isUrl: isURL(src), analyzedAt: new Date().toLocaleDateString("fr-FR") };
      setJobs(prev => {
        const seen = new Set();
        return [job, ...prev].filter(j => { if (seen.has(j.sourceInput)) return false; seen.add(j.sourceInput); return true; });
      });
      setLastResult(d);
      setJobLink(""); setJobDesc("");
    } catch(e) { setErrors([e.message]); }
    setLoading(false);
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

      {/* background blobs */}
      <Blob color={C.blue}   style={{ width:500, height:400, top:-100, left:-150 }} />
      <Blob color={C.pink}   style={{ width:400, height:350, top:"30%", right:-100, animationDelay:"3s" }} />
      <Blob color={C.green}  style={{ width:350, height:300, bottom:100, left:"20%", animationDelay:"5s" }} />

      {/* ── MARQUEE ─────────────────────────────── */}
      <div style={{
        background:C.black, overflow:"hidden", whiteSpace:"nowrap",
        borderBottom:`2px solid ${C.black}`, position:"relative", zIndex:10,
      }}>
        <div style={{ display:"inline-flex", animation:"marquee 40s linear infinite" }}>
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

            <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:12, letterSpacing:3, color:C.pink, marginBottom:6, textTransform:"uppercase" }}>
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
                letterSpacing:-1,
                lineHeight:0.9,
                color:C.black,
              }}>
                NAIL<span style={{ WebkitTextStroke:`3px ${C.black}`, color:C.blue }}> IT</span>
                <span style={{
                  display:"block", fontFamily:"'Bricolage Grotesque',sans-serif",
                  fontSize:"clamp(18px,2.5vw,28px)", color:C.pink, letterSpacing:2,
                  fontWeight:300, marginTop:4,
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
                background:C.black, color:C.cream,
                border:`2.5px solid ${C.black}`,
                borderRadius:6,
                padding:"14px 22px",
                textAlign:"center",
                boxShadow:`4px 4px 0 ${color}`,
              }}>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:42, lineHeight:1, color }}>{val}</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:2, color:"#888", marginTop:2 }}>{label}</div>
              </div>
            ))}
          </div>
        </header>

        {/* ── INPUT ─────────────────────────────── */}
        <Panel accent={C.green} style={{ marginBottom:20 }}>
          <PanelHeader bg={C.black} color={C.green}>
            <span>📡</span> INPUT.EXE
          </PanelHeader>

          {/* preference */}
          <div style={{ padding:"12px 16px", borderBottom:`1.5px solid ${C.black}20`, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, letterSpacing:3, color:"#888", flexShrink:0 }}>PREFERENCE</span>
            {[["1",pref1,setPref1],["2",pref2,setPref2],["3",pref3,setPref3]].map(([n,val,set])=>(
              <div key={n} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#aaa" }}>{n}</span>
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
          <div style={{ padding:"12px 16px", borderBottom:`1.5px solid ${C.black}20`, display:"flex", alignItems:"center", gap:16 }}>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, letterSpacing:3, color:"#888", flexShrink:0, width:110 }}>JOB LINK</span>
            <input
              value={jobLink} onChange={e=>setJobLink(e.target.value)} disabled={loading}
              placeholder="https://..."
              style={{
                flex:1, fontFamily:"'Space Mono',monospace", fontSize:12,
                background:"transparent", border:`1.5px solid ${C.black}40`,
                borderRadius:4, padding:"6px 12px", outline:"none",
                color:C.blue, caretColor:C.pink,
              }}
            />
          </div>

          {/* job description */}
          <div style={{ padding:"12px 16px", borderBottom:`1.5px solid ${C.black}20` }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, letterSpacing:3, color:"#888", marginBottom:8 }}>JOB DESCRIPTION</div>
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
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, letterSpacing:3, color:"#888", marginBottom:8 }}>ANALYSIS COMPATIBILITY</div>
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
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"#aaa" }}>/100</span>
                  </div>
                  <div style={{ fontSize:11, color:"#555", lineHeight:1.7 }}>{lastResult.fitReason}</div>
                </div>
              ) : (
                <span style={{ color:"#bbb" }}>— awaiting analysis —</span>
              )}
            </div>
          </div>

          {/* actions */}
          <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"flex-end", gap:10, background:`${C.black}08` }}>
            {jobs.length>0 && (
              <Btn color={C.pink} small onClick={()=>{ if(confirm("Supprimer tout?")) setJobs([]); }}>✕ Clear</Btn>
            )}
            <Btn onClick={handleAnalyze} disabled={loading||(!jobLink.trim()&&!jobDesc.trim())}>
              {loading ? "⟳ Analyzing..." : "▶ Analyser"}
            </Btn>
          </div>

          {loading && (
            <div style={{ padding:"8px 16px", borderTop:`2px solid ${C.black}`, background:`${C.green}18` }}>
              <div style={{ height:6, background:"#ddd", border:`1.5px solid ${C.black}`, borderRadius:4, overflow:"hidden" }}>
                <div style={{ height:"100%", background:C.green, width:"60%", borderRadius:3, animation:"marquee 1.2s linear infinite" }} />
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
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, letterSpacing:3, color:"#888" }}>FILTER</span>
            {[
              { key:"all",      label:"TOUS",         bg:C.cream },
              { key:"to_apply", label:"★ TO APPLY",   bg:C.green },
              ...CAT_ORDER.map(c=>({ key:c, label:CAT_META[c].label, bg:CAT_META[c].color })),
            ].map(({ key, label, bg }) => (
              <Tag key={key} onClick={()=>setFilter(key)} bg={filter===key?bg:C.cream}
                color={C.black} style={{ opacity: filter===key?1:0.55 }}>{label}</Tag>
            ))}
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, letterSpacing:3, color:"#888", marginLeft:8 }}>SORT</span>
            {[{key:"category",label:"PRIORITÉ"},{key:"fit",label:"FIT ↓"}].map(({ key, label })=>(
              <Tag key={key} onClick={()=>setSortBy(key)} bg={sortBy===key?C.yellow:C.cream}
                color={C.black} style={{ opacity:sortBy===key?1:0.55 }}>{label}</Tag>
            ))}
          </div>
        )}

        {/* ── TABLE ─────────────────────────────── */}
        <Panel accent={C.blue}>
          <PanelHeader bg={C.blue} color={C.black}>
            📊 RESULTS.DB — {sorted.length} ENTRÉES
            <Star size={16} color={C.black} style={{ marginLeft:"auto" }} />
          </PanelHeader>

          {sorted.length===0 ? (
            <div style={{ textAlign:"center", padding:"80px 20px" }}>
              <div style={{ fontSize:60, marginBottom:16,
                animation:"wiggle 2s ease-in-out infinite",
                display:"inline-block" }}>✦</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:3, color:"#bbb" }}>
                {jobs.length===0 ? "PAS DE DONNÉES" : "AUCUN RÉSULTAT"}
              </div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#ccc", marginTop:6 }}>
                {jobs.length===0 ? "collez des liens / JDs et cliquez ANALYSER" : "modifiez les filtres"}
              </div>
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:860 }}>
                <thead>
                  <tr style={{ background:C.black }}>
                    {["Poste","Lien","Catégorie","Fit","Salaire","Lieu","Stack","Statut",""].map(h=>(
                      <th key={h} style={{
                        padding:"10px 14px", textAlign:"left",
                        fontFamily:"'Bebas Neue',sans-serif", fontSize:12,
                        letterSpacing:2, color:C.cream, whiteSpace:"nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((job, idx) => {
                    const cat = CAT_META[job.category] || CAT_META.other;
                    const isExp = expanded===job.id;
                    const rowBg = idx%2===0 ? C.cream : "#F8F2E2";
                    let host="";
                    if(job.isUrl){ try{ host=new URL(job.sourceInput).hostname.replace("www.",""); }catch(_){host="link";} }

                    return (
                      <>
                        <tr key={job.id}
                          onClick={()=>setExpanded(isExp?null:job.id)}
                          style={{
                            background: isExp ? `${C.blue}18` : rowBg,
                            borderBottom:`1.5px solid ${C.black}20`,
                            cursor:"pointer",
                            transition:"background .12s",
                          }}
                          onMouseEnter={e=>{ if(!isExp) e.currentTarget.style.background=`${C.blue}12`; }}
                          onMouseLeave={e=>{ if(!isExp) e.currentTarget.style.background=rowBg; }}
                        >
                          {/* title */}
                          <td style={{ padding:"12px 14px", maxWidth:200 }}>
                            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:15, letterSpacing:1, color:C.black }}>{job.title||"—"}</div>
                            {job.company && <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#888", marginTop:1 }}>{job.company}</div>}
                            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"#bbb", marginTop:1 }}>{job.analyzedAt}</div>
                          </td>

                          {/* link */}
                          <td style={{ padding:"12px 14px" }}>
                            {job.isUrl
                              ? <a href={job.sourceInput} target="_blank" rel="noopener noreferrer"
                                  onClick={e=>e.stopPropagation()}
                                  style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:C.blue,
                                    textDecoration:"none", display:"block", maxWidth:130,
                                    overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                  ↗ {host}
                                </a>
                              : <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#bbb" }}>JD texte</span>}
                          </td>

                          {/* category */}
                          <td style={{ padding:"12px 14px" }}>
                            <span style={{
                              fontFamily:"'Space Mono',monospace", fontSize:9, fontWeight:700,
                              padding:"3px 9px", borderRadius:20,
                              border:`2px solid ${cat.color}`,
                              background:cat.bg, color:cat.color,
                              whiteSpace:"nowrap", letterSpacing:0.5,
                            }}>{cat.label}</span>
                          </td>

                          {/* fit */}
                          <td style={{ padding:"12px 14px" }}><FitMeter score={job.fitScore||0} /></td>

                          {/* salary */}
                          <td style={{ padding:"12px 14px", fontFamily:"'Space Mono',monospace", fontSize:11, color:"#555", whiteSpace:"nowrap" }}>{job.salary||"—"}</td>

                          {/* location */}
                          <td style={{ padding:"12px 14px", fontFamily:"'Space Mono',monospace", fontSize:11, color:"#777", whiteSpace:"nowrap" }}>{job.location||"—"}</td>

                          {/* stack */}
                          <td style={{ padding:"12px 14px" }}>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:3, maxWidth:180 }}>
                              {(job.techStack||[]).slice(0,5).map((t,i)=>(
                                <span key={i} style={{
                                  fontFamily:"'Space Mono',monospace", fontSize:9,
                                  padding:"2px 6px", border:`1.5px solid ${C.black}30`,
                                  borderRadius:3, background:`${C.blue}18`, color:C.black,
                                }}>{t}</span>
                              ))}
                              {(job.techStack||[]).length>5 && (
                                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"#aaa" }}>+{job.techStack.length-5}</span>
                              )}
                            </div>
                          </td>

                          {/* status */}
                          <td style={{ padding:"12px 14px" }} onClick={e=>e.stopPropagation()}>
                            <Tag
                              bg={job.toApply?C.green:C.cream}
                              onClick={()=>setJobs(p=>p.map(j=>j.id===job.id?{...j,toApply:!j.toApply}:j))}
                              style={{ fontSize:9 }}
                            >{job.toApply?"★ TO APPLY":"+ MARK"}</Tag>
                          </td>

                          {/* delete */}
                          <td style={{ padding:"12px 14px" }} onClick={e=>e.stopPropagation()}>
                            <button onClick={()=>setJobs(p=>p.filter(j=>j.id!==job.id))}
                              style={{
                                background:"transparent", border:`1.5px solid ${C.black}30`,
                                borderRadius:4, width:26, height:26, cursor:"pointer",
                                fontFamily:"'Space Mono',monospace", fontSize:12, color:"#ccc",
                                transition:"all .12s", display:"flex", alignItems:"center", justifyContent:"center",
                              }}
                              onMouseEnter={e=>{ e.currentTarget.style.color=C.red; e.currentTarget.style.borderColor=C.red; e.currentTarget.style.background=`${C.red}12`; }}
                              onMouseLeave={e=>{ e.currentTarget.style.color="#ccc"; e.currentTarget.style.borderColor=`${C.black}30`; e.currentTarget.style.background="transparent"; }}
                            >✕</button>
                          </td>
                        </tr>

                        {/* expanded row */}
                        {isExp && (
                          <tr key={`${job.id}-exp`}>
                            <td colSpan={9} style={{ padding:"0 14px 18px", background:`${C.blue}10` }}>
                              <div style={{
                                background:C.cream, border:`2px solid ${C.black}20`,
                                borderRadius:6, padding:16,
                                display:"grid", gridTemplateColumns:"1fr 1fr", gap:20,
                                animation:"slideUp .2s ease",
                              }}>
                                <div>
                                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:11, letterSpacing:3, color:"#aaa", marginBottom:6 }}>▸ RÉSUMÉ DU POSTE</div>
                                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:12, lineHeight:1.7, color:"#444" }}>{job.intro}</div>
                                </div>
                                <div>
                                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:11, letterSpacing:3, color:"#aaa", marginBottom:6 }}>▸ POURQUOI CE SCORE ?</div>
                                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:12, lineHeight:1.7, color:"#444" }}>{job.fitReason}</div>
                                </div>
                                {job.techStack?.length>0 && (
                                  <div style={{ gridColumn:"1/-1" }}>
                                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:11, letterSpacing:3, color:"#aaa", marginBottom:8 }}>▸ STACK COMPLÈTE</div>
                                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                                      {job.techStack.map((t,i)=>(
                                        <span key={i} style={{
                                          fontFamily:"'Space Mono',monospace", fontSize:11,
                                          padding:"3px 8px", border:`1.5px solid ${C.black}30`,
                                          borderRadius:3, background:`${C.blue}20`, color:C.black,
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
          color:"#bbb", letterSpacing:2,
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
