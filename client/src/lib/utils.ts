import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

// Utility for conditioning class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date using date-fns
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'EEEE, MMMM d');
}

// Format time using date-fns
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'h:mm a');
}

// Calculate total calories and macros from meal logs
export function calculateDailyTotals(mealLogs: any[]) {
  return mealLogs.reduce((totals, meal) => {
    return {
      calories: totals.calories + meal.totalCalories,
      protein: totals.protein + meal.totalProtein,
      carbs: totals.carbs + meal.totalCarbs,
      fat: totals.fat + meal.totalFat
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

// Calculate percentage for progress rings
export function calculatePercentage(value: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(Math.round((value / target) * 100), 100);
}

// Format numbers with commas
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Generate a weekly date range for the current week
export function getCurrentWeekDates(): Date[] {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Calculate the date of the previous Sunday (or today if it's Sunday)
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - day);

  // Generate dates for the week
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    return date;
  });
}

// Get day abbreviation (M, T, W, T, F, S, S)
export function getDayAbbreviation(date: Date): string {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return days[date.getDay()];
}

// Helper function to calculate the stroke dash offset for progress rings
export function calculateStrokeDashOffset(percentage: number, circumference: number): number {
  return circumference - (percentage / 100) * circumference;
}

// Format workout duration
export function formatWorkoutDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mins`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} hr ${mins} mins` : `${hours} hr`;
  }
}

// Get random integer between min and max
export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Mock data generator for weekly progress
export function generateWeeklyProgressData() {
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return weekDays.map(day => ({
    day,
    caloriesBurned: getRandomInt(100, 500)
  }));
}

// Calculate BMR (Basal Metabolic Rate) using the Mifflin-St Jeor Equation
export function calculateBMR(weight: number, heightCm: number, age: number, gender: 'male' | 'female'): number {
  if (gender === 'male') {
    return (10 * weight) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * heightCm) - (5 * age) - 161;
  }
}

// Calculate daily calorie needs based on activity level
export function calculateDailyCalories(bmr: number, activityLevel: 'sedentary' | 'lightlyActive' | 'moderatelyActive' | 'veryActive' | 'extraActive'): number {
  const activityMultipliers = {
    sedentary: 1.2,
    lightlyActive: 1.375,
    moderatelyActive: 1.55,
    veryActive: 1.725,
    extraActive: 1.9
  };
  
  return Math.round(bmr * activityMultipliers[activityLevel]);
}

// Calculate recommended macros based on goal
export function calculateMacros(calories: number, goal: 'lose' | 'maintain' | 'gain'): { protein: number, carbs: number, fat: number } {
  let proteinPercentage: number, carbsPercentage: number, fatPercentage: number;
  
  switch(goal) {
    case 'lose':
      proteinPercentage = 0.4; // 40%
      carbsPercentage = 0.3;   // 30%
      fatPercentage = 0.3;     // 30%
      break;
    case 'maintain':
      proteinPercentage = 0.3; // 30%
      carbsPercentage = 0.4;   // 40%
      fatPercentage = 0.3;     // 30%
      break;
    case 'gain':
      proteinPercentage = 0.3; // 30%
      carbsPercentage = 0.5;   // 50%
      fatPercentage = 0.2;     // 20%
      break;
  }
  
  const proteinCalories = calories * proteinPercentage;
  const carbsCalories = calories * carbsPercentage;
  const fatCalories = calories * fatPercentage;
  
  // Protein and carbs have 4 calories per gram, fat has 9 calories per gram
  return {
    protein: Math.round(proteinCalories / 4),
    carbs: Math.round(carbsCalories / 4),
    fat: Math.round(fatCalories / 9)
  };
}
