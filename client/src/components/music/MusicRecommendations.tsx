import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Song } from "@/types";

export default function MusicRecommendations() {
  const { data: musicRecommendations = [], isLoading } = useQuery<Song[]>({
    queryKey: ['/api/music/recommendations'],
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Music Therapy</h2>
          <div className="text-sm text-gray-500">Mood-based</div>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Music recommendations based on your current mood:</p>
          
          {isLoading ? (
            <div className="py-10 flex justify-center">
              <p className="text-gray-500">Loading recommendations...</p>
            </div>
          ) : musicRecommendations.length === 0 ? (
            <div className="py-10 flex justify-center">
              <p className="text-gray-500">No recommendations available</p>
            </div>
          ) : (
            musicRecommendations.map((track, index) => (
              <div 
                key={index}
                className="flex items-center p-3 hover:bg-neutral-lightest rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-200">
                  {track.coverUrl && (
                    <img 
                      src={track.coverUrl} 
                      alt={`${track.title} cover`} 
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-gray-800 font-medium">{track.title}</p>
                  <p className="text-gray-500 text-sm">{track.artist}</p>
                </div>
                <Button 
                  size="icon"
                  variant="outline"
                  className="w-8 h-8 rounded-full bg-neutral-lightest flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <i className="fas fa-play text-xs"></i>
                </Button>
              </div>
            ))
          )}
        </div>
        
        <Button 
          variant="link" 
          className="mt-6 text-primary hover:text-primary-dark text-sm font-medium flex items-center transition-colors w-full justify-center"
        >
          <span>View all recommendations</span>
          <i className="fas fa-chevron-right ml-1 text-xs"></i>
        </Button>
      </CardContent>
    </Card>
  );
}
