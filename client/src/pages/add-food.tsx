import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FoodItem } from '@/components/FoodItem';
import { useFoodItems, useMealLogs } from '@/lib/hooks';
import { useToast } from '@/hooks/use-toast';

export default function AddFood() {
  const [, setLocation] = useLocation();
  const { foodItems, isLoading, createFoodItem } = useFoodItems();
  const { createMealLog } = useMealLogs();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("my-foods");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingSize: ''
  });
  
  const filteredFoodItems = foodItems ? foodItems.filter(
    item => item.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddCustomFood = () => {
    if (!formData.name || !formData.calories) {
      toast({
        title: "Required Fields Missing",
        description: "Please enter a name and calories",
        variant: "destructive"
      });
      return;
    }
    
    createFoodItem({
      userId: 1, // Demo user
      name: formData.name,
      calories: parseInt(formData.calories) || 0,
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fat: parseFloat(formData.fat) || 0,
      servingSize: formData.servingSize,
      barcode: ""
    });
    
    // Reset form and hide it
    setFormData({
      name: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      servingSize: ''
    });
    setShowAddForm(false);
  };
  
  const handleSelectFood = (food: any) => {
    setSelectedFoods(prev => {
      // Check if already selected
      const isSelected = prev.some(item => item.id === food.id);
      
      if (isSelected) {
        return prev.filter(item => item.id !== food.id);
      } else {
        return [...prev, { ...food, quantity: 1 }];
      }
    });
  };
  
  const isSelected = (id: number) => {
    return selectedFoods.some(food => food.id === id);
  };
  
  const handleMealTypeSelection = (type: string) => {
    setSelectedMealType(type);
  };
  
  const handleAddToMeal = () => {
    if (selectedFoods.length === 0) {
      toast({
        title: "No Foods Selected",
        description: "Please select at least one food item",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedMealType) {
      toast({
        title: "No Meal Type Selected",
        description: "Please select a meal type",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate totals
    const totalCalories = selectedFoods.reduce((sum, food) => sum + food.calories, 0);
    const totalProtein = selectedFoods.reduce((sum, food) => sum + food.protein, 0);
    const totalCarbs = selectedFoods.reduce((sum, food) => sum + food.carbs, 0);
    const totalFat = selectedFoods.reduce((sum, food) => sum + food.fat, 0);
    
    // Create meal log
    createMealLog({
      userId: 1, // Demo user
      mealType: selectedMealType,
      foodItems: selectedFoods,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    });
    
    toast({
      title: "Meal Added",
      description: `Foods added to ${selectedMealType}`
    });
    
    // Redirect to macros page
    setTimeout(() => {
      setLocation('/macros');
    }, 500);
  };

  return (
    <main className="flex-1 overflow-y-auto pb-16">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" className="mr-2" onClick={() => setLocation('/macros')}>
            <span className="material-icons">arrow_back</span>
          </Button>
          <h2 className="text-lg font-montserrat font-bold">Add Food</h2>
        </div>
        
        <Tabs defaultValue="my-foods" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="my-foods">My Foods</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-foods">
            <div className="mb-4">
              <Input
                placeholder="Search your foods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border-slate-700"
              />
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-montserrat font-bold">Your Food Items</h3>
              <Button 
                variant="ghost" 
                className="text-primary text-sm"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                <span className="material-icons mr-1">add</span>
                Add Custom
              </Button>
            </div>
            
            {showAddForm && (
              <Card className="bg-slate-800 rounded-xl mb-4">
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="name">Food Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Chicken Breast"
                      className="bg-slate-900 border-slate-700"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="calories">Calories</Label>
                      <Input
                        id="calories"
                        name="calories"
                        type="number"
                        value={formData.calories}
                        onChange={handleInputChange}
                        placeholder="e.g. 165"
                        className="bg-slate-900 border-slate-700"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="servingSize">Serving Size</Label>
                      <Input
                        id="servingSize"
                        name="servingSize"
                        value={formData.servingSize}
                        onChange={handleInputChange}
                        placeholder="e.g. 100g"
                        className="bg-slate-900 border-slate-700"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        name="protein"
                        type="number"
                        step="0.1"
                        value={formData.protein}
                        onChange={handleInputChange}
                        className="bg-slate-900 border-slate-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        name="carbs"
                        type="number"
                        step="0.1"
                        value={formData.carbs}
                        onChange={handleInputChange}
                        className="bg-slate-900 border-slate-700"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input
                        id="fat"
                        name="fat"
                        type="number"
                        step="0.1"
                        value={formData.fat}
                        onChange={handleInputChange}
                        className="bg-slate-900 border-slate-700"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="bg-primary text-black"
                      onClick={handleAddCustomFood}
                    >
                      Add Food
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <ScrollArea className="h-[50vh]">
              <Card className="bg-slate-800 rounded-xl">
                <CardContent className="p-0">
                  {isLoading ? (
                    // Loading skeleton
                    <div className="p-4 animate-pulse space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-700">
                          <div className="h-5 w-32 bg-slate-700 rounded"></div>
                          <div className="h-5 w-20 bg-slate-700 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : filteredFoodItems.length > 0 ? (
                    <div className="divide-y divide-slate-700">
                      {filteredFoodItems.map((food) => (
                        <div 
                          key={food.id} 
                          className={`p-3 ${isSelected(food.id) ? 'bg-slate-700' : ''}`}
                          onClick={() => handleSelectFood(food)}
                        >
                          <FoodItem item={food} />
                        </div>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="p-6 text-center text-gray-400">
                      No food items match your search
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-400">
                      No food items yet. Add your first food item!
                    </div>
                  )}
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="search">
            <div className="mb-4">
              <Input
                placeholder="Search food database..."
                className="bg-slate-900 border-slate-700"
              />
              <p className="text-sm text-gray-400 mt-2">
                Search for common foods or use the barcode scanner to find packaged products.
              </p>
            </div>
            
            <Button 
              className="w-full bg-accent text-black py-3 mb-4"
              onClick={() => setLocation('/scan')}
            >
              <span className="material-icons mr-2">qr_code_scanner</span>
              Scan Barcode
            </Button>
            
            {/* This would normally show search results */}
            <div className="text-center text-gray-400 py-8">
              <span className="material-icons text-3xl mb-2">search</span>
              <p>Search for foods by name or scan a barcode</p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Selected Foods Summary */}
        {selectedFoods.length > 0 && (
          <div className="fixed bottom-16 left-0 right-0 bg-slate-900 p-4 border-t border-slate-800">
            <div className="mb-2">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-white">Selected Foods ({selectedFoods.length})</h3>
                <Button 
                  variant="ghost" 
                  className="h-8 text-red-500 text-sm"
                  onClick={() => setSelectedFoods([])}
                >
                  Clear All
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  variant={selectedMealType === "Breakfast" ? "default" : "outline"}
                  className={selectedMealType === "Breakfast" ? "bg-primary text-black" : ""}
                  size="sm"
                  onClick={() => handleMealTypeSelection("Breakfast")}
                >
                  Breakfast
                </Button>
                <Button
                  variant={selectedMealType === "Lunch" ? "default" : "outline"}
                  className={selectedMealType === "Lunch" ? "bg-primary text-black" : ""}
                  size="sm"
                  onClick={() => handleMealTypeSelection("Lunch")}
                >
                  Lunch
                </Button>
                <Button
                  variant={selectedMealType === "Dinner" ? "default" : "outline"}
                  className={selectedMealType === "Dinner" ? "bg-primary text-black" : ""}
                  size="sm"
                  onClick={() => handleMealTypeSelection("Dinner")}
                >
                  Dinner
                </Button>
                <Button
                  variant={selectedMealType === "Snack" ? "default" : "outline"}
                  className={selectedMealType === "Snack" ? "bg-primary text-black" : ""}
                  size="sm"
                  onClick={() => handleMealTypeSelection("Snack")}
                >
                  Snack
                </Button>
              </div>
            </div>
            
            <Button
              className="w-full bg-accent text-black"
              onClick={handleAddToMeal}
              disabled={!selectedMealType}
            >
              Add to {selectedMealType || "Meal"}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
