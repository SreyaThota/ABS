import { NavLink, useLocation } from "react-router-dom";
import { Home, Upload, MessageCircle, Target, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/chat", label: "Coach", icon: MessageCircle },
  { to: "/career", label: "Career", icon: Target },
  { to: "/resume", label: "Resume", icon: FileText },
];

export const MobileShell = ({ children }: { children: React.ReactNode }) => {
  const loc = useLocation();
  const hideNav = loc.pathname.startsWith("/result") || loc.pathname.startsWith("/chat") || loc.pathname.startsWith("/quiz");
  return (
    <div className="min-h-screen w-full bg-background flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen flex flex-col relative">
        <main className="flex-1 pb-28">{children}</main>
        {!hideNav && (
          <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[408px] z-30">
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
    </div>
  );
};
