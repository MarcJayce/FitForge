import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FoodItem } from '@/components/FoodItem';

interface FoodItemType {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity?: number;
  servingSize?: string;
}

interface MealCardProps {
  title: string;
  totalCalories: number;
  foodItems: FoodItemType[];
  onAddFood?: () => void;
  onRemoveFood?: (id: number) => void;
}

export default function MealCard({
  title,
  totalCalories,
  foodItems,
  onAddFood,
  onRemoveFood
}: MealCardProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="bg-slate-800 rounded-xl mb-4">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="material-icons text-gray-400 mr-3">restaurant</span>
            <CardTitle className="font-medium text-white text-lg">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-primary">{totalCalories} cal</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-400"
              onClick={() => setExpanded(!expanded)}
            >
              <span className="material-icons">
                {expanded ? 'expand_less' : 'expand_more'}
              </span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="p-4 pt-2">
          <div className="space-y-3">
            {foodItems.length > 0 ? (
              foodItems.map((item) => (
                <FoodItem
                  key={item.id}
                  item={item}
                  onRemove={onRemoveFood ? () => onRemoveFood(item.id) : undefined}
                />
              ))
            ) : (
              <div className="text-center py-3 text-gray-400">
                No food items added yet
              </div>
            )}
          </div>
          
          {onAddFood && (
            <Button 
              variant="ghost" 
              className="w-full mt-3 text-primary border border-dashed border-gray-600 py-2"
              onClick={onAddFood}
            >
              <span className="material-icons mr-2">add_circle_outline</span>
              Add Food
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
