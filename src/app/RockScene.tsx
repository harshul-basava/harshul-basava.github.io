"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   A small Figma / Google-Docs-style transform editor.

   • View mode: koroks + rock render at their saved transforms.
     Koroks are clickable links; hovering shows a cursor tooltip.
   • Edit mode (add ?edit to the URL): drag to move, corner handles
     to scale, top handle to rotate. Export copies the transform
     JSON so it can be pasted back in as DEFAULT_ITEMS.

   Placement persists to localStorage while editing.
   ───────────────────────────────────────────────────────────── */

type Item = {
  id: string;
  src: string;
  label?: string;
  href?: string;
  target?: string;
  modal?: boolean;
  baseHeight: number; // px height at scale = 1 (width follows aspect ratio)
  x: number; // left, in scene coordinates
  y: number; // top, in scene coordinates
  scale: number;
  rotation: number; // degrees
  z: number;
};

// Positions are offsets from the PHOTO's top-left corner (the scene layer is
// nested inside the photo frame), so koroks track the photo across any monitor
// size or zoom level. Edit via ?edit, then Export to update these.
const DEFAULT_ITEMS: Item[] = [
  {
    id: "github",
    src: "/icons/github.png",
    label: "GitHub",
    href: "https://github.com/harshul-basava",
    target: "_blank",
    baseHeight: 96,
    x: 226,
    y: 147,
    scale: 1.006,
    rotation: 20.8,
    z: 10,
  },
  {
    id: "resume",
    src: "/icons/resume.png",
    label: "Resume",
    href: "/resume.pdf",
    target: "_blank",
    baseHeight: 96,
    x: -19,
    y: 132,
    scale: 0.882,
    rotation: -27.9,
    z: 11,
  },
  {
    id: "linkedin",
    src: "/icons/linkedin.png",
    label: "LinkedIn",
    href: "https://linkedin.com/in/harshulb",
    target: "_blank",
    baseHeight: 96,
    x: 115,
    y: -65,
    scale: 1,
    rotation: -0.9,
    z: 12,
  },
  {
    id: "writing",
    src: "/icons/writing.png",
    label: "Research",
    href: "https://scholar.google.com/citations?hl=en&view_op=list_works&gmla=AERr9JH45IdgazQQL89IRVBVHhrWcjea0PuV6N0YmAjBMnIuJXpxrL86uyAAnQ32G_M2SlhyS_88JFXQCf3Vs9CJ971LQ9LgCPm2HfhCt-4&user=8DEzvssAAAAJ",
    target: "_blank",
    baseHeight: 96,
    x: 27,
    y: 106,
    scale: 1,
    rotation: -13.6,
    z: 13,
  },
  {
    id: "meet",
    src: "/icons/meet.png",
    label: "Meet",
    modal: true,
    baseHeight: 96,
    x: 195,
    y: 136,
    scale: 1,
    rotation: 6.7,
    z: 14,
  },
];

const STORAGE_KEY = "rockScene.v7";
const CORNERS: Array<[number, number]> = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
];

type Op =
  | { type: "click"; id: string; sx: number; sy: number; moved: boolean }
  | { type: "move"; id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean }
  | { type: "scale"; id: string; cx: number; cy: number; startDist: number; startScale: number }
  | { type: "rotate"; id: string; cx: number; cy: number; startAngle: number; startRot: number };

export default function RockScene() {
  const [items, setItems] = useState<Item[]>(DEFAULT_ITEMS);
  const [editable, setEditable] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hover, setHover] = useState<{ label: string; x: number; y: number } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const opRef = useRef<Op | null>(null);

  // Load persisted placement + detect ?edit (runs once on mount; localStorage
  // is client-only so this can't be a lazy initializer without a hydration mismatch)
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved: Item[] = JSON.parse(raw);
        // merge saved transforms onto defaults (keeps hrefs/labels authoritative)
        setItems(
          DEFAULT_ITEMS.map((d) => {
            const s = saved.find((it) => it.id === d.id);
            return s ? { ...d, x: s.x, y: s.y, scale: s.scale, rotation: s.rotation, z: s.z, baseHeight: s.baseHeight } : d;
          })
        );
      }
    } catch {
      /* ignore */
    }
    const isEdit = new URLSearchParams(window.location.search).has("edit");
    setEditable(isEdit);
    setEditMode(isEdit);
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Persist placement whenever it changes (after initial load)
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, loaded]);

  const update = useCallback((id: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const navigate = useCallback(
    (id: string) => {
      const item = items.find((it) => it.id === id);
      if (!item) return;
      if (item.modal) {
        window.Cal?.ns.mtg("modal", {
          calLink: "harshulb/mtg",
          config: { layout: "month_view" },
        });
      } else if (item.href) {
        window.open(item.href, item.target ?? "_self");
      }
    },
    [items]
  );

  // ── Pointer interaction ──
  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const op = opRef.current;
      if (!op) return;
      if (op.type === "click") {
        if (Math.hypot(e.clientX - op.sx, e.clientY - op.sy) > 3) op.moved = true;
      } else if (op.type === "move") {
        const dx = e.clientX - op.sx;
        const dy = e.clientY - op.sy;
        if (Math.hypot(dx, dy) > 3) op.moved = true;
        update(op.id, { x: op.ox + dx, y: op.oy + dy });
      } else if (op.type === "scale") {
        const dist = Math.hypot(e.clientX - op.cx, e.clientY - op.cy);
        const s = Math.min(8, Math.max(0.1, (op.startScale * dist) / op.startDist));
        update(op.id, { scale: s });
      } else if (op.type === "rotate") {
        const ang = (Math.atan2(e.clientY - op.cy, e.clientX - op.cx) * 180) / Math.PI;
        let r = op.startRot + (ang - op.startAngle);
        if (e.shiftKey) r = Math.round(r / 15) * 15; // snap with Shift
        update(op.id, { rotation: r });
      }
    },
    [update]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const op = opRef.current;
      if (op && (op.type === "click" || op.type === "move") && !op.moved && !editMode) {
        navigate(op.id);
      }
      opRef.current = null;
      try {
        (e.target as Element).releasePointerCapture?.(e.pointerId);
      } catch {
        /* ignore */
      }
    },
    [editMode, navigate]
  );

  const startBody = (e: React.PointerEvent, item: Item) => {
    // In view mode the rock isn't interactive at all.
    if (!editMode && item.id === "rock") return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    if (editMode) {
      setSelectedId(item.id);
      opRef.current = {
        type: "move",
        id: item.id,
        sx: e.clientX,
        sy: e.clientY,
        ox: item.x,
        oy: item.y,
        moved: false,
      };
    } else {
      opRef.current = { type: "click", id: item.id, sx: e.clientX, sy: e.clientY, moved: false };
    }
  };

  const startScale = (e: React.PointerEvent, item: Item) => {
    e.stopPropagation();
    const node = nodeRefs.current[item.id];
    if (!node) return;
    const r = node.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    (e.target as Element).setPointerCapture(e.pointerId);
    opRef.current = {
      type: "scale",
      id: item.id,
      cx,
      cy,
      startDist: Math.hypot(e.clientX - cx, e.clientY - cy),
      startScale: item.scale,
    };
  };

  const startRotate = (e: React.PointerEvent, item: Item) => {
    e.stopPropagation();
    const node = nodeRefs.current[item.id];
    if (!node) return;
    const r = node.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    (e.target as Element).setPointerCapture(e.pointerId);
    opRef.current = {
      type: "rotate",
      id: item.id,
      cx,
      cy,
      startAngle: (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI,
      startRot: item.rotation,
    };
  };

  const bringToFront = () => {
    if (!selectedId) return;
    const maxZ = Math.max(...items.map((it) => it.z));
    update(selectedId, { z: maxZ + 1 });
  };
  const sendToBack = () => {
    if (!selectedId) return;
    const minZ = Math.min(...items.map((it) => it.z));
    update(selectedId, { z: minZ - 1 });
  };

  const exportJSON = async () => {
    const json = JSON.stringify(
      items.map(({ id, x, y, scale, rotation, z, baseHeight }) => ({
        id,
        x: Math.round(x),
        y: Math.round(y),
        scale: Number(scale.toFixed(3)),
        rotation: Number(rotation.toFixed(1)),
        z,
        baseHeight,
      })),
      null,
      2
    );
    try {
      await navigator.clipboard.writeText(json);
    } catch {
      /* ignore */
    }
    // Always log so it can be grabbed from the console too.
    console.log("[RockScene] transforms:\n" + json);
    alert("Transforms copied to clipboard (also logged to console).");
  };

  const resetAll = () => {
    if (!confirm("Reset all placement to defaults?")) return;
    setItems(DEFAULT_ITEMS);
    setSelectedId(null);
  };

  const selected = items.find((it) => it.id === selectedId) || null;

  return (
    <div
      className={`scene${editMode ? " editing" : ""}`}
      onPointerDown={() => {
        if (editMode) setSelectedId(null);
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {items
        .slice()
        .sort((a, b) => a.z - b.z)
        .map((item) => {
          const isSel = editMode && selectedId === item.id;
          const interactive = editMode || item.id !== "rock";
          return (
            <div
              key={item.id}
              ref={(el) => {
                nodeRefs.current[item.id] = el;
              }}
              className={`scene-item${isSel ? " selected" : ""}`}
              style={{
                left: item.x,
                top: item.y,
                // While selected, float above everything so the handles are never
                // covered by a higher-z item (e.g. the rock) during editing.
                zIndex: isSel ? 9999 : item.z,
                transform: `rotate(${item.rotation}deg) scale(${item.scale})`,
                cursor: editMode ? "move" : item.id === "rock" ? "default" : "pointer",
                pointerEvents: interactive ? "auto" : "none",
              }}
              onPointerDown={(e) => startBody(e, item)}
              onMouseMove={(e) => {
                if (!editMode && item.label) setHover({ label: item.label, x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => {
                if (!editMode) setHover(null);
              }}
              aria-label={item.label}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="scene-img"
                src={item.src}
                alt=""
                draggable={false}
                style={{ height: item.baseHeight }}
              />

              {isSel && (
                <>
                  <div className="sel-border" style={{ borderWidth: 1 / item.scale }} />
                  {CORNERS.map(([cx, cy], i) => (
                    <div
                      key={i}
                      className="sel-handle"
                      style={{
                        left: `${cx * 100}%`,
                        top: `${cy * 100}%`,
                        transform: `translate(-50%, -50%) scale(${1 / item.scale})`,
                      }}
                      onPointerDown={(e) => startScale(e, item)}
                    />
                  ))}
                  <div
                    className="sel-rotate-stem"
                    style={{ height: 22 / item.scale, transform: `translateX(-50%) scaleY(${1 / item.scale})`, transformOrigin: "bottom" }}
                  />
                  <div
                    className="sel-rotate"
                    style={{ transform: `translate(-50%, -50%) scale(${1 / item.scale})`, top: -22 / item.scale }}
                    onPointerDown={(e) => startRotate(e, item)}
                  />
                </>
              )}
            </div>
          );
        })}

      {hover && (
        <span className="cursor-tooltip" style={{ left: hover.x, top: hover.y }}>
          {hover.label}
        </span>
      )}

      {editable && (
        <div className="scene-toolbar" onPointerDown={(e) => e.stopPropagation()}>
          <div className="scene-toolbar-row">
            <button onClick={() => setEditMode((v) => !v)}>{editMode ? "Done" : "Edit"}</button>
            {editMode && (
              <>
                <button onClick={exportJSON}>Export</button>
                <button onClick={resetAll}>Reset</button>
              </>
            )}
          </div>
          {editMode && selected && (
            <div className="scene-inspector">
              <strong>{selected.id}</strong>
              <label>
                scale
                <input
                  type="number"
                  step="0.05"
                  value={Number(selected.scale.toFixed(3))}
                  onChange={(e) => update(selected.id, { scale: Math.max(0.1, Number(e.target.value) || 0.1) })}
                />
              </label>
              <label>
                rot°
                <input
                  type="number"
                  step="1"
                  value={Number(selected.rotation.toFixed(1))}
                  onChange={(e) => update(selected.id, { rotation: Number(e.target.value) || 0 })}
                />
              </label>
              <label>
                size
                <input
                  type="number"
                  step="4"
                  value={Math.round(selected.baseHeight)}
                  onChange={(e) => update(selected.id, { baseHeight: Math.max(8, Number(e.target.value) || 8) })}
                />
              </label>
              <div className="scene-toolbar-row">
                <button onClick={bringToFront}>Front</button>
                <button onClick={sendToBack}>Back</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
