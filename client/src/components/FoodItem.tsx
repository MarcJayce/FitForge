import { Button } from '@/components/ui/button';

interface FoodItemProps {
  item: {
    id: number;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize?: string;
    quantity?: number;
  };
  onClick?: () => void;
  onRemove?: () => void;
}

export function FoodItem({ item, onClick, onRemove }: FoodItemProps) {
  const { name, calories, protein, carbs, fat, servingSize } = item;
  
  return (
    <div 
      className={`flex justify-between items-center py-2 border-b border-slate-700 ${onClick ? 'cursor-pointer hover:bg-slate-700' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div>
          <p className="text-white">{name}</p>
          {servingSize && <p className="text-xs text-gray-400">{servingSize}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className="text-sm text-white">{calories} cal</p>
          <p className="text-xs text-gray-400">P: {protein}g | C: {carbs}g | F: {fat}g</p>
        </div>
        {onRemove && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-gray-400 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <span className="material-icons text-sm">close</span>
          </Button>
        )}
      </div>
    </div>
  );
}
