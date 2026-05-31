import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/routine", label: "Routine" },
  { to: "/analyze", label: "Analyze" },
  { to: "/chat", label: "Chat" },
] as const;

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/60">
      <div className="mx-auto max-w-5xl px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid place-items-center w-9 h-9 rounded-full btn-glow">
            <Sparkles className="w-4 h-4" />
          </span>
          <span className="font-semibold tracking-tight text-lg">Lumen</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
