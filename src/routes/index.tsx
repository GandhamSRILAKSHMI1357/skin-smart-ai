import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Camera, MessageCircle, ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/SiteNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen — Your AI skincare companion" },
      {
        name: "description",
        content:
          "Personalized routines, AI selfie analysis, and a 24/7 esthetician chat. Glow on your terms.",
      },
      { property: "og:title", content: "Lumen — Your AI skincare companion" },
      {
        property: "og:description",
        content: "Personalized routines, AI selfie analysis, and a 24/7 esthetician chat.",
      },
    ],
  }),
  component: Home,
});

const features = [
  {
    to: "/routine" as const,
    icon: Sparkles,
    title: "Routine advisor",
    body: "Tell Lumen about your skin — get a tailored AM & PM routine in seconds.",
  },
  {
    to: "/analyze" as const,
    icon: Camera,
    title: "Selfie analysis",
    body: "Upload a photo. Get gentle, expert observations and focus areas.",
  },
  {
    to: "/chat" as const,
    icon: MessageCircle,
    title: "Ask Lumen",
    body: "Chat with your AI esthetician about any ingredient or concern.",
  },
];

function Home() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-5 pb-24">
        <section className="pt-16 sm:pt-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/70 text-secondary-foreground text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" /> Powered by Lovable AI
          </div>
          <h1 className="mt-6 text-5xl sm:text-6xl font-semibold leading-[1.05]">
            Your skin, <span className="text-gradient">illuminated</span>.
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-muted-foreground text-lg">
            A personal AI esthetician — routines, selfie analysis, and answers to every
            skincare question. Soft, smart, judgement-free.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/routine"
              className="btn-glow hover:[&]:btn-glow-hover inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium"
            >
              Build my routine <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium border border-border bg-card/70 backdrop-blur hover:bg-card transition-colors"
            >
              Try selfie scan
            </Link>
          </div>
        </section>

        <section className="mt-20 grid gap-5 sm:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="surface-card group rounded-2xl p-6 hover:-translate-y-1 transition-transform"
            >
              <span className="grid place-items-center w-11 h-11 rounded-xl bg-secondary text-primary">
                <f.icon className="w-5 h-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
