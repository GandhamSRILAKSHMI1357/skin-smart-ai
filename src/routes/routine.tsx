import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { getRoutine } from "@/lib/api/skincare.functions";
import { Sparkles, Loader2 } from "lucide-react";
import { Markdown } from "@/components/Markdown";

export const Route = createFileRoute("/routine")({
  head: () => ({
    meta: [
      { title: "Routine advisor — Lumen" },
      { name: "description", content: "Get a personalized AM and PM skincare routine in seconds." },
      { property: "og:title", content: "Routine advisor — Lumen" },
      { property: "og:description", content: "Get a personalized AM and PM skincare routine." },
    ],
  }),
  component: RoutinePage,
});

const SKIN_TYPES = ["Oily", "Dry", "Combination", "Normal", "Sensitive"] as const;

function RoutinePage() {
  const run = useServerFn(getRoutine);
  const [skinType, setSkinType] = useState<string>("Combination");
  const [concerns, setConcerns] = useState("");
  const [age, setAge] = useState("");
  const [budget, setBudget] = useState("Mid-range");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await run({ data: { skinType, concerns, age, budget } });
      setResult(r.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <header className="text-center">
          <h1 className="text-4xl font-semibold">Build my routine</h1>
          <p className="mt-2 text-muted-foreground">A few quick details and Lumen does the rest.</p>
        </header>

        <form onSubmit={submit} className="surface-card mt-8 rounded-2xl p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Skin type</label>
            <div className="flex flex-wrap gap-2">
              {SKIN_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSkinType(t)}
                  className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                    skinType === t
                      ? "bg-primary text-primary-foreground border-transparent"
                      : "bg-card border-border hover:bg-secondary/60"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="concerns">
              Main concerns
            </label>
            <textarea
              id="concerns"
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              placeholder="e.g. dryness around cheeks, occasional breakouts on chin, dullness"
              rows={3}
              className="w-full rounded-xl bg-input/40 border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-ring/60 resize-none"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="age">Age range</label>
              <input
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 25"
                className="w-full rounded-xl bg-input/40 border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-ring/60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Budget</label>
              <div className="flex gap-2">
                {["Drugstore", "Mid-range", "Luxury"].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBudget(b)}
                    className={`flex-1 px-3 py-2 rounded-full text-sm border transition-colors ${
                      budget === b
                        ? "bg-primary text-primary-foreground border-transparent"
                        : "bg-card border-border hover:bg-secondary/60"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glow hover:[&]:btn-glow-hover inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-medium disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Crafting your routine..." : "Generate routine"}
          </button>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>
          )}
        </form>

        {result && (
          <article className="surface-card mt-6 rounded-2xl p-6">
            <Markdown text={result} />
          </article>
        )}
      </main>
    </div>
  );
}
