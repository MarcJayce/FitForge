import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useWorkoutPrograms } from '@/lib/hooks';
import { useToast } from '@/hooks/use-toast';

export default function CreateWorkout() {
  const [, setLocation] = useLocation();
  const { createProgram, isCreating } = useWorkoutPrograms();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'beginner',
    workoutsCount: '3',
    tags: [] as string[]
  });
  
  const [customTag, setCustomTag] = useState('');
  
  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];
  
  const availableTags = [
    { value: 'upper-body', label: 'Upper Body' },
    { value: 'lower-body', label: 'Lower Body' },
    { value: 'core', label: 'Core' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'strength', label: 'Strength' },
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const addTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };
  
  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };
  
  const addCustomTag = () => {
    if (customTag && !formData.tags.includes(customTag)) {
      addTag(customTag);
      setCustomTag('');
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: "Required Field Missing",
        description: "Please enter a program name",
        variant: "destructive"
      });
      return;
    }
    
    // Create workout program
    createProgram({
      userId: 1, // Demo user
      name: formData.name,
      description: formData.description,
      difficulty: formData.difficulty,
      workoutsCount: parseInt(formData.workoutsCount),
      tags: formData.tags
    });
    
    // Redirect back to programs page
    toast({
      title: "Program Created",
      description: "Your new workout program has been created"
    });
    
    setTimeout(() => {
      setLocation('/gym');
    }, 500);
  };

  return (
    <main className="flex-1 overflow-y-auto pb-16">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" className="mr-2" onClick={() => setLocation('/gym')}>
            <span className="material-icons">arrow_back</span>
          </Button>
          <h2 className="text-lg font-montserrat font-bold">Create Workout Program</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Card className="bg-slate-800 rounded-xl mb-4">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Program Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. 5-Day Split, Full Body, etc."
                  className="bg-slate-900 border-slate-700"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your workout program"
                  className="bg-slate-900 border-slate-700 min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => handleSelectChange('difficulty', value)}
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {difficultyOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workoutsCount">Number of Workouts</Label>
                  <Input
                    id="workoutsCount"
                    name="workoutsCount"
                    type="number"
                    min="1"
                    max="7"
                    value={formData.workoutsCount}
                    onChange={handleInputChange}
                    className="bg-slate-900 border-slate-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 rounded-xl mb-4">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium text-white">Program Tags</h3>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <div key={tag} className="bg-slate-700 text-white rounded-full px-3 py-1 text-sm flex items-center">
                    {tag}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 ml-1 text-gray-400 hover:text-red-500"
                      type="button"
                      onClick={() => removeTag(tag)}
                    >
                      <span className="material-icons text-sm">close</span>
                    </Button>
                  </div>
                ))}
                
                {formData.tags.length === 0 && (
                  <p className="text-gray-400 text-sm">No tags added yet</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {availableTags.map(tag => (
                  <div key={tag.value} className="flex items-center justify-between bg-slate-900 rounded-lg p-2">
                    <span className="text-gray-300">{tag.label}</span>
                    <Switch
                      checked={formData.tags.includes(tag.label)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          addTag(tag.label);
                        } else {
                          removeTag(tag.label);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add custom tag"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  className="bg-slate-900 border-slate-700"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCustomTag}
                  disabled={!customTag}
                >
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setLocation('/gym')}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary text-black"
              type="submit"
              disabled={isCreating || !formData.name}
            >
              {isCreating ? "Creating..." : "Create Program"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
