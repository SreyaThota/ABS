import { NavLink, useLocation } from "react-router-dom";
import { Home, Upload, MessageCircle, Target, FileText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { DesktopContextPanel } from "@/components/DesktopContextPanel";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/chat", label: "Coach", icon: MessageCircle },
  { to: "/career", label: "Career", icon: Target },
  { to: "/resume", label: "Resume", icon: FileText },
];

export const MobileShell = ({ children }: { children: React.ReactNode }) => {
  const loc = useLocation();
  // The bottom nav (mobile) hides on focused flows.
  const hideMobileNav =
    loc.pathname.startsWith("/result") ||
    loc.pathname.startsWith("/chat") ||
    loc.pathname.startsWith("/quiz");
  // The desktop right context panel hides on focused flows + onboarding.
  const hideContextPanel =
    hideMobileNav || loc.pathname.startsWith("/onboarding");

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Desktop layout: side rail + content + optional context panel */}
      <div className="mx-auto flex w-full max-w-[1400px] min-h-screen">
        {/* Side rail (md+) */}
        <aside className="hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen md:w-[76px] lg:w-[220px] border-r border-border bg-card/60 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 px-4 lg:px-5 h-16 border-b border-border">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="hidden lg:block text-sm font-semibold tracking-tight">ABS</span>
          </div>
          <nav className="flex-1 px-2 lg:px-3 py-4 flex flex-col gap-1">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 abs-tap",
                    isActive
                      ? "bg-primary-soft text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <t.icon className={cn("w-5 h-5 shrink-0 transition-transform", isActive && "scale-110")} />
                    <span className="hidden lg:inline text-sm">{t.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="hidden lg:block px-5 py-4 text-[10px] text-muted-foreground border-t border-border">
            Career Impact Engine
          </div>
        </aside>

        {/* Center content column */}
        <div className="flex-1 min-w-0 flex justify-center">
          <main className="w-full max-w-[440px] md:max-w-[680px] lg:max-w-[760px] pb-28 md:pb-8 px-0 md:px-6">
            {children}
          </main>
        </div>

        {/* Right context panel (lg+) */}
        {!hideContextPanel && (
          <aside className="hidden lg:block w-[300px] shrink-0 border-l border-border bg-card/40 backdrop-blur-sm sticky top-0 h-screen overflow-y-auto">
            <DesktopContextPanel />
          </aside>
        )}
      </div>

      {/* Mobile floating bottom nav */}
      {!hideMobileNav && (
        <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[408px] z-30">
          <div className="abs-card-elevated bg-card/95 backdrop-blur-xl flex items-center justify-around px-2 py-2 rounded-full">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-full transition-all duration-300 abs-tap min-w-[52px]",
                    isActive
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <t.icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
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
