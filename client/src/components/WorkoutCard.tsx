import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WorkoutCardProps {
  id: number;
  name: string;
  exerciseCount: number;
  duration: number;
  status?: 'not_started' | 'in_progress' | 'completed';
  scheduledDay?: string;
  tags?: string[];
  showActions?: boolean;
  opacity?: number;
}

export default function WorkoutCard({
  id,
  name,
  exerciseCount,
  duration,
  status = 'not_started',
  scheduledDay,
  tags,
  showActions = true,
  opacity = 1
}: WorkoutCardProps) {
  const getStatusColor = () => {
    switch(status) {
      case 'in_progress': return 'text-accent';
      case 'completed': return 'text-primary';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch(status) {
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return scheduledDay || 'Not Started';
    }
  };

  return (
    <Card className={cn("bg-slate-800 rounded-xl p-4 mb-3 relative overflow-hidden", `opacity-${opacity * 100}`)} style={{ opacity }}>
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <span className="material-icons text-6xl text-primary">fitness_center</span>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-montserrat font-bold text-white text-lg">{name}</h3>
          <p className="text-sm text-gray-400 mt-1">{exerciseCount} exercises · {duration} mins</p>
        </div>
        <div className="bg-slate-900 rounded-lg px-3 py-1">
          <span className={`font-medium text-sm ${getStatusColor()}`}>{getStatusText()}</span>
        </div>
      </div>
      
      {tags && tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={index} className="bg-slate-900 rounded-full px-3 py-1 text-xs text-gray-300">{tag}</span>
          ))}
        </div>
      )}
      
      {showActions && (
        <div className="mt-4 flex items-center gap-2">
          <Link href={`/workout/${id}`}>
            <Button className="bg-primary text-black rounded-lg py-2 px-4 font-medium flex-1">
              {status === 'in_progress' ? 'Continue' : 'Start Workout'}
            </Button>
          </Link>
          <Button variant="outline" className="text-gray-300 rounded-lg py-2 px-4 border border-slate-700">
            Edit
          </Button>
        </div>
      )}
    </Card>
  );
}
