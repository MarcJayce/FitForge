import {
  User, InsertUser, 
  WorkoutProgram, InsertWorkoutProgram,
  Workout, InsertWorkout,
  Exercise, InsertExercise,
  FoodItem, InsertFoodItem,
  MealLog, InsertMealLog,
  ProgressLog, InsertProgressLog
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;

  // Workout Program methods
  getWorkoutPrograms(userId: number): Promise<WorkoutProgram[]>;
  getWorkoutProgram(id: number): Promise<WorkoutProgram | undefined>;
  createWorkoutProgram(program: InsertWorkoutProgram): Promise<WorkoutProgram>;
  updateWorkoutProgram(id: number, program: Partial<WorkoutProgram>): Promise<WorkoutProgram | undefined>;
  deleteWorkoutProgram(id: number): Promise<boolean>;

  // Workout methods
  getWorkouts(programId: number): Promise<Workout[]>;
  getWorkout(id: number): Promise<Workout | undefined>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  updateWorkout(id: number, workout: Partial<Workout>): Promise<Workout | undefined>;
  deleteWorkout(id: number): Promise<boolean>;

  // Exercise methods
  getExercises(workoutId: number): Promise<Exercise[]>;
  getExercise(id: number): Promise<Exercise | undefined>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  updateExercise(id: number, exercise: Partial<Exercise>): Promise<Exercise | undefined>;
  deleteExercise(id: number): Promise<boolean>;

  // Food Item methods
  getFoodItems(userId: number): Promise<FoodItem[]>;
  getFoodItem(id: number): Promise<FoodItem | undefined>;
  getFoodItemByBarcode(barcode: string): Promise<FoodItem | undefined>;
  createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem>;
  updateFoodItem(id: number, foodItem: Partial<FoodItem>): Promise<FoodItem | undefined>;
  deleteFoodItem(id: number): Promise<boolean>;

  // Meal Log methods
  getMealLogs(userId: number, date?: Date): Promise<MealLog[]>;
  getMealLog(id: number): Promise<MealLog | undefined>;
  createMealLog(mealLog: InsertMealLog): Promise<MealLog>;
  updateMealLog(id: number, mealLog: Partial<MealLog>): Promise<MealLog | undefined>;
  deleteMealLog(id: number): Promise<boolean>;

  // Progress Log methods
  getProgressLogs(userId: number, startDate?: Date, endDate?: Date): Promise<ProgressLog[]>;
  getProgressLog(id: number): Promise<ProgressLog | undefined>;
  createProgressLog(progressLog: InsertProgressLog): Promise<ProgressLog>;
  updateProgressLog(id: number, progressLog: Partial<ProgressLog>): Promise<ProgressLog | undefined>;
  deleteProgressLog(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workoutPrograms: Map<number, WorkoutProgram>;
  private workouts: Map<number, Workout>;
  private exercises: Map<number, Exercise>;
  private foodItems: Map<number, FoodItem>;
  private mealLogs: Map<number, MealLog>;
  private progressLogs: Map<number, ProgressLog>;

  private userId: number;
  private workoutProgramId: number;
  private workoutId: number;
  private exerciseId: number;
  private foodItemId: number;
  private mealLogId: number;
  private progressLogId: number;

  constructor() {
    this.users = new Map();
    this.workoutPrograms = new Map();
    this.workouts = new Map();
    this.exercises = new Map();
    this.foodItems = new Map();
    this.mealLogs = new Map();
    this.progressLogs = new Map();

    this.userId = 1;
    this.workoutProgramId = 1;
    this.workoutId = 1;
    this.exerciseId = 1;
    this.foodItemId = 1;
    this.mealLogId = 1;
    this.progressLogId = 1;

    // Add demo user
    this.users.set(1, {
      id: 1,
      username: "demo",
      password: "password",
      name: "Alex Johnson",
      weight: 180,
      weightGoal: 175,
      dailyCalories: 2000,
      proteinTarget: 150,
      workoutsPerWeek: 4,
      profileType: "Fitness Enthusiast"
    });

    // Add sample workout programs
    this.workoutPrograms.set(1, {
      id: 1,
      userId: 1,
      name: "5-Day Split",
      description: "Advanced workout program",
      difficulty: "Advanced",
      workoutsCount: 5,
      tags: ["Chest & Triceps", "Back & Biceps", "Legs", "Shoulders"],
      createdAt: new Date()
    });

    this.workoutPrograms.set(2, {
      id: 2,
      userId: 1,
      name: "Full Body",
      description: "Beginner workout program",
      difficulty: "Beginner",
      workoutsCount: 3,
      tags: ["Monday", "Wednesday", "Friday"],
      createdAt: new Date()
    });

    // Add sample workout
    this.workouts.set(1, {
      id: 1,
      programId: 1,
      name: "Upper Body",
      description: "Focus on chest and triceps",
      duration: 45,
      status: "in_progress",
      scheduledDay: "Monday"
    });

    // Add sample exercises
    this.exercises.set(1, {
      id: 1,
      workoutId: 1,
      name: "Bench Press",
      description: "Barbell bench press",
      sets: 4,
      reps: 10,
      weight: 135,
      completed: true,
      notes: ""
    });

    this.exercises.set(2, {
      id: 2,
      workoutId: 1,
      name: "Push-ups",
      description: "Standard push-ups",
      sets: 3,
      reps: 15,
      weight: 0,
      completed: true,
      notes: ""
    });

    // Add sample food items
    this.foodItems.set(1, {
      id: 1,
      userId: 1,
      name: "Eggs",
      calories: 180,
      protein: 12,
      carbs: 2,
      fat: 14,
      servingSize: "2 large eggs",
      barcode: ""
    });

    this.foodItems.set(2, {
      id: 2,
      userId: 1,
      name: "Avocado Toast",
      calories: 220,
      protein: 6,
      carbs: 22,
      fat: 12,
      servingSize: "1 slice, 1/2 avocado",
      barcode: ""
    });

    this.foodItems.set(3, {
      id: 3,
      userId: 1,
      name: "Chicken Breast",
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      servingSize: "100g",
      barcode: ""
    });

    // Add sample meal logs
    this.mealLogs.set(1, {
      id: 1,
      userId: 1,
      date: new Date(),
      mealType: "Breakfast",
      foodItems: [
        { id: 1, quantity: 1, name: "Eggs", calories: 180, protein: 12, carbs: 2, fat: 14 },
        { id: 2, quantity: 1, name: "Avocado Toast", calories: 220, protein: 6, carbs: 22, fat: 12 }
      ],
      totalCalories: 400,
      totalProtein: 18,
      totalCarbs: 24,
      totalFat: 26
    });

    this.mealLogs.set(2, {
      id: 2,
      userId: 1,
      date: new Date(),
      mealType: "Lunch",
      foodItems: [
        { id: 3, quantity: 1, name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6 }
      ],
      totalCalories: 165,
      totalProtein: 31,
      totalCarbs: 0,
      totalFat: 3.6
    });

    // Set the IDs for new records
    this.workoutProgramId = 3;
    this.workoutId = 2;
    this.exerciseId = 3;
    this.foodItemId = 4;
    this.mealLogId = 3;
    this.userId = 2;
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Workout Program Methods
  async getWorkoutPrograms(userId: number): Promise<WorkoutProgram[]> {
    return Array.from(this.workoutPrograms.values()).filter(
      (program) => program.userId === userId
    );
  }

  async getWorkoutProgram(id: number): Promise<WorkoutProgram | undefined> {
    return this.workoutPrograms.get(id);
  }

  async createWorkoutProgram(program: InsertWorkoutProgram): Promise<WorkoutProgram> {
    const id = this.workoutProgramId++;
    const newProgram: WorkoutProgram = { ...program, id, createdAt: new Date() };
    this.workoutPrograms.set(id, newProgram);
    return newProgram;
  }

  async updateWorkoutProgram(id: number, programData: Partial<WorkoutProgram>): Promise<WorkoutProgram | undefined> {
    const existingProgram = this.workoutPrograms.get(id);
    if (!existingProgram) return undefined;
    
    const updatedProgram = { ...existingProgram, ...programData };
    this.workoutPrograms.set(id, updatedProgram);
    return updatedProgram;
  }

  async deleteWorkoutProgram(id: number): Promise<boolean> {
    return this.workoutPrograms.delete(id);
  }

  // Workout Methods
  async getWorkouts(programId: number): Promise<Workout[]> {
    return Array.from(this.workouts.values()).filter(
      (workout) => workout.programId === programId
    );
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const id = this.workoutId++;
    const newWorkout: Workout = { ...workout, id };
    this.workouts.set(id, newWorkout);
    return newWorkout;
  }

  async updateWorkout(id: number, workoutData: Partial<Workout>): Promise<Workout | undefined> {
    const existingWorkout = this.workouts.get(id);
    if (!existingWorkout) return undefined;
    
    const updatedWorkout = { ...existingWorkout, ...workoutData };
    this.workouts.set(id, updatedWorkout);
    return updatedWorkout;
  }

  async deleteWorkout(id: number): Promise<boolean> {
    return this.workouts.delete(id);
  }

  // Exercise Methods
  async getExercises(workoutId: number): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(
      (exercise) => exercise.workoutId === workoutId
    );
  }

  async getExercise(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const id = this.exerciseId++;
    const newExercise: Exercise = { ...exercise, id };
    this.exercises.set(id, newExercise);
    return newExercise;
  }

  async updateExercise(id: number, exerciseData: Partial<Exercise>): Promise<Exercise | undefined> {
    const existingExercise = this.exercises.get(id);
    if (!existingExercise) return undefined;
    
    const updatedExercise = { ...existingExercise, ...exerciseData };
    this.exercises.set(id, updatedExercise);
    return updatedExercise;
  }

  async deleteExercise(id: number): Promise<boolean> {
    return this.exercises.delete(id);
  }

  // Food Item Methods
  async getFoodItems(userId: number): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values()).filter(
      (foodItem) => foodItem.userId === userId
    );
  }

  async getFoodItem(id: number): Promise<FoodItem | undefined> {
    return this.foodItems.get(id);
  }

  async getFoodItemByBarcode(barcode: string): Promise<FoodItem | undefined> {
    return Array.from(this.foodItems.values()).find(
      (foodItem) => foodItem.barcode === barcode
    );
  }

  async createFoodItem(foodItem: InsertFoodItem): Promise<FoodItem> {
    const id = this.foodItemId++;
    const newFoodItem: FoodItem = { ...foodItem, id };
    this.foodItems.set(id, newFoodItem);
    return newFoodItem;
  }

  async updateFoodItem(id: number, foodItemData: Partial<FoodItem>): Promise<FoodItem | undefined> {
    const existingFoodItem = this.foodItems.get(id);
    if (!existingFoodItem) return undefined;
    
    const updatedFoodItem = { ...existingFoodItem, ...foodItemData };
    this.foodItems.set(id, updatedFoodItem);
    return updatedFoodItem;
  }

  async deleteFoodItem(id: number): Promise<boolean> {
    return this.foodItems.delete(id);
  }

  // Meal Log Methods
  async getMealLogs(userId: number, date?: Date): Promise<MealLog[]> {
    let mealLogs = Array.from(this.mealLogs.values()).filter(
      (mealLog) => mealLog.userId === userId
    );
    
    if (date) {
      mealLogs = mealLogs.filter(mealLog => {
        const mealDate = new Date(mealLog.date);
        return mealDate.toDateString() === date.toDateString();
      });
    }
    
    return mealLogs;
  }

  async getMealLog(id: number): Promise<MealLog | undefined> {
    return this.mealLogs.get(id);
  }

  async createMealLog(mealLog: InsertMealLog): Promise<MealLog> {
    const id = this.mealLogId++;
    const newMealLog: MealLog = { ...mealLog, id, date: new Date() };
    this.mealLogs.set(id, newMealLog);
    return newMealLog;
  }

  async updateMealLog(id: number, mealLogData: Partial<MealLog>): Promise<MealLog | undefined> {
    const existingMealLog = this.mealLogs.get(id);
    if (!existingMealLog) return undefined;
    
    const updatedMealLog = { ...existingMealLog, ...mealLogData };
    this.mealLogs.set(id, updatedMealLog);
    return updatedMealLog;
  }

  async deleteMealLog(id: number): Promise<boolean> {
    return this.mealLogs.delete(id);
  }

  // Progress Log Methods
  async getProgressLogs(userId: number, startDate?: Date, endDate?: Date): Promise<ProgressLog[]> {
    let progressLogs = Array.from(this.progressLogs.values()).filter(
      (progressLog) => progressLog.userId === userId
    );
    
    if (startDate) {
      progressLogs = progressLogs.filter(progressLog => {
        const logDate = new Date(progressLog.date);
        return logDate >= startDate;
      });
    }
    
    if (endDate) {
      progressLogs = progressLogs.filter(progressLog => {
        const logDate = new Date(progressLog.date);
        return logDate <= endDate;
      });
    }
    
    return progressLogs;
  }

  async getProgressLog(id: number): Promise<ProgressLog | undefined> {
    return this.progressLogs.get(id);
  }

  async createProgressLog(progressLog: InsertProgressLog): Promise<ProgressLog> {
    const id = this.progressLogId++;
    const newProgressLog: ProgressLog = { ...progressLog, id, date: new Date() };
    this.progressLogs.set(id, newProgressLog);
    return newProgressLog;
  }

  async updateProgressLog(id: number, progressLogData: Partial<ProgressLog>): Promise<ProgressLog | undefined> {
    const existingProgressLog = this.progressLogs.get(id);
    if (!existingProgressLog) return undefined;
    
    const updatedProgressLog = { ...existingProgressLog, ...progressLogData };
    this.progressLogs.set(id, updatedProgressLog);
    return updatedProgressLog;
  }

  async deleteProgressLog(id: number): Promise<boolean> {
    return this.progressLogs.delete(id);
  }
}

export const storage = new MemStorage();
