import { C } from "../lib/constants";
import { FitMeter } from "./ui";

export default function JobRow({ job, idx, isExpanded, onExpand, onToggleApply, onToggleApplied, onDelete, t }) {
  const rowBg = job.justApplied ? "#1E1914" : C.paper;

  return (
    <>
      <tr
        onClick={onExpand}
        style={{
          background: isExpanded ? `${C.blue}18` : rowBg,
          borderBottom:`1.5px solid ${C.border}`,
          cursor:"pointer",
          transition:"background .12s",
        }}
        onMouseEnter={e=>{ if(!isExpanded) e.currentTarget.style.background=`${C.blue}12`; }}
        onMouseLeave={e=>{ if(!isExpanded) e.currentTarget.style.background=rowBg; }}
      >
        {/* ORDER NUM */}
        <td style={{ padding:"12px 14px", width:30, fontFamily:"'Space Mono',monospace", fontSize:12, color:C.muted, fontWeight:700 }}>
          {idx + 1}.
        </td>

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

        {/* actions */}
        <td style={{ padding:"12px 14px", display:"flex", gap:8 }} onClick={e=>e.stopPropagation()}>
          <button onClick={onToggleApply}
            style={{
              background: job.toApply ? `${C.yellow}20` : "transparent", border:`1.5px solid ${job.toApply ? C.yellow : C.border}`,
              borderRadius:4, width:26, height:26, cursor:"pointer",
              fontFamily:"'Space Mono',monospace", fontSize:14, color: job.toApply ? C.black : C.muted,
              transition:"all .12s", display:"flex", alignItems:"center", justifyContent:"center",
            }}
            title={job.toApply ? "Remove from To Apply" : "Mark To Apply"}
          >★</button>
          <button onClick={onToggleApplied}
            style={{
              background: job.justApplied ? `${C.blue}30` : "transparent", border:`1.5px solid ${job.justApplied ? C.blue : C.border}`,
              borderRadius:4, width:26, height:26, cursor:"pointer",
              fontFamily:"'Space Mono',monospace", fontSize:12, color: job.justApplied ? C.cream : C.muted,
              transition:"all .12s", display:"flex", alignItems:"center", justifyContent:"center",
            }}
            onMouseEnter={e=>{ if(!job.justApplied) { e.currentTarget.style.color=C.blue; e.currentTarget.style.borderColor=C.blue; } }}
            onMouseLeave={e=>{ if(!job.justApplied) { e.currentTarget.style.color=C.muted; e.currentTarget.style.borderColor=C.border; } }}
          >✓</button>
          <button onClick={onDelete}
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
      {isExpanded && (
        <tr key={`${job.id}-exp`}>
          <td colSpan={8} style={{ padding:"0 14px 18px", background:`${C.blue}10` }}>
            <div style={{
              background:C.paper, border:`2px solid ${C.border}`,
              borderRadius:6, padding:16,
              display:"grid", gridTemplateColumns:"1fr 1fr", gap:20,
              animation:"slideUp .2s ease",
            }}>
              <div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:11, letterSpacing:3, color:C.muted, marginBottom:6 }}>▸ {t.job_summary}</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:12, lineHeight:1.7, color:C.muted }}>{job.intro}</div>
              </div>
              <div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:11, letterSpacing:3, color:C.muted, marginBottom:6 }}>▸ {t.why_score}</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:12, lineHeight:1.7, color:C.muted }}>{job.fitReason}</div>
              </div>
              {job.techStack?.length>0 && (
                <div style={{ gridColumn:"1/-1" }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:11, letterSpacing:3, color:C.muted, marginBottom:8 }}>▸ {t.full_stack}</div>
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
}
