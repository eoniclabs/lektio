import { useEffect, useRef } from "react";
import gsap from "gsap";
import ReactMarkdown from "react-markdown";
import { useAnimation } from "../../contexts/AnimationContext";

export function TextBlockPrimitive() {
  const { state, primitive } = useAnimation();
  const { currentStep } = state;
  const blockRef = useRef<HTMLDivElement>(null);

  const step = primitive.steps[currentStep];
  const data = step?.data as { text?: string; highlight?: string | null } | undefined;
  const text = data?.text ?? step?.narration ?? "";

  useEffect(() => {
    if (!blockRef.current) return;
    const transition = step?.transition ?? "fade";

    if (transition === "fade") {
      gsap.fromTo(blockRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    } else if (transition === "slide") {
      gsap.fromTo(
        blockRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [currentStep, step?.transition]);

  // Highlight specific phrase if requested
  useEffect(() => {
    if (!blockRef.current || !data?.highlight) return;
    const highlight = data.highlight;
    const walker = document.createTreeWalker(blockRef.current, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);

    for (const node of nodes) {
      const idx = node.nodeValue?.indexOf(highlight) ?? -1;
      if (idx === -1) continue;
      const before = document.createTextNode(node.nodeValue!.slice(0, idx));
      const mark = document.createElement("mark");
      mark.textContent = highlight;
      mark.className = "bg-[#2B9DB0]/20 text-[#1d7a8a] rounded px-0.5 not-italic";
      const after = document.createTextNode(node.nodeValue!.slice(idx + highlight.length));
      node.parentNode?.replaceChild(after, node);
      after.parentNode?.insertBefore(mark, after);
      after.parentNode?.insertBefore(before, mark);
      gsap.fromTo(mark, { backgroundColor: "rgba(43,157,176,0.5)" }, { backgroundColor: "rgba(43,157,176,0.15)", duration: 1.2, delay: 0.3 });
      break;
    }
  }, [currentStep, data?.highlight]);

  return (
    <div
      ref={blockRef}
      className="py-3 px-1 text-sm text-gray-800 prose prose-sm max-w-none leading-relaxed"
    >
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
