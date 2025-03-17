import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogClose 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { detectEmotion } from "@/lib/emotionDetection";
import { apiRequest } from "@/lib/queryClient";
import { EmotionAnalysis } from "@/types";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AnalysisModal({ open, onOpenChange }: AnalysisModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [emotionResult, setEmotionResult] = useState<EmotionAnalysis | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const saveAnalysisMutation = useMutation({
    mutationFn: async (analysis: EmotionAnalysis) => {
      return apiRequest("/api/analysis/save", {
        method: "POST", 
        data: analysis
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stress/current'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stress/weekly'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save analysis results",
      });
    },
  });

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopEverything();
    }

    return () => {
      stopEverything();
    };
  }, [open]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsAnalyzing(true);
        startAnalysis();
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startAnalysis = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
    }

    captureFrame();
    
    // Run emotion analysis every 3 seconds
    analysisIntervalRef.current = setInterval(() => {
      if (isPaused) return;
      captureFrame(true);
    }, 3000);
  };

  const captureFrame = async (analyze = false) => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    if (analyze) {
      try {
        // Convert canvas to base64 image
        const imageData = canvas.toDataURL('image/jpeg');
        const base64Data = imageData.split(',')[1];
        
        // Detect emotion using the API
        const result = await detectEmotion(base64Data);
        setEmotionResult(result);
        
        // Save the analysis result
        if (result) {
          saveAnalysisMutation.mutate(result);
        }
      } catch (error) {
        console.error("Error analyzing emotion:", error);
        toast({
          variant: "destructive",
          title: "Analysis Error",
          description: "Failed to analyze facial expression",
        });
      }
    }
    
    // Continue animation loop
    if (!isPaused) {
      animationRef.current = requestAnimationFrame(() => captureFrame(false));
    }
  };

  const pauseAnalysis = () => {
    setIsPaused(true);
    cancelAnimationFrame(animationRef.current);
  };

  const resumeAnalysis = () => {
    setIsPaused(false);
    captureFrame();
  };

  const stopEverything = () => {
    setIsAnalyzing(false);
    setIsPaused(false);
    
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    
    cancelAnimationFrame(animationRef.current);
    stopCamera();
  };

  const handleClose = () => {
    stopEverything();
    onOpenChange(false);
  };

  const handleEndSession = () => {
    toast({
      title: "Analysis Complete",
      description: "Your stress analysis has been saved successfully.",
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">Stress Analysis</DialogTitle>
          <DialogClose onClick={handleClose} className="absolute right-4 top-4 text-neutral-darker hover:text-gray-800 transition-colors">
            <i className="fas fa-times"></i>
          </DialogClose>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-neutral-lightest rounded-lg p-4 flex flex-col items-center">
            <div className="w-full h-56 rounded-lg bg-gray-800 mb-4 overflow-hidden relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="h-full w-full object-cover"
              />
              <canvas 
                ref={canvasRef} 
                className="hidden"
              />
              {!isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-video text-3xl text-white"></i>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 text-center">Facial expression analysis using Vertex AI Vision</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">Real-time Analysis</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">Stress Level</span>
                    <span className={`text-sm font-medium ${
                      emotionResult?.stressLevel && emotionResult.stressLevel < 30 
                        ? 'text-[#4ECDC4]' 
                        : emotionResult?.stressLevel && emotionResult.stressLevel < 70
                          ? 'text-[#FFD166]'
                          : 'text-[#EF476F]'
                    }`}>
                      {emotionResult 
                        ? `${emotionResult.stressLevel < 30 
                            ? 'Low' 
                            : emotionResult.stressLevel < 70 
                              ? 'Moderate' 
                              : 'High'} (${emotionResult.stressLevel}%)`
                        : 'Analyzing...'}
                    </span>
                  </div>
                  <Progress 
                    value={emotionResult?.stressLevel} 
                    className="h-2 bg-neutral-light"
                    indicatorClassName={
                      emotionResult?.stressLevel && emotionResult.stressLevel < 30 
                        ? 'bg-[#4ECDC4]' 
                        : emotionResult?.stressLevel && emotionResult.stressLevel < 70
                          ? 'bg-[#FFD166]'
                          : 'bg-[#EF476F]'
                    }
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">Primary Emotion</span>
                    <span className="text-sm font-medium text-gray-800">
                      {emotionResult?.primaryEmotion
                        ? `${emotionResult.primaryEmotion.name} (${emotionResult.primaryEmotion.confidence}%)`
                        : 'Analyzing...'}
                    </span>
                  </div>
                  <Progress 
                    value={emotionResult?.primaryEmotion?.confidence} 
                    className="h-2 bg-neutral-light"
                    indicatorClassName="bg-primary"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-700">Secondary Emotion</span>
                    <span className="text-sm font-medium text-gray-800">
                      {emotionResult?.secondaryEmotion
                        ? `${emotionResult.secondaryEmotion.name} (${emotionResult.secondaryEmotion.confidence}%)`
                        : 'Analyzing...'}
                    </span>
                  </div>
                  <Progress 
                    value={emotionResult?.secondaryEmotion?.confidence} 
                    className="h-2 bg-neutral-light"
                    indicatorClassName="bg-[#4ECDC4]"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-3">AI Insights</h3>
              <div className="bg-neutral-lightest rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  {emotionResult?.insight || "Analyzing your facial expressions to provide personalized insights..."}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              {isPaused ? (
                <Button 
                  variant="outline" 
                  className="px-4 py-2 border border-neutral-dark text-gray-600 rounded-md hover:bg-neutral-light transition-colors"
                  onClick={resumeAnalysis}
                >
                  Resume
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="px-4 py-2 border border-neutral-dark text-gray-600 rounded-md hover:bg-neutral-light transition-colors"
                  onClick={pauseAnalysis}
                >
                  Pause
                </Button>
              )}
              <Button 
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors"
                onClick={handleEndSession}
              >
                End Session
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
