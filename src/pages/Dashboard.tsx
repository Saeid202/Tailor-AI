import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/Header';
import { OnlineStore } from '@/components/store/OnlineStore';
import { WorkflowProvider } from '@/contexts/WorkflowContext';
import { IndexContent } from './Index';
import { ProfileContent } from './Profile';
import { Home, Camera, User, ShoppingBag } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('shop');

  return (
    <div className="min-h-screen bg-background">
      <Header variant="app" />
      
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="shop" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Shop
            </TabsTrigger>
            <TabsTrigger value="measurements" className="gap-2">
              <Camera className="h-4 w-4" />
              AI Measurements
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              My Profile
            </TabsTrigger>
            <TabsTrigger value="store" className="gap-2">
              <Home className="h-4 w-4" />
              My Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop">
            <OnlineStore />
          </TabsContent>

          <TabsContent value="measurements">
            <WorkflowProvider>
              <IndexContent />
            </WorkflowProvider>
          </TabsContent>

          <TabsContent value="profile">
            <ProfileContent />
          </TabsContent>

          <TabsContent value="store">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">My Orders</h2>
              <p className="text-muted-foreground">Your order history will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;

