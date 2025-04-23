import { useState, useEffect } from 'react';
import { getCurrentWeekDates, getDayAbbreviation } from '@/lib/utils';

type WeeklyData = {
  day: string;
  caloriesBurned: number;
  date: Date;
};

interface WeeklyProgressChartProps {
  data?: WeeklyData[];
  isLoading?: boolean;
}

export default function WeeklyProgressChart({ data, isLoading = false }: WeeklyProgressChartProps) {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [maxCalories, setMaxCalories] = useState(500); // Default max for scaling

  useEffect(() => {
    if (data) {
      setWeeklyData(data);
      
      // Find the maximum calories value for scaling
      const max = Math.max(...data.map(d => d.caloriesBurned), 100);
      setMaxCalories(max);
    } else {
      // Generate default data if none provided
      const dates = getCurrentWeekDates();
      const today = new Date().getDay();
      
      const defaultData = dates.map((date, index) => ({
        day: getDayAbbreviation(date),
        date,
        caloriesBurned: index <= today ? Math.floor(Math.random() * 400) + 100 : 0
      }));
      
      setWeeklyData(defaultData);
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-xl p-4 animate-pulse">
        <div className="h-6 bg-slate-700 rounded mb-4 w-1/3"></div>
        <div className="h-40 flex items-end justify-between">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 w-1/7">
              <div className="w-8 bg-slate-700 rounded-t-sm" style={{ height: `${Math.random() * 80}%` }}></div>
              <div className="w-4 h-4 rounded-full bg-slate-700"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-300 font-poppins">Calories Burned</span>
        <span className="text-sm font-medium text-primary">+12% vs last week</span>
      </div>
      
      <div className="h-40 flex items-end justify-between">
        {weeklyData.map((day, index) => {
          const today = new Date().getDay();
          const isFuture = index > today;
          const height = isFuture ? '20%' : `${(day.caloriesBurned / maxCalories) * 100}%`;
          
          return (
            <div key={index} className="flex flex-col items-center gap-2 w-1/7">
              <div 
                className={`w-8 rounded-t-sm ${isFuture ? 'bg-slate-700' : 'bg-gradient-to-t from-primary to-accent'}`}
                style={{ height }}
              ></div>
              <span className="text-xs text-gray-400">{day.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
