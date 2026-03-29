import { useEffect, useRef } from "react";
import gsap from "gsap";
import { evaluate } from "mathjs";
import { useAnimation } from "../../contexts/AnimationContext";

// Safe expression evaluator using mathjs (no code execution)
// Normalises JS-style Math.* calls to mathjs equivalents (e.g. Math.sin → sin)
function evalExpression(expr: string, x: number): number {
  try {
    const normalized = expr.replace(/Math\./g, "");
    const result = evaluate(normalized, { x });
    return typeof result === "number" ? result : NaN;
  } catch {
    return NaN;
  }
}

function buildPath(expr: string, xRange: [number, number], yRange: [number, number], w: number, h: number, padding: number): string {
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;
  const toSvgX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * (w - 2 * padding);
  const toSvgY = (y: number) => h - padding - ((y - yMin) / (yMax - yMin)) * (h - 2 * padding);

  const steps = 200;
  const dx = (xMax - xMin) / steps;
  let d = "";
  let penDown = false;

  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * dx;
    const y = evalExpression(expr, x);
    if (!isFinite(y) || y < yMin - 1 || y > yMax + 1) {
      penDown = false;
      continue;
    }
    const sx = toSvgX(x);
    const sy = toSvgY(y);
    if (!penDown) {
      d += `M ${sx} ${sy} `;
      penDown = true;
    } else {
      d += `L ${sx} ${sy} `;
    }
  }
  return d.trim();
}

const PALETTE = ["#2B9DB0", "#e06c75", "#98c379", "#e5c07b", "#c678dd", "#56b6c2"];

export function CoordinateSystemPrimitive() {
  const { state, primitive } = useAnimation();
  const { currentStep } = state;
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 300;
  const H = 240;
  const PAD = 32;

  // Determine axis range from all steps
  let xRange: [number, number] = [-5, 5];
  let yRange: [number, number] = [-5, 5];
  for (const s of primitive.steps) {
    const d = s.data as { xRange?: [number, number]; yRange?: [number, number] };
    if (d.xRange) xRange = d.xRange;
    if (d.yRange) yRange = d.yRange;
  }

  const toSvgX = (x: number) =>
    PAD + ((x - xRange[0]) / (xRange[1] - xRange[0])) * (W - 2 * PAD);
  const toSvgY = (y: number) =>
    H - PAD - ((y - yRange[0]) / (yRange[1] - yRange[0])) * (H - 2 * PAD);

  // Animate new elements on step change
  useEffect(() => {
    if (!svgRef.current) return;
    const step = primitive.steps[currentStep];
    if (!step) return;

    const newEls = svgRef.current.querySelectorAll("[data-step='" + currentStep + "']");
    newEls.forEach((el) => {
      const transition = step.transition;
      if (transition === "draw" && el instanceof SVGPathElement) {
        const len = el.getTotalLength();
        gsap.fromTo(el,
          { strokeDasharray: len, strokeDashoffset: len, opacity: 1 },
          { strokeDashoffset: 0, duration: (step.durationMs / 1000) * 0.8, ease: "power2.inOut" }
        );
      } else {
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
      }
    });
  }, [currentStep, primitive.steps]);

  const gridLines: React.ReactNode[] = [];
  for (let x = Math.ceil(xRange[0]); x <= Math.floor(xRange[1]); x++) {
    gridLines.push(
      <line key={`gx${x}`} x1={toSvgX(x)} y1={PAD} x2={toSvgX(x)} y2={H - PAD}
        stroke="#f0f0f0" strokeWidth="1" />
    );
  }
  for (let y = Math.ceil(yRange[0]); y <= Math.floor(yRange[1]); y++) {
    gridLines.push(
      <line key={`gy${y}`} x1={PAD} y1={toSvgY(y)} x2={W - PAD} y2={toSvgY(y)}
        stroke="#f0f0f0" strokeWidth="1" />
    );
  }

  const axisLabels: React.ReactNode[] = [];
  for (let x = Math.ceil(xRange[0]); x <= Math.floor(xRange[1]); x++) {
    if (x === 0) continue;
    axisLabels.push(
      <text key={`lx${x}`} x={toSvgX(x)} y={toSvgY(0) + 14}
        textAnchor="middle" fontSize="9" fill="#9ca3af">{x}</text>
    );
  }
  for (let y = Math.ceil(yRange[0]); y <= Math.floor(yRange[1]); y++) {
    if (y === 0) continue;
    axisLabels.push(
      <text key={`ly${y}`} x={toSvgX(0) - 8} y={toSvgY(y) + 3}
        textAnchor="end" fontSize="9" fill="#9ca3af">{y}</text>
    );
  }

  let colorIndex = 0;
  const renderedSteps: React.ReactNode[] = [];

  for (let si = 0; si <= currentStep; si++) {
    const s = primitive.steps[si];
    if (!s) continue;
    const d = s.data as Record<string, unknown>;

    if (s.action === "drawAxes" || s.action === "init") continue;

    if (s.action === "plotFunction" && typeof d.expression === "string") {
      const color = (typeof d.color === "string" ? d.color : null) ?? PALETTE[colorIndex++ % PALETTE.length];
      const pathD = buildPath(d.expression, xRange, yRange, W, H, PAD);
      renderedSteps.push(
        <path key={`curve-${si}`} data-step={si} d={pathD}
          stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      );
      if (typeof d.label === "string") {
        const labelX = toSvgX(xRange[1] - (xRange[1] - xRange[0]) * 0.05);
        const lastY = evalExpression(d.expression, xRange[1] - (xRange[1] - xRange[0]) * 0.05);
        if (isFinite(lastY)) {
          renderedSteps.push(
            <text key={`label-${si}`} data-step={si} x={labelX} y={toSvgY(lastY) - 6}
              fontSize="10" fill={color} textAnchor="end" fontWeight="600">{d.label as string}</text>
          );
        }
      }
    }

    if (s.action === "addPoint" && typeof d.x === "number" && typeof d.y === "number") {
      const color = (typeof d.color === "string" ? d.color : null) ?? "#e06c75";
      renderedSteps.push(
        <g key={`pt-${si}`} data-step={si}>
          <circle cx={toSvgX(d.x)} cy={toSvgY(d.y)} r="5" fill={color} />
          {typeof d.label === "string" && (
            <text x={toSvgX(d.x) + 7} y={toSvgY(d.y) - 4}
              fontSize="10" fill={color} fontWeight="600">{d.label as string}</text>
          )}
        </g>
      );
    }

    if (s.action === "drawTangent" && typeof d.x === "number" && typeof d.expression === "string") {
      const x0 = d.x as number;
      const h = 0.0001;
      const y0 = evalExpression(d.expression, x0);
      const slope = (evalExpression(d.expression, x0 + h) - y0) / h;
      const span = (xRange[1] - xRange[0]) * 0.3;
      const x1 = x0 - span; const x2 = x0 + span;
      const y1 = y0 + slope * (x1 - x0);
      const y2 = y0 + slope * (x2 - x0);
      renderedSteps.push(
        <line key={`tan-${si}`} data-step={si}
          x1={toSvgX(x1)} y1={toSvgY(y1)} x2={toSvgX(x2)} y2={toSvgY(y2)}
          stroke="#e5c07b" strokeWidth="1.5" strokeDasharray="4 3" />
      );
    }

    if (s.action === "shadeArea" && typeof d.expression === "string"
        && typeof d.xFrom === "number" && typeof d.xTo === "number") {
      const color = (typeof d.color === "string" ? d.color : null) ?? "#2B9DB0";
      const aSteps = 100;
      const dx = (d.xTo - d.xFrom) / aSteps;
      let aPath = `M ${toSvgX(d.xFrom)} ${toSvgY(0)} `;
      for (let i = 0; i <= aSteps; i++) {
        const ax = d.xFrom + i * dx;
        aPath += `L ${toSvgX(ax)} ${toSvgY(evalExpression(d.expression, ax))} `;
      }
      aPath += `L ${toSvgX(d.xTo)} ${toSvgY(0)} Z`;
      renderedSteps.push(
        <path key={`area-${si}`} data-step={si} d={aPath}
          fill={color} fillOpacity="0.15" stroke={color} strokeWidth="0" />
      );
    }
  }

  return (
    <div className="flex justify-center py-2">
      <svg ref={svgRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`}
        className="overflow-visible">
        {/* Grid */}
        {gridLines}
        {/* Axes */}
        <line x1={PAD} y1={toSvgY(0)} x2={W - PAD} y2={toSvgY(0)}
          stroke="#d1d5db" strokeWidth="1.5" />
        <line x1={toSvgX(0)} y1={PAD} x2={toSvgX(0)} y2={H - PAD}
          stroke="#d1d5db" strokeWidth="1.5" />
        {/* Axis arrows */}
        <polygon points={`${W - PAD},${toSvgY(0)} ${W - PAD - 6},${toSvgY(0) - 4} ${W - PAD - 6},${toSvgY(0) + 4}`}
          fill="#d1d5db" />
        <polygon points={`${toSvgX(0)},${PAD} ${toSvgX(0) - 4},${PAD + 6} ${toSvgX(0) + 4},${PAD + 6}`}
          fill="#d1d5db" />
        {/* Labels */}
        {axisLabels}
        <text x={W - PAD + 4} y={toSvgY(0) + 4} fontSize="11" fill="#9ca3af">x</text>
        <text x={toSvgX(0) + 4} y={PAD - 4} fontSize="11" fill="#9ca3af">y</text>
        {/* Data */}
        {renderedSteps}
      </svg>
    </div>
  );
}
