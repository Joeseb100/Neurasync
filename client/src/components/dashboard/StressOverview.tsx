import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { StressRecord } from "@/types";

export default function StressOverview() {
  const { toast } = useToast();
  const { data: stressData, isLoading, error } = useQuery<StressRecord[]>({
    queryKey: ['/api/stress/weekly'],
  });

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load stress data",
    });
  }

  // Format data for the chart
  const chartData = stressData?.map(record => ({
    day: new Date(record.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
    value: record.stressLevel,
    color: getStressColor(record.stressLevel)
  })) || [];

  function getStressColor(level: number) {
    if (level < 30) return "#4ECDC4"; // low
    if (level < 70) return "#FFD166"; // moderate
    return "#EF476F"; // high
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Stress Overview</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-neutral-darker">This week</span>
            <button className="p-1 text-neutral-darker hover:text-gray-800 transition-colors">
              <i className="fas fa-chevron-down text-xs"></i>
            </button>
          </div>
        </div>
        
        <div className="h-64">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Loading data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorModerate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD166" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FFD166" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF476F" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF476F" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8"
                  fill={(entry) => {
                    const value = entry.value;
                    if (value < 30) return "url(#colorLow)";
                    if (value < 70) return "url(#colorModerate)";
                    return "url(#colorHigh)";
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-[#4ECDC4] mr-2"></div>
            <span className="text-sm text-gray-600">Low</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-[#FFD166] mr-2"></div>
            <span className="text-sm text-gray-600">Moderate</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-[#EF476F] mr-2"></div>
            <span className="text-sm text-gray-600">High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
