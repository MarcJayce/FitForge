import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useWorkouts, useExercises } from '@/lib/hooks';

export default function WorkoutDetail() {
  const [, params] = useRoute('/workout/:id');
  const [, setLocation] = useLocation();
  const workoutId = params ? parseInt(params.id) : 0;
  
  const { workouts, updateWorkout } = useWorkouts(1); // Assuming program ID 1
  const { exercises, createExercise, updateExercise, toggleExerciseCompletion } = useExercises(workoutId);
  const { toast } = useToast();
  
  const [workout, setWorkout] = useState<any>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sets: '3',
    reps: '10',
    weight: '0'
  });
  
  useEffect(() => {
    // Find the workout from the list
    if (workouts) {
      const found = workouts.find(w => w.id === workoutId);
      if (found) {
        setWorkout(found);
      } else {
        toast({
          title: "Workout not found",
          variant: "destructive"
        });
        setLocation('/gym');
      }
    }
  }, [workouts, workoutId, toast, setLocation]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddExercise = () => {
    createExercise({
      workoutId,
      name: formData.name,
      description: formData.description,
      sets: parseInt(formData.sets),
      reps: parseInt(formData.reps),
      weight: parseFloat(formData.weight),
      completed: false,
      notes: ''
    });
    
    // Reset form and close dialog
    setFormData({
      name: '',
      description: '',
      sets: '3',
      reps: '10',
      weight: '0'
    });
    setShowAddExercise(false);
  };
  
  const handleCheckExercise = (id: number, completed: boolean) => {
    toggleExerciseCompletion({ id, completed: !completed });
    
    // Check if all exercises are completed
    if (!completed) {
      const allCompleted = exercises?.every(e => e.id === id || e.completed);
      
      if (allCompleted) {
        // Update workout status to completed
        updateWorkout({
          id: workoutId,
          status: 'completed'
        });
        
        toast({
          title: "Workout Completed!",
          description: "Great job! You've completed this workout.",
          variant: "success"
        });
      }
    }
  };
  
  const calculateProgress = () => {
    if (!exercises || exercises.length === 0) return 0;
    const completed = exercises.filter(e => e.completed).length;
    return Math.round((completed / exercises.length) * 100);
  };
  
  const progress = calculateProgress();
  
  // Start workout (change status to in_progress)
  const handleStartWorkout = () => {
    updateWorkout({
      id: workoutId,
      status: 'in_progress'
    });
    
    toast({
      title: "Workout Started",
      description: "Let's crush this workout!"
    });
  };
  
  // Complete workout (all exercises checked)
  const handleCompleteWorkout = () => {
    // Mark all exercises as completed
    exercises?.forEach(exercise => {
      if (!exercise.completed) {
        toggleExerciseCompletion({ id: exercise.id, completed: true });
      }
    });
    
    // Update workout status
    updateWorkout({
      id: workoutId,
      status: 'completed'
    });
    
    toast({
      title: "Workout Completed!",
      description: "Great job! You've completed this workout.",
      variant: "success"
    });
  };

  if (!workout) {
    return (
      <div className="p-4 space-y-6 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="h-8 w-8 bg-slate-700 rounded-full mr-2"></div>
          <div className="h-6 w-40 bg-slate-700 rounded"></div>
        </div>
        <div className="h-20 bg-slate-700 rounded-xl mb-4"></div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-700 rounded-xl mb-2"></div>
        ))}
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto pb-16">
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" className="mr-2" onClick={() => setLocation('/gym')}>
            <span className="material-icons">arrow_back</span>
          </Button>
          <h2 className="text-lg font-montserrat font-bold">{workout.name}</h2>
        </div>
        
        {/* Workout Progress */}
        <Card className="bg-slate-800 rounded-xl mb-4">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-white">Progress</h3>
              <span className="text-primary font-medium">{progress}%</span>
            </div>
            
            <div className="w-full bg-slate-900 rounded-full h-2.5 mb-4">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">{exercises?.filter(e => e.completed).length || 0} of {exercises?.length || 0} exercises</span>
              <span className="text-sm text-gray-400">{workout.duration || 45} mins</span>
            </div>
            
            {workout.status === 'not_started' ? (
              <Button 
                className="w-full bg-primary text-black mt-2"
                onClick={handleStartWorkout}
              >
                Start Workout
              </Button>
            ) : workout.status === 'in_progress' ? (
              <Button 
                className="w-full bg-accent text-black mt-2"
                onClick={handleCompleteWorkout}
              >
                Complete Workout
              </Button>
            ) : (
              <div className="text-center text-accent font-medium mt-2">
                Workout Completed
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Exercise List */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-montserrat font-bold">Exercises</h3>
            <Button 
              className="text-primary text-sm font-medium"
              variant="ghost"
              onClick={() => setShowAddExercise(true)}
            >
              <span className="material-icons text-sm mr-1">add</span>
              Add Exercise
            </Button>
          </div>
          
          {exercises && exercises.length > 0 ? (
            <div className="space-y-2">
              {exercises.map(exercise => (
                <Card key={exercise.id} className={`bg-slate-800 rounded-xl ${exercise.completed ? 'opacity-70' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <Checkbox
                        checked={exercise.completed}
                        onCheckedChange={() => handleCheckExercise(exercise.id, exercise.completed)}
                        className="mr-3 mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className={`font-medium ${exercise.completed ? 'text-gray-400 line-through' : 'text-white'}`}>
                            {exercise.name}
                          </h4>
                          <span className="text-sm text-gray-400">
                            {exercise.weight > 0 ? `${exercise.weight} lbs` : 'Bodyweight'}
                          </span>
                        </div>
                        {exercise.description && (
                          <p className="text-sm text-gray-400 mt-1">{exercise.description}</p>
                        )}
                        <p className="text-sm text-gray-300 mt-2">
                          {exercise.sets} sets × {exercise.reps} reps
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800 rounded-xl">
              <CardContent className="p-4 text-center">
                <p className="text-gray-400 py-4">No exercises added yet</p>
                <Button 
                  variant="outline" 
                  className="border-dashed"
                  onClick={() => setShowAddExercise(true)}
                >
                  <span className="material-icons text-sm mr-1">add</span>
                  Add Your First Exercise
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Add Exercise Dialog */}
        <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Add Exercise</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Exercise Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Bench Press, Squats, etc."
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
                  placeholder="Notes about form, technique, etc."
                  className="bg-slate-900 border-slate-700"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sets">Sets</Label>
                  <Input
                    id="sets"
                    name="sets"
                    type="number"
                    min="1"
                    value={formData.sets}
                    onChange={handleInputChange}
                    className="bg-slate-900 border-slate-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reps">Reps</Label>
                  <Input
                    id="reps"
                    name="reps"
                    type="number"
                    min="1"
                    value={formData.reps}
                    onChange={handleInputChange}
                    className="bg-slate-900 border-slate-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="number"
                    min="0"
                    step="2.5"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="bg-slate-900 border-slate-700"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddExercise(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="bg-primary text-black"
                  onClick={handleAddExercise}
                  disabled={!formData.name}
                >
                  Add Exercise
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
