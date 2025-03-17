import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, User } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function AIChatbot() {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/user/profile'],
  });

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['/api/therapy/messages'],
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest<Message>("/api/therapy/message", {
        method: "POST",
        data: { content }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/therapy/messages'] });
      setInputMessage("");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    },
  });

  useEffect(() => {
    // Scroll to bottom whenever messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      sendMessageMutation.mutate(inputMessage);
    }
  };

  const clearChatHistory = () => {
    // This would require a backend endpoint to clear chat history
    toast({
      title: "Feature coming soon",
      description: "Chat history clearing will be available in a future update.",
    });
  };

  return (
    <Card className="lg:col-span-2 shadow-xl glass glass-highlight">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold text-primary flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white mr-2">
                <i className="fas fa-brain text-sm"></i>
              </div>
              Manassu
            </CardTitle>
            <CardDescription>
              Your AI therapeutic companion - share what's on your mind
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearChatHistory}
            className="text-xs"
          >
            <i className="fas fa-trash-alt mr-1"></i> Clear Chat
          </Button>
        </div>
      </CardHeader>
      
      <Separator className="bg-border opacity-30" />
      
      <CardContent className="p-0">
        <div className="h-[400px] flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <p className="text-muted-foreground">Loading conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center p-4">
                <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex items-start ${message.sender === 'user' ? 'justify-end' : ''}`}
                >
                  {message.sender !== 'user' && (
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white shadow-md">
                        <i className="fas fa-brain text-sm"></i>
                      </div>
                    </div>
                  )}
                  
                  <div className={`rounded-lg p-4 max-w-[80%] shadow-md ${
                    message.sender === 'user' 
                      ? 'bg-primary bg-opacity-90 text-white' 
                      : 'glass text-foreground'
                  }`}>
                    <p className={`text-sm ${message.sender === 'user' ? 'text-white' : 'text-foreground'}`}>
                      {message.content}
                    </p>
                    
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-white border-opacity-20">
                        <p className={`text-xs font-medium mb-1 ${message.sender === 'user' ? 'text-white text-opacity-90' : 'text-foreground'}`}>
                          Suggestions:
                        </p>
                        <ul className={`list-disc pl-5 text-xs space-y-1 ${message.sender === 'user' ? 'text-white text-opacity-80' : 'text-foreground'}`}>
                          {message.suggestions.map((suggestion, idx) => (
                            <li key={idx}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className={`text-right mt-1 text-xs ${message.sender === 'user' ? 'text-white text-opacity-70' : 'text-muted-foreground'}`}>
                      {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                    </div>
                  </div>
                  
                  {message.sender === 'user' && (
                    <div className="flex-shrink-0 ml-3">
                      <Avatar className="h-10 w-10 ring-2 ring-primary ring-opacity-30">
                        <AvatarImage src={user?.profileImage} alt={user?.name || 'User'} />
                        <AvatarFallback className="bg-secondary text-secondary-foreground">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 border-t border-border border-opacity-30">
        <form className="flex flex-col w-full" onSubmit={handleSubmit}>
          <div className="flex items-center w-full">
            <Input
              type="text"
              placeholder="Share your thoughts here..."
              className="flex-1 glass border-0 rounded-l-md py-3 px-4 text-foreground"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={sendMessageMutation.isPending}
            />
            <Button 
              type="submit" 
              className="bg-primary hover:bg-opacity-90 text-white rounded-r-md py-3 px-4 transition-all"
              disabled={sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </Button>
          </div>
          <div className="w-full mt-3 text-xs text-center text-muted-foreground">
            💭 Remember that while AI can provide support, it's not a substitute for professional mental health services.
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
