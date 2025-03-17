import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Song, Playlist } from "@/types";

export default function Music() {
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null);
  
  const { data: recommendations = [], isLoading: loadingRecs } = useQuery<Song[]>({
    queryKey: ['/api/music/recommendations'],
  });
  
  const { data: playlists = [], isLoading: loadingPlaylists } = useQuery<Playlist[]>({
    queryKey: ['/api/music/playlists'],
  });
  
  const { data: playlistSongs = [], isLoading: loadingPlaylistSongs } = useQuery<Song[]>({
    queryKey: ['/api/music/playlist', activePlaylist],
    enabled: !!activePlaylist,
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Music Therapy</h1>
        <p className="text-neutral-darker mt-1">
          Personalized music recommendations based on your mood and stress level.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="recommended">
                <div className="flex justify-between items-center mb-6">
                  <TabsList>
                    <TabsTrigger value="recommended">Recommended</TabsTrigger>
                    <TabsTrigger value="playlists">My Playlists</TabsTrigger>
                  </TabsList>
                  
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder="Search music..." 
                      className="pl-8 bg-neutral-lightest"
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"></i>
                  </div>
                </div>
                
                <TabsContent value="recommended">
                  <h3 className="text-lg font-medium mb-4">Mood-Based Recommendations</h3>
                  
                  {loadingRecs ? (
                    <div className="py-10 flex justify-center">
                      <p className="text-gray-500">Loading recommendations...</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recommendations.map((song, index) => (
                        <div key={index} className="flex items-center p-3 hover:bg-neutral-lightest rounded-lg transition-colors">
                          <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-200">
                            {song.coverUrl && (
                              <img 
                                src={song.coverUrl} 
                                alt={`${song.title} cover`} 
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-gray-800 font-medium">{song.title}</p>
                            <p className="text-gray-500 text-sm">{song.artist}</p>
                          </div>
                          <div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="w-8 h-8 rounded-full text-primary"
                            >
                              <i className="fas fa-play text-xs"></i>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="playlists">
                  {activePlaylist ? (
                    <>
                      <div className="mb-4 flex items-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mr-2"
                          onClick={() => setActivePlaylist(null)}
                        >
                          <i className="fas fa-arrow-left mr-1"></i> Back
                        </Button>
                        <h3 className="text-lg font-medium">
                          {playlists.find(p => p.id === activePlaylist)?.name || 'Playlist'}
                        </h3>
                      </div>
                      
                      {loadingPlaylistSongs ? (
                        <div className="py-10 flex justify-center">
                          <p className="text-gray-500">Loading playlist...</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {playlistSongs.map((song, index) => (
                            <div key={index} className="flex items-center p-3 hover:bg-neutral-lightest rounded-lg transition-colors">
                              <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-200">
                                {song.coverUrl && (
                                  <img 
                                    src={song.coverUrl} 
                                    alt={`${song.title} cover`} 
                                    className="h-full w-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-gray-800 font-medium">{song.title}</p>
                                <p className="text-gray-500 text-sm">{song.artist}</p>
                              </div>
                              <div>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="w-8 h-8 rounded-full text-primary"
                                >
                                  <i className="fas fa-play text-xs"></i>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium mb-4">Your Playlists</h3>
                      
                      {loadingPlaylists ? (
                        <div className="py-10 flex justify-center">
                          <p className="text-gray-500">Loading playlists...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {playlists.map((playlist, index) => (
                            <div 
                              key={index} 
                              className="border rounded-lg p-4 hover:bg-neutral-lightest transition-colors cursor-pointer"
                              onClick={() => setActivePlaylist(playlist.id)}
                            >
                              <h4 className="font-medium mb-1">{playlist.name}</h4>
                              <p className="text-sm text-gray-600">{playlist.songCount} songs</p>
                              <p className="text-xs text-gray-500 mt-2">{playlist.description}</p>
                            </div>
                          ))}
                          
                          <div className="border rounded-lg p-4 hover:bg-neutral-lightest transition-colors cursor-pointer border-dashed flex flex-col items-center justify-center text-center">
                            <i className="fas fa-plus text-primary text-xl mb-2"></i>
                            <p className="font-medium">Create New Playlist</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Now Playing</h2>
              
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 rounded-md overflow-hidden bg-gray-200 mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80" 
                    alt="Album cover" 
                    className="h-full w-full object-cover"
                  />
                </div>
                
                <h3 className="font-medium text-lg text-center">Gentle Piano</h3>
                <p className="text-gray-600 text-sm mb-4 text-center">Classical Relaxation</p>
                
                <div className="relative w-full h-1 bg-neutral-light rounded-full mb-2">
                  <div className="absolute left-0 top-0 h-full w-1/3 bg-primary rounded-full"></div>
                </div>
                
                <div className="flex w-full justify-between text-xs text-gray-500 mb-6">
                  <span>1:25</span>
                  <span>4:30</span>
                </div>
                
                <div className="flex items-center justify-between w-full max-w-xs">
                  <Button variant="ghost" size="icon" className="text-gray-600">
                    <i className="fas fa-backward-step text-lg"></i>
                  </Button>
                  
                  <Button 
                    size="icon"
                    className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center"
                  >
                    <i className="fas fa-pause"></i>
                  </Button>
                  
                  <Button variant="ghost" size="icon" className="text-gray-600">
                    <i className="fas fa-forward-step text-lg"></i>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Mood Categories</h2>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-cloud mr-2 text-[#4ECDC4]"></i> Relaxation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-sun mr-2 text-[#FFD166]"></i> Energy
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-moon mr-2 text-primary"></i> Sleep
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-brain mr-2 text-[#4ECDC4]"></i> Focus
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <i className="fas fa-heart mr-2 text-[#EF476F]"></i> Mood Boost
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
