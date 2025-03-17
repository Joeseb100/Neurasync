import { useState } from "react";
import { Button } from "@/components/ui/button";
import StressOverview from "@/components/dashboard/StressOverview";
import CurrentStressLevel from "@/components/dashboard/CurrentStressLevel";
import AIChatbot from "@/components/therapy/AIChatbot";
import MusicRecommendations from "@/components/music/MusicRecommendations";
import AnalysisModal from "@/components/analysis/AnalysisModal";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types";

export default function Dashboard() {
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile'],
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-neutral-darker mt-1">
            Welcome back, Jophit. Let's check your wellness today.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost"
            size="icon"
            className="p-2 rounded-full bg-neutral-lightest text-gray-600 hover:bg-neutral-light transition-colors"
            aria-label="Notifications"
          >
            <i className="fas fa-bell"></i>
          </Button>
          
          <button data-replit-metadata="client/src/pages/Dashboard.tsx:38:10" data-component-name="Button" class="justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 h-10 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md flex items-center transition-colors"><i data-replit-metadata="client/src/pages/Dashboard.tsx:42:12" data-component-name="i" class="fas fa-play mr-2"></i><span data-replit-metadata="client/src/pages/Dashboard.tsx:43:12" data-component-name="span">Start Analysis</span></button>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <StressOverview />
        <CurrentStressLevel />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AIChatbot />
        <MusicRecommendations />
      </div>

      <AnalysisModal 
        open={isAnalysisModalOpen} 
        onOpenChange={setIsAnalysisModalOpen} 
      />
    </div>
  );
}
