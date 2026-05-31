import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { analyzeSelfie } from "@/lib/api/skincare.functions";
import { Camera, Loader2, Upload, X } from "lucide-react";
import { Markdown } from "@/components/Markdown";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Selfie analysis — Lumen" },
      { name: "description", content: "Upload a selfie and get gentle AI skin observations." },
      { property: "og:title", content: "Selfie analysis — Lumen" },
      { property: "og:description", content: "Upload a selfie and get gentle AI skin observations." },
    ],
  }),
  component: AnalyzePage,
});

async function downscale(file: File, max = 1024): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = reject;
    im.src = dataUrl;
  });
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function AnalyzePage() {
  const run = useServerFn(analyzeSelfie);
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function onFile(f: File | undefined) {
    if (!f) return;
    setError(null);
    setResult(null);
    try {
      const url = await downscale(f);
      setPreview(url);
    } catch {
      setError("Couldn't read that image.");
    }
  }

  async function submit() {
    if (!preview) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await run({ data: { imageDataUrl: preview, notes } });
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
          <h1 className="text-4xl font-semibold">Selfie analysis</h1>
          <p className="mt-2 text-muted-foreground">
            Best in soft natural light, no makeup if possible.
          </p>
        </header>

        <div className="surface-card mt-8 rounded-2xl p-6 space-y-5">
          {preview ? (
            <div className="relative mx-auto w-fit">
              <img
                src={preview}
                alt="Selfie preview"
                className="rounded-xl max-h-80 shadow-[var(--shadow-soft)]"
              />
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="absolute -top-2 -right-2 w-8 h-8 grid place-items-center rounded-full bg-card border border-border shadow"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-border py-12 flex flex-col items-center gap-3 hover:bg-secondary/40 transition-colors"
            >
              <span className="grid place-items-center w-12 h-12 rounded-full bg-secondary text-primary">
                <Upload className="w-5 h-5" />
              </span>
              <span className="font-medium">Upload a selfie</span>
              <span className="text-xs text-muted-foreground">PNG or JPG, kept on-device until analysis</span>
            </button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional: anything you'd like Lumen to focus on?"
            rows={2}
            className="w-full rounded-xl bg-input/40 border border-border px-4 py-3 outline-none focus:ring-2 focus:ring-ring/60 resize-none"
          />

          <button
            type="button"
            onClick={submit}
            disabled={!preview || loading}
            className="btn-glow hover:[&]:btn-glow-hover inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full font-medium disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            {loading ? "Analyzing..." : "Analyze my skin"}
          </button>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>
          )}
        </div>

        {result && (
          <article className="surface-card mt-6 rounded-2xl p-6">
            <Markdown text={result} />
          </article>
        )}
      </main>
    </div>
  );
}
