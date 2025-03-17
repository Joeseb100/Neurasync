import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import AnalysisModal from "@/components/analysis/AnalysisModal";
import { StressRecord, EmotionAnalysisHistory } from "@/types";

export default function Analysis() {
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  const { data: weeklyData, isLoading: loadingWeekly } = useQuery<StressRecord[]>({
    queryKey: ['/api/stress/weekly'],
  });

  const { data: monthlyData, isLoading: loadingMonthly } = useQuery<StressRecord[]>({
    queryKey: ['/api/stress/monthly'],
  });

  const { data: emotionHistory, isLoading: loadingEmotions } = useQuery<EmotionAnalysisHistory[]>({
    queryKey: ['/api/analysis/history'],
  });

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Stress Analysis</h1>
          <p className="text-neutral-darker mt-1">
            Detailed analysis of your stress patterns and emotional health.
          </p>
        </div>
        
        <Button 
          className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md flex items-center transition-colors"
          onClick={() => setIsAnalysisModalOpen(true)}
        >
          <i className="fas fa-play mr-2"></i>
          <span>Start New Analysis</span>
        </Button>
      </header>

      <Tabs defaultValue="stress" className="mb-8">
        <TabsList>
          <TabsTrigger value="stress">Stress Trends</TabsTrigger>
          <TabsTrigger value="emotions">Emotion Tracking</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stress">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Stress Level Trends</h2>
              
              <Tabs defaultValue="weekly">
                <TabsList className="mb-4">
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
                
                <TabsContent value="weekly">
                  {loadingWeekly ? (
                    <div className="h-80 flex items-center justify-center">
                      <p className="text-gray-500">Loading data...</p>
                    </div>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={weeklyData?.map(record => ({
                            date: formatDate(record.timestamp),
                            stress: record.stressLevel,
                          }))}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="stress" 
                            name="Stress Level"
                            stroke="#0077B6" 
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="monthly">
                  {loadingMonthly ? (
                    <div className="h-80 flex items-center justify-center">
                      <p className="text-gray-500">Loading data...</p>
                    </div>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={monthlyData?.map(record => ({
                            date: formatDate(record.timestamp),
                            stress: record.stressLevel,
                          }))}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="stress" 
                            name="Stress Level"
                            stroke="#0077B6" 
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="emotions">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Emotion Analysis History</h2>
              
              {loadingEmotions ? (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-gray-500">Loading emotion data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {emotionHistory?.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-500">No emotion analysis data available yet.</p>
                      <Button 
                        className="mt-4 bg-primary hover:bg-primary-dark text-white"
                        onClick={() => setIsAnalysisModalOpen(true)}
                      >
                        Start your first analysis
                      </Button>
                    </div>
                  ) : (
                    emotionHistory?.map((record, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{new Date(record.timestamp).toLocaleString()}</h3>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Primary: {record.primaryEmotion.name} ({record.primaryEmotion.confidence}%)</p>
                                <p className="text-sm text-gray-600">Secondary: {record.secondaryEmotion.name} ({record.secondaryEmotion.confidence}%)</p>
                                <p className="text-sm text-gray-600">Stress Level: {record.stressLevel}%</p>
                              </div>
                              <div className="bg-neutral-lightest p-3 rounded-md">
                                <p className="text-sm">{record.insight}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AnalysisModal 
        open={isAnalysisModalOpen} 
        onOpenChange={setIsAnalysisModalOpen} 
      />
    </div>
  );
}
