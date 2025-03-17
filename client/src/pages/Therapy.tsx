import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AIChatbot from "@/components/therapy/AIChatbot";
import { TherapySession } from "@/types";
import { Separator } from "@/components/ui/separator";

export default function Therapy() {
  const { data: sessions, isLoading } = useQuery<TherapySession[]>({
    queryKey: ['/api/therapy/sessions'],
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">Therapeutic Support</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Manassu is your AI therapeutic companion designed to provide motivational conversations
          and supportive guidance for your wellness journey.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIChatbot />
        </div>

        <div className="space-y-6">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold text-primary">About Manassu</CardTitle>
              <CardDescription>
                Your supportive AI companion
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 mb-4">
                Manassu is designed to provide:
              </p>
              <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                <li>Supportive and motivational conversations</li>
                <li>A safe space for reflection and self-discovery</li>
                <li>Empathetic responses to your thoughts and feelings</li>
                <li>Practical suggestions for coping with daily challenges</li>
                <li>Personalized guidance based on your individual needs</li>
              </ul>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
                <p className="text-xs text-blue-700">
                  <i className="fas fa-info-circle mr-1"></i> While Manassu can provide support, it's not a replacement for professional therapy or medical advice.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold text-primary">Wellness Resources</CardTitle>
              <CardDescription>
                Tools to support your mental health
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4">              
              <ul className="space-y-3">
                <li>
                  <Button variant="link" className="text-primary p-0 h-auto">
                    <i className="fas fa-book-open mr-2"></i> Mindfulness Guide
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="text-primary p-0 h-auto">
                    <i className="fas fa-headphones mr-2"></i> Guided Meditation
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="text-primary p-0 h-auto">
                    <i className="fas fa-lungs mr-2"></i> Breathing Exercises
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="text-primary p-0 h-auto">
                    <i className="fas fa-moon mr-2"></i> Sleep Improvement
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="text-primary p-0 h-auto">
                    <i className="fas fa-heart mr-2"></i> Self-Compassion Practices
                  </Button>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {sessions && sessions.length > 0 && (
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold text-primary">Conversation History</CardTitle>
                <CardDescription>
                  Previous therapeutic sessions
                </CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {sessions.map((session, index) => (
                    <div key={index} className="p-3 border rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors">
                      <div className="flex justify-between mb-1">
                        <p className="font-medium">{new Date(session.date).toLocaleDateString()}</p>
                        <span className="text-xs bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-full">
                          {session.duration} min
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{session.summary}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
