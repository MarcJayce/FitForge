import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useFoodItems } from '@/lib/hooks';

export default function FoodDetail() {
  const [, params] = useRoute('/food/:id');
  const [, setLocation] = useLocation();
  const foodId = params ? parseInt(params.id) : 0;
  
  const { foodItems, updateFoodItem, deleteFoodItem } = useFoodItems();
  
  const [food, setFood] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    servingSize: ''
  });
  
  useEffect(() => {
    // Find the food item from the list
    if (foodItems) {
      const found = foodItems.find(f => f.id === foodId);
      if (found) {
        setFood(found);
        setFormData({
          name: found.name,
          calories: found.calories.toString(),
          protein: found.protein.toString(),
          carbs: found.carbs.toString(),
          fat: found.fat.toString(),
          servingSize: found.servingSize || ''
        });
      } else {
        setLocation('/macros');
      }
    }
  }, [foodItems, foodId, setLocation]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = () => {
    updateFoodItem({
      id: foodId,
      name: formData.name,
      calories: parseInt(formData.calories) || 0,
      protein: parseFloat(formData.protein) || 0,
      carbs: parseFloat(formData.carbs) || 0,
      fat: parseFloat(formData.fat) || 0,
      servingSize: formData.servingSize
    });
    
    setEditing(false);
  };
  
  const handleDelete = () => {
    deleteFoodItem(foodId);
    setLocation('/macros');
  };
  
  if (!food) {
    return (
      <div className="p-4 space-y-6 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="h-8 w-8 bg-slate-700 rounded-full mr-2"></div>
          <div className="h-6 w-40 bg-slate-700 rounded"></div>
        </div>
        <div className="h-40 bg-slate-700 rounded-xl mb-4"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto pb-16">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" className="mr-2" onClick={() => setLocation('/macros')}>
            <span className="material-icons">arrow_back</span>
          </Button>
          <h2 className="text-lg font-montserrat font-bold">{food.name}</h2>
          {!editing && (
            <Button 
              variant="ghost" 
              className="ml-auto"
              onClick={() => setEditing(true)}
            >
              <span className="material-icons">edit</span>
            </Button>
          )}
        </div>
        
        <Card className="bg-slate-800 rounded-xl mb-4">
          <CardContent className="p-4">
            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Food Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-slate-900 border-slate-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="servingSize">Serving Size</Label>
                  <Input
                    id="servingSize"
                    name="servingSize"
                    value={formData.servingSize}
                    onChange={handleInputChange}
                    className="bg-slate-900 border-slate-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    name="calories"
                    type="number"
                    value={formData.calories}
                    onChange={handleInputChange}
                    className="bg-slate-900 border-slate-700"
                  />
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
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-primary text-black"
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="material-icons text-3xl text-primary">restaurant</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{food.name}</h3>
                  {food.servingSize && (
                    <p className="text-sm text-gray-400">Serving: {food.servingSize}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{food.calories}</div>
                    <div className="text-xs text-gray-400">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-accent">{food.protein}g</div>
                    <div className="text-xs text-gray-400">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-yellow-500">{food.carbs}g</div>
                    <div className="text-xs text-gray-400">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-500">{food.fat}g</div>
                    <div className="text-xs text-gray-400">Fat</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-white">Nutrition Details</h4>
                  <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-gray-300">Calories</span>
                    <span className="text-white">{food.calories}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-gray-300">Protein</span>
                    <span className="text-white">{food.protein}g</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-700">
                    <span className="text-gray-300">Carbohydrates</span>
                    <span className="text-white">{food.carbs}g</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-300">Fat</span>
                    <span className="text-white">{food.fat}g</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {!editing && (
          <Button 
            variant="outline" 
            className="w-full text-red-500 border-red-500/20 hover:bg-red-500/10"
            onClick={handleDelete}
          >
            <span className="material-icons mr-2">delete</span>
            Delete Food Item
          </Button>
        )}
      </div>
    </main>
  );
}
