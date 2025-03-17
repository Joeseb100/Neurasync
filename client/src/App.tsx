import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Analysis from "@/pages/Analysis";
import Therapy from "@/pages/Therapy";
import Music from "@/pages/Music";
import Settings from "@/pages/Settings";
import Sidebar from "@/components/layout/Sidebar";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar />
      <main className="ml-20 md:ml-64 flex-1">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/analysis" component={Analysis} />
          <Route path="/therapy" component={Therapy} />
          <Route path="/music" component={Music} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
