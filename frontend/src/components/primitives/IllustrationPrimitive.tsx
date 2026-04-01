import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useAnimation } from "../../contexts/AnimationContext";

// Stödda SVG-formtyper
type ShapeType = "circle" | "rect" | "ellipse" | "line" | "path" | "text";

interface ShapeData {
  id: string;
  type: ShapeType;
  props: Record<string, unknown>;
  label?: string;
}

interface SceneConfig {
  viewBox: string;
  background?: string;
}

export function IllustrationPrimitive() {
  const { state, primitive } = useAnimation();
  const { currentStep } = state;
  const svgRef = useRef<SVGSVGElement>(null);
  const shapeRefs = useRef<Map<string, SVGElement | null>>(new Map());

  // Bygg upp scen och form-state genom att spela alla steg upp till currentStep
  let scene: SceneConfig = { viewBox: "0 0 400 300" };
  const shapes = new Map<string, ShapeData>();
  const stepActions: { stepIndex: number; action: string; data: Record<string, unknown> }[] = [];

  for (let i = 0; i <= currentStep; i++) {
    const step = primitive.steps[i];
    if (!step) continue;
    const d = step.data as Record<string, unknown>;

    stepActions.push({ stepIndex: i, action: step.action, data: d });

    if (step.action === "setScene") {
      scene = {
        viewBox: (d.viewBox as string) ?? "0 0 400 300",
        background: d.background as string | undefined,
      };
    }

    if (step.action === "addShape") {
      const shape: ShapeData = {
        id: d.id as string,
        type: d.type as ShapeType,
        props: (d.props as Record<string, unknown>) ?? {},
        label: d.label as string | undefined,
      };
      shapes.set(shape.id, shape);
    }

    if (step.action === "addGroup") {
      const groupShapes = (d.shapes as ShapeData[]) ?? [];
      for (const s of groupShapes) {
        shapes.set(s.id, {
          id: s.id,
          type: s.type,
          props: s.props ?? {},
          label: s.label,
        });
      }
    }

    if (step.action === "moveShape") {
      const targetId = d.id as string;
      const existing = shapes.get(targetId);
      if (existing) {
        const toProps = (d.to as Record<string, unknown>) ?? {};
        shapes.set(targetId, {
          ...existing,
          props: { ...existing.props, ...toProps },
        });
      }
    }

    // highlight uppdaterar inte formen permanent, hanteras i animation
  }

  // Animera det senaste steget
  useEffect(() => {
    if (!svgRef.current) return;
    const step = primitive.steps[currentStep];
    if (!step) return;
    const d = step.data as Record<string, unknown>;
    const duration = (step.durationMs ?? 800) / 1000;

    if (step.action === "setScene") {
      gsap.fromTo(svgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    }

    if (step.action === "addShape") {
      const el = shapeRefs.current.get(d.id as string);
      if (el) {
        gsap.fromTo(el, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.4)", transformOrigin: "center" });
      }
    }

    if (step.action === "addGroup") {
      const groupShapes = (d.shapes as ShapeData[]) ?? [];
      groupShapes.forEach((s, idx) => {
        const el = shapeRefs.current.get(s.id);
        if (el) {
          gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.35, delay: idx * 0.08, ease: "power2.out" });
        }
      });
    }

    if (step.action === "moveShape") {
      const targetId = d.id as string;
      const el = shapeRefs.current.get(targetId);
      const toProps = (d.to as Record<string, unknown>) ?? {};
      const moveDuration = (d.duration as number) ?? duration;
      if (el) {
        const attrValues: Record<string, number | string> = {};
        for (const [key, val] of Object.entries(toProps)) {
          if (typeof val === "number" || typeof val === "string") {
            attrValues[key] = val;
          }
        }
        gsap.to(el, { attr: attrValues, duration: moveDuration, ease: "power2.inOut" });
      }
    }

    if (step.action === "highlight") {
      const targetId = d.id as string;
      const color = (d.color as string) ?? "#e06c75";
      const el = shapeRefs.current.get(targetId);
      if (el) {
        gsap.fromTo(
          el,
          { filter: "drop-shadow(0 0 0px transparent)" },
          {
            filter: `drop-shadow(0 0 6px ${color})`,
            duration: 0.4,
            yoyo: true,
            repeat: 2,
            ease: "power1.inOut",
          }
        );
      }
    }
  }, [currentStep, primitive.steps]);

  // Rendera en SVG-form baserat på typ och props
  function renderShape(shape: ShapeData) {
    const { id, type, props, label } = shape;
    const setRef = (el: SVGElement | null) => {
      shapeRefs.current.set(id, el);
    };

    // Extrahera textContent separat (inte ett giltigt SVG-attribut)
    const { textContent, ...svgProps } = props;

    let shapeEl: React.ReactNode = null;

    switch (type) {
      case "circle":
        shapeEl = <circle ref={setRef as React.Ref<SVGCircleElement>} {...svgProps} />;
        break;
      case "rect":
        shapeEl = <rect ref={setRef as React.Ref<SVGRectElement>} {...svgProps} />;
        break;
      case "ellipse":
        shapeEl = <ellipse ref={setRef as React.Ref<SVGEllipseElement>} {...svgProps} />;
        break;
      case "line":
        shapeEl = <line ref={setRef as React.Ref<SVGLineElement>} {...svgProps} />;
        break;
      case "path":
        shapeEl = <path ref={setRef as React.Ref<SVGPathElement>} fill="none" {...svgProps} />;
        break;
      case "text": {
        const content = (textContent as string) ?? "";
        shapeEl = (
          <text ref={setRef as React.Ref<SVGTextElement>} {...svgProps}>
            {content}
          </text>
        );
        break;
      }
      default:
        return null;
    }

    // Om formen har en label, visa den bredvid
    if (label) {
      const labelX = (props.cx as number) ?? (props.x as number) ?? 0;
      const labelY = ((props.cy as number) ?? (props.y as number) ?? 0) - 10;
      return (
        <g key={id}>
          {shapeEl}
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            fontSize="10"
            fill="#64748b"
            fontWeight="500"
          >
            {label}
          </text>
        </g>
      );
    }

    return <g key={id}>{shapeEl}</g>;
  }

  // Parsa viewBox-dimensioner for bakgrund
  const vbParts = scene.viewBox.split(" ").map(Number);
  const vbX = vbParts[0] ?? 0;
  const vbY = vbParts[1] ?? 0;
  const vbW = vbParts[2] ?? 400;
  const vbH = vbParts[3] ?? 300;

  return (
    <div className="flex justify-center py-2">
      <svg
        ref={svgRef}
        width={vbW}
        height={vbH}
        viewBox={scene.viewBox}
        className="overflow-visible max-w-full"
      >
        {/* Bakgrund */}
        {scene.background && (
          <rect x={vbX} y={vbY} width={vbW} height={vbH} fill={scene.background} rx="8" />
        )}
        {/* Alla former */}
        {Array.from(shapes.values()).map((shape) => renderShape(shape))}
      </svg>
    </div>
  );
}
