import { Switch, Route } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Analysis from "@/pages/Analysis";
import Therapy from "@/pages/Therapy";
import Music from "@/pages/Music";
import Settings from "@/pages/Settings";
import Sidebar from "@/components/layout/Sidebar";
import { useEffect, useState } from "react";
import { applyEmotionTheme } from "./lib/themeUtils";
import { CurrentStress } from "./types";

function Router() {
  // State to track current stress level and emotion
  const [currentMood, setCurrentMood] = useState<string>("neutral");
  
  // Fetch the current stress level and mood when the app loads
  useEffect(() => {
    const fetchCurrentStress = async () => {
      try {
        const data = await apiRequest<CurrentStress>("/api/stress/current");
        if (data && data.mood) {
          setCurrentMood(data.mood);
          // Apply the emotion-based theme
          applyEmotionTheme(data.mood);
        } else {
          // Default theme if no mood detected
          applyEmotionTheme("neutral");
        }
      } catch (error) {
        console.error("Failed to fetch current stress:", error);
        // Fallback to neutral theme
        applyEmotionTheme("neutral");
      }
    };
    
    // Get initial mood
    fetchCurrentStress();
    
    // Set up periodic refresh every 2 minutes
    const refreshInterval = setInterval(fetchCurrentStress, 2 * 60 * 1000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar />
      <main className="ml-20 md:ml-64 flex-1 p-6">
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
