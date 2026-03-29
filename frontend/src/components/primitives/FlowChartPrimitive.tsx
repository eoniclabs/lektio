import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAnimation } from "../../contexts/AnimationContext";

interface FlowNode {
  id: string;
  label: string;
  shape?: "rect" | "diamond" | "oval";
  x: number;
  y: number;
  color?: string;
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

export function FlowChartPrimitive() {
  const { state, primitive } = useAnimation();
  const { currentStep } = state;
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 300;
  const H = 260;
  const NODE_W = 90;
  const NODE_H = 36;
  const DIAMOND_SIZE = 40;

  // Collect nodes and edges visible up to currentStep
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];

  for (let i = 0; i <= currentStep; i++) {
    const step = primitive.steps[i];
    if (!step) continue;
    const d = step.data as Record<string, unknown>;

    if (step.action === "addNode") {
      nodes.push({
        id: d.id as string,
        label: d.label as string,
        shape: (d.shape as FlowNode["shape"]) ?? "rect",
        x: (d.x as number) ?? 50,
        y: (d.y as number) ?? 50,
        color: d.color as string | undefined,
      });
    }
    if (step.action === "addEdge") {
      edges.push({
        from: d.from as string,
        to: d.to as string,
        label: d.label as string | undefined,
      });
    }
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // Animate newly added elements
  useEffect(() => {
    if (!svgRef.current) return;
    const step = primitive.steps[currentStep];
    if (!step) return;
    const els = svgRef.current.querySelectorAll(`[data-step="${currentStep}"]`);
    els.forEach((el) => {
      gsap.fromTo(el, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(1.4)", transformOrigin: "center" });
    });
  }, [currentStep, primitive.steps]);

  function nodeCenterX(n: FlowNode) {
    return (n.x / 100) * W;
  }
  function nodeCenterY(n: FlowNode) {
    return (n.y / 100) * H;
  }

  function renderNode(n: FlowNode, stepIndex: number) {
    const cx = nodeCenterX(n);
    const cy = nodeCenterY(n);
    const color = n.color ?? "#2B9DB0";

    if (n.shape === "diamond") {
      const s = DIAMOND_SIZE;
      const pts = `${cx},${cy - s} ${cx + s * 1.3},${cy} ${cx},${cy + s} ${cx - s * 1.3},${cy}`;
      return (
        <g key={n.id} data-step={stepIndex}>
          <polygon points={pts} fill={`${color}15`} stroke={color} strokeWidth="1.5" />
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill={color} fontWeight="600">
            {n.label}
          </text>
        </g>
      );
    }

    if (n.shape === "oval") {
      return (
        <g key={n.id} data-step={stepIndex}>
          <ellipse cx={cx} cy={cy} rx={NODE_W / 2} ry={NODE_H / 2 - 4}
            fill={`${color}15`} stroke={color} strokeWidth="1.5" />
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill={color} fontWeight="600">
            {n.label}
          </text>
        </g>
      );
    }

    // Default: rect with rounded corners
    return (
      <g key={n.id} data-step={stepIndex}>
        <rect x={cx - NODE_W / 2} y={cy - NODE_H / 2} width={NODE_W} height={NODE_H}
          rx="8" fill={`${color}15`} stroke={color} strokeWidth="1.5" />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill={color} fontWeight="600">
          {n.label}
        </text>
      </g>
    );
  }

  function renderEdge(e: FlowEdge, stepIndex: number) {
    const from = nodeMap.get(e.from);
    const to = nodeMap.get(e.to);
    if (!from || !to) return null;

    const x1 = nodeCenterX(from);
    const y1 = nodeCenterY(from) + NODE_H / 2;
    const x2 = nodeCenterX(to);
    const y2 = nodeCenterY(to) - NODE_H / 2;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    return (
      <g key={`${e.from}-${e.to}`} data-step={stepIndex}>
        <defs>
          <marker id={`arrow-${stepIndex}`} markerWidth="8" markerHeight="8"
            refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#9ca3af" />
          </marker>
        </defs>
        <path d={`M ${x1} ${y1} Q ${x1} ${my} ${x2} ${y2}`}
          stroke="#9ca3af" strokeWidth="1.5" fill="none"
          markerEnd={`url(#arrow-${stepIndex})`} />
        {e.label && (
          <text x={mx + 6} y={my} fontSize="9" fill="#9ca3af" textAnchor="start">{e.label}</text>
        )}
      </g>
    );
  }

  // Map each node/edge back to the step that introduced it
  const stepToNodes = new Map<number, FlowNode[]>();
  const stepToEdges = new Map<number, FlowEdge[]>();
  for (let i = 0; i <= currentStep; i++) {
    const step = primitive.steps[i];
    if (!step) continue;
    const d = step.data as Record<string, unknown>;
    if (step.action === "addNode") {
      stepToNodes.set(i, [...(stepToNodes.get(i) ?? []), {
        id: d.id as string, label: d.label as string,
        shape: (d.shape as FlowNode["shape"]) ?? "rect",
        x: d.x as number, y: d.y as number, color: d.color as string | undefined,
      }]);
    }
    if (step.action === "addEdge") {
      stepToEdges.set(i, [...(stepToEdges.get(i) ?? []), {
        from: d.from as string, to: d.to as string, label: d.label as string | undefined,
      }]);
    }
  }

  return (
    <div className="flex justify-center py-2">
      <svg ref={svgRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {Array.from(stepToEdges.entries()).map(([si, edgeList]) =>
          edgeList.map((e) => renderEdge(e, si))
        )}
        {Array.from(stepToNodes.entries()).map(([si, nodeList]) =>
          nodeList.map((n) => renderNode(n, si))
        )}
      </svg>
    </div>
  );
}
