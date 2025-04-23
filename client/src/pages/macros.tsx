import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MealCard from '@/components/MealCard';
import MacroProgress from '@/components/MacroProgress';
import { useUser, useMealLogs, useFoodItems } from '@/lib/hooks';
import { calculateDailyTotals } from '@/lib/utils';

export default function MacroTracker() {
  const { user, isLoading: isLoadingUser } = useUser();
  const { mealLogs, isLoading: isLoadingMeals, createMealLog } = useMealLogs(1, new Date());
  const { foodItems } = useFoodItems(1);
  
  const [showAddMeal, setShowAddMeal] = useState(false);
  
  // Calculate daily totals from meal logs
  const totals = mealLogs ? calculateDailyTotals(mealLogs) : { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  // Get targets from user profile
  const targets = {
    calories: user?.dailyCalories || 2000,
    protein: user?.proteinTarget || 150,
    carbs: 220, // Example target
    fat: 70 // Example target
  };

  // Group meals by type
  const getMealsByType = (type: string) => {
    return mealLogs ? mealLogs.filter(meal => meal.mealType === type) : [];
  };
  
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  
  // Add a new empty meal
  const handleAddMeal = (mealType: string) => {
    createMealLog({
      userId: 1,
      mealType,
      foodItems: [],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0
    });
    setShowAddMeal(false);
  };

  return (
    <main className="flex-1 overflow-y-auto pb-16">
      <div className="p-4 space-y-6">
        <div className="mb-4">
          <h2 className="text-lg font-montserrat font-bold mb-1">Macro & Calorie Tracker</h2>
          <p className="text-sm text-gray-400 font-poppins">Track your nutrition goals</p>
        </div>
        
        {/* Today's Summary */}
        <Card className="bg-slate-800 rounded-xl p-4">
          <h3 className="font-montserrat font-bold text-white text-lg mb-4">Today's Summary</h3>
          
          <div className="flex flex-col gap-4">
            <MacroProgress
              label="Calories"
              current={totals.calories}
              target={targets.calories}
              unit=""
              color="bg-primary"
            />
            
            <MacroProgress
              label="Protein"
              current={totals.protein}
              target={targets.protein}
              color="protein"
            />
            
            <MacroProgress
              label="Carbs"
              current={totals.carbs}
              target={targets.carbs}
              color="carbs"
            />
            
            <MacroProgress
              label="Fat"
              current={totals.fat}
              target={targets.fat}
              color="fat"
            />
          </div>
        </Card>
        
        {/* Meal Log */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-montserrat font-bold">Meal Log</h3>
            <Link href="/add-food">
              <Button className="bg-primary text-black rounded-lg py-1 px-3 text-sm font-medium flex items-center">
                <span className="material-icons text-sm mr-1">add</span> Add Food
              </Button>
            </Link>
          </div>
          
          <div className="space-y-4">
            {isLoadingMeals ? (
              // Loading skeletons
              [...Array(2)].map((_, i) => (
                <Card key={i} className="bg-slate-800 rounded-xl p-4 animate-pulse">
                  <div className="flex justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-700 rounded-full"></div>
                      <div className="h-5 w-24 bg-slate-700 rounded"></div>
                    </div>
                    <div className="h-5 w-16 bg-slate-700 rounded"></div>
                  </div>
                  <div className="space-y-3">
                    {[...Array(2)].map((_, j) => (
                      <div key={j} className="flex justify-between py-2 border-b border-slate-700">
                        <div className="h-5 w-32 bg-slate-700 rounded"></div>
                        <div className="h-5 w-20 bg-slate-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            ) : (
              <>
                {/* Render existing meal logs by type */}
                {mealTypes.map(type => {
                  const meals = getMealsByType(type);
                  if (meals.length === 0) return null;
                  
                  return meals.map(meal => (
                    <MealCard
                      key={meal.id}
                      title={meal.mealType}
                      totalCalories={meal.totalCalories}
                      foodItems={meal.foodItems}
                      onAddFood={() => {/* Navigate to add food to specific meal */}}
                    />
                  ));
                })}
                
                {/* Add More Meal Section */}
                {showAddMeal ? (
                  <Card className="bg-slate-800 rounded-xl p-4">
                    <h4 className="font-medium text-white mb-3">Add New Meal</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {mealTypes.map(type => (
                        <Button
                          key={type}
                          variant="outline"
                          className="border-slate-700 hover:bg-slate-700"
                          onClick={() => handleAddMeal(type)}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full mt-3 text-gray-400"
                      onClick={() => setShowAddMeal(false)}
                    >
                      Cancel
                    </Button>
                  </Card>
                ) : (
                  <Button 
                    className="w-full py-3 border border-dashed border-gray-600 rounded-xl text-gray-400 flex items-center justify-center"
                    variant="ghost"
                    onClick={() => setShowAddMeal(true)}
                  >
                    <span className="material-icons mr-2">add_circle_outline</span>
                    Add Another Meal
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
