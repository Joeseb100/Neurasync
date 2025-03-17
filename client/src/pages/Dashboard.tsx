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
    <div className="p-6 max-w-7xl mx-auto ml-24 md:ml-72">
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

          <Button 
              onClick={() => setIsAnalysisModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <i className="fas fa-play mr-2"></i>
              <span>Start Analysis</span>
            </Button>
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