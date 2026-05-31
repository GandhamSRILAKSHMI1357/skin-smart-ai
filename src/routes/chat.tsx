import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { chatWithLumen } from "@/lib/api/skincare.functions";
import { Loader2, Send, Sparkles } from "lucide-react";
import { Markdown } from "@/components/Markdown";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Ask Lumen — AI esthetician chat" },
      { name: "description", content: "Ask Lumen anything about ingredients, routines, or concerns." },
      { property: "og:title", content: "Ask Lumen — AI esthetician chat" },
      { property: "og:description", content: "Chat with your AI esthetician." },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Can I use retinol and vitamin C together?",
  "How do I treat under-eye dark circles?",
  "What ingredients help with redness?",
];

function ChatPage() {
  const run = useServerFn(chatWithLumen);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const value = text.trim();
    if (!value || loading) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: value }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const r = await run({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: r.content }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 mx-auto w-full max-w-3xl px-5 py-8 flex flex-col">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-semibold">Ask Lumen</h1>
          <p className="mt-2 text-muted-foreground">Your 24/7 AI esthetician.</p>
        </header>

        <div className="surface-card flex-1 rounded-2xl p-5 flex flex-col min-h-[55vh]">
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.length === 0 && (
              <div className="h-full grid place-items-center text-center py-10">
                <div>
                  <span className="grid place-items-center w-14 h-14 rounded-full btn-glow mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </span>
                  <p className="mt-4 text-muted-foreground">Ask anything skincare-related.</p>
                  <div className="mt-5 flex flex-wrap gap-2 justify-center">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-xs px-3 py-1.5 rounded-full bg-secondary/70 hover:bg-secondary text-secondary-foreground transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary/70 text-secondary-foreground rounded-bl-sm"
                  }`}
                >
                  {m.role === "assistant" ? <Markdown text={m.content} /> : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary/70 rounded-2xl rounded-bl-sm px-4 py-3 text-sm flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Lumen is thinking…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {error && (
            <p className="mt-3 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
              {error}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mt-4 flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Ask about an ingredient, concern, or routine…"
              rows={1}
              className="flex-1 resize-none rounded-2xl bg-input/40 border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-ring/60 max-h-32"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-glow hover:[&]:btn-glow-hover w-12 h-12 rounded-full grid place-items-center disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
