import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ProgressRing from '@/components/ProgressRing';
import WeeklyProgressChart from '@/components/WeeklyProgressChart';
import WorkoutCard from '@/components/WorkoutCard';
import MealCard from '@/components/MealCard';
import { formatDate, calculatePercentage } from '@/lib/utils';
import { useUser, useWorkouts, useMealLogs } from '@/lib/hooks';

export default function Dashboard() {
  const { user, isLoading: isLoadingUser } = useUser();
  const { workouts, isLoading: isLoadingWorkouts } = useWorkouts(1); // Assuming program ID 1 for demo
  const { mealLogs, isLoading: isLoadingMeals } = useMealLogs(1, new Date()); // Today's meals
  const [date, setDate] = useState<string>('');
  
  const [dailyStats, setDailyStats] = useState({
    calories: { current: 0, target: 2000, percentage: 0 },
    protein: { current: 0, target: 150, percentage: 0 },
    workout: { current: 0, target: 5, percentage: 0 },
  });

  useEffect(() => {
    // Format current date
    setDate(formatDate(new Date()));
    
    // Update stats based on user profile and meal logs
    if (user && mealLogs) {
      // Calculate total calories and macros from meals
      const caloriesConsumed = mealLogs.reduce((total, meal) => total + meal.totalCalories, 0);
      const proteinConsumed = mealLogs.reduce((total, meal) => total + meal.totalProtein, 0);
      
      // Calculate workout progress
      const completedExercises = workouts ? 
        workouts.filter(w => w.status === 'completed').length : 0;
      
      // Update stats
      setDailyStats({
        calories: {
          current: caloriesConsumed,
          target: user.dailyCalories || 2000,
          percentage: calculatePercentage(caloriesConsumed, user.dailyCalories || 2000)
        },
        protein: {
          current: proteinConsumed,
          target: user.proteinTarget || 150,
          percentage: calculatePercentage(proteinConsumed, user.proteinTarget || 150)
        },
        workout: {
          current: completedExercises,
          target: 5,
          percentage: calculatePercentage(completedExercises, 5)
        }
      });
    }
  }, [user, mealLogs, workouts]);

  // Loading state
  if (isLoadingUser || isLoadingWorkouts || isLoadingMeals) {
    return (
      <div className="p-4 space-y-6 pb-16">
        <div className="mb-4 animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-3 gap-2 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="rounded-full bg-slate-700 w-24 h-24 mb-2"></div>
              <div className="h-4 bg-slate-700 rounded w-16 mb-1"></div>
              <div className="h-3 bg-slate-700 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto pb-16">
      <div className="p-4 space-y-6">
        <div className="mb-4">
          <h2 className="text-lg font-montserrat font-bold mb-1">Daily Progress</h2>
          <p className="text-sm text-gray-400 font-poppins">{date}</p>
        </div>

        {/* Progress Rings */}
        <div className="grid grid-cols-3 gap-2">
          <ProgressRing 
            percentage={dailyStats.calories.percentage} 
            progressColor="#00E5FF"
            label="Calories"
            sublabel={`${dailyStats.calories.current}/${dailyStats.calories.target}`}
          />
          
          <ProgressRing 
            percentage={dailyStats.protein.percentage} 
            progressColor="#AEEA00"
            label="Protein"
            sublabel={`${dailyStats.protein.current}/${dailyStats.protein.target}g`}
          />
          
          <ProgressRing 
            percentage={dailyStats.workout.percentage}
            gradient={true}
            label="Workout"
            sublabel={`${dailyStats.workout.current}/${dailyStats.workout.target} Exercises`}
          />
        </div>

        {/* Weekly Stats */}
        <div className="mt-8">
          <h2 className="text-lg font-montserrat font-bold mb-3">Weekly Progress</h2>
          <WeeklyProgressChart />
        </div>

        {/* Today's Workouts */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-montserrat font-bold">Today's Workout</h2>
            <Link href="/gym">
              <Button variant="link" className="text-primary text-sm font-medium">View All</Button>
            </Link>
          </div>
          
          {workouts && workouts.length > 0 ? (
            <>
              {/* Active workout */}
              {workouts.find(w => w.status === 'in_progress') && (
                <WorkoutCard
                  id={workouts.find(w => w.status === 'in_progress')!.id}
                  name={workouts.find(w => w.status === 'in_progress')!.name}
                  exerciseCount={5} // This would normally come from a count of exercises
                  duration={workouts.find(w => w.status === 'in_progress')!.duration || 45}
                  status="in_progress"
                />
              )}
              
              {/* Upcoming workouts */}
              {workouts.some(w => w.status === 'not_started') && (
                <>
                  <div className="text-gray-400 text-sm mb-2">Coming up next</div>
                  {workouts
                    .filter(w => w.status === 'not_started')
                    .slice(0, 1)
                    .map(workout => (
                      <WorkoutCard
                        key={workout.id}
                        id={workout.id}
                        name={workout.name}
                        exerciseCount={4} // This would normally come from a count of exercises
                        duration={workout.duration || 50}
                        status="not_started"
                        scheduledDay="Tomorrow"
                        showActions={false}
                        opacity={0.8}
                      />
                    ))
                  }
                </>
              )}
            </>
          ) : (
            <Card className="bg-slate-800 rounded-xl p-4 text-center">
              <CardContent className="p-6">
                <span className="material-icons text-4xl text-gray-500 mb-2">fitness_center</span>
                <h3 className="text-lg font-medium text-white mb-2">No Workouts Planned</h3>
                <p className="text-gray-400 mb-4">Create your first workout plan to get started</p>
                <Link href="/create-workout">
                  <Button className="bg-primary text-black">Create Workout</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Nutrition Summary */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-montserrat font-bold">Nutrition Today</h2>
            <Link href="/add-food">
              <Button variant="link" className="text-primary text-sm font-medium">Add Meal</Button>
            </Link>
          </div>
          
          <Card className="bg-slate-800 rounded-xl p-4">
            {/* Macros Distribution */}
            <div className="flex justify-between mb-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                <span className="text-sm text-gray-300">Protein: {dailyStats.protein.current}g</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-accent mr-2"></div>
                <span className="text-sm text-gray-300">Carbs: 180g</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                <span className="text-sm text-gray-300">Fats: 60g</span>
              </div>
            </div>
            
            {/* Meal List */}
            <div className="space-y-3 mt-4">
              {mealLogs && mealLogs.length > 0 ? (
                mealLogs.map(meal => (
                  <div key={meal.id} className="flex justify-between items-center py-2 border-b border-slate-700">
                    <div className="flex items-center">
                      <span className="material-icons text-gray-400 mr-3">restaurant</span>
                      <div>
                        <h4 className="font-medium text-white">{meal.mealType}</h4>
                        <p className="text-xs text-gray-400">
                          {meal.foodItems
                            .slice(0, 2)
                            .map((item: any) => item.name)
                            .join(', ')}
                          {meal.foodItems.length > 2 ? ', ...' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{meal.totalCalories}</p>
                      <p className="text-xs text-gray-400">calories</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <span className="material-icons text-3xl mb-2">restaurant</span>
                  <p>No meals logged today</p>
                  <Link href="/add-food">
                    <Button variant="link" className="text-primary mt-2">Log your first meal</Button>
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
