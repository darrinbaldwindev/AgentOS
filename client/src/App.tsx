import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
const Chat = lazy(() => import("./pages/Chat"));

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07111f] p-8 font-mono text-xs uppercase tracking-[0.14em] text-cyan-200">
          Loading AgentOS surface…
        </div>
      }
    >
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/chat"} component={Chat} />
        <Route path={"/providers"} component={Home} />
        <Route path={"/affiliates"} component={Home} />
        <Route path={"/integrations"} component={Home} />
        <Route path={"/recovery"} component={Home} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
