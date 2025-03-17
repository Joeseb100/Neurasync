import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AIChatbot from "@/components/therapy/AIChatbot";
import { TherapySession } from "@/types";

export default function Therapy() {
  const { data: sessions, isLoading } = useQuery<TherapySession[]>({
    queryKey: ['/api/therapy/sessions'],
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">AI Therapy</h1>
        <p className="text-neutral-darker mt-1">
          Chat with our AI therapy assistant for personalized mental wellness support.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIChatbot />
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Therapy History</h2>
              
              {isLoading ? (
                <div className="py-8 flex justify-center">
                  <p className="text-gray-500">Loading sessions...</p>
                </div>
              ) : sessions?.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500 mb-4">No previous therapy sessions found.</p>
                  <p className="text-sm text-gray-600">
                    Start a conversation with the AI assistant to create your first session.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions?.map((session, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-neutral-lightest cursor-pointer">
                      <div className="flex justify-between mb-1">
                        <p className="font-medium">{new Date(session.date).toLocaleDateString()}</p>
                        <span className="text-xs bg-neutral-light px-2 py-1 rounded-full">
                          {session.duration} min
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{session.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Wellness Resources</h2>
              
              <ul className="space-y-3">
                <li>
                  <Button variant="link" className="text-primary p-0 h-auto">
                    <i className="fas fa-file-pdf mr-2"></i> Stress Management Guide
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="text-primary p-0 h-auto">
                    <i className="fas fa-file-audio mr-2"></i> Guided Meditation Audio
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="text-primary p-0 h-auto">
                    <i className="fas fa-file-video mr-2"></i> Breathing Exercises Video
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="text-primary p-0 h-auto">
                    <i className="fas fa-file-alt mr-2"></i> Sleep Improvement Tips
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
