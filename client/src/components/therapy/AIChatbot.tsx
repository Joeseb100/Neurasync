import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message, User } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
      return apiRequest("POST", "/api/therapy/message", { content });
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

  return (
    <Card className="lg:col-span-2">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">AI Therapy Assistant</h2>
          <button className="text-sm text-primary hover:text-primary-dark transition-colors">
            View history
          </button>
        </div>
        
        <div className="h-96 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
            {isLoading ? (
              <div className="flex justify-center p-4">
                <p className="text-gray-500">Loading conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center p-4">
                <p className="text-gray-500">No messages yet. Start a conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex items-start ${message.sender === 'user' ? 'justify-end' : ''}`}
                >
                  {message.sender !== 'user' && (
                    <div className="flex-shrink-0 mr-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                        <i className="fas fa-robot text-sm"></i>
                      </div>
                    </div>
                  )}
                  
                  <div className={`rounded-lg p-3 max-w-[80%] ${
                    message.sender === 'user' 
                      ? 'bg-primary-light bg-opacity-10' 
                      : 'bg-neutral-lightest'
                  }`}>
                    <p className="text-sm text-gray-800">{message.content}</p>
                    {message.suggestions && (
                      <ul className="list-disc pl-5 mt-2 text-sm text-gray-700 space-y-1">
                        {message.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  {message.sender === 'user' && (
                    <div className="flex-shrink-0 ml-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImage} alt={user?.name || 'User'} />
                        <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="border-t pt-4">
            <form className="flex items-center" onSubmit={handleSubmit}>
              <Input
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-neutral-lightest rounded-l-md py-3 px-4 focus:outline-none focus:ring-1 focus:ring-primary"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={sendMessageMutation.isPending}
              />
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary-dark text-white rounded-r-md py-3 px-4 transition-colors"
                disabled={sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
