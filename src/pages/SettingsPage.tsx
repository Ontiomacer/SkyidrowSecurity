
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Bell, Key } from 'lucide-react';
import { ApiKeyManager } from '@/components/settings/ApiKeyManager';

const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  
  const handleUpdateProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully",
    });
  };
  
  const handleRegenerateApiKey = () => {
    toast({
      title: "API Key Regenerated",
      description: "A new API key has been generated",
    });
  };
  
  const [activeTab, setActiveTab] = useState('profile');
  const [email, setEmail] = useState(currentUser?.email || 'admin@skyidrow.com');

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application settings</p>
        </div>
        
        <Tabs 
          defaultValue="profile" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 max-w-lg mb-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span>API Keys</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-6">Profile Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Username</label>
                      <input 
                        type="text" 
                        value={currentUser?.username || 'admin'} 
                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Current Password</label>
                      <input 
                        type="password" 
                        placeholder="Enter current password" 
                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">New Password</label>
                      <input 
                        type="password" 
                        placeholder="Enter new password" 
                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="Confirm new password" 
                        className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="pt-2">
                      <Button onClick={handleUpdateProfile}>
                        Update Password
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-6">Notification Preferences</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">SMS Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive text messages for critical alerts</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Push Notifications</h4>
                        <p className="text-sm text-muted-foreground">Get browser notifications for updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button>
                    Save Notification Preferences
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api-keys">
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <ApiKeyManager />
            </div>
          </TabsContent>
        </Tabs>


      </div>
    </Layout>
  );
};

export default SettingsPage;
