import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MobileShell } from "@/components/MobileShell";
import { useLearningStore } from "@/store/learning";
import Home from "./pages/Home";
import Upload from "./pages/Upload";
import Result from "./pages/Result";
import Career from "./pages/Career";
import Resume from "./pages/Resume";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const Gate = ({ children }: { children: React.ReactNode }) => {
  const hasOnboarded = useLearningStore((s) => s.hasOnboarded);
  const loc = useLocation();
  if (!hasOnboarded && loc.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  if (hasOnboarded && loc.pathname === "/onboarding") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => {
  const loc = useLocation();
  const isOnboarding = loc.pathname === "/onboarding";
  const content = (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/" element={<Home />} />
      <Route path="/upload" element={<Upload />} />
      <Route path="/result/:id" element={<Result />} />
      <Route path="/career" element={<Career />} />
      <Route path="/resume" element={<Resume />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
  return <Gate>{isOnboarding ? content : <MobileShell>{content}</MobileShell>}</Gate>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
