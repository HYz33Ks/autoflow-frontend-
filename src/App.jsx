import { useState, useRef, useCallback, useEffect } from "react";
import AuthModal from "./AuthModal";

const DARK_THEME = {
  bg: "#080a0f", surface: "#0d1117", card: "#111720", border: "#1e2d3d",
  accent: "#00d4ff", accentDim: "#00d4ff22", green: "#00ff88",
  orange: "#ff8c00", purple: "#a855f7", pink: "#ff3b7f",
  text: "#e2e8f0", muted: "#4a6080",
  shadow: "0 4px 20px #00000066",
  hoverShadow: "0 8px 32px rgba(0,0,0,0.5)",
  previewShadow: "0 -20px 60px rgba(0,0,0,0.8)",
  buttonShadow: "0 8px 30px rgba(255,255,255,0.2)",
  cardShadow: "0 10px 40px rgba(0,0,0,0.5)"
};

const LIGHT_THEME = {
  bg: "#f3f4f6", surface: "#ffffff", card: "#ffffff", border: "#e5e7eb",
  accent: "#0284c7", accentDim: "#0ea5e922", green: "#10b981",
  orange: "#f97316", purple: "#8b5cf6", pink: "#ec4899",
  text: "#0f172a", muted: "#64748b",
  shadow: "none",
  hoverShadow: "none",
  previewShadow: "none",
  buttonShadow: "none",
  cardShadow: "none"
};

let COLORS = DARK_THEME;

const NODE_TYPES = {
  ai: { color: "#a855f7", label: "IA & LLM", icon: "🤖" },
  office: { color: "#00d4ff", label: "Bureautique", icon: "📊" },
  comm: { color: "#00ff88", label: "Communication", icon: "💬" },
  data: { color: "#ff8c00", label: "Données", icon: "🗄️" },
  trigger: { color: "#ff3b7f", label: "Déclencheur", icon: "⚡" },
  logic: { color: "#facc15", label: "Logique", icon: "🔀" },
};

const ALL_NODES = [
  { id: "claude", label: "Claude AI", category: "ai", icon: "🧠", desc: "Analyse, résumé, génération" },
  { id: "chatgpt", label: "ChatGPT", category: "ai", icon: "💬", desc: "OpenAI GPT-4" },
  { id: "gemini", label: "Gemini", category: "ai", icon: "✨", desc: "Google Multimodal AI" },
  { id: "excel", label: "Excel", category: "office", icon: "📗", desc: "Lire / écrire des cellules" },
  { id: "sheets", label: "Google Sheets", category: "office", icon: "📊", desc: "Tableaux collaboratifs" },
  { id: "gmail", label: "Gmail", category: "comm", icon: "📧", desc: "Envoi & lecture d'emails" },
  { id: "outlook", label: "Outlook", category: "comm", icon: "📨", desc: "Email Microsoft" },
  { id: "slack", label: "Slack", category: "comm", icon: "💼", desc: "Messages d'équipe" },
  { id: "teams", label: "Teams", category: "comm", icon: "🗣️", desc: "Microsoft Teams" },
  { id: "notion", label: "Notion", category: "data", icon: "📝", desc: "Pages & bases de données" },
  { id: "airtable", label: "Airtable", category: "data", icon: "🗂️", desc: "Tables relationnelles" },
  { id: "cron", label: "Planificateur", category: "trigger", icon: "⏰", desc: "Tâche récurrente" },
  { id: "webhook", label: "Webhook", category: "trigger", icon: "🔗", desc: "Déclencheur HTTP" },
  { id: "condition", label: "Condition", category: "logic", icon: "❓", desc: "IF / ELSE" },
  { id: "loop", label: "Boucle", category: "logic", icon: "🔄", desc: "Itérer sur une liste" },
];

const TEMPLATES = [
  { id: 1, name: "Rapport matinal IA", category: "IA", desc: "Chaque matin à 8h, Claude génère un résumé d'actualité envoyé par Gmail", nodes: ["cron", "claude", "gmail"], color: "#a855f7", runs: 142, status: "active" },
  { id: 2, name: "Formulaire → Excel → Slack", category: "Bureautique", desc: "À chaque soumission de formulaire, insère dans Excel et notifie Slack", nodes: ["webhook", "excel", "slack"], color: "#00d4ff", runs: 89, status: "active" },
  { id: 3, name: "Analyse emails avec GPT", category: "IA", desc: "Lit les emails entrants, les classe avec GPT-4 et crée des tâches Notion", nodes: ["gmail", "chatgpt", "notion"], color: "#00ff88", runs: 203, status: "paused" },
  { id: 4, name: "Rapport hebdo Excel", category: "Bureautique", desc: "Génère un rapport Excel chaque lundi et l'envoie par Outlook", nodes: ["cron", "sheets", "excel", "outlook"], color: "#ff8c00", runs: 24, status: "active" },
  { id: 5, name: "Alerte données critiques", category: "Données", desc: "Surveille Airtable, si condition remplie → alerte Teams + email", nodes: ["airtable", "condition", "teams", "outlook"], color: "#ff3b7f", runs: 67, status: "active" },
  { id: 6, name: "Résumé réunion Gemini", category: "IA", desc: "Transcrit une réunion, Gemini génère le résumé et le post dans Notion", nodes: ["webhook", "gemini", "notion"], color: "#facc15", runs: 31, status: "active" },
];

const LOGS = [
  { id: 1, workflow: "Rapport matinal IA", status: "success", time: "08:00:03", duration: "2.3s", date: "Aujourd'hui" },
  { id: 2, workflow: "Formulaire → Excel → Slack", status: "success", time: "11:42:17", duration: "0.8s", date: "Aujourd'hui" },
  { id: 3, workflow: "Analyse emails avec GPT", status: "error", time: "09:15:44", duration: "5.1s", date: "Aujourd'hui" },
  { id: 4, workflow: "Rapport hebdo Excel", status: "success", time: "09:00:01", duration: "4.7s", date: "Lundi" },
  { id: 5, workflow: "Rapport matinal IA", status: "success", time: "08:00:02", duration: "2.1s", date: "Hier" },
  { id: 6, workflow: "Alerte données critiques", status: "success", time: "14:22:08", duration: "1.2s", date: "Hier" },
  { id: 7, workflow: "Résumé réunion Gemini", status: "success", time: "16:05:33", duration: "8.9s", date: "Hier" },
  { id: 8, workflow: "Analyse emails avec GPT", status: "success", time: "10:11:22", duration: "3.4s", date: "Hier" },
];

const INITIAL_NODES = [
  { id: "n1", type: "cron", x: 80, y: 200, label: "Tous les jours 8h" },
  { id: "n2", type: "claude", x: 320, y: 200, label: "Générer résumé" },
  { id: "n3", type: "gmail", x: 560, y: 200, label: "Envoyer email" },
];
const INITIAL_EDGES = [
  { id: "e1", from: "n1", to: "n2" },
  { id: "e2", from: "n2", to: "n3" },
];

const getNodeColor = (type) => { const n = ALL_NODES.find(n => n.id === type); return n ? NODE_TYPES[n.category]?.color || "#4a6080" : "#4a6080"; };
const getNodeIcon = (type) => ALL_NODES.find(n => n.id === type)?.icon || "⚙️";
const getNodeLabel = (type) => ALL_NODES.find(n => n.id === type)?.label || type;

// ─── WORKFLOW CANVAS ─────────────────────────────────────────────────────────
// Architecture: nodes live in a CSS-transformed "world" div.
// Edges are drawn in a SCREEN-SPACE SVG that covers the canvas 100%,
// with node positions projected through the transform manually.
// This avoids all SVG clipping issues caused by zero-size or offset containers.
function WorkflowCanvas({ nodes, edges, setNodes, setEdges, selectedNode, setSelectedNode, addNodeToCanvas, isExecuting }) {
  const canvasRef = useRef(null);
  const dragging = useRef(null);  // { id, offsetX, offsetY }
  const connecting = useRef(null);  // source nodeId while drawing an edge
  const isPanning = useRef(false);
  const panAnchor = useRef(null);  // { mouseX, mouseY, originX, originY }

  // Transform stored in ref (avoids stale closures) + mirrored to state for renders
  const xfRef = useRef({ x: 0, y: 0, zoom: 1 });
  const [xf, setXf] = useState({ x: 0, y: 0, zoom: 1 });
  // Screen-space mouse position (for live connection line)
  const [smouse, setSmouse] = useState({ x: 0, y: 0 });
  const [contextMenu, setContextMenu] = useState(null);
  const [snapLines, setSnapLines] = useState([]);

  const applyXf = (next) => { xfRef.current = next; setXf({ ...next }); };

  // world → screen
  const toScreen = (wx, wy) => ({
    x: wx * xfRef.current.zoom + xfRef.current.x,
    y: wy * xfRef.current.zoom + xfRef.current.y,
  });
  // screen → world
  const toWorld = (sx, sy) => ({
    x: (sx - xfRef.current.x) / xfRef.current.zoom,
    y: (sy - xfRef.current.y) / xfRef.current.zoom,
  });

  // ── Wheel zoom toward cursor ─────────────────────────────────────────────
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const t = xfRef.current;
    const factor = e.deltaY < 0 ? 1.04 : 1 / 1.04;
    const newZoom = Math.min(Math.max(t.zoom * factor, 0.15), 4);
    applyXf({
      zoom: newZoom,
      x: mx - (mx - t.x) * (newZoom / t.zoom),
      y: my - (my - t.y) * (newZoom / t.zoom),
    });
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  // ── Node drag ────────────────────────────────────────────────────────────
  const onNodeDown = (e, nodeId) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    const world = toWorld(e.clientX - rect.left, e.clientY - rect.top);
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    dragging.current = { id: nodeId, offsetX: world.x - node.x, offsetY: world.y - node.y };
    setSelectedNode(nodeId);
  };

  // ── Start drawing a connection ───────────────────────────────────────────
  const onConnectorDown = (e, nodeId) => {
    e.stopPropagation();
    connecting.current = nodeId;
  };

  // ── Finish drawing a connection on a node ───────────────────────────────
  const onNodeUp = (e, targetId) => {
    e.stopPropagation();
    if (connecting.current && targetId && connecting.current !== targetId) {
      if (!edges.find(ed => ed.from === connecting.current && ed.to === targetId))
        setEdges(prev => [...prev, { id: `e${Date.now()}`, from: connecting.current, to: targetId }]);
    }
    dragging.current = null;
    connecting.current = null;
    isPanning.current = false;
    panAnchor.current = null;
    setSnapLines([]);
    setSmouse(prev => ({ ...prev }));
  };

  // ── Canvas pan ───────────────────────────────────────────────────────────
  const onCanvasDown = (e) => {
    if (contextMenu) setContextMenu(null);
    // Only start pan when clicking the background (not a node)
    if (dragging.current || connecting.current) return;
    setSelectedNode(null);
    isPanning.current = true;
    const rect = canvasRef.current.getBoundingClientRect();
    panAnchor.current = {
      mouseX: e.clientX - rect.left,
      mouseY: e.clientY - rect.top,
      originX: xfRef.current.x,
      originY: xfRef.current.y,
    };
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const world = toWorld(sx, sy);
    setContextMenu({ screenX: sx, screenY: sy, worldX: world.x, worldY: world.y });
  };

  // ── Mouse move ───────────────────────────────────────────────────────────
  const onMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    setSmouse({ x: sx, y: sy });

    if (dragging.current) {
      const world = toWorld(sx, sy);
      const rawX = world.x - dragging.current.offsetX;
      const rawY = world.y - dragging.current.offsetY;
      let snapX = Math.round(rawX / 20) * 20;
      let snapY = Math.round(rawY / 20) * 20;

      const newSnapLines = [];
      nodes.forEach(n => {
        if (n.id === dragging.current.id) return;
        if (Math.abs(snapX - n.x) < 15) { snapX = n.x; newSnapLines.push({ type: 'v', val: n.x }); }
        if (Math.abs(snapY - n.y) < 15) { snapY = n.y; newSnapLines.push({ type: 'h', val: n.y }); }
      });
      setSnapLines(newSnapLines);

      setNodes(prev => prev.map(n =>
        n.id === dragging.current.id
          ? { ...n, x: snapX, y: snapY }
          : n
      ));
    }
    if (isPanning.current && panAnchor.current) {
      applyXf({
        ...xfRef.current,
        x: panAnchor.current.originX + (sx - panAnchor.current.mouseX),
        y: panAnchor.current.originY + (sy - panAnchor.current.mouseY),
      });
    }
  };

  // ── Canvas mouse up (clears all states) ─────────────────────────────────
  const onCanvasUp = () => {
    dragging.current = null;
    connecting.current = null;
    isPanning.current = false;
    panAnchor.current = null;
    setSnapLines([]);
    setSmouse(prev => ({ ...prev }));
  };

  const deleteNodeRef = useRef(null);
  deleteNodeRef.current = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    setSelectedNode(null);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.code === "Delete" || e.code === "Backspace") && selectedNode) {
        if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) return;
        if (deleteNodeRef.current) deleteNodeRef.current(selectedNode);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNode]);

  const deleteNode = (id) => {
    if (deleteNodeRef.current) deleteNodeRef.current(id);
  };

  const zoomIn = () => applyXf({ ...xfRef.current, zoom: Math.min(xfRef.current.zoom * 1.2, 4) });
  const zoomOut = () => applyXf({ ...xfRef.current, zoom: Math.max(xfRef.current.zoom / 1.2, 0.15) });
  const zoomReset = () => applyXf({ x: 0, y: 0, zoom: 1 });

  // Node dimensions (must match the rendered node div)
  const NW = 160, NH = 72;
  // Center of a node projected to screen space
  const nodeCenterScreen = (n) => toScreen(n.x + NW / 2, n.y + NH / 2);

  return (
    <div
      ref={canvasRef}
      style={{
        flex: 1, position: "relative", overflow: "hidden",
        background: `radial-gradient(ellipse at 30% 50%,${COLORS.surface} 0%,${COLORS.bg} 70%)`,
        cursor: isPanning.current ? "grabbing" : "default"
      }}
      onMouseMove={onMove}
      onMouseUp={onCanvasUp}
      onMouseDown={onCanvasDown}
      onMouseLeave={onCanvasUp}
      onContextMenu={handleContextMenu}
    >
      {/* ── Grid (screen-space, follows pan+zoom) ── */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <defs>
          <pattern id="wfgrid" width={40 * xf.zoom} height={40 * xf.zoom} patternUnits="userSpaceOnUse"
            x={xf.x % (40 * xf.zoom)} y={xf.y % (40 * xf.zoom)}>
            <path d={`M${40 * xf.zoom} 0L0 0 0${40 * xf.zoom}`} fill="none" stroke={COLORS.border} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wfgrid)" />
      </svg>

      {/* ── Edges SVG — screen-space, full size, above grid but below nodes ── */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
        {/* Draw snap lines */}
        {snapLines.map((sl, i) => {
          if (sl.type === 'v') {
            const sx = toScreen(sl.val, 0).x;
            return <line key={`sl${i}`} x1={sx} y1="0" x2={sx} y2="100%" stroke={COLORS.accent} strokeWidth="1" strokeDasharray="4 4" opacity=".5" />;
          } else {
            const sy = toScreen(0, sl.val).y;
            return <line key={`sl${i}`} x1="0" y1={sy} x2="100%" y2={sy} stroke={COLORS.accent} strokeWidth="1" strokeDasharray="4 4" opacity=".5" />;
          }
        })}
        {edges.map(edge => {
          const fn = nodes.find(n => n.id === edge.from);
          const tn = nodes.find(n => n.id === edge.to);
          if (!fn || !tn) return null;
          const f = nodeCenterScreen(fn);
          const t2 = nodeCenterScreen(tn);
          const mx = (f.x + t2.x) / 2;
          const color = getNodeColor(fn.type);
          return (
            <g key={edge.id}>
              <path d={`M${f.x},${f.y} C${mx},${f.y} ${mx},${t2.y} ${t2.x},${t2.y}`}
                fill="none" stroke={color} strokeWidth="2" opacity={isExecuting ? "1" : ".7"} strokeDasharray="6 3" filter={isExecuting ? `drop-shadow(0 0 8px ${color})` : "none"}>
                <animate attributeName="stroke-dashoffset" from="0" to="-18" dur={isExecuting ? "0.3s" : "1s"} repeatCount="indefinite" />
              </path>
              <circle cx={t2.x} cy={t2.y} r={isExecuting ? "7" : "5"} fill={color} opacity=".9" />
            </g>
          );
        })}
        {/* Live connection line while dragging from a connector */}
        {connecting.current && (() => {
          const fn = nodes.find(n => n.id === connecting.current);
          if (!fn) return null;
          const f = nodeCenterScreen(fn);
          return (
            <line x1={f.x} y1={f.y} x2={smouse.x} y2={smouse.y}
              stroke={COLORS.accent} strokeWidth="2" strokeDasharray="5 3" opacity=".8" />
          );
        })()}
      </svg>

      {/* ── World container (nodes) ── */}
      <div style={{
        position: "absolute", left: 0, top: 0,
        transform: `translate(${xf.x}px,${xf.y}px) scale(${xf.zoom})`,
        transformOrigin: "0 0", willChange: "transform", zIndex: 2
      }}>
        {nodes.map((node, idx) => {
          const color = getNodeColor(node.type);
          const icon = getNodeIcon(node.type);
          const sel = selectedNode === node.id;
          return (
            <div key={node.id}
              style={{
                position: "absolute", left: node.x, top: node.y, width: NW,
                background: sel ? `${color}22` : COLORS.card,
                border: `2px solid ${sel ? color : COLORS.border}`,
                borderRadius: 12, padding: "10px 14px",
                cursor: "grab", userSelect: "none",
                boxShadow: sel ? `0 0 20px ${color}44` : COLORS.shadow,
                transition: "box-shadow .2s,border-color .2s", zIndex: sel ? 10 : 1,
                animation: `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.1}s both`
              }}
              onMouseDown={(e) => onNodeDown(e, node.id)}
              onMouseUp={(e) => onNodeUp(e, node.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontSize: 18, background: `${color}22`, borderRadius: 8,
                  width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                  border: `1px solid ${color}44`, flexShrink: 0
                }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "monospace" }}>{getNodeLabel(node.type)}</div>
                  <div style={{ fontSize: 12, color: COLORS.text, fontWeight: 600, lineHeight: 1.3 }}>{node.label}</div>
                </div>
              </div>
              {/* Output connector dot */}
              <div
                style={{
                  position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)",
                  width: 16, height: 16, borderRadius: "50%",
                  background: color, border: `2px solid ${COLORS.bg}`,
                  cursor: "crosshair", zIndex: 20
                }}
                onMouseDown={(e) => onConnectorDown(e, node.id)}
              />
              {/* Delete button (visible when selected) */}
              {sel && (
                <div
                  style={{
                    position: "absolute", top: -9, right: -9,
                    width: 18, height: 18, borderRadius: "50%",
                    background: "#ff3b7f", border: "2px solid #080a0f",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, cursor: "pointer", color: "#fff", fontWeight: 700, zIndex: 30
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                >×</div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Zoom controls ── */}
      <div style={{
        position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 2,
        background: COLORS.surface + "ee", border: `1px solid ${COLORS.border}`,
        borderRadius: 12, padding: "4px 6px", backdropFilter: "blur(8px)", zIndex: 100
      }}>
        {[
          { l: "−", w: 32, action: zoomOut, style: { fontSize: 20, color: COLORS.text } },
          { l: `${Math.round(xf.zoom * 100)}%`, w: 56, action: zoomReset, style: { fontSize: 11, color: COLORS.accent, fontFamily: "monospace", fontWeight: 700 } },
          { l: "+", w: 32, action: zoomIn, style: { fontSize: 20, color: COLORS.text } },
        ].map((b, i) => (
          <button key={i} onClick={b.action}
            style={{
              width: b.w, height: 32, borderRadius: 8, border: "none", background: "transparent",
              cursor: "pointer", transition: "background .15s",
              display: "flex", alignItems: "center", justifyContent: "center", ...b.style
            }}
            onMouseEnter={e => e.currentTarget.style.background = COLORS.border}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >{b.l}</button>
        ))}
      </div>

      {/* ── Context Menu ── */}
      {contextMenu && (
        <div style={{ position: "absolute", left: contextMenu.screenX, top: contextMenu.screenY, width: 220, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 8, zIndex: 200, boxShadow: COLORS.hoverShadow, maxHeight: 300, overflow: "auto", animation: "fadeIn .15s ease-out" }}>
          <div style={{ fontSize: 10, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase", padding: "0 6px", fontFamily: "monospace" }}>Ajouter un nœud</div>
          {ALL_NODES.map(n => {
            const catInfo = NODE_TYPES[n.category] || { color: "#4a6080" };
            return (
              <div key={n.id} onClick={(e) => { e.stopPropagation(); addNodeToCanvas(n.id, contextMenu.worldX, contextMenu.worldY); setContextMenu(null); }}
                style={{ padding: "8px 10px", fontSize: 12, cursor: "pointer", borderRadius: 8, display: "flex", alignItems: "center", gap: 10, color: COLORS.text, transition: "background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = COLORS.card}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <span style={{ width: 24, height: 24, borderRadius: 6, background: `${catInfo.color}22`, display: "flex", alignItems: "center", justifyContent: "center", color: catInfo.color, border: `1px solid ${catInfo.color}44` }}>{n.icon}</span>
                <div style={{ fontWeight: 600 }}>{n.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Hints ── */}
      <div style={{
        position: "absolute", bottom: 20, right: 16, fontSize: 11, color: COLORS.muted,
        fontFamily: "monospace", textAlign: "right", lineHeight: 1.9, pointerEvents: "none"
      }}>
        <div>🖱️ Scroll → zoom · Glisser fond → pan</div>
        <div>🔵 Point coloré → connecter · Clic-droit → menu</div>
        <div>✕ Sélectionner → supprimer (ou touche Suppr)</div>
      </div>
    </div>
  );
}

const Logo = ({ size = 48, className = "", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={{ filter: "drop-shadow(0 0 10px rgba(0, 212, 255, 0.4))", ...style }}>
    <defs>
      <linearGradient id="gradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00d4ff" />
        <stop offset="100%" stopColor="#0088ff" />
      </linearGradient>
      <linearGradient id="gradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#ff3b7f" />
      </linearGradient>
    </defs>
    <path d="M50,20 L50,40" stroke="url(#gradCyan)" strokeWidth="3" fill="none" />
    <path d="M50,40 L30,40 L30,55 L20,55" stroke="url(#gradPurple)" strokeWidth="3" fill="none" strokeLinejoin="round" />
    <path d="M50,40 L70,40" stroke="url(#gradCyan)" strokeWidth="3" fill="none" strokeLinejoin="round" />
    <path d="M50,40 L50,60" stroke="url(#gradPurple)" strokeWidth="3" fill="none" />
    <path d="M20,55 L50,55 L50,75 L50,90" stroke="url(#gradPurple)" strokeWidth="3" fill="none" strokeLinejoin="round" />
    <path d="M50,60 L75,60 L75,50" stroke="url(#gradCyan)" strokeWidth="3" fill="none" strokeLinejoin="round" />
    {[
      { x: 50, y: 40, c: "url(#gradCyan)" }, { x: 20, y: 55, c: "url(#gradPurple)" }, { x: 70, y: 40, c: "url(#gradCyan)" },
      { x: 50, y: 60, c: "url(#gradPurple)" }, { x: 50, y: 75, c: "url(#gradPurple)" }, { x: 50, y: 90, c: "url(#gradPurple)" },
      { x: 75, y: 50, c: "url(#gradCyan)" }
    ].map((h, i) => (
      <polygon key={i} points={`${h.x},${h.y - 6} ${h.x + 5.2},${h.y - 3} ${h.x + 5.2},${h.y + 3} ${h.x},${h.y + 6} ${h.x - 5.2},${h.y + 3} ${h.x - 5.2},${h.y - 3}`} fill={COLORS.bg} stroke={h.c} strokeWidth="2" />
    ))}
    <path d="M50,4 L52,12 L59,14 L52,16 L50,24 L48,16 L41,14 L48,12 Z" fill="#00d4ff" filter="drop-shadow(0 0 4px #00d4ff)" />
  </svg>
);

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function AutoFlow() {
  const [theme, setTheme] = useState("dark");
  COLORS = theme === "dark" ? DARK_THEME : LIGHT_THEME;

  const [screen, setScreen] = useState("landing");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('autoflow_token') || null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [savedWorkflows, setSavedWorkflows] = useState([]);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/api/workflows', { headers: { 'Authorization': `Bearer ${token}` }})
        .then(res => res.json())
        .then(data => { if (!data.error) setSavedWorkflows(data); })
        .catch(console.error);
    }
  }, [token]);

  const handleLogin = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('autoflow_token', jwtToken);
    setAuthModalOpen(false);
    setScreen("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('autoflow_token');
    setScreen("landing");
  };

  const handleOpenApp = () => {
    if (token) setScreen("dashboard");
    else setAuthModalOpen(true);
  };
  const [workflowNodes, setWorkflowNodes] = useState(INITIAL_NODES);
  const [workflowEdges, setWorkflowEdges] = useState(INITIAL_EDGES);
  const [selectedNode, setSelectedNode] = useState(null);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [workflowName, setWorkflowName] = useState("Rapport matinal IA");
  const [isActive, setIsActive] = useState(true);
  const [templateFilter, setTemplateFilter] = useState("Tous");
  const [showSuccess, setShowSuccess] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [configOpen, setConfigOpen] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleChatSubmit = (e) => {
    if (e.key === 'Enter' && chatQuery.trim()) {
      const q = chatQuery.trim();
      setChatHistory(prev => [...prev, { role: 'user', content: q }]);
      setChatQuery('');
      setIsChatLoading(true);

      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'ai', content: "Je suis l'assistant AutoFlow. Je peux analyser votre demande et vous suggérer les blocs parfaits pour ce workflow !" }]);
        setIsChatLoading(false);
      }, 1500);
    }
  };

  const helpRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (helpRef.current && !helpRef.current.contains(e.target)) {
        setIsHelpOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll(".scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [screen]);

  const addNodeToCanvas = useCallback((nodeType, px = null, py = null) => {
    const rawX = px !== null ? px : 100 + Math.random() * 300;
    const rawY = py !== null ? py : 80 + Math.random() * 200;
    const snapX = Math.round(rawX / 20) * 20;
    const snapY = Math.round(rawY / 20) * 20;
    setWorkflowNodes(prev => [...prev, { id: `n${Date.now()}`, type: nodeType, x: snapX, y: snapY, label: getNodeLabel(nodeType) }]);
    setScreen("editor");
  }, []);

  const filteredNodes = ALL_NODES.filter(n =>
    n.label.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
    (NODE_TYPES[n.category]?.label || "").toLowerCase().includes(sidebarSearch.toLowerCase())
  );

  const templateCategories = ["Tous", ...new Set(TEMPLATES.map(t => t.category))];
  const filteredTemplates = templateFilter === "Tous" ? TEMPLATES : TEMPLATES.filter(t => t.category === templateFilter);
  const handleSave = async () => {
    if (!token) return setAuthModalOpen(true);
    try {
      const res = await fetch('http://localhost:5000/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: workflowName, nodes: workflowNodes, edges: workflowEdges, isActive })
      });
      if (res.ok) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        const dataRes = await fetch('http://localhost:5000/api/workflows', { headers: { 'Authorization': `Bearer ${token}` }});
        const data = await dataRes.json();
        if (!data.error) setSavedWorkflows(data);
      }
    } catch (err) { console.error(err); }
  };

  const handleTest = () => {
    setIsExecuting(true);
    setTimeout(() => setIsExecuting(false), 3000);
  };

  const deleteEdge = (id) => setWorkflowEdges(prev => prev.filter(e => e.id !== id));
  const loadTemplate = (template) => {
    setScreen("editor");
    setIsTemplateLoading(true);
    setWorkflowName(template.name);
    setWorkflowNodes([]);
    setWorkflowEdges([]);

    setTimeout(() => {
      const newNodes = template.nodes.map((type, i) => ({
        id: `n${Date.now()}_${i}`, type, x: 100 + i * 240, y: 200, label: getNodeLabel(type), config: {}
      }));
      const newEdges = [];
      for (let i = 0; i < newNodes.length - 1; i++) {
        newEdges.push({ id: `e${Date.now()}_${i}`, from: newNodes[i].id, to: newNodes[i + 1].id });
      }
      setWorkflowNodes(newNodes);

      setTimeout(() => {
        setWorkflowEdges(newEdges);
      }, 400);

      setIsTemplateLoading(false);
    }, 1200);
  };

  const stats = [
    { label: "Workflows actifs", value: "5", icon: "⚡", color: COLORS.green },
    { label: "Exécutions today", value: "47", icon: "🔄", color: COLORS.accent },
    { label: "Taux de succès", value: "97.8%", icon: "✅", color: "#00ff88" },
    { label: "Temps moyen", value: "2.4s", icon: "⏱️", color: COLORS.orange },
  ];

  const navItems = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "editor", icon: "⬡", label: "Éditeur" },
    { id: "templates", icon: "◈", label: "Templates" },
    { id: "logs", icon: "≡", label: "Historique" },
    { id: "settings", icon: "⚙", label: "Intégrations" },
  ];

  return (
    <div style={{ "--text": COLORS.text, "--card-shadow": COLORS.cardShadow, "--glass-panel": COLORS.surface + "aa", "--glass-card": COLORS.card + "cc", "--hover-bg": COLORS.surface, "--hover-nav": COLORS.card, display: "flex", height: "100vh", background: COLORS.bg, fontFamily: "'IBM Plex Sans','Segoe UI',sans-serif", color: COLORS.text, overflow: "hidden", position: "relative" }}>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onLogin={handleLogin} themeColors={COLORS} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#1e2d3d;border-radius:2px}
        *{box-sizing:border-box}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatDown{from{opacity:0;transform:translateY(-30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes zoomInFade{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        @keyframes gradientMove { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }
        
        /* Animated Background Waves */
        .text-gradient-logo {
          background: linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple});
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          background-clip: text !important;
          color: transparent !important;
        }
        @keyframes bg-wave {
          0% { transform: scale(1) translate(0, 0) rotate(0deg); }
          50% { transform: scale(1.2) translate(4vw, 3vh) rotate(10deg); }
          100% { transform: scale(1) translate(0, 0) rotate(360deg); }
        }
        @keyframes bg-wave-fast {
          0% { transform: scale(0.9) translate(0, 0) rotate(0deg); }
          50% { transform: scale(1.3) translate(-5vw, 4vh) rotate(-15deg); }
          100% { transform: scale(0.9) translate(0, 0) rotate(-360deg); }
        }
        .animated-bg {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          overflow: hidden; z-index: 0; pointer-events: none;
          background-color: transparent;
        }
        .animated-bg .blob-1 {
          position: absolute; width: 60vw; height: 60vw; border-radius: 50%;
          background: radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 60%);
          top: -10vw; left: -10vw;
          animation: bg-wave 14s infinite linear;
        }
        .animated-bg .blob-2 {
          position: absolute; width: 70vw; height: 70vw; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,212,255,0.16) 0%, transparent 50%);
          bottom: -20vw; right: -10vw;
          animation: bg-wave-fast 16s infinite linear;
        }
        .animated-bg .blob-3 {
          position: absolute; width: 50vw; height: 50vw; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,59,127,0.15) 0%, transparent 60%);
          top: 30vh; left: 20vw;
          animation: bg-wave 12s infinite alternate ease-in-out;
        }
        .animated-bg .blob-4 {
          position: absolute; width: 45vw; height: 45vw; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,255,136,0.12) 0%, transparent 60%);
          top: 10vh; right: 10vw;
          animation: bg-wave-fast 18s infinite alternate-reverse ease-in-out;
        }
        .animated-bg .blob-5 {
          position: absolute; width: 40vw; height: 40vw; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,140,0,0.14) 0%, transparent 60%);
          bottom: 10vh; left: 10vw;
          animation: bg-wave 10s infinite linear reverse;
        }

        /* Scroll Reveal Transitions */
        .scroll-reveal { opacity: 0; transform: translateY(40px); transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .scroll-reveal.visible { opacity: 1; transform: translateY(0); }
        
        /* Subtle glassmorphism updates */
        .glass-panel { background: var(--glass-panel); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        .glass-card { background: var(--glass-card); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        
        /* Chatbot Logo Animations */
        .help-logo { transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer; transform-origin: center; }
        .help-logo:hover { transform: scale(1.15) rotate(5deg); }
        .help-bar-container { display:flex; align-items:center; justify-content:flex-end; gap:16px; position:absolute; bottom:32px; right:32px; z-index:1000; animation:fadeIn 0.5s ease; pointer-events:auto; }
        .help-bar { width: 0; opacity: 0; overflow: hidden; transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); border-radius: 30px; background: var(--glass-panel); backdrop-filter: blur(20px); border: 1px solid transparent; box-shadow: var(--card-shadow); display: flex; align-items: center; }
        .help-bar.open { width: 320px; opacity: 1; border-color: rgba(168,85,247,0.5); padding: 4px 16px; margin-right: -8px; }
        .help-input { width: 100%; background: transparent; border: none; outline: none; color: var(--text); font-size: 14px; padding: 12px 4px; font-family: 'IBM Plex Sans', sans-serif; }
        .help-input::placeholder { color: rgba(255,255,255,0.4); }
        
        /* Chat Window Styles */
        .chat-window { position:absolute; bottom:80px; right:10px; width:320px; max-height:400px; background:var(--glass-panel); backdrop-filter:blur(24px); border:1px solid rgba(168,85,247,0.3); border-radius:20px; padding:16px; display:flex; flex-direction:column; gap:12px; overflow-y:auto; box-shadow: var(--card-shadow); opacity:0; transform:translateY(20px); pointer-events:none; transition:all 0.4s cubic-bezier(0.16, 1, 0.3, 1); z-index:999; scrollbar-width:none; }
        .chat-window.open { opacity:1; transform:translateY(0); pointer-events:auto; }
        .chat-msg { font-size:13px; line-height:1.5; padding:10px 14px; border-radius:14px; max-width:85%; word-wrap:break-word; animation:fadeIn 0.3s ease; }
        .chat-msg.user { background:linear-gradient(135deg,var(--accent),var(--purple)); color:#fff; align-self:flex-end; border-bottom-right-radius:4px; }
        .chat-msg.ai { background:var(--card); color:var(--text); border:1px solid var(--border); align-self:flex-start; border-bottom-left-radius:4px; }
        .chat-typing { display:flex; gap:4px; padding:12px 14px; background:var(--card); border:1px solid var(--border); border-radius:14px; width:fit-content; align-self:flex-start; border-bottom-left-radius:4px; }
        .dot { width:6px; height:6px; background:var(--muted); border-radius:50%; animation:bounce 1.4s infinite ease-in-out both; }
        .dot:nth-child(1) { animation-delay:-0.32s; } .dot:nth-child(2) { animation-delay:-0.16s; }
        @keyframes bounce { 0%, 80%, 100% { transform:scale(0); } 40% { transform:scale(1); } }
        @keyframes spin { 100% { transform:rotate(360deg); } }
        @keyframes fadeInUp { 0% { opacity:0; transform:translateY(20px); } 100% { opacity:1; transform:translateY(0); } }

        
        .nav-item:hover{background:var(--hover-nav)!important}
        .node-card:hover{border-color:#2e4060!important;transform:translateY(-1px)}
        .template-card:hover{border-color:var(--c)!important;box-shadow:0 0 24px var(--cs)!important}
        .btn-primary:hover{filter:brightness(1.15);transform:translateY(-1px)}
        .log-row:hover{background:var(--hover-bg)!important}
        .integration-card:hover{border-color:#2e4060!important}
      `}</style>

      {/* GLOBAL ANIMATED BACKGROUND */}
      <div className="animated-bg">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
        <div className="blob-3"></div>
        <div className="blob-4"></div>
        <div className="blob-5"></div>
      </div>

      {/* Sidebar (Hidden on landing page) */}
      {screen !== "landing" && (
        <div className="glass-panel" style={{ width: 72, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: 4, zIndex: 10 }}>
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center" }}><Logo size={54} /></div>
          {navItems.map(item => (
            <div key={item.id} className="nav-item" onClick={() => setScreen(item.id)} title={item.label}
              style={{ width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .15s", background: screen === item.id ? COLORS.accentDim : "transparent", border: screen === item.id ? `1px solid ${COLORS.accent}44` : "1px solid transparent" }}>
              <span style={{ fontSize: 16, color: screen === item.id ? COLORS.accent : COLORS.muted }}>{item.icon}</span>
            </div>
          ))}
          <div onClick={handleLogout} title="Déconnexion" style={{ marginTop: "auto", width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#00d4ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {user ? user.email.substring(0,2).toUpperCase() : 'JD'}
          </div>
        </div>
      )}

      {/* LANDING PAGE (APPLE INSPIRED) */}
      {screen === "landing" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "transparent", overflow: "auto", position: "relative", zIndex: 10 }}>

          {/* Header */}
          <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 60px", justifyContent: "space-between", background: COLORS.surface + "cc", backdropFilter: "blur(20px)", borderBottom: `1px solid ${COLORS.border}`, position: "sticky", top: 0, zIndex: 100, animation: "floatDown 0.8s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Logo size={36} />
              <div className="text-gradient-logo" style={{ fontSize: 22, fontFamily: "'IBM Plex Mono',monospace", fontWeight: 700, letterSpacing: 2, display: "inline-block" }}>AutoFlow</div>
            </div>
            <div style={{ display: "flex", gap: 32, fontSize: 13, fontWeight: 500, color: COLORS.muted }}>
              <span onClick={() => document.getElementById("features").scrollIntoView({ behavior: "smooth" })} style={{ cursor: "pointer", transition: "color .2s" }} onMouseEnter={e => e.target.style.color = COLORS.text} onMouseLeave={e => e.target.style.color = COLORS.muted}>Fonctionnalités</span>
              <span onClick={() => document.getElementById("templates-preview").scrollIntoView({ behavior: "smooth" })} style={{ cursor: "pointer", transition: "color .2s" }} onMouseEnter={e => e.target.style.color = COLORS.text} onMouseLeave={e => e.target.style.color = COLORS.muted}>Templates</span>
              <span onClick={() => document.getElementById("security").scrollIntoView({ behavior: "smooth" })} style={{ cursor: "pointer", transition: "color .2s" }} onMouseEnter={e => e.target.style.color = COLORS.text} onMouseLeave={e => e.target.style.color = COLORS.muted}>Sécurité</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer", transition: "transform .2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} title={theme === 'dark' ? "Passer au thème clair" : "Passer au thème sombre"}>
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button onClick={handleOpenApp} style={{ background: COLORS.text, border: "none", borderRadius: 20, color: COLORS.bg, fontWeight: 600, padding: "8px 18px", cursor: "pointer", fontSize: 13, transition: "transform .15s", boxShadow: `0 4px 14px ${COLORS.text}33` }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>{token ? "Ouvrir l'App" : "Connexion"}</button>
            </div>
          </div>

          {/* Hero Section */}
          <div style={{ height: "90vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>

            {/* Animated background glow */}
            <div style={{ position: "absolute", width: 800, height: 800, background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(0,212,255,0.05) 50%, transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 0, animation: "pulse 4s infinite alternate ease-in-out" }} />

            <div style={{ zIndex: 1, textAlign: "center", padding: "0 20px" }}>
              <div style={{ animation: "floatUp 1s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
                <h1 style={{ fontSize: "clamp(60px, 8vw, 120px)", fontWeight: 700, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1, background: `linear-gradient(90deg, ${COLORS.text}, ${COLORS.muted})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Le futur du travail.
                </h1>
                <h1 style={{ fontSize: "clamp(60px, 8vw, 120px)", fontWeight: 700, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1, background: `linear-gradient(270deg, ${COLORS.accent}, ${COLORS.purple}, ${COLORS.pink})`, backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "gradientMove 6s ease infinite" }}>
                  Automatisé.
                </h1>
              </div>

              <p style={{ marginTop: 32, fontSize: "clamp(18px, 2vw, 24px)", color: COLORS.muted, maxWidth: 600, margin: "32px auto 0", lineHeight: 1.5, animation: "floatUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both" }}>
                Connectez vos applications bureautiques à la puissance de l'IA en quelques clics. Sans écrire une seule ligne de code.
              </p>

              <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 48, animation: "floatUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both" }}>
                <button onClick={handleOpenApp} style={{ background: COLORS.text, border: "none", borderRadius: 30, color: COLORS.bg, fontWeight: 600, padding: "16px 32px", cursor: "pointer", fontSize: 16, transition: "all .2s", boxShadow: COLORS.buttonShadow }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                  {token ? "Accéder au Dashboard" : "Démarrer gratuitement"}
                </button>
                <button onClick={() => setScreen("templates")} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 30, color: COLORS.text, fontWeight: 600, padding: "16px 32px", cursor: "pointer", fontSize: 16, transition: "all .2s" }} onMouseEnter={e => { e.currentTarget.style.background = COLORS.card; e.currentTarget.style.borderColor = COLORS.muted; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = COLORS.border; }}>
                  Voir les templates
                </button>
              </div>
            </div>

            {/* Mock Editor Floating Preview */}
            <div style={{ position: "absolute", bottom: "-20%", width: "80%", height: 400, background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "24px 24px 0 0", boxShadow: COLORS.previewShadow, transform: "perspective(1000px) rotateX(15deg)", animation: "zoomInFade 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }}>
              {/* Decorative grid */}
              <div style={{ position: "absolute", inset: 0, backgroundSize: "40px 40px", backgroundImage: "linear-gradient(to right, #1e2d3d 1px, transparent 1px), linear-gradient(to bottom, #1e2d3d 1px, transparent 1px)", opacity: 0.5 }} />
              <img src="https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&q=80&w=1200&h=400" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.1, mixBlendMode: "screen" }} alt="Dashboard preview background" />
              <div style={{ position: "absolute", display: "flex", gap: 40, alignItems: "center" }}>
                <div style={{ background: COLORS.card, border: `2px solid ${COLORS.accent}`, padding: "20px", borderRadius: 16, display: "flex", gap: 12, alignItems: "center", boxShadow: `0 10px 30px ${COLORS.accent}33` }}>
                  <span style={{ fontSize: 28 }}>🧠</span> <span style={{ fontWeight: 700, fontSize: 18, color: "#fff" }}>Claude AI</span>
                </div>
                <div style={{ width: 80, height: 3, background: COLORS.purple, position: "relative" }}>
                  <div style={{ position: "absolute", right: -4, top: -3, width: 9, height: 9, borderRadius: "50%", background: COLORS.purple }} />
                </div>
                <div style={{ background: COLORS.card, border: `2px solid ${COLORS.purple}`, padding: "20px", borderRadius: 16, display: "flex", gap: 12, alignItems: "center", boxShadow: `0 10px 30px ${COLORS.purple}33` }}>
                  <span style={{ fontSize: 28 }}>📊</span> <span style={{ fontWeight: 700, fontSize: 18, color: "#fff" }}>Sheets</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features grid */}
          <div id="features" style={{ padding: "120px 10%", background: "transparent" }}>
            <h2 className="scroll-reveal" style={{ fontSize: 48, fontWeight: 700, textAlign: "center", marginBottom: 80, color: COLORS.text }}>Conçu pour la fluidité.</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
              {[
                { title: "Intelligence Multimodale", desc: "Connectez ChatGPT, Claude et Gemini dans un seul flux de travail sans API complexes.", icon: "✨", color: COLORS.purple },
                { title: "Bureautique native", desc: "Excel, Sheets, Gmail, Outlook. Vos outils du quotidien, automatisés instantanément.", icon: "📊", color: COLORS.accent },
                { title: "Temps réel infaillible", desc: "Une architecture distribuée qui garantit l'exécution de vos tâches à la seconde près.", icon: "⚡", color: COLORS.green }
              ].map((f, i) => (
                <div key={i} className="glass-card scroll-reveal" style={{ border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: 40, transition: "transform .3s, opacity 0.8s, translateY 0.8s", transitionDelay: `${i * 0.15}s`, cursor: "default" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-8px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                  <div style={{ fontSize: 40, marginBottom: 24, width: 80, height: 80, background: `${f.color}15`, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${f.color}33` }}>{f.icon}</div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 16px 0", color: COLORS.text }}>{f.title}</h3>
                  <p style={{ fontSize: 16, color: COLORS.muted, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Templates Preview Section */}
          <div id="templates-preview" style={{ padding: "120px 10%", background: COLORS.bg, borderTop: `1px solid ${COLORS.border}`, borderBottom: `1px solid ${COLORS.border}` }}>
            <div className="scroll-reveal" style={{ textAlign: "center", marginBottom: 80 }}>
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, color: COLORS.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Prêt à l'emploi</div>
              <h2 style={{ fontSize: 48, fontWeight: 700, margin: 0, color: COLORS.text }}>Démarrez en une seconde.</h2>
              <p style={{ fontSize: 20, color: COLORS.muted, maxWidth: 600, margin: "24px auto 0" }}>Des dizaines de templates pré-configurés pour les cas d'usage les plus courants.</p>
            </div>

            <div className="scroll-reveal" style={{ display: "flex", gap: 24, overflowX: "auto", paddingBottom: 32, snapType: "x mandatory", scrollbarWidth: "none" }}>
              {TEMPLATES.slice(0, 4).map((t, i) => (
                <div key={i} className="glass-card" onClick={() => { setScreen("editor"); loadTemplate(t); }} style={{ minWidth: 340, flex: "0 0 340px", border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 32, cursor: "pointer", transition: "all .3s", snapAlign: "start", position: "relative", overflow: "hidden", "--c": t.color }} onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.borderColor = t.color; e.currentTarget.style.boxShadow = `0 16px 40px ${t.color}22`; }} onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.boxShadow = "none"; }}>
                  <div style={{ position: "absolute", top: 0, right: 0, width: 150, height: 150, background: `radial-gradient(circle at top right, ${t.color}33, transparent 70%)`, pointerEvents: "none" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <span style={{ fontSize: 10, fontFamily: "monospace", padding: "4px 12px", borderRadius: 20, background: `${t.color}22`, color: t.color, border: `1px solid ${t.color}44` }}>{t.category}</span>
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 12px 0", color: COLORS.text }}>{t.name}</h3>
                  <p style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.5, marginBottom: 24 }}>{t.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {t.nodes.map((n, idx) => <span key={idx} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, background: `${getNodeColor(n)}15`, color: getNodeColor(n), border: `1px solid ${getNodeColor(n)}33`, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 6 }}>{getNodeIcon(n)} {getNodeLabel(n)}</span>)}
                  </div>
                </div>
              ))}
            </div>
            <div className="scroll-reveal" style={{ textAlign: "center", marginTop: 32 }}>
              <button onClick={() => setScreen("templates")} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 30, color: "#fff", fontWeight: 600, padding: "12px 24px", cursor: "pointer", fontSize: 14, transition: "background .2s" }} onMouseEnter={e => e.currentTarget.style.background = COLORS.card} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                Voir tous les templates →
              </button>
            </div>
          </div>

          {/* Security Section */}
          <div id="security" style={{ padding: "160px 10%", background: "transparent", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 1000, height: 1000, background: "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 60%)", zIndex: 0, pointerEvents: "none" }} />
            <div className="scroll-reveal" style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 80, height: 80, borderRadius: "50%", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", marginBottom: 32, boxShadow: "0 0 40px rgba(0,212,255,0.2)" }}>
                <span style={{ fontSize: 32 }}>🛡️</span>
              </div>
              <h2 style={{ fontSize: 48, fontWeight: 700, marginBottom: 24, color: COLORS.text }}>La sécurité au cœur du système.</h2>
              <p style={{ fontSize: 20, color: COLORS.muted, lineHeight: 1.6, marginBottom: 64 }}>Vos données n'appartiennent qu'à vous. AutoFlow est conçu pour répondre aux exigences des entreprises les plus strictes au monde.</p>

              <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
                {[
                  { label: "Chiffrement AES-256", icon: "🔒" },
                  { label: "Conformité RGPD", icon: "🇪🇺" },
                  { label: "Zéro Rétention IA", icon: "👁️‍🗨️" },
                  { label: "Audit Logs Temps Réel", icon: "📜" }
                ].map((badge, i) => (
                  <div key={i} className="glass-panel" style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderRadius: 16, border: `1px solid ${COLORS.border}` }}>
                    <span style={{ fontSize: 20 }}>{badge.icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.text }}>{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div style={{ padding: "100px 20px", textAlign: "center", borderTop: `1px solid ${COLORS.border}`, background: COLORS.surface }}>
            <h2 className="scroll-reveal" style={{ fontSize: 36, fontWeight: 700, marginBottom: 32, color: COLORS.text }}>Prêt à automatiser l'impossible ?</h2>
            <button className="scroll-reveal" onClick={() => setScreen("dashboard")} style={{ background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`, border: "none", borderRadius: 30, color: "#000", fontWeight: 700, padding: "16px 40px", cursor: "pointer", fontSize: 18, transition: "transform .2s", boxShadow: `0 10px 30px ${COLORS.purple}44` }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              Créer mon premier flux
            </button>
            <div style={{ marginTop: 64, fontSize: 13, color: COLORS.muted, display: "flex", justifyContent: "center", gap: 24 }}>
              <span>© 2026 AutoFlow Inc.</span>
              <span style={{ cursor: "pointer" }}>Mentions légales</span>
              <span style={{ cursor: "pointer" }}>Confidentialité</span>
            </div>
          </div>

        </div>
      )}

      {/* DASHBOARD */}
      {screen === "dashboard" && (
        <div key="dashboard" style={{ flex: 1, overflow: "auto", padding: 32, animation: "fadeIn 0.2s ease", zIndex: 10 }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, color: COLORS.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Tableau de bord</div>
            <h1 style={{ margin: 0, fontSize: 38, fontWeight: 700, background: `linear-gradient(135deg,${COLORS.text},${COLORS.muted})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Vue d'ensemble</h1>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
            {stats.map((s, i) => (
              <div key={i} className="glass-card" style={{ border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "20px 24px", animation: `fadeIn .4s ease ${i * .1}s both` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div><div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: s.color, fontFamily: "'IBM Plex Mono',monospace" }}>{s.value}</div>
                  </div>
                  <span style={{ fontSize: 24, opacity: .7 }}>{s.icon}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="glass-card" style={{ border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 20, fontSize: 14 }}>Activité — 7 derniers jours</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
              {[32, 45, 28, 67, 41, 58, 47].map((v, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", borderRadius: 4, height: `${(v / 70) * 72}px`, background: `linear-gradient(180deg,${COLORS.accent},${COLORS.purple})`, opacity: i === 6 ? 1 : .5 }} />
                  <span style={{ fontSize: 9, color: COLORS.muted, fontFamily: "monospace" }}>{["L", "M", "M", "J", "V", "S", "D"][i]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card" style={{ border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Workflows actifs</div>
              <button className="btn-primary" onClick={() => setScreen("editor")} style={{ background: `linear-gradient(135deg,${COLORS.accent},${COLORS.purple})`, border: "none", borderRadius: 8, color: "#000", fontWeight: 700, padding: "6px 16px", cursor: "pointer", fontSize: 12, transition: "all .15s" }}>+ Nouveau</button>
            </div>
            {TEMPLATES.filter(t => t.status === "active").map((t, i) => (
              <div key={t.id} className="log-row" onClick={() => loadTemplate(t)}
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: i < 3 ? `1px solid ${COLORS.border}` : "none", cursor: "pointer", transition: "background .15s", borderRadius: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.green, animation: "pulse 2s infinite", flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>{t.desc}</div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  {t.nodes.slice(0, 3).map((n, idx) => (
                    <span key={idx} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: `${getNodeColor(n)}22`, color: getNodeColor(n), border: `1px solid ${getNodeColor(n)}44`, fontFamily: "monospace" }}>{getNodeLabel(n)}</span>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "monospace" }}>{t.runs} runs</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDITOR */}
      {screen === "editor" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 10 }}>
          <div className="glass-panel" style={{ height: 56, borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, flexShrink: 0 }}>
            <input value={workflowName} onChange={e => setWorkflowName(e.target.value)} style={{ background: "transparent", border: "none", outline: "none", fontSize: 15, fontWeight: 600, color: COLORS.text, minWidth: 200 }} />
            <div style={{ flex: 1 }} />
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer" }} title="Changer le thème">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {showSuccess && <span style={{ fontSize: 12, color: COLORS.green, fontFamily: "monospace", animation: "fadeIn .2s" }}>✓ Sauvegardé</span>}
            <button onClick={handleSave} style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, padding: "6px 14px", cursor: "pointer", fontSize: 12 }}>Sauvegarder</button>
            <button onClick={handleTest} style={{ background: isExecuting ? `${COLORS.accent}33` : "transparent", border: `1px solid ${COLORS.accent}44`, borderRadius: 8, color: COLORS.accent, padding: "6px 14px", cursor: "pointer", fontSize: 12, transition: "all .2s", boxShadow: isExecuting ? `0 0 15px ${COLORS.accent}66` : "none" }}>{isExecuting ? "⚡ En cours..." : "▷ Tester"}</button>
            <div onClick={() => setIsActive(!isActive)} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: isActive ? `${COLORS.green}22` : "#1e2d3d", border: `1px solid ${isActive ? COLORS.green + "44" : COLORS.border}`, borderRadius: 20, padding: "5px 12px", fontSize: 12, transition: "all .2s" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: isActive ? COLORS.green : COLORS.muted, animation: isActive ? "pulse 2s infinite" : "none" }} />
              <span style={{ color: isActive ? COLORS.green : COLORS.muted }}>{isActive ? "Actif" : "Inactif"}</span>
            </div>
            <div style={{ width: 1, height: 24, background: COLORS.border, margin: "0 8px" }} />
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: sidebarOpen ? COLORS.card : "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, padding: "6px 10px", cursor: "pointer", fontSize: 12 }}>
              {sidebarOpen ? "◀ Bibliothèque" : "▶ Bibliothèque"}
            </button>
            <button onClick={() => setConfigOpen(!configOpen)} style={{ background: configOpen ? COLORS.card : "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 8, color: COLORS.text, padding: "6px 10px", cursor: "pointer", fontSize: 12 }}>
              {configOpen ? "Panneau ▶" : "◀ Panneau"}
            </button>
          </div>

          <div style={{ flex: 1, display: "flex", position: "relative" }}>
            {isTemplateLoading && (
              <div style={{ position: "absolute", inset: 0, background: COLORS.bg, zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", animation: "fadeOut 0.5s ease 1s forwards" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, animation: "spin 1s linear infinite", marginBottom: 24 }} />
                <div style={{ fontSize: 18, fontWeight: 600, color: COLORS.text, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: 2, animation: "pulse 1.5s infinite" }}>GÉNÉRATION DU WORKFLOW...</div>
              </div>
            )}
            {/* Node library */}
            {sidebarOpen && (
              <div className="glass-panel" style={{ width: 220, borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", overflow: "hidden", animation: "fadeIn .2s ease" }}>
                <div style={{ padding: "12px 12px 8px" }}>
                  <input placeholder="Rechercher..." value={sidebarSearch} onChange={e => setSidebarSearch(e.target.value)}
                    style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "7px 12px", color: COLORS.text, fontSize: 12, outline: "none", fontFamily: "inherit" }} />
                </div>
                <div style={{ flex: 1, overflow: "auto", padding: "4px 8px 12px" }}>
                  {Object.entries(NODE_TYPES).map(([cat, catInfo]) => {
                    const catNodes = filteredNodes.filter(n => n.category === cat);
                    if (!catNodes.length) return null;
                    return (
                      <div key={cat} style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 9, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 2, padding: "4px 4px 6px", fontFamily: "monospace" }}>{catInfo.label}</div>
                        {catNodes.map(node => (
                          <div key={node.id} className="node-card" onClick={() => addNodeToCanvas(node.id)}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, border: `1px solid ${COLORS.border}`, marginBottom: 4, cursor: "pointer", transition: "all .15s", background: COLORS.card }}>
                            <span style={{ fontSize: 16, width: 28, height: 28, borderRadius: 8, background: `${catInfo.color}22`, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${catInfo.color}33`, flexShrink: 0 }}>{node.icon}</span>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{node.label}</div>
                              <div style={{ fontSize: 10, color: COLORS.muted }}>{node.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Canvas */}
            <WorkflowCanvas nodes={workflowNodes} edges={workflowEdges} setNodes={setWorkflowNodes} setEdges={setWorkflowEdges} selectedNode={selectedNode} setSelectedNode={setSelectedNode} addNodeToCanvas={addNodeToCanvas} />

            {/* Config panel */}
            {configOpen && selectedNode && (() => {
              const node = workflowNodes.find(n => n.id === selectedNode); if (!node) return null;
              const color = getNodeColor(node.type), nodeInfo = ALL_NODES.find(n => n.id === node.type);
              const updateConfig = (field, value) => setWorkflowNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, config: { ...(n.config || {}), [field]: value } } : n));
              const cfg = node.config || {};
              const D = { prompt: "Génère un résumé des actualités du jour en 3 points.", recipient: "equipe@entreprise.com", subject: "Rapport automatique — {{date}}", frequency: "Tous les jours à 8h00", body: "Bonjour,\n\nVeuillez trouver ci-joint le rapport automatique.\n\nCordialement", slackChannel: "#general", slackMessage: "📊 Nouveau rapport disponible : {{titre}}", notionPage: "Rapports / {{date}}", sheetName: "Feuille1", cellRange: "A1:D100", webhookUrl: "https://hooks.exemple.com/trigger", loopField: "items", conditionField: "statut", conditionValue: "actif" };
              const fs = { width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "8px 12px", color: COLORS.text, fontSize: 12, outline: "none", fontFamily: "inherit" };
              const ls = { fontSize: 10, color: COLORS.muted, display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" };
              return (
                <div className="glass-panel" style={{ width: 270, borderLeft: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column", overflow: "hidden", animation: "fadeIn .2s ease" }}>
                  <div style={{ padding: "16px 20px 14px", borderBottom: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22, width: 40, height: 40, borderRadius: 10, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${color}44` }}>{nodeInfo?.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{nodeInfo?.label}</div>
                        <div style={{ fontSize: 10, color, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1 }}>{nodeInfo?.category}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div><label style={ls}>Nom du nœud</label>
                        <input value={node.label} onChange={e => setWorkflowNodes(prev => prev.map(n => n.id === selectedNode ? { ...n, label: e.target.value } : n))} style={fs} />
                      </div>
                      {node.type === "cron" && (<>
                        <div><label style={ls}>Fréquence</label>
                          <select value={cfg.frequency || D.frequency} onChange={e => updateConfig("frequency", e.target.value)} style={{ ...fs, cursor: "pointer" }}>
                            <option>Tous les jours à 8h00</option><option>Tous les jours à 9h00</option><option>Tous les jours à 18h00</option>
                            <option>Chaque lundi</option><option>Toutes les heures</option><option>Toutes les 30 min</option><option>Toutes les 15 min</option><option>Personnalisé (CRON)</option>
                          </select>
                        </div>
                        {cfg.frequency === "Personnalisé (CRON)" && <div><label style={ls}>Expression CRON</label><input value={cfg.cron || "0 8 * * *"} onChange={e => updateConfig("cron", e.target.value)} style={fs} /></div>}
                      </>)}
                      {["claude", "chatgpt", "gemini"].includes(node.type) && (<>
                        <div><label style={ls}>Modèle</label>
                          <select value={cfg.model || (node.type === "claude" ? "claude-sonnet-4-6" : node.type === "chatgpt" ? "gpt-4o" : "gemini-1.5-pro")} onChange={e => updateConfig("model", e.target.value)} style={{ ...fs, cursor: "pointer" }}>
                            {node.type === "claude" && <><option value="claude-opus-4-6">Claude Opus 4.6</option><option value="claude-sonnet-4-6">Claude Sonnet 4.6</option><option value="claude-haiku-4-5-20251001">Claude Haiku 4.5</option></>}
                            {node.type === "chatgpt" && <><option value="gpt-4o">GPT-4o</option><option value="gpt-4-turbo">GPT-4 Turbo</option><option value="gpt-3.5-turbo">GPT-3.5 Turbo</option></>}
                            {node.type === "gemini" && <><option value="gemini-1.5-pro">Gemini 1.5 Pro</option><option value="gemini-1.5-flash">Gemini 1.5 Flash</option><option value="gemini-2.0-flash">Gemini 2.0 Flash</option></>}
                          </select>
                        </div>
                        <div><label style={ls}>Prompt système</label><textarea value={cfg.prompt !== undefined ? cfg.prompt : D.prompt} onChange={e => updateConfig("prompt", e.target.value)} rows={6} style={{ ...fs, resize: "vertical" }} /></div>
                        <div><label style={ls}>Température</label>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <input type="range" min="0" max="1" step="0.1" value={cfg.temperature !== undefined ? cfg.temperature : 0.7} onChange={e => updateConfig("temperature", parseFloat(e.target.value))} style={{ flex: 1, accentColor: color }} />
                            <span style={{ fontSize: 12, color: COLORS.accent, fontFamily: "monospace", minWidth: 28 }}>{cfg.temperature !== undefined ? cfg.temperature : 0.7}</span>
                          </div>
                        </div>
                      </>)}
                      {["gmail", "outlook"].includes(node.type) && (<>
                        <div><label style={ls}>Destinataire</label><input value={cfg.recipient !== undefined ? cfg.recipient : D.recipient} onChange={e => updateConfig("recipient", e.target.value)} style={fs} /></div>
                        <div><label style={ls}>Sujet</label><input value={cfg.subject !== undefined ? cfg.subject : D.subject} onChange={e => updateConfig("subject", e.target.value)} style={fs} /></div>
                        <div><label style={ls}>Corps du message</label><textarea value={cfg.body !== undefined ? cfg.body : D.body} onChange={e => updateConfig("body", e.target.value)} rows={5} style={{ ...fs, resize: "vertical" }} /></div>
                        <div><label style={ls}>Pièce jointe</label>
                          <select value={cfg.attachment || "none"} onChange={e => updateConfig("attachment", e.target.value)} style={{ ...fs, cursor: "pointer" }}>
                            <option value="none">Aucune</option><option value="prev_output">Sortie du nœud précédent</option><option value="excel">Fichier Excel</option><option value="pdf">Rapport PDF</option>
                          </select>
                        </div>
                      </>)}
                      {node.type === "slack" && (<>
                        <div><label style={ls}>Canal</label><input value={cfg.slackChannel !== undefined ? cfg.slackChannel : D.slackChannel} onChange={e => updateConfig("slackChannel", e.target.value)} style={fs} /></div>
                        <div><label style={ls}>Message</label><textarea value={cfg.slackMessage !== undefined ? cfg.slackMessage : D.slackMessage} onChange={e => updateConfig("slackMessage", e.target.value)} rows={4} style={{ ...fs, resize: "vertical" }} /></div>
                      </>)}
                      {node.type === "teams" && (<>
                        <div><label style={ls}>Équipe / Canal</label><input value={cfg.teamsChannel !== undefined ? cfg.teamsChannel : "Général"} onChange={e => updateConfig("teamsChannel", e.target.value)} style={fs} /></div>
                        <div><label style={ls}>Message</label><textarea value={cfg.teamsMessage !== undefined ? cfg.teamsMessage : "Nouveau rapport disponible."} onChange={e => updateConfig("teamsMessage", e.target.value)} rows={4} style={{ ...fs, resize: "vertical" }} /></div>
                      </>)}
                      {node.type === "notion" && (<>
                        <div><label style={ls}>Page / Base de données</label><input value={cfg.notionPage !== undefined ? cfg.notionPage : D.notionPage} onChange={e => updateConfig("notionPage", e.target.value)} style={fs} /></div>
                        <div><label style={ls}>Action</label>
                          <select value={cfg.notionAction || "create"} onChange={e => updateConfig("notionAction", e.target.value)} style={{ ...fs, cursor: "pointer" }}>
                            <option value="create">Créer une page</option><option value="update">Mettre à jour</option><option value="append">Ajouter un bloc</option><option value="read">Lire</option>
                          </select>
                        </div>
                      </>)}
                      {["excel", "sheets"].includes(node.type) && (<>
                        <div><label style={ls}>Nom de la feuille</label><input value={cfg.sheetName !== undefined ? cfg.sheetName : D.sheetName} onChange={e => updateConfig("sheetName", e.target.value)} style={fs} /></div>
                        <div><label style={ls}>Plage de cellules</label><input value={cfg.cellRange !== undefined ? cfg.cellRange : D.cellRange} onChange={e => updateConfig("cellRange", e.target.value)} style={fs} /></div>
                        <div><label style={ls}>Action</label>
                          <select value={cfg.sheetAction || "write"} onChange={e => updateConfig("sheetAction", e.target.value)} style={{ ...fs, cursor: "pointer" }}>
                            <option value="write">Écrire</option><option value="read">Lire</option><option value="append">Ajouter une ligne</option><option value="clear">Effacer</option>
                          </select>
                        </div>
                      </>)}
                      {node.type === "webhook" && (<>
                        <div><label style={ls}>URL</label><input value={cfg.webhookUrl !== undefined ? cfg.webhookUrl : D.webhookUrl} onChange={e => updateConfig("webhookUrl", e.target.value)} style={fs} /></div>
                        <div><label style={ls}>Méthode HTTP</label>
                          <select value={cfg.method || "POST"} onChange={e => updateConfig("method", e.target.value)} style={{ ...fs, cursor: "pointer" }}>
                            <option>POST</option><option>GET</option><option>PUT</option><option>PATCH</option>
                          </select>
                        </div>
                      </>)}
                      {node.type === "condition" && (<>
                        <div><label style={ls}>Champ à évaluer</label><input value={cfg.conditionField !== undefined ? cfg.conditionField : D.conditionField} onChange={e => updateConfig("conditionField", e.target.value)} style={fs} /></div>
                        <div><label style={ls}>Opérateur</label>
                          <select value={cfg.operator || "equals"} onChange={e => updateConfig("operator", e.target.value)} style={{ ...fs, cursor: "pointer" }}>
                            <option value="equals">Est égal à</option><option value="not_equals">Différent de</option><option value="contains">Contient</option><option value="gt">Supérieur à</option><option value="lt">Inférieur à</option>
                          </select>
                        </div>
                        <div><label style={ls}>Valeur</label><input value={cfg.conditionValue !== undefined ? cfg.conditionValue : D.conditionValue} onChange={e => updateConfig("conditionValue", e.target.value)} style={fs} /></div>
                      </>)}
                      {node.type === "loop" && (
                        <div><label style={ls}>Champ à itérer</label><input value={cfg.loopField !== undefined ? cfg.loopField : D.loopField} onChange={e => updateConfig("loopField", e.target.value)} style={fs} /></div>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: "12px 20px 16px", borderTop: `1px solid ${COLORS.border}`, flexShrink: 0 }}>
                    <button onClick={handleSave} style={{ width: "100%", background: `linear-gradient(135deg,${color},${color}99)`, border: "none", borderRadius: 8, color: "#000", fontWeight: 700, padding: 10, cursor: "pointer", fontSize: 13 }}>✓ Appliquer les modifications</button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* TEMPLATES */}
      {screen === "templates" && (
        <div key="templates" style={{ flex: 1, overflow: "auto", padding: 32, animation: "fadeIn 0.2s ease", zIndex: 10 }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, color: COLORS.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Bibliothèque</div>
            <h1 style={{ margin: 0, fontSize: 38, fontWeight: 700 }}>Templates prêts à l'emploi</h1>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {templateCategories.map(cat => (
              <button key={cat} onClick={() => setTemplateFilter(cat)} style={{ background: templateFilter === cat ? COLORS.accentDim : "transparent", border: `1px solid ${templateFilter === cat ? COLORS.accent : COLORS.border}`, borderRadius: 20, color: templateFilter === cat ? COLORS.accent : COLORS.muted, padding: "6px 16px", cursor: "pointer", fontSize: 12, transition: "all .15s" }}>{cat}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {filteredTemplates.map((t, i) => (
              <div key={t.id} className="template-card glass-card" onClick={() => loadTemplate(t)}
                style={{ border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 24, cursor: "pointer", transition: "all .2s", "--c": t.color, "--cs": t.color + "22", animation: `fadeIn .3s ease ${i * .07}s both` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 10, fontFamily: "monospace", padding: "3px 10px", borderRadius: 20, background: `${t.color}22`, color: t.color, border: `1px solid ${t.color}44` }}>{t.category}</span>
                  <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "monospace" }}>{t.status === "active" ? "🟢" : "⏸"} {t.runs} runs</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.6, marginBottom: 16 }}>{t.desc}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {t.nodes.map((n, idx) => <span key={idx} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: `${getNodeColor(n)}15`, color: getNodeColor(n), border: `1px solid ${getNodeColor(n)}33`, fontFamily: "monospace", display: "flex", alignItems: "center", gap: 4 }}>{getNodeIcon(n)} {getNodeLabel(n)}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOGS */}
      {screen === "logs" && (
        <div key="logs" style={{ flex: 1, overflow: "auto", padding: 32, animation: "fadeIn 0.2s ease", zIndex: 10 }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, color: COLORS.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Monitoring</div>
            <h1 style={{ margin: 0, fontSize: 38, fontWeight: 700 }}>Historique d'exécutions</h1>
          </div>
          <div className="glass-card" style={{ border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 80px 80px", padding: "12px 24px", background: COLORS.surface, borderBottom: `1px solid ${COLORS.border}` }}>
              {["Workflow", "Statut", "Date", "Heure", "Durée"].map(h => <span key={h} style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>{h}</span>)}
            </div>
            {LOGS.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: COLORS.text }}>Aucun historique disponible</div>
                <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 8 }}>Exécutez un workflow pour afficher ses logs ici.</div>
              </div>
            ) : LOGS.map((log, i) => (
              <div key={log.id} className="log-row" style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px 80px 80px", padding: "14px 24px", borderBottom: i < LOGS.length - 1 ? `1px solid ${COLORS.border}` : "none", transition: "background .15s", cursor: "pointer" }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{log.workflow}</span>
                <span style={{ fontSize: 11, fontFamily: "monospace", display: "inline-flex", alignItems: "center", gap: 6, color: log.status === "success" ? COLORS.green : COLORS.pink }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: log.status === "success" ? COLORS.green : COLORS.pink, display: "inline-block" }} />
                  {log.status === "success" ? "Succès" : "Erreur"}
                </span>
                <span style={{ fontSize: 12, color: COLORS.muted }}>{log.date}</span>
                <span style={{ fontSize: 12, color: COLORS.muted, fontFamily: "monospace" }}>{log.time}</span>
                <span style={{ fontSize: 12, color: COLORS.accent, fontFamily: "monospace" }}>{log.duration}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {screen === "settings" && (
        <div key="settings" style={{ flex: 1, overflow: "auto", padding: 32, animation: "fadeIn 0.2s ease", zIndex: 10 }}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, color: COLORS.accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 8 }}>Configuration</div>
            <h1 style={{ margin: 0, fontSize: 38, fontWeight: 700 }}>Intégrations</h1>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {ALL_NODES.map((node, i) => {
              const cat = NODE_TYPES[node.category];
              const connected = ["claude", "gmail", "excel", "slack", "cron"].includes(node.id);
              return (
                <div key={node.id} className="integration-card glass-card" style={{ border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20, transition: "all .15s", animation: `fadeIn .3s ease ${i * .04}s both` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <span style={{ fontSize: 22, width: 44, height: 44, borderRadius: 12, background: `${cat.color}22`, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${cat.color}44` }}>{node.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{node.label}</div>
                      <div style={{ fontSize: 11, color: cat.color, fontFamily: "monospace" }}>{cat.label}</div>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      <div style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, fontFamily: "monospace", background: connected ? `${COLORS.green}22` : COLORS.surface, color: connected ? COLORS.green : COLORS.muted, border: `1px solid ${connected ? COLORS.green + "44" : COLORS.border}` }}>{connected ? "Connecté" : "Non lié"}</div>
                    </div>
                  </div>
                  <input placeholder={connected ? "••••••••••••••••" : "Clé API..."} type="password" style={{ width: "100%", background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "7px 12px", color: COLORS.text, fontSize: 12, outline: "none", fontFamily: "monospace", marginBottom: 10 }} />
                  <button style={{ width: "100%", background: connected ? "transparent" : `${cat.color}22`, border: `1px solid ${connected ? COLORS.border : cat.color + "44"}`, borderRadius: 8, color: connected ? COLORS.muted : cat.color, padding: 7, cursor: "pointer", fontSize: 12, transition: "all .15s" }}>{connected ? "Modifier" : "Connecter"}</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GLOBAL LOGO (Bottom Right on non-landing pages) */}
      {screen !== "landing" && (
        <div className="help-bar-container" ref={helpRef}>
          <div className={`chat-window ${isHelpOpen && chatHistory.length > 0 ? 'open' : ''}`}>
            {chatHistory.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>{msg.content}</div>
            ))}
            {isChatLoading && (
              <div className="chat-typing">
                <div className="dot"></div><div className="dot"></div><div className="dot"></div>
              </div>
            )}
          </div>
          <div className={`help-bar ${isHelpOpen ? 'open' : ''}`}>
            <span style={{ fontSize: 18, marginRight: 10 }}>✨</span>
            <input type="text" className="help-input" placeholder="Demander à l'IA..." value={chatQuery} onChange={(e) => setChatQuery(e.target.value)} onKeyDown={handleChatSubmit} autoFocus={isHelpOpen} />
          </div>
          <div className="help-logo" onClick={() => setIsHelpOpen(!isHelpOpen)} title="Besoin d'aide ?">
            <Logo size={isHelpOpen ? 64 : 80} style={{ opacity: isHelpOpen ? 1 : 0.8, filter: `drop-shadow(0 0 ${isHelpOpen ? '24px' : '16px'} rgba(168, 85, 247, 0.6))`, transition: 'all 0.4s ease' }} />
          </div>
        </div>
      )}
    </div>
  );
}
