import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const notificationFormSchema = z.object({
  emailNotifications: z.boolean(),
  stressAlerts: z.boolean(),
  weeklyReports: z.boolean(),
  therapyReminders: z.boolean(),
});

export default function Settings() {
  const { toast } = useToast();
  
  const { data: user, isLoading: loadingUser } = useQuery<User>({
    queryKey: ['/api/user/profile'],
  });
  
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });
  
  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: user?.preferences?.emailNotifications || false,
      stressAlerts: user?.preferences?.stressAlerts || false,
      weeklyReports: user?.preferences?.weeklyReports || false,
      therapyReminders: user?.preferences?.therapyReminders || false,
    },
  });
  
  // Update forms when user data loads
  React.useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "",
        email: user.email || "",
      });
      
      notificationForm.reset({
        emailNotifications: user.preferences?.emailNotifications || false,
        stressAlerts: user.preferences?.stressAlerts || false,
        weeklyReports: user.preferences?.weeklyReports || false,
        therapyReminders: user.preferences?.therapyReminders || false,
      });
    }
  }, [user]);
  
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileFormSchema>) => {
      return apiRequest("PATCH", "/api/user/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    },
  });
  
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof notificationFormSchema>) => {
      return apiRequest("PATCH", "/api/user/preferences", { preferences: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been updated.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update preferences. Please try again.",
      });
    },
  });

  const onProfileSubmit = (data: z.infer<typeof profileFormSchema>) => {
    updateProfileMutation.mutate(data);
  };
  
  const onNotificationsSubmit = (data: z.infer<typeof notificationFormSchema>) => {
    updateNotificationsMutation.mutate(data);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-neutral-darker mt-1">
          Manage your account preferences and application settings.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">Profile Information</h2>
                  
                  {loadingUser ? (
                    <div className="py-10 flex justify-center">
                      <p className="text-gray-500">Loading profile data...</p>
                    </div>
                  ) : (
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="you@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div>
                          <Label htmlFor="profileImage">Profile Image</Label>
                          <div className="mt-2 flex items-center">
                            <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden mr-4">
                              <img 
                                src={user?.profileImage} 
                                alt={user?.name || 'User'} 
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <Button variant="outline" type="button">
                              Change
                            </Button>
                          </div>
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="bg-primary hover:bg-primary-dark text-white"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">Notification Preferences</h2>
                  
                  {loadingUser ? (
                    <div className="py-10 flex justify-center">
                      <p className="text-gray-500">Loading notification preferences...</p>
                    </div>
                  ) : (
                    <Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                        <FormField
                          control={notificationForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel>Email Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications via email
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="stressAlerts"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel>Stress Alerts</FormLabel>
                                <FormDescription>
                                  Get alerts when stress levels are high
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="weeklyReports"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel>Weekly Reports</FormLabel>
                                <FormDescription>
                                  Receive weekly wellness reports
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={notificationForm.control}
                          name="therapyReminders"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel>Therapy Reminders</FormLabel>
                                <FormDescription>
                                  Get reminders for therapy sessions
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="bg-primary hover:bg-primary-dark text-white"
                          disabled={updateNotificationsMutation.isPending}
                        >
                          {updateNotificationsMutation.isPending ? "Saving..." : "Save Preferences"}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="privacy">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">Privacy Settings</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Data Collection</Label>
                        <p className="text-sm text-gray-600">Allow facial expression analysis</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Data Sharing</Label>
                        <p className="text-sm text-gray-600">Share anonymous data for research</p>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Chat History</Label>
                        <p className="text-sm text-gray-600">Save AI therapy conversation history</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        className="text-red-500 border-red-500 hover:bg-red-50"
                      >
                        Clear All Data
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        This will permanently delete all your data from our servers
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">Account Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input 
                        id="currentPassword" 
                        type="password" 
                        className="mt-1" 
                        placeholder="Enter current password"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input 
                        id="newPassword" 
                        type="password" 
                        className="mt-1" 
                        placeholder="Enter new password"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        className="mt-1" 
                        placeholder="Confirm new password"
                      />
                    </div>
                    
                    <Button className="bg-primary hover:bg-primary-dark text-white">
                      Change Password
                    </Button>
                    
                    <div className="pt-6 border-t mt-6">
                      <h3 className="text-base font-medium text-gray-800 mb-4">Danger Zone</h3>
                      
                      <Button variant="destructive">
                        Delete Account
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">App Information</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Version</p>
                  <p className="font-medium">1.0.0</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">June 15, 2024</p>
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    Check for Updates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Help & Support</h2>
              
              <div className="space-y-3">
                <Button variant="link" className="text-primary p-0 h-auto block text-left w-full">
                  <i className="fas fa-book mr-2"></i> Documentation
                </Button>
                <Button variant="link" className="text-primary p-0 h-auto block text-left w-full">
                  <i className="fas fa-question-circle mr-2"></i> FAQs
                </Button>
                <Button variant="link" className="text-primary p-0 h-auto block text-left w-full">
                  <i className="fas fa-envelope mr-2"></i> Contact Support
                </Button>
                <Button variant="link" className="text-primary p-0 h-auto block text-left w-full">
                  <i className="fas fa-comment-alt mr-2"></i> Send Feedback
                </Button>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">For immediate assistance:</p>
                <p className="font-medium">
                  <i className="fas fa-envelope text-gray-500 mr-2"></i> support@neurasync.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
