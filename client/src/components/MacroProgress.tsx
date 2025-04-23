import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface MacroProgressProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
}

export default function MacroProgress({
  label,
  current,
  target,
  unit = 'g',
  color = 'bg-primary'
}: MacroProgressProps) {
  const percentage = Math.min(Math.round((current / target) * 100), 100);
  
  const getColorClass = () => {
    if (color === 'protein') return 'bg-accent';
    if (color === 'carbs') return 'bg-yellow-500';
    if (color === 'fat') return 'bg-red-500';
    return color;
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-medium">
          {current}{unit} / {target}{unit}
        </span>
      </div>
      <Progress 
        value={percentage} 
        className="h-2.5 bg-slate-900"
        indicatorClassName={cn("h-2.5 rounded-full", getColorClass())}
      />
    </div>
  );
}
