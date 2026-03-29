import { useEffect, useRef } from "react";
import gsap from "gsap";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useAnimation } from "../../contexts/AnimationContext";

const MARK_CLASS = "bg-[#2B9DB0]/20 text-[#1d7a8a] rounded px-0.5 not-italic";

/**
 * Injects a <mark> tag around the highlight phrase in the raw markdown string.
 * Strategy:
 *  1. Direct substring match (handles simple words and phrases not split by markdown).
 *  2. Regex match that tolerates markdown syntax characters (*_~) between words,
 *     covering phrases like "bold text" that render from "**bold** text".
 */
function injectHighlight(markdown: string, phrase: string): string {
  // 1. Direct match
  const idx = markdown.indexOf(phrase);
  if (idx !== -1) {
    return (
      markdown.slice(0, idx) +
      `<mark class="${MARK_CLASS}">${phrase}</mark>` +
      markdown.slice(idx + phrase.length)
    );
  }

  // 2. Cross-boundary match: allow markdown syntax between words
  const escaped = phrase
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("[\\s*_~]+");
  return markdown.replace(
    new RegExp(escaped, "i"),
    (match) => `<mark class="${MARK_CLASS}">${match}</mark>`
  );
}

export function TextBlockPrimitive() {
  const { state, primitive } = useAnimation();
  const { currentStep } = state;
  const blockRef = useRef<HTMLDivElement>(null);

  const step = primitive.steps[currentStep];
  const data = step?.data as { text?: string; highlight?: string | null } | undefined;
  const rawText = data?.text ?? step?.narration ?? "";
  const highlight = data?.highlight ?? null;

  const text = highlight ? injectHighlight(rawText, highlight) : rawText;

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

  // Animate the injected <mark> element after render
  useEffect(() => {
    if (!blockRef.current || !highlight) return;
    const mark = blockRef.current.querySelector("mark");
    if (!mark) return;
    gsap.fromTo(
      mark,
      { backgroundColor: "rgba(43,157,176,0.5)" },
      { backgroundColor: "rgba(43,157,176,0.15)", duration: 1.2, delay: 0.3 }
    );
  }, [currentStep, highlight]);

  return (
    <div
      ref={blockRef}
      className="py-3 px-1 text-sm text-gray-800 prose prose-sm max-w-none leading-relaxed"
    >
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{text}</ReactMarkdown>
    </div>
  );
}
