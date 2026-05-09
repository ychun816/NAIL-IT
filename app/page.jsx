"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import translations from "./lib/translations";
import { C, CAT_ORDER, CAT_META, STORAGE, isURL } from "./lib/constants";
import { Star, Panel, PanelHeader, Tag, Btn } from "./components/ui";
import JobRow from "./components/JobRow";

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
  const [sortBy,     setSortBy]     = useState("time");
  const [filter,     setFilter]     = useState("all");
  const [expanded,   setExpanded]   = useState(null);
  const [ready,      setReady]      = useState(false);
  const [inputType,  setInputType]  = useState("urls");
  const [parisTime,  setParisTime]  = useState("");
  const [lang, setLang] = useState("FR");
  const t = translations[lang];

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setParisTime(now.toLocaleString("fr-FR", {
        timeZone: "Europe/Paris",
        weekday: "long", day: "2-digit", month: "short",
        hour: "2-digit", minute: "2-digit",
        hour12: false,
      }).toUpperCase());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE); if(s) setJobs(JSON.parse(s)); } catch(_){}
    setReady(true);
  }, []);
  useEffect(() => {
    if(!ready) return;
    try { localStorage.setItem(STORAGE, JSON.stringify(jobs)); } catch(_){}
  }, [jobs, ready]);

  const handleAnalyze = useCallback(async () => {
    const links = (inputType === "urls" && jobLink.trim())
      ? jobLink.trim().split("\n").map(u => u.trim()).filter(u => u && (u.startsWith("http://") || u.startsWith("https://"))).slice(0, 20)
      : [];
    const entries = inputType === "urls" ? links : (jobDesc.trim() ? [jobDesc.trim()] : []);
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
    .filter(j => {
      if (filter === "all") return true;
      if (filter === "to_apply") return j.toApply;
      if (filter === "just_applied") return j.justApplied;
      if (filter === "cloud_devops") return j.category === "cloud_devops" || j.category === "cloud" || j.category === "devops";
      if (filter === "other") return !["cloud_devops","cloud","devops","backend","frontend","ai","fullstack"].includes(j.category);
      return j.category === filter;
    })
    .sort((a,b) => sortBy === "fit" ? b.fitScore-a.fitScore : b.id-a.id);

  const toApplyN = jobs.filter(j=>j.toApply).length;
  const appliedTodayN = jobs.filter(j => j.justApplied && new Date(j.appliedAt).toDateString() === new Date().toDateString()).length;
  const linkLines = jobLink === "" ? [] : jobLink.split('\n').slice(0,20);
  const numbersCount = Math.min(20, Math.max(linkLines.length + 1, 1));

  /* ── render ─────────────────────────────────── */
  return (
    <div style={{ minHeight:"100vh", position:"relative", zIndex:1 }}>

      {/* ── MARQUEE ─────────────────────────────── */}
      <div style={{
        background:"#1A2060", overflow:"hidden", whiteSpace:"nowrap",
        borderBottom:`2px solid rgba(255,255,255,0.12)`, position:"relative", zIndex:10,
      }}>
        <div style={{ display:"inline-flex", animation:"marquee 12s linear infinite" }}>
          {[...Array(2)].map((_,k) => (
            <span key={k} style={{
              fontFamily:"'Bebas Neue',sans-serif", letterSpacing:5,
              fontSize:13, padding:"7px 0", color:C.cream,
            }}>
              &nbsp;&nbsp; ★ &nbsp; STAGE &nbsp; ★ &nbsp; ALTERNANCE &nbsp; ❤︎ &nbsp; INTERNSHIP &nbsp; ✦ &nbsp; BONNE CHANCE &nbsp; ❤︎ &nbsp; CAREERS &nbsp; ✦ &nbsp; CHARBONER MÊME SI TU AS LA FLEMME ★ &nbsp;
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* ── HERO ──────────────────────────────── */}
        <header style={{ padding:"40px 0 32px", display:"flex", alignItems:"flex-end", justifyContent:"space-between", gap:24, flexWrap:"wrap", position:"relative" }}>
          <div>
            {/* decorative stars */}
            <Star size={28} color={C.yellow} style={{ position:"absolute", top:18, left:-12, transform:"rotate(15deg)" }} />
            <Star size={18} color={C.pink}   style={{ position:"absolute", top:20, left:220, transform:"rotate(-10deg)" }} />

            <div style={{
              fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:11,
              letterSpacing:"0.2em", color:C.auraMid, marginBottom:8,
              textTransform:"uppercase", fontStretch:"condensed", fontWeight:900,
            }}>
              {t.alternance}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <img
                src="/red-pin-nobg.png"
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
                }}>{t.analyzer}</span>
              </h1>
            </div>
          </div>

          {/* stat cards */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:10 }}>
          {parisTime && (
            <div style={{
              fontFamily:"'Bebas Neue',sans-serif",
              fontSize:13,
              letterSpacing:"0.18em",
              color:C.auraCore,
              textTransform:"uppercase",
              opacity:0.85,
            }}>
              PARIS · {parisTime}
            </div>
          )}
          <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
            {["EN","FR","CH"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                fontFamily:"'Bebas Neue',sans-serif",
                fontSize:12, letterSpacing:"0.12em",
                padding:"2px 8px",
                border:`1.5px solid ${lang===l ? C.auraCore : "rgba(255,255,255,0.25)"}`,
                borderRadius:3,
                background: lang===l ? "rgba(253,228,201,0.15)" : "transparent",
                color: lang===l ? C.auraCore : "rgba(255,255,255,0.45)",
                cursor:"pointer",
                transition:"all .12s",
              }}>{l}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {[
              { val:jobs.length, label:t.analyzed, color:C.blue },
              { val:toApplyN,    label:t.to_apply,  color:C.pink },
              { val:appliedTodayN, label:t.applied_today, color:C.green },
            ].map(({ val, label, color }) => (
              <div key={label} style={{
                background:"rgba(26,32,96,0.72)", color:C.cream,
                backdropFilter:"blur(2px)",
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
          </div>
        </header>

        {/* ── INPUT ─────────────────────────────── */}
        <Panel accent={C.auraOuter} style={{ marginBottom:20 }}>
          <PanelHeader bg="#1A2060" color={C.auraCore}>
            <span></span> {t.panel_title}
          </PanelHeader>

          {/* preference */}
          <div style={{ padding:"12px 16px", borderBottom:`1.5px solid ${C.black}20`, display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:12, letterSpacing:2, color:C.muted, flexShrink:0, fontWeight:700 }}>{t.preference}</span>
            {[["1",pref1,setPref1],["2",pref2,setPref2],["3",pref3,setPref3]].map(([n,val,set])=>(
              <div key={n} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:C.muted }}>{n}</span>
                <input
                  value={val} onChange={e=>set(e.target.value)} disabled={loading}
                  placeholder={t.pref_placeholder}
                  style={{
                    fontFamily:"'Space Mono',monospace", fontSize:11, width:110,
                    background:"transparent", border:`1.5px solid ${C.black}40`,
                    borderRadius:4, padding:"5px 10px", outline:"none", color:C.black,
                  }}
                />
              </div>
            ))}
          </div>

          {/* tabs */}
          <div style={{ display:"flex", borderBottom:`1.5px solid ${C.black}20` }}>
            <button
              onClick={() => setInputType("urls")}
              style={{
                flex: 1, padding: "12px 16px", background: inputType === "urls" ? "transparent" : "rgba(0,0,0,0.1)",
                border: "none", borderRight: `1.5px solid ${C.black}20`,
                fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 12, letterSpacing: 2,
                color: inputType === "urls" ? C.black : C.muted, fontWeight: 700, cursor: "pointer",
                textAlign: "left"
              }}
            >
              {t.job_link}
            </button>
            <button
              onClick={() => setInputType("desc")}
              style={{
                flex: 1, padding: "12px 16px", background: inputType === "desc" ? "transparent" : "rgba(0,0,0,0.1)",
                border: "none",
                fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 12, letterSpacing: 2,
                color: inputType === "desc" ? C.black : C.muted, fontWeight: 700, cursor: "pointer",
                textAlign: "left"
              }}
            >
              {t.job_description}
            </button>
          </div>

          {/* tab content */}
          <div style={{ padding:"12px 16px", borderBottom:`1.5px solid ${C.black}20` }}>
            {inputType === "urls" ? (
              <>
                <div style={{ display:"flex", alignItems:"baseline", gap:10, marginBottom:6 }}>
                  <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:12, letterSpacing:2, color:C.muted, fontWeight:700 }}>{t.job_link}</span>
                  <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:C.muted }}>{t.link_hint}</span>
                </div>
                <div style={{ display:"flex", gap:8, width:"100%", background:"transparent", border:`1.5px solid ${C.black}40`, borderRadius:4, padding:"8px 10px", alignItems:"flex-start" }}>
                  <div style={{ width:40, paddingTop:4, paddingLeft:6, paddingRight:6, textAlign:"right", color:C.muted, fontFamily:"'Space Mono',monospace", fontSize:12 }}>
                    {Array.from({ length: numbersCount }).map((_,i) => (
                      <div key={i} style={{ height:24, lineHeight:"24px", color: i < linkLines.length && linkLines[i].trim() ? C.blue : "rgba(255,255,255,0.35)", userSelect:"none" }}>{i+1}.</div>
                    ))}
                  </div>
                  <textarea
                    value={jobLink}
                    onChange={e => {
                      const lines = e.target.value.split('\n').slice(0,20);
                      setJobLink(lines.join('\n'));
                    }}
                    disabled={loading}
                    rows={4}
                    placeholder={"https://example.com/job-1\nhttps://example.com/job-2"}
                    style={{
                      flex:1, resize:"vertical",
                      background:"transparent", border:"none",
                      padding:0, margin:0, outline:"none",
                      fontFamily:"'Space Mono',monospace", fontSize:12,
                      color:C.blue, caretColor:C.pink, lineHeight:"24px",
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:12, letterSpacing:2, color:C.muted, marginBottom:8, fontWeight:700 }}>{t.job_description}</div>
                <textarea
                  value={jobDesc} onChange={e=>setJobDesc(e.target.value)} disabled={loading}
                  rows={5}
                  placeholder={t.desc_placeholder}
                  style={{
                    width:"100%", resize:"vertical",
                    background:"transparent", border:`1.5px solid ${C.black}40`,
                    borderRadius:4, padding:"8px 12px", outline:"none",
                    fontFamily:"'Space Mono',monospace", fontSize:12,
                    color:C.black, lineHeight:1.6, caretColor:C.pink,
                  }}
                />
              </>
            )}
          </div>

          {loading && (
            <div style={{ padding:"12px 16px", borderBottom:`1.5px solid ${C.black}20`, textAlign:"center", fontFamily:"'Space Mono',monospace", fontSize:12, color:C.green }}>
              {t.analyzing}
            </div>
          )}

          {/* actions */}
          <div style={{ padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"flex-end", gap:10, background:`${C.black}08` }}>
            {jobs.length>0 && (
              <Btn color={C.pink} small onClick={()=>{ if(confirm(t.clear_confirm)) setJobs([]); }}>{t.clear}</Btn>
            )}
            <Btn onClick={handleAnalyze} disabled={loading||(!jobLink.trim()&&!jobDesc.trim())}>
              {loading ? `⟳ ${progress.done}/${progress.total}` : t.lets_check}
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
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, minWidth:0 }}>
            <div className="filter-scroll" style={{ display:"flex", alignItems:"center", gap:8, overflowX:"auto", flex:1, minWidth:0, paddingBottom:4 }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, letterSpacing:3, color:C.auraCore, fontWeight:900, flexShrink:0 }}>FILTER</span>
              {[
                { key:"all",      label:"ALL",          bg:C.cream },
                { key:"to_apply", label:"★ TO APPLY",   bg:C.yellow },
                { key:"just_applied", label:"✓ JUST APPLIED!", bg:C.blue },
                ...CAT_ORDER.map(c=>({ key:c, label:CAT_META[c].label, bg:CAT_META[c].color })),
              ].map(({ key, label, bg }) => (
                <Tag key={key} onClick={()=>setFilter(key)} bg={filter===key?bg:C.paper}
                  color={filter===key?C.black:C.cream} style={{ opacity: filter===key?1:0.55, flexShrink:0 }}>{label}</Tag>
              ))}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              {/* <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:13, letterSpacing:3, color:C.auraCore, fontWeight:900 }}>SORT</span> */}
              <Tag onClick={()=>setSortBy(s => s==="fit" ? "time" : "fit")}
                bg={C.yellow} color={C.black}
                style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
                <span style={{ opacity: sortBy==="time" ? 1 : 0.4 }}>TIME ↓</span>
                <span style={{ opacity:0.4 }}>/</span>
                <span style={{ opacity: sortBy==="fit" ? 1 : 0.4 }}>FIT ↓</span>
              </Tag>
            </div>
          </div>
        )}

        {/* ── TABLE ─────────────────────────────── */}
        <Panel accent={C.auraMid}>
          <PanelHeader bg="#1A2060" color={C.auraCore}>
            THE ✶ FIT CHECK — {sorted.length}
            <Star size={16} color={C.auraCore} style={{ marginLeft:"auto" }} />
          </PanelHeader>

          {sorted.length===0 ? (
            <div style={{ textAlign:"center", padding:"80px 20px" }}>
              <div style={{ fontSize:60, marginBottom:16,
                animation:"wiggle 2s ease-in-out infinite",
                display:"inline-block" }}>✦</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:3, color:C.muted }}>
                {jobs.length===0 ? t.no_data : t.no_results}
              </div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:C.muted, marginTop:6 }}>
                {jobs.length===0 ? t.paste_links : t.modify_filters}
              </div>
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", minWidth:900 }}>
                <thead>
                  <tr style={{ background:C.black }}>
                    {["#", t.col_title, t.col_compat, t.col_salary, t.col_location, t.col_intro, t.col_stack, ""].map(h=>(
                      <th key={h} style={{
                        padding:"10px 14px", textAlign:"left",
                        fontFamily:"'Stora',sans-serif", fontSize:12,
                        letterSpacing:2, color:C.cream, whiteSpace:"nowrap",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((job, idx) => (
                    <JobRow
                      key={job.id}
                      job={job}
                      idx={idx}
                      isExpanded={expanded === job.id}
                      onExpand={() => setExpanded(expanded === job.id ? null : job.id)}
                      onToggleApply={() => setJobs(p => p.map(j => j.id === job.id ? { ...j, toApply: !j.toApply } : j))}
                      onToggleApplied={() => setJobs(p => p.map(j => j.id === job.id ? { ...j, justApplied: !j.justApplied, appliedAt: new Date() } : j))}
                      onDelete={() => setJobs(p => p.filter(j => j.id !== job.id))}
                      t={t}
                    />
                  ))}
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
          NAIL IT · STAGE · ALTERNANCE 2026
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
