"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

/* ────────────────────────────────────────────────────────────────────────────
 * Types
 * ──────────────────────────────────────────────────────────────────────────── */
interface RadialHeatmapProps {
  readonly categories: string[];
  readonly activeCategory: string | null;
  readonly onSelectCategory: (cat: string | null) => void;
  readonly articleCounts?: Record<string, number>;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

interface OrbitDot {
  angle: number;
  speed: number;
  orbitRadius: number;
  dotRadius: number;
  color: string;
  centerX: number;
  centerY: number;
}

interface DataStream {
  progress: number;
  speed: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  width: number;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Constants
 * ──────────────────────────────────────────────────────────────────────────── */
const CATEGORY_COLORS: Record<string, { primary: string; glow: string; rgb: string }> = {
  Crypto:      { primary: "#00ff88", glow: "rgba(0,255,136,", rgb: "0,255,136" },
  Stocks:      { primary: "#0088ff", glow: "rgba(0,136,255,", rgb: "0,136,255" },
  AI:          { primary: "#aa44ff", glow: "rgba(170,68,255,", rgb: "170,68,255" },
  Commodities: { primary: "#ffaa00", glow: "rgba(255,170,0,", rgb: "255,170,0" },
  Forex:       { primary: "#ff0088", glow: "rgba(255,0,136,", rgb: "255,0,136" },
};

const FALLBACK_COLOR = { primary: "#00ff88", glow: "rgba(0,255,136,", rgb: "0,255,136" };

/* ────────────────────────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────────────────────────── */
export function RadialHeatmap({
  categories,
  activeCategory,
  onSelectCategory,
  articleCounts,
}: RadialHeatmapProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const isHoveringCanvas = useRef(false);
  const particlesRef = useRef<Particle[]>([]);
  const orbitDotsRef = useRef<OrbitDot[]>([]);
  const dataStreamsRef = useRef<DataStream[]>([]);
  const scanAngleRef = useRef(0);
  const frameRef = useRef(0);
  const activeCatRef = useRef<string | null>(null);
  const hoveredNodeRef = useRef<number | null>(null);

  // Keep active category ref in sync
  useEffect(() => {
    activeCatRef.current = activeCategory;
  }, [activeCategory]);

  const getNodePositions = useCallback((cx: number, cy: number, radius: number) => {
    return categories.map((cat, i) => {
      const angle = (i * (360 / categories.length) - 90) * (Math.PI / 180);
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      return { cat, x, y, angle };
    });
  }, [categories]);

  /* ── Spawn burst particles ────────────────────────────────────────────── */
  const spawnBurst = useCallback((x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1 + Math.random() * 2.5,
        alpha: 1,
        life: 0,
        maxLife: 40 + Math.random() * 40,
        color,
      });
    }
  }, []);

  /* ── Spawn ambient particles ──────────────────────────────────────────── */
  const spawnAmbient = useCallback((cx: number, cy: number, maxR: number) => {
    if (particlesRef.current.length > 300) return;
    const angle = Math.random() * Math.PI * 2;
    const dist = maxR * 0.3 + Math.random() * maxR * 0.7;
    particlesRef.current.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 0.5 + Math.random() * 1.5,
      alpha: 0.1 + Math.random() * 0.4,
      life: 0,
      maxLife: 120 + Math.random() * 180,
      color: `rgba(${[CATEGORY_COLORS.Crypto.rgb, CATEGORY_COLORS.Stocks.rgb, CATEGORY_COLORS.AI.rgb][Math.floor(Math.random() * 3)]},`,
    });
  }, []);

  /* ── Initialize orbit dots ────────────────────────────────────────────── */
  const initOrbitDots = useCallback((cx: number, cy: number, nodeRadius: number) => {
    const dots: OrbitDot[] = [];
    categories.forEach((cat, i) => {
      const angle = (i * (360 / categories.length) - 90) * (Math.PI / 180);
      const nx = cx + Math.cos(angle) * nodeRadius;
      const ny = cy + Math.sin(angle) * nodeRadius;
      const catColor = CATEGORY_COLORS[cat] ?? FALLBACK_COLOR;

      // 3–5 orbiting dots per node
      const count = 3 + Math.floor(Math.random() * 3);
      for (let j = 0; j < count; j++) {
        dots.push({
          angle: Math.random() * Math.PI * 2,
          speed: 0.01 + Math.random() * 0.025,
          orbitRadius: 18 + Math.random() * 14,
          dotRadius: 1 + Math.random() * 2,
          color: catColor.primary,
          centerX: nx,
          centerY: ny,
        });
      }
    });
    orbitDotsRef.current = dots;
  }, [categories]);

  /* ── Initialize data streams ──────────────────────────────────────────── */
  const initDataStreams = useCallback((cx: number, cy: number, nodeRadius: number) => {
    const streams: DataStream[] = [];
    categories.forEach((cat, i) => {
      const angle = (i * (360 / categories.length) - 90) * (Math.PI / 180);
      const nx = cx + Math.cos(angle) * nodeRadius;
      const ny = cy + Math.sin(angle) * nodeRadius;
      const catColor = CATEGORY_COLORS[cat] ?? FALLBACK_COLOR;

      // 2 streams per node flowing center → node
      for (let j = 0; j < 2; j++) {
        streams.push({
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.005,
          fromX: cx, fromY: cy,
          toX: nx, toY: ny,
          color: catColor.primary,
          width: 1 + Math.random(),
        });
      }
    });
    dataStreamsRef.current = streams;
  }, [categories]);

  /* ── Canvas animation loop ────────────────────────────────────────────── */
  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) / 2 - 20;
    const nodeRadius = maxR * 0.65;

    initOrbitDots(cx, cy, nodeRadius);
    initDataStreams(cx, cy, nodeRadius);

    const nodes = getNodePositions(cx, cy, nodeRadius);

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      frameRef.current++;

      const isDark = document.documentElement.classList.contains("dark");

      // ── 1. Background grid ──
      ctx.strokeStyle = isDark ? "rgba(255,255,255,0.015)" : "rgba(0,0,0,0.03)";
      ctx.lineWidth = 0.5;
      const gridSize = 30;
      for (let gx = 0; gx < w; gx += gridSize) {
        // Mouse-reactive distortion
        const distToMouse = isHoveringCanvas.current
          ? Math.abs(gx - mousePos.current.x)
          : Infinity;
        const warp = distToMouse < 80 ? Math.sin((distToMouse / 80) * Math.PI) * 4 : 0;
        ctx.beginPath();
        ctx.moveTo(gx + warp, 0);
        ctx.lineTo(gx - warp, h);
        ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += gridSize) {
        const distToMouse = isHoveringCanvas.current
          ? Math.abs(gy - mousePos.current.y)
          : Infinity;
        const warp = distToMouse < 80 ? Math.sin((distToMouse / 80) * Math.PI) * 4 : 0;
        ctx.beginPath();
        ctx.moveTo(0, gy + warp);
        ctx.lineTo(w, gy - warp);
        ctx.stroke();
      }

      // ── 2. Concentric rings ──
      for (let ring = 1; ring <= 5; ring++) {
        const r = maxR * (ring / 5);
        const pulse = Math.sin(frameRef.current * 0.01 + ring) * 0.03;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,255,136,${0.04 + pulse + ring * 0.02})`;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 10]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // ── 3. Radar sweep line ──
      scanAngleRef.current += 0.008;
      const sweepAngle = scanAngleRef.current;

      // Draw sweep cone (trailing arc)
      const trailAngle = 0.6; // radians of trail
      for (let step = 0; step < 20; step++) {
        const a = sweepAngle - (step / 20) * trailAngle;
        const alpha = (1 - step / 20) * 0.08;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
        ctx.strokeStyle = `rgba(0,255,136,${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Bright leading edge
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * maxR, cy + Math.sin(sweepAngle) * maxR);
      ctx.strokeStyle = "rgba(0,255,136,0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // ── 4. Data streams (flowing dots center → nodes) ──
      dataStreamsRef.current.forEach((stream) => {
        stream.progress += stream.speed;
        if (stream.progress > 1) stream.progress = 0;

        const px = stream.fromX + (stream.toX - stream.fromX) * stream.progress;
        const py = stream.fromY + (stream.toY - stream.fromY) * stream.progress;

        ctx.beginPath();
        ctx.arc(px, py, stream.width, 0, Math.PI * 2);
        ctx.fillStyle = stream.color;
        ctx.globalAlpha = 0.3 + stream.progress * 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // ── 5. Connection lines to nodes ──
      nodes.forEach(({ x: nx, y: ny, cat }) => {
        const isActive = activeCatRef.current === cat;
        const catColor = CATEGORY_COLORS[cat] ?? FALLBACK_COLOR;

        // Glow line if active
        if (isActive) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(nx, ny);
          ctx.strokeStyle = catColor.primary;
          ctx.lineWidth = 3;
          ctx.shadowColor = catColor.primary;
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Dim line always
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = isActive
          ? `${catColor.glow}0.4)`
          : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)");
        ctx.lineWidth = isActive ? 1.5 : 1;
        ctx.stroke();
      });

      // ── 6. Orbit dots around nodes ──
      orbitDotsRef.current.forEach((dot) => {
        dot.angle += dot.speed;
        const dx = dot.centerX + Math.cos(dot.angle) * dot.orbitRadius;
        const dy = dot.centerY + Math.sin(dot.angle) * dot.orbitRadius;

        ctx.beginPath();
        ctx.arc(dx, dy, dot.dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.globalAlpha = 0.35 + Math.sin(dot.angle * 3) * 0.2;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // ── 7. Node rendering ──
      nodes.forEach(({ x: nx, y: ny, cat }, nodeIdx) => {
        const isActive = activeCatRef.current === cat;
        const isHovered = hoveredNodeRef.current === nodeIdx;
        const catColor = CATEGORY_COLORS[cat] ?? FALLBACK_COLOR;
        const pulse = Math.sin(frameRef.current * 0.03 + nodeIdx * 2);

        // Outer aura
        if (isActive || isHovered) {
          const auraR = 28 + pulse * 4;
          const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, auraR);
          grad.addColorStop(0, `${catColor.glow}0.25)`);
          grad.addColorStop(0.6, `${catColor.glow}0.08)`);
          grad.addColorStop(1, `${catColor.glow}0)`);
          ctx.beginPath();
          ctx.arc(nx, ny, auraR, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Outer ring pulse
        if (isActive) {
          const ringR = 18 + pulse * 3;
          ctx.beginPath();
          ctx.arc(nx, ny, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `${catColor.glow}${0.3 + pulse * 0.1})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Main node
        const mainR = isActive ? 10 : isHovered ? 9 : 7;
        ctx.beginPath();
        ctx.arc(nx, ny, mainR, 0, Math.PI * 2);
        if (isActive) {
          const nodeGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, mainR);
          nodeGrad.addColorStop(0, "white");
          nodeGrad.addColorStop(1, catColor.primary);
          ctx.fillStyle = nodeGrad;
        } else {
          ctx.fillStyle = isHovered ? catColor.primary : (isDark ? "rgba(30,40,50,0.9)" : "rgba(240,245,250,0.9)");
        }
        ctx.shadowColor = isActive ? catColor.primary : "transparent";
        ctx.shadowBlur = isActive ? 20 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Node border
        ctx.beginPath();
        ctx.arc(nx, ny, mainR, 0, Math.PI * 2);
        ctx.strokeStyle = isActive ? "white" : isHovered ? catColor.primary : (isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)");
        ctx.lineWidth = isActive ? 2 : 1.5;
        ctx.stroke();

        // Article count badge (if provided)
        const count = articleCounts?.[cat];
        if (count !== undefined && (isActive || isHovered)) {
          const badgeX = nx + mainR + 6;
          const badgeY = ny - mainR - 2;
          const badgeText = String(count);
          ctx.font = "bold 9px Inter, sans-serif";
          const tw = ctx.measureText(badgeText).width;
          const bw = tw + 8;

          ctx.beginPath();
          ctx.roundRect(badgeX - bw / 2, badgeY - 7, bw, 14, 4);
          ctx.fillStyle = catColor.primary;
          ctx.fill();

          ctx.fillStyle = isDark ? "#000" : "#fff";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(badgeText, badgeX, badgeY);
        }
      });

      // ── 8. Center core ──
      const coreSize = 5 + Math.sin(frameRef.current * 0.02) * 1.5;
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 4);
      coreGrad.addColorStop(0, "rgba(0,255,136,0.3)");
      coreGrad.addColorStop(0.5, "rgba(0,255,136,0.05)");
      coreGrad.addColorStop(1, "rgba(0,255,136,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, coreSize * 4, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, coreSize, 0, Math.PI * 2);
      ctx.fillStyle = "#00ff88";
      ctx.shadowColor = "#00ff88";
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── 9. Ambient particles ──
      if (frameRef.current % 3 === 0) {
        spawnAmbient(cx, cy, maxR);
      }

      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.alpha <= 0) return false;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.alpha, 0, Math.PI * 2);
        ctx.fillStyle = typeof p.color === "string" && p.color.endsWith(",")
          ? `${p.color}${p.alpha})`
          : p.color;
        ctx.globalAlpha = p.alpha * 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;

        return true;
      });

      // ── 10. Mouse gravitational distortion on particles ──
      if (isHoveringCanvas.current) {
        const mx = mousePos.current.x;
        const my = mousePos.current.y;
        particlesRef.current.forEach((p) => {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100 && dist > 1) {
            const force = 0.3 / dist;
            p.vx += dx * force;
            p.vy += dy * force;
          }
        });
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [mounted, categories, getNodePositions, initOrbitDots, initDataStreams, spawnAmbient, articleCounts]);

  /* ── Mouse interaction ────────────────────────────────────────────────── */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

      // Hit-test nodes for hover
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const maxR = Math.min(rect.width, rect.height) / 2 - 20;
      const nodeRadius = maxR * 0.65;
      const nodes = getNodePositions(cx, cy, nodeRadius);

      let foundHover: number | null = null;
      nodes.forEach(({ x: nx, y: ny }, idx) => {
        const dx = mousePos.current.x - nx;
        const dy = mousePos.current.y - ny;
        if (Math.sqrt(dx * dx + dy * dy) < 20) {
          foundHover = idx;
        }
      });
      hoveredNodeRef.current = foundHover;

      if (canvasRef.current) {
        canvasRef.current.style.cursor = foundHover !== null ? "pointer" : "default";
      }
    },
    [getNodePositions]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const maxR = Math.min(rect.width, rect.height) / 2 - 20;
      const nodeRadius = maxR * 0.65;
      const nodes = getNodePositions(cx, cy, nodeRadius);

      nodes.forEach(({ x: nx, y: ny, cat }) => {
        const dx = mx - nx;
        const dy = my - ny;
        if (Math.sqrt(dx * dx + dy * dy) < 22) {
          const catColor = CATEGORY_COLORS[cat] ?? FALLBACK_COLOR;
          const isActive = activeCatRef.current === cat;
          onSelectCategory(isActive ? null : cat);

          // Explosive particle burst on click
          spawnBurst(nx, ny, catColor.primary, 60);

          // Shockwave ring animation on the overlay
          if (overlayRef.current) {
            const ring = document.createElement("div");
            ring.style.position = "absolute";
            ring.style.left = `${nx}px`;
            ring.style.top = `${ny}px`;
            ring.style.width = "0px";
            ring.style.height = "0px";
            ring.style.borderRadius = "50%";
            ring.style.border = `2px solid ${catColor.primary}`;
            ring.style.transform = "translate(-50%, -50%)";
            ring.style.pointerEvents = "none";
            overlayRef.current.appendChild(ring);

            gsap.to(ring, {
              width: 200,
              height: 200,
              opacity: 0,
              duration: 0.8,
              ease: "power2.out",
              onComplete: () => ring.remove(),
            });
          }
        }
      });
    },
    [getNodePositions, onSelectCategory, spawnBurst]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[420px] w-full animate-pulse bg-[var(--color-surface-1)] rounded-3xl" />;

  return (
    <div className="relative w-full max-w-[520px] mx-auto">
      {/* Ambient aurora background */}
      <div className="absolute inset-[-40px] pointer-events-none">
        <div
          className="absolute inset-0 rounded-full blur-[80px] animate-pulse"
          style={{
            background:
              activeCategory && CATEGORY_COLORS[activeCategory]
                ? `radial-gradient(circle, ${CATEGORY_COLORS[activeCategory].glow}0.12) 0%, transparent 70%)`
                : "radial-gradient(circle, rgba(0,255,136,0.06) 0%, rgba(170,68,255,0.04) 50%, transparent 70%)",
          }}
        />
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="relative z-10 w-full aspect-square rounded-3xl"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => { isHoveringCanvas.current = true; }}
        onMouseLeave={() => {
          isHoveringCanvas.current = false;
          hoveredNodeRef.current = null;
        }}
        onClick={handleClick}
      />

      {/* DOM overlay for shockwave rings */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-3xl"
      />

      {/* Category labels positioned outside the canvas */}
      <div className="relative z-30 flex justify-center gap-4 mt-6">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const catColor = CATEGORY_COLORS[cat] ?? FALLBACK_COLOR;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(isActive ? null : cat)}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 cursor-pointer"
              style={{
                borderColor: isActive ? catColor.primary : "var(--color-border-dim)",
                background: isActive ? `${catColor.glow}0.08)` : "var(--color-surface-2)",
                boxShadow: isActive ? `0 0 20px ${catColor.glow}0.15)` : "none",
              }}
            >
              <span
                className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                style={{
                  background: catColor.primary,
                  boxShadow: isActive ? `0 0 8px ${catColor.primary}` : "none",
                }}
              />
              <span
                className="text-xs font-bold uppercase tracking-wider transition-colors duration-200"
                style={{
                  color: isActive ? catColor.primary : "var(--color-text-secondary)",
                }}
              >
                {cat}
              </span>
              {articleCounts?.[cat] !== undefined && (
                <span
                  className="text-[10px] font-bold ml-1 px-1.5 py-0.5 rounded-md transition-all"
                  style={{
                    background: isActive ? catColor.primary : "var(--color-surface-1)",
                    color: isActive ? "#000" : "var(--color-text-tertiary)",
                  }}
                >
                  {articleCounts[cat]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-center mt-4 text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-[0.25em]">
        Click nodes on radar or buttons below to filter
      </p>
    </div>
  );
}
