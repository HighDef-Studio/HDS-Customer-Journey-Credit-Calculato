import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Calculator from "@/pages/calculator";
import NotFound from "@/pages/not-found";
import { useState, useEffect } from "react";

// Create a makebase hook that understands the base path from Vite
const useBasePath = () => {
  const base = import.meta.env.BASE_URL;
  return base === "/" ? "" : base;
};

function Router() {
  // Get the base path for GitHub Pages
  const basePath = useBasePath();
  
  // Force a re-render on mount to ensure proper routing with the base path
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  
  return (
    <WouterRouter base={basePath}>
      <Switch>
        <Route path="/" component={Calculator} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
