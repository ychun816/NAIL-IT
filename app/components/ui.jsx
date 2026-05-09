import { C, fitColor } from "../lib/constants";

/* ─── decorative helpers ──────────────────────── */
export const Star = ({ size=40, color=C.yellow, style={} }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink:0, ...style }}>
    <path d="M20 0 L22 16 L38 20 L22 24 L20 40 L18 24 L2 20 L18 16Z"
      fill={color} stroke={C.black} strokeWidth="1.5"/>
  </svg>
);

/* ─── Panel (cut-paper card) ──────────────────── */
export const Panel = ({ children, accent=C.cream, style={} }) => (
  <div style={{
    background: "rgba(58,90,196,0.70)",
    backdropFilter: "blur(2px)",
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
export const PanelHeader = ({ children, bg=C.black, color=C.cream }) => (
  <div style={{
    background: bg === C.black ? "rgba(26,32,96,0.82)" : bg,
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
export const Tag = ({ children, color=C.black, bg=C.yellow, onClick, style={} }) => (
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
export const Btn = ({ children, onClick, disabled, color=C.green, small=false }) => (
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
export const FitMeter = ({ score }) => {
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
