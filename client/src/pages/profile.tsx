import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useUser, useSyncStatus } from '@/lib/hooks';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user, isLoading, updateUser, isPending } = useUser();
  const { triggerSync, hasPendingSync } = useSyncStatus();
  const { toast } = useToast();
  const [showEditGoals, setShowEditGoals] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    weightGoal: '',
    dailyCalories: '',
    proteinTarget: '',
    workoutsPerWeek: ''
  });
  
  // Update form data when user data loads
  useState(() => {
    if (user) {
      setFormData({
        weightGoal: user.weightGoal?.toString() || '',
        dailyCalories: user.dailyCalories?.toString() || '',
        proteinTarget: user.proteinTarget?.toString() || '',
        workoutsPerWeek: user.workoutsPerWeek?.toString() || ''
      });
    }
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleUpdateGoals = () => {
    const updates = {
      weightGoal: parseFloat(formData.weightGoal) || undefined,
      dailyCalories: parseInt(formData.dailyCalories) || undefined,
      proteinTarget: parseInt(formData.proteinTarget) || undefined,
      workoutsPerWeek: parseInt(formData.workoutsPerWeek) || undefined
    };
    
    updateUser(updates);
    setShowEditGoals(false);
  };
  
  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully"
    });
    // In a real app, this would clear authentication state
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-6 animate-pulse">
        <div className="flex flex-col items-center justify-center py-4">
          <div className="w-24 h-24 rounded-full bg-slate-700 mb-4"></div>
          <div className="h-6 w-40 bg-slate-700 rounded mb-2"></div>
          <div className="h-4 w-32 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto pb-16">
      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center justify-center py-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-primary to-accent mb-4 flex items-center justify-center">
            <span className="material-icons text-4xl text-black">person</span>
          </div>
          <h2 className="text-xl font-montserrat font-bold text-white">
            {user?.name || "Alex Johnson"}
          </h2>
          <p className="text-sm text-gray-400 font-poppins">
            {user?.profileType || "Fitness Enthusiast"}
          </p>
        </div>
        
        {/* Goals and Stats */}
        <Card className="bg-slate-800 rounded-xl p-4">
          <h3 className="font-montserrat font-bold text-white text-lg mb-4">My Goals</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Weight Goal</span>
              <span className="text-white font-medium">{user?.weightGoal || 175} lbs</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Daily Calories</span>
              <span className="text-white font-medium">{user?.dailyCalories || 2000} cal</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Protein Target</span>
              <span className="text-white font-medium">{user?.proteinTarget || 150}g</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Workouts per Week</span>
              <span className="text-white font-medium">{user?.workoutsPerWeek || 4} days</span>
            </div>
          </div>
          
          <Button 
            className="mt-4 w-full bg-slate-900 text-primary border border-primary rounded-lg py-2 px-4 font-medium"
            onClick={() => setShowEditGoals(true)}
          >
            Edit Goals
          </Button>
          
          <Dialog open={showEditGoals} onOpenChange={setShowEditGoals}>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Fitness Goals</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="weightGoal">Weight Goal (lbs)</Label>
                  <Input 
                    id="weightGoal"
                    name="weightGoal"
                    value={formData.weightGoal}
                    onChange={handleInputChange}
                    type="number"
                    placeholder="Weight Goal"
                    className="bg-slate-900 border-slate-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dailyCalories">Daily Calories</Label>
                  <Input 
                    id="dailyCalories"
                    name="dailyCalories"
                    value={formData.dailyCalories}
                    onChange={handleInputChange}
                    type="number"
                    placeholder="Daily Calories"
                    className="bg-slate-900 border-slate-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="proteinTarget">Protein Target (g)</Label>
                  <Input 
                    id="proteinTarget"
                    name="proteinTarget"
                    value={formData.proteinTarget}
                    onChange={handleInputChange}
                    type="number"
                    placeholder="Protein Target"
                    className="bg-slate-900 border-slate-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workoutsPerWeek">Workouts per Week</Label>
                  <Input 
                    id="workoutsPerWeek"
                    name="workoutsPerWeek"
                    value={formData.workoutsPerWeek}
                    onChange={handleInputChange}
                    type="number"
                    placeholder="Workouts per Week"
                    className="bg-slate-900 border-slate-700"
                  />
                </div>
                
                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEditGoals(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-primary text-black"
                    onClick={handleUpdateGoals}
                    disabled={isPending}
                  >
                    {isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
        
        {/* Profile Settings */}
        <Card className="bg-slate-800 rounded-xl p-4">
          <h3 className="font-montserrat font-bold text-white text-lg mb-4">Account Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-2 hover:bg-slate-700 rounded-lg">
              <div className="flex items-center">
                <span className="material-icons text-gray-400 mr-3">person</span>
                <span className="text-gray-300">Personal Information</span>
              </div>
              <span className="material-icons text-gray-400">chevron_right</span>
            </div>
            
            <div className="flex items-center justify-between p-2 hover:bg-slate-700 rounded-lg">
              <div className="flex items-center">
                <span className="material-icons text-gray-400 mr-3">notifications</span>
                <span className="text-gray-300">Notifications</span>
              </div>
              <span className="material-icons text-gray-400">chevron_right</span>
            </div>
            
            <div 
              className="flex items-center justify-between p-2 hover:bg-slate-700 rounded-lg cursor-pointer"
              onClick={triggerSync}
            >
              <div className="flex items-center">
                <span className={`material-icons mr-3 ${hasPendingSync ? 'text-yellow-500' : 'text-gray-400'}`}>sync</span>
                <span className="text-gray-300">Sync Settings</span>
              </div>
              <span className="material-icons text-gray-400">chevron_right</span>
            </div>
            
            <div className="flex items-center justify-between p-2 hover:bg-slate-700 rounded-lg">
              <div className="flex items-center">
                <span className="material-icons text-gray-400 mr-3">help_outline</span>
                <span className="text-gray-300">Help & Support</span>
              </div>
              <span className="material-icons text-gray-400">chevron_right</span>
            </div>
            
            <Separator className="bg-slate-700" />
            
            <div 
              className="flex items-center justify-between p-2 hover:bg-slate-700 rounded-lg cursor-pointer"
              onClick={handleLogout}
            >
              <div className="flex items-center">
                <span className="material-icons text-red-500 mr-3">logout</span>
                <span className="text-red-500">Sign Out</span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* App Information */}
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>FitForge v1.0.0</p>
          <p className="mt-1">Made with 💪 for fitness enthusiasts</p>
        </div>
      </div>
    </main>
  );
}
