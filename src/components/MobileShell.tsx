import { NavLink, useLocation } from "react-router-dom";
import { Home, Upload, MessageCircle, Target, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { DesktopContextPanel } from "@/components/DesktopContextPanel";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/chat", label: "Coach", icon: MessageCircle },
  { to: "/career", label: "Career", icon: Target },
  { to: "/resume", label: "Resume", icon: FileText },
];

const BrandMark = () => (
  // 4-dot Google nod inside a single solid blue tile
  <div className="abs-brand-mark">
    <div className="grid grid-cols-2 gap-[3px]">
      <span className="w-1.5 h-1.5 rounded-full bg-white/95" />
      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(4_84%_70%)]" />
      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(45_96%_70%)]" />
      <span className="w-1.5 h-1.5 rounded-full bg-[hsl(137_53%_70%)]" />
    </div>
  </div>
);

export const MobileShell = ({ children }: { children: React.ReactNode }) => {
  const loc = useLocation();
  const hideMobileNav =
    loc.pathname.startsWith("/result") ||
    loc.pathname.startsWith("/chat") ||
    loc.pathname.startsWith("/quiz");
  const hideContextPanel =
    hideMobileNav || loc.pathname.startsWith("/onboarding");

  return (
    <div className="min-h-screen w-full bg-background">
      <div className="mx-auto flex w-full max-w-[1440px] min-h-screen">
        {/* Side rail (md+) */}
        <aside
          className="hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen md:w-[78px] lg:w-[232px] shrink-0 border-r border-border/70"
          style={{ background: "hsl(var(--surface-2))" }}
        >
          <div className="flex items-center gap-2.5 px-4 lg:px-5 h-16">
            <BrandMark />
            <div className="hidden lg:flex flex-col leading-none">
              <span className="text-[15px] font-semibold tracking-tight">ABS</span>
              <span className="text-[10px] text-muted-foreground tracking-[0.12em] uppercase mt-0.5">
                Career engine
              </span>
            </div>
          </div>
          <div className="abs-divider opacity-60" />

          <nav className="flex-1 px-2 lg:px-3 py-4 flex flex-col gap-0.5">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 abs-tap abs-focus",
                    isActive
                      ? "bg-primary-soft text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                    )}
                    <t.icon className={cn("w-[18px] h-[18px] shrink-0 transition-transform", isActive && "scale-105")} />
                    <span className="hidden lg:inline text-[13.5px]">{t.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2 px-5 py-4 border-t border-border/70">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-[11px] text-muted-foreground">v1.0 · all systems go</span>
          </div>
        </aside>

        {/* Center content column */}
        <div className="flex-1 min-w-0 flex justify-center">
          <main className="w-full max-w-[440px] md:max-w-[700px] lg:max-w-[760px] pb-28 md:pb-10 px-0 md:px-8">
            {children}
          </main>
        </div>

        {/* Right context panel (lg+) */}
        {!hideContextPanel && (
          <aside
            className="hidden lg:block w-[300px] shrink-0 border-l border-border/70 sticky top-0 h-screen overflow-y-auto"
            style={{ background: "hsl(var(--surface-2))" }}
          >
            <DesktopContextPanel />
          </aside>
        )}
      </div>

      {/* Mobile flush bottom bar */}
      {!hideMobileNav && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-xl border-t border-border">
          <div
            className="flex items-stretch justify-around px-1 pt-1.5"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 6px)" }}
          >
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 abs-tap abs-focus",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "absolute -top-1.5 left-1/2 -translate-x-1/2 h-1 rounded-full transition-all duration-300",
                        isActive ? "w-5 bg-primary" : "w-0 bg-transparent"
                      )}
                    />
                    <t.icon className={cn("w-[20px] h-[20px] transition-transform", isActive && "scale-110")} />
                    <span className="text-[10px] font-medium tracking-wide">{t.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};
