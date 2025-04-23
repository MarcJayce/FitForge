import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAllItems, addItem, updateItem, deleteItem, hasSyncItems } from './db';
import { queryClient, apiRequest } from './queryClient';
import { useToast } from '@/hooks/use-toast';

// Network status hook
export function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}

// Sync status hook
export function useSyncStatus() {
  const [hasPendingSync, setHasPendingSync] = useState(false);
  const { toast } = useToast();
  
  const checkSyncStatus = useCallback(async () => {
    try {
      const pending = await hasSyncItems();
      setHasPendingSync(pending);
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  }, []);
  
  useEffect(() => {
    // Check initially
    checkSyncStatus();
    
    // Set up periodic checking
    const interval = setInterval(checkSyncStatus, 5000);
    
    return () => clearInterval(interval);
  }, [checkSyncStatus]);
  
  const triggerSync = useCallback(async () => {
    if (!navigator.onLine) {
      toast({
        title: "You're offline",
        description: "Can't sync data while offline",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, we would implement the full sync logic here
    // This would involve sending all queued changes to the server
    
    toast({
      title: "Sync started",
      description: "Syncing your data with the server..."
    });
    
    // Simulate sync
    setTimeout(() => {
      setHasPendingSync(false);
      toast({
        title: "Sync complete",
        description: "All your data is now up to date",
        variant: "success"
      });
    }, 2000);
  }, [toast]);
  
  return { hasPendingSync, triggerSync };
}

// Custom hook for handling user data
export function useUser(userId = 1) { // Default to user ID 1 for demo
  const isOffline = useNetworkStatus();
  const { toast } = useToast();
  
  const fetchUser = async ({ queryKey }: { queryKey: any[] }) => {
    if (isOffline) {
      // Get from local DB when offline
      const users = await getAllItems('userProfile');
      const user = users.find(u => u.id === userId);
      if (!user) throw new Error("User not found");
      return user;
    }
    
    // Fetch from API when online
    const res = await fetch(queryKey[0]);
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  };
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: [`/api/users/${userId}`],
    queryFn: fetchUser,
    staleTime: 300000, // 5 minutes
  });
  
  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      if (isOffline) {
        return await updateItem('userProfile', userId, userData);
      }
      
      const res = await apiRequest('PATCH', `/api/users/${userId}`, userData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}`] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    }
  });
  
  return {
    user,
    isLoading,
    error,
    updateUser: updateUserMutation.mutate,
    isPending: updateUserMutation.isPending
  };
}

// Custom hook for handling workout programs
export function useWorkoutPrograms(userId = 1) {
  const isOffline = useNetworkStatus();
  const { toast } = useToast();
  
  const fetchPrograms = async ({ queryKey }: { queryKey: any[] }) => {
    if (isOffline) {
      // Get from local DB when offline
      return await getAllItems('workoutPrograms', 'userId', userId);
    }
    
    // Fetch from API when online
    const res = await fetch(queryKey[0]);
    if (!res.ok) throw new Error("Failed to fetch workout programs");
    return res.json();
  };
  
  const { data: programs, isLoading, error } = useQuery({
    queryKey: [`/api/workout-programs?userId=${userId}`],
    queryFn: fetchPrograms,
    staleTime: 300000, // 5 minutes
  });
  
  const createProgramMutation = useMutation({
    mutationFn: async (programData: any) => {
      if (isOffline) {
        return await addItem('workoutPrograms', { ...programData, userId });
      }
      
      const res = await apiRequest('POST', '/api/workout-programs', programData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workout-programs?userId=${userId}`] });
      toast({
        title: "Program created",
        description: "Your workout program has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Failed to create workout program",
        variant: "destructive",
      });
    }
  });
  
  const updateProgramMutation = useMutation({
    mutationFn: async ({ id, ...programData }: any) => {
      if (isOffline) {
        return await updateItem('workoutPrograms', id, programData);
      }
      
      const res = await apiRequest('PATCH', `/api/workout-programs/${id}`, programData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workout-programs?userId=${userId}`] });
      toast({
        title: "Program updated",
        description: "Your workout program has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update workout program",
        variant: "destructive",
      });
    }
  });
  
  const deleteProgramMutation = useMutation({
    mutationFn: async (id: number) => {
      if (isOffline) {
        return await deleteItem('workoutPrograms', id);
      }
      
      await apiRequest('DELETE', `/api/workout-programs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workout-programs?userId=${userId}`] });
      toast({
        title: "Program deleted",
        description: "Your workout program has been deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Failed to delete workout program",
        variant: "destructive",
      });
    }
  });
  
  return {
    programs,
    isLoading,
    error,
    createProgram: createProgramMutation.mutate,
    updateProgram: updateProgramMutation.mutate,
    deleteProgram: deleteProgramMutation.mutate,
    isCreating: createProgramMutation.isPending,
    isUpdating: updateProgramMutation.isPending,
    isDeleting: deleteProgramMutation.isPending
  };
}

// Custom hook for handling workouts
export function useWorkouts(programId: number) {
  const isOffline = useNetworkStatus();
  const { toast } = useToast();
  
  const fetchWorkouts = async ({ queryKey }: { queryKey: any[] }) => {
    if (isOffline) {
      // Get from local DB when offline
      return await getAllItems('workouts', 'programId', programId);
    }
    
    // Fetch from API when online
    const res = await fetch(queryKey[0]);
    if (!res.ok) throw new Error("Failed to fetch workouts");
    return res.json();
  };
  
  const { data: workouts, isLoading, error } = useQuery({
    queryKey: [`/api/workouts?programId=${programId}`],
    queryFn: fetchWorkouts,
    staleTime: 300000, // 5 minutes
    enabled: !!programId
  });
  
  const createWorkoutMutation = useMutation({
    mutationFn: async (workoutData: any) => {
      if (isOffline) {
        return await addItem('workouts', { ...workoutData, programId });
      }
      
      const res = await apiRequest('POST', '/api/workouts', workoutData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workouts?programId=${programId}`] });
      toast({
        title: "Workout created",
        description: "Your workout has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Failed to create workout",
        variant: "destructive",
      });
    }
  });
  
  const updateWorkoutMutation = useMutation({
    mutationFn: async ({ id, ...workoutData }: any) => {
      if (isOffline) {
        return await updateItem('workouts', id, workoutData);
      }
      
      const res = await apiRequest('PATCH', `/api/workouts/${id}`, workoutData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workouts?programId=${programId}`] });
      toast({
        title: "Workout updated",
        description: "Your workout has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update workout",
        variant: "destructive",
      });
    }
  });
  
  const deleteWorkoutMutation = useMutation({
    mutationFn: async (id: number) => {
      if (isOffline) {
        return await deleteItem('workouts', id);
      }
      
      await apiRequest('DELETE', `/api/workouts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/workouts?programId=${programId}`] });
      toast({
        title: "Workout deleted",
        description: "Your workout has been deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Failed to delete workout",
        variant: "destructive",
      });
    }
  });
  
  return {
    workouts,
    isLoading,
    error,
    createWorkout: createWorkoutMutation.mutate,
    updateWorkout: updateWorkoutMutation.mutate,
    deleteWorkout: deleteWorkoutMutation.mutate,
    isCreating: createWorkoutMutation.isPending,
    isUpdating: updateWorkoutMutation.isPending,
    isDeleting: deleteWorkoutMutation.isPending
  };
}

// Custom hook for handling exercises
export function useExercises(workoutId: number) {
  const isOffline = useNetworkStatus();
  const { toast } = useToast();
  
  const fetchExercises = async ({ queryKey }: { queryKey: any[] }) => {
    if (isOffline) {
      // Get from local DB when offline
      return await getAllItems('exercises', 'workoutId', workoutId);
    }
    
    // Fetch from API when online
    const res = await fetch(queryKey[0]);
    if (!res.ok) throw new Error("Failed to fetch exercises");
    return res.json();
  };
  
  const { data: exercises, isLoading, error } = useQuery({
    queryKey: [`/api/exercises?workoutId=${workoutId}`],
    queryFn: fetchExercises,
    staleTime: 300000, // 5 minutes
    enabled: !!workoutId
  });
  
  const createExerciseMutation = useMutation({
    mutationFn: async (exerciseData: any) => {
      if (isOffline) {
        return await addItem('exercises', { ...exerciseData, workoutId });
      }
      
      const res = await apiRequest('POST', '/api/exercises', exerciseData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/exercises?workoutId=${workoutId}`] });
      toast({
        title: "Exercise added",
        description: "Exercise has been added to your workout",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Failed to add exercise",
        variant: "destructive",
      });
    }
  });
  
  const updateExerciseMutation = useMutation({
    mutationFn: async ({ id, ...exerciseData }: any) => {
      if (isOffline) {
        return await updateItem('exercises', id, exerciseData);
      }
      
      const res = await apiRequest('PATCH', `/api/exercises/${id}`, exerciseData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/exercises?workoutId=${workoutId}`] });
      toast({
        title: "Exercise updated",
        description: "Exercise has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update exercise",
        variant: "destructive",
      });
    }
  });
  
  const deleteExerciseMutation = useMutation({
    mutationFn: async (id: number) => {
      if (isOffline) {
        return await deleteItem('exercises', id);
      }
      
      await apiRequest('DELETE', `/api/exercises/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/exercises?workoutId=${workoutId}`] });
      toast({
        title: "Exercise deleted",
        description: "Exercise has been removed from your workout",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Failed to delete exercise",
        variant: "destructive",
      });
    }
  });
  
  const toggleExerciseCompletionMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      if (isOffline) {
        return await updateItem('exercises', id, { completed });
      }
      
      const res = await apiRequest('PATCH', `/api/exercises/${id}`, { completed });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/exercises?workoutId=${workoutId}`] });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update exercise completion",
        variant: "destructive",
      });
    }
  });
  
  return {
    exercises,
    isLoading,
    error,
    createExercise: createExerciseMutation.mutate,
    updateExercise: updateExerciseMutation.mutate,
    deleteExercise: deleteExerciseMutation.mutate,
    toggleExerciseCompletion: toggleExerciseCompletionMutation.mutate,
    isCreating: createExerciseMutation.isPending,
    isUpdating: updateExerciseMutation.isPending,
    isDeleting: deleteExerciseMutation.isPending
  };
}

// Custom hook for handling food items
export function useFoodItems(userId = 1) {
  const isOffline = useNetworkStatus();
  const { toast } = useToast();
  
  const fetchFoodItems = async ({ queryKey }: { queryKey: any[] }) => {
    if (isOffline) {
      // Get from local DB when offline
      return await getAllItems('foodItems', 'userId', userId);
    }
    
    // Fetch from API when online
    const res = await fetch(queryKey[0]);
    if (!res.ok) throw new Error("Failed to fetch food items");
    return res.json();
  };
  
  const { data: foodItems, isLoading, error } = useQuery({
    queryKey: [`/api/food-items?userId=${userId}`],
    queryFn: fetchFoodItems,
    staleTime: 300000, // 5 minutes
  });
  
  const createFoodItemMutation = useMutation({
    mutationFn: async (foodItemData: any) => {
      if (isOffline) {
        return await addItem('foodItems', { ...foodItemData, userId });
      }
      
      const res = await apiRequest('POST', '/api/food-items', foodItemData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/food-items?userId=${userId}`] });
      toast({
        title: "Food item added",
        description: "Food item has been added to your database",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation failed",
        description: error instanceof Error ? error.message : "Failed to add food item",
        variant: "destructive",
      });
    }
  });
  
  const updateFoodItemMutation = useMutation({
    mutationFn: async ({ id, ...foodItemData }: any) => {
      if (isOffline) {
        return await updateItem('foodItems', id, foodItemData);
      }
      
      const res = await apiRequest('PATCH', `/api/food-items/${id}`, foodItemData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/food-items?userId=${userId}`] });
      toast({
        title: "Food item updated",
        description: "Food item has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update food item",
        variant: "destructive",
      });
    }
  });
  
  const deleteFoodItemMutation = useMutation({
    mutationFn: async (id: number) => {
      if (isOffline) {
        return await deleteItem('foodItems', id);
      }
      
      await apiRequest('DELETE', `/api/food-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/food-items?userId=${userId}`] });
      toast({
        title: "Food item deleted",
        description: "Food item has been removed from your database",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Failed to delete food item",
        variant: "destructive",
      });
    }
  });
  
  return {
    foodItems,
    isLoading,
    error,
    createFoodItem: createFoodItemMutation.mutate,
    updateFoodItem: updateFoodItemMutation.mutate,
    deleteFoodItem: deleteFoodItemMutation.mutate,
    isCreating: createFoodItemMutation.isPending,
    isUpdating: updateFoodItemMutation.isPending,
    isDeleting: deleteFoodItemMutation.isPending
  };
}

// Custom hook for handling meal logs
export function useMealLogs(userId = 1, date?: Date) {
  const isOffline = useNetworkStatus();
  const { toast } = useToast();
  
  const fetchMealLogs = async ({ queryKey }: { queryKey: any[] }) => {
    if (isOffline) {
      // Get from local DB when offline
      let mealLogs = await getAllItems('mealLogs', 'userId', userId);
      
      if (date) {
        // Filter by date if provided
        mealLogs = mealLogs.filter(log => {
          const logDate = new Date(log.date);
          return logDate.toDateString() === date.toDateString();
        });
      }
      
      return mealLogs;
    }
    
    // Fetch from API when online
    const res = await fetch(queryKey[0]);
    if (!res.ok) throw new Error("Failed to fetch meal logs");
    return res.json();
  };
  
  const queryUrl = date ? 
    `/api/meal-logs?userId=${userId}&date=${date.toISOString()}` : 
    `/api/meal-logs?userId=${userId}`;
  
  const { data: mealLogs, isLoading, error } = useQuery({
    queryKey: [queryUrl],
    queryFn: fetchMealLogs,
    staleTime: 300000, // 5 minutes
  });
  
  const createMealLogMutation = useMutation({
    mutationFn: async (mealLogData: any) => {
      if (isOffline) {
        return await addItem('mealLogs', { ...mealLogData, userId, date: new Date() });
      }
      
      const res = await apiRequest('POST', '/api/meal-logs', mealLogData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryUrl] });
      toast({
        title: "Meal logged",
        description: "Your meal has been logged successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Logging failed",
        description: error instanceof Error ? error.message : "Failed to log meal",
        variant: "destructive",
      });
    }
  });
  
  const updateMealLogMutation = useMutation({
    mutationFn: async ({ id, ...mealLogData }: any) => {
      if (isOffline) {
        return await updateItem('mealLogs', id, mealLogData);
      }
      
      const res = await apiRequest('PATCH', `/api/meal-logs/${id}`, mealLogData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryUrl] });
      toast({
        title: "Meal updated",
        description: "Your meal log has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update meal log",
        variant: "destructive",
      });
    }
  });
  
  const deleteMealLogMutation = useMutation({
    mutationFn: async (id: number) => {
      if (isOffline) {
        return await deleteItem('mealLogs', id);
      }
      
      await apiRequest('DELETE', `/api/meal-logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryUrl] });
      toast({
        title: "Meal deleted",
        description: "Your meal log has been deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Failed to delete meal log",
        variant: "destructive",
      });
    }
  });
  
  return {
    mealLogs,
    isLoading,
    error,
    createMealLog: createMealLogMutation.mutate,
    updateMealLog: updateMealLogMutation.mutate,
    deleteMealLog: deleteMealLogMutation.mutate,
    isCreating: createMealLogMutation.isPending,
    isUpdating: updateMealLogMutation.isPending,
    isDeleting: deleteMealLogMutation.isPending
  };
}

// Custom hook for handling progress logs
export function useProgressLogs(userId = 1, startDate?: Date, endDate?: Date) {
  const isOffline = useNetworkStatus();
  const { toast } = useToast();
  
  const fetchProgressLogs = async ({ queryKey }: { queryKey: any[] }) => {
    if (isOffline) {
      // Get from local DB when offline
      let progressLogs = await getAllItems('progressLogs', 'userId', userId);
      
      if (startDate) {
        progressLogs = progressLogs.filter(log => {
          const logDate = new Date(log.date);
          return logDate >= startDate;
        });
      }
      
      if (endDate) {
        progressLogs = progressLogs.filter(log => {
          const logDate = new Date(log.date);
          return logDate <= endDate;
        });
      }
      
      return progressLogs;
    }
    
    // Fetch from API when online
    const res = await fetch(queryKey[0]);
    if (!res.ok) throw new Error("Failed to fetch progress logs");
    return res.json();
  };
  
  let queryUrl = `/api/progress-logs?userId=${userId}`;
  if (startDate) {
    queryUrl += `&startDate=${startDate.toISOString()}`;
  }
  if (endDate) {
    queryUrl += `&endDate=${endDate.toISOString()}`;
  }
  
  const { data: progressLogs, isLoading, error } = useQuery({
    queryKey: [queryUrl],
    queryFn: fetchProgressLogs,
    staleTime: 300000, // 5 minutes
  });
  
  const createProgressLogMutation = useMutation({
    mutationFn: async (progressLogData: any) => {
      if (isOffline) {
        return await addItem('progressLogs', { ...progressLogData, userId, date: new Date() });
      }
      
      const res = await apiRequest('POST', '/api/progress-logs', progressLogData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryUrl] });
      toast({
        title: "Progress logged",
        description: "Your progress has been logged successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Logging failed",
        description: error instanceof Error ? error.message : "Failed to log progress",
        variant: "destructive",
      });
    }
  });
  
  const updateProgressLogMutation = useMutation({
    mutationFn: async ({ id, ...progressLogData }: any) => {
      if (isOffline) {
        return await updateItem('progressLogs', id, progressLogData);
      }
      
      const res = await apiRequest('PATCH', `/api/progress-logs/${id}`, progressLogData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryUrl] });
      toast({
        title: "Progress updated",
        description: "Your progress log has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update progress log",
        variant: "destructive",
      });
    }
  });
  
  const deleteProgressLogMutation = useMutation({
    mutationFn: async (id: number) => {
      if (isOffline) {
        return await deleteItem('progressLogs', id);
      }
      
      await apiRequest('DELETE', `/api/progress-logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryUrl] });
      toast({
        title: "Progress log deleted",
        description: "Your progress log has been deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Failed to delete progress log",
        variant: "destructive",
      });
    }
  });
  
  return {
    progressLogs,
    isLoading,
    error,
    createProgressLog: createProgressLogMutation.mutate,
    updateProgressLog: updateProgressLogMutation.mutate,
    deleteProgressLog: deleteProgressLogMutation.mutate,
    isCreating: createProgressLogMutation.isPending,
    isUpdating: updateProgressLogMutation.isPending,
    isDeleting: deleteProgressLogMutation.isPending
  };
}
