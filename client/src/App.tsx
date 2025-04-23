import { Switch, Route, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useNetworkStatus } from "./lib/hooks";
import { initializeDB } from "./lib/db";
import Dashboard from "@/pages/dashboard";
import GymPrograms from "@/pages/gym";
import MacroTracker from "@/pages/macros";
import Scanner from "@/pages/scan";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/Navbar";
import CreateWorkout from "@/pages/create-workout";
import WorkoutDetail from "@/pages/workout-detail";
import AddFood from "@/pages/add-food";
import FoodDetail from "@/pages/food-detail";

function Router() {
  const [location] = useLocation();
  const isOffline = useNetworkStatus();
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Offline Banner */}
      {isOffline && (
        <div className="offline-indicator bg-yellow-500 text-black text-center py-1 font-poppins text-sm font-medium">
          <span className="material-icons text-sm align-text-bottom mr-1">wifi_off</span> Working offline - Changes will sync when connected
        </div>
      )}
      
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/gym" component={GymPrograms} />
        <Route path="/macros" component={MacroTracker} />
        <Route path="/scan" component={Scanner} />
        <Route path="/profile" component={Profile} />
        <Route path="/create-workout" component={CreateWorkout} />
        <Route path="/workout/:id" component={WorkoutDetail} />
        <Route path="/add-food" component={AddFood} />
        <Route path="/food/:id" component={FoodDetail} />
        <Route component={NotFound} />
      </Switch>
      
      {/* Only show navbar on main tabs */}
      {["/", "/gym", "/macros", "/scan", "/profile"].includes(location) && (
        <Navbar currentPath={location} />
      )}
    </div>
  );
}

function App() {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the database on component mount
    const initDb = async () => {
      try {
        await initializeDB();
        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setDbError(error instanceof Error ? error.message : 'Unknown error initializing database');
      }
    };

    initDb();
  }, []);

  // Show a loading state before the database is initialized
  if (!dbInitialized && !dbError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-montserrat font-bold">Loading FitForge...</h2>
        <p className="text-gray-400 text-sm mt-2">Setting up your fitness data</p>
      </div>
    );
  }

  // Show an error message if database initialization failed
  if (dbError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-4">
        <span className="material-icons text-red-500 text-4xl mb-4">error</span>
        <h2 className="text-lg font-montserrat font-bold text-center">Database Initialization Error</h2>
        <p className="text-gray-400 text-sm mt-2 text-center">{dbError}</p>
        <button 
          className="mt-6 bg-primary text-black px-4 py-2 rounded-md"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
