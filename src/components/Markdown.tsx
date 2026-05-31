import { useMemo } from "react";

// Tiny, dependency-free markdown renderer for the limited subset our AI returns:
// headings, bold, italics, inline code, bullet/numbered lists, paragraphs.
export function Markdown({ text }: { text: string }) {
  const html = useMemo(() => render(text), [text]);
  return (
    <div
      className="prose-lumen text-foreground"
      // Sanitized below — only specific tags emitted.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(s: string) {
  return escape(s)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*]+)\*/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-secondary text-xs">$1</code>');
}

function render(text: string): string {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let list: "ul" | "ol" | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      out.push(`<p class="mb-3 leading-relaxed">${inline(para.join(" "))}</p>`);
      para = [];
    }
  };
  const closeList = () => {
    if (list) {
      out.push(`</${list}>`);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushPara();
      closeList();
      continue;
    }
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      flushPara();
      closeList();
      const lvl = h[1].length;
      const sizes = ["text-2xl", "text-xl", "text-lg"];
      out.push(
        `<h${lvl} class="${sizes[lvl - 1]} font-semibold mt-5 mb-2">${inline(h[2])}</h${lvl}>`,
      );
      continue;
    }
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    if (ol) {
      flushPara();
      if (list !== "ol") {
        closeList();
        out.push('<ol class="list-decimal pl-5 space-y-1.5 mb-3">');
        list = "ol";
      }
      out.push(`<li>${inline(ol[1])}</li>`);
      continue;
    }
    if (ul) {
      flushPara();
      if (list !== "ul") {
        closeList();
        out.push('<ul class="list-disc pl-5 space-y-1.5 mb-3">');
        list = "ul";
      }
      out.push(`<li>${inline(ul[1])}</li>`);
      continue;
    }
    closeList();
    para.push(line);
  }
  flushPara();
  closeList();
  return out.join("\n");
}
