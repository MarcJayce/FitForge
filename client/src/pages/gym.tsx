import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkoutCard from '@/components/WorkoutCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkoutPrograms } from '@/lib/hooks';

export default function GymPrograms() {
  const { programs, isLoading, createProgram } = useWorkoutPrograms();
  const [activeTab, setActiveTab] = useState("my-programs");
  
  // Suggested programs (static for demo)
  const suggestedPrograms = [
    {
      id: 1001,
      name: "HIIT Circuit",
      description: "High intensity interval training",
      difficulty: "Intermediate",
      duration: 20,
      tag: "Popular",
      icon: "fitness_center"
    },
    {
      id: 1002,
      name: "Strength Core",
      description: "Core strength training",
      difficulty: "Intermediate",
      duration: 30,
      tag: "New",
      icon: "self_improvement"
    },
    {
      id: 1003,
      name: "Cardio Blast",
      description: "Intensive cardio workout",
      difficulty: "All Levels",
      duration: 45,
      icon: "directions_run"
    }
  ];

  return (
    <main className="flex-1 overflow-y-auto pb-16">
      <div className="p-4 space-y-6">
        <div className="mb-4">
          <h2 className="text-lg font-montserrat font-bold mb-1">Gym Programs</h2>
          <p className="text-sm text-gray-400 font-poppins">Build and track your workout routines</p>
        </div>
        
        <Tabs defaultValue="my-programs" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="my-programs">My Programs</TabsTrigger>
            <TabsTrigger value="suggested">Suggested</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-programs">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-montserrat font-bold">My Programs</h3>
              <Link href="/create-workout">
                <Button className="bg-primary text-black rounded-lg py-1 px-3 text-sm font-medium flex items-center">
                  <span className="material-icons text-sm mr-1">add</span> New Program
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {isLoading ? (
                // Loading skeletons
                [...Array(2)].map((_, i) => (
                  <Card key={i} className="bg-slate-800 rounded-xl p-4">
                    <CardContent className="p-0">
                      <div className="flex justify-between">
                        <div>
                          <Skeleton className="h-6 w-32 bg-slate-700 mb-2" />
                          <Skeleton className="h-4 w-40 bg-slate-700" />
                        </div>
                        <Skeleton className="h-8 w-20 bg-slate-700 rounded-lg" />
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Skeleton className="h-6 w-20 bg-slate-700 rounded-full" />
                        <Skeleton className="h-6 w-24 bg-slate-700 rounded-full" />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Skeleton className="h-10 w-full bg-slate-700 rounded-lg" />
                        <Skeleton className="h-10 w-12 bg-slate-700 rounded-lg" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : programs && programs.length > 0 ? (
                programs.map(program => (
                  <WorkoutCard
                    key={program.id}
                    id={program.id}
                    name={program.name}
                    exerciseCount={program.workoutsCount}
                    duration={45} // This would normally be calculated from workouts
                    tags={program.tags}
                  />
                ))
              ) : (
                <Card className="bg-slate-800 rounded-xl p-6 text-center">
                  <div className="text-gray-400 mb-4">
                    <span className="material-icons text-4xl mb-2">fitness_center</span>
                    <h3 className="text-lg font-medium text-white mb-2">No Programs Found</h3>
                    <p>Create your first workout program to get started</p>
                  </div>
                  <Link href="/create-workout">
                    <Button className="bg-primary text-black">Create Program</Button>
                  </Link>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="suggested">
            <h3 className="font-montserrat font-bold mb-3">Suggested Programs</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {suggestedPrograms.map(program => (
                <Card key={program.id} className="bg-slate-800 rounded-xl p-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
                    <span className="material-icons text-5xl text-white">{program.icon}</span>
                  </div>
                  {program.tag && (
                    <span className={`bg-${program.tag === 'New' ? 'accent' : 'primary'} text-black text-xs font-medium px-2 py-1 rounded-md`}>
                      {program.tag}
                    </span>
                  )}
                  <h3 className="font-montserrat font-bold text-white text-lg mt-2">{program.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{program.duration} min · {program.difficulty}</p>
                  <Button className="mt-3 bg-slate-900 text-white rounded-lg py-2 px-3 text-sm font-medium w-full">
                    View Details
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
