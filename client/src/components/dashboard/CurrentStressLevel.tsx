import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CurrentStress, PhysiologicalData } from "@/types";

export default function CurrentStressLevel() {
  const { data: currentStress, isLoading: loadingStress } = useQuery<CurrentStress>({
    queryKey: ['/api/stress/current'],
  });

  const { data: physData, isLoading: loadingPhys } = useQuery<PhysiologicalData>({
    queryKey: ['/api/physiological/current'],
  });

  const getStressColor = (level: number) => {
    if (level < 30) return "#4ECDC4"; // low
    if (level < 70) return "#FFD166"; // moderate
    return "#EF476F"; // high
  };

  const getStressLabel = (level: number) => {
    if (level < 30) return "Low Stress";
    if (level < 70) return "Moderate Stress";
    return "High Stress";
  };

  const stressLevel = currentStress?.level || 0;
  const stressColor = getStressColor(stressLevel);
  const stressLabel = getStressLabel(stressLevel);
  
  // Calculate percentage for the circular gauge
  const gaugePercentage = 100 - stressLevel;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Current Status</h2>
        
        <div className="flex justify-center mb-6">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#E9ECEF" 
                strokeWidth="10" 
              />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke={stressColor} 
                strokeWidth="10" 
                strokeDasharray="282.5" 
                strokeDashoffset={(282.5 * (100 - gaugePercentage)) / 100} 
                transform="rotate(-90 50 50)"
              />
              <text 
                x="50" 
                y="45" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="text-4xl font-bold" 
                fill={stressColor}
              >
                {loadingStress ? "..." : stressLevel}
              </text>
              <text 
                x="50" 
                y="65" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="text-sm" 
                fill="#6c757d"
              >
                {loadingStress ? "Loading..." : stressLabel}
              </text>
            </svg>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-light bg-opacity-10 flex items-center justify-center text-primary mr-3">
              <i className="fas fa-heart-pulse"></i>
            </div>
            <div>
              <p className="text-sm text-gray-700">Heart Rate</p>
              <p className="text-lg font-medium">{loadingPhys ? "Loading..." : `${physData?.heartRate} BPM`}</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary-light bg-opacity-10 flex items-center justify-center text-primary mr-3">
              <i className="fas fa-lungs"></i>
            </div>
            <div>
              <p className="text-sm text-gray-700">Breathing Rate</p>
              <p className="text-lg font-medium">
                {loadingPhys ? "Loading..." : `${physData?.breathingRate} breaths/min`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#4ECDC4] bg-opacity-10 flex items-center justify-center text-[#4ECDC4] mr-3">
              <i className="fas fa-face-smile"></i>
            </div>
            <div>
              <p className="text-sm text-gray-700">Mood</p>
              <p className="text-lg font-medium">{loadingStress ? "Loading..." : currentStress?.mood}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
