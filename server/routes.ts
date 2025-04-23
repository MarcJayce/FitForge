import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertWorkoutProgramSchema,
  insertWorkoutSchema,
  insertExerciseSchema,
  insertFoodItemSchema,
  insertMealLogSchema,
  insertProgressLogSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error: error });
    }
  });

  app.patch("/api/users/:id", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error: error });
    }
  });

  // Workout Program routes
  app.get("/api/workout-programs", async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const programs = await storage.getWorkoutPrograms(userId);
    res.json(programs);
  });

  app.get("/api/workout-programs/:id", async (req: Request, res: Response) => {
    const programId = parseInt(req.params.id);
    if (isNaN(programId)) {
      return res.status(400).json({ message: "Invalid program ID" });
    }

    const program = await storage.getWorkoutProgram(programId);
    if (!program) {
      return res.status(404).json({ message: "Workout program not found" });
    }

    res.json(program);
  });

  app.post("/api/workout-programs", async (req: Request, res: Response) => {
    try {
      const programData = insertWorkoutProgramSchema.parse(req.body);
      const newProgram = await storage.createWorkoutProgram(programData);
      res.status(201).json(newProgram);
    } catch (error) {
      res.status(400).json({ message: "Invalid program data", error: error });
    }
  });

  app.patch("/api/workout-programs/:id", async (req: Request, res: Response) => {
    const programId = parseInt(req.params.id);
    if (isNaN(programId)) {
      return res.status(400).json({ message: "Invalid program ID" });
    }

    try {
      const program = await storage.getWorkoutProgram(programId);
      if (!program) {
        return res.status(404).json({ message: "Workout program not found" });
      }

      const updatedProgram = await storage.updateWorkoutProgram(programId, req.body);
      if (!updatedProgram) {
        return res.status(404).json({ message: "Workout program not found" });
      }

      res.json(updatedProgram);
    } catch (error) {
      res.status(400).json({ message: "Invalid program data", error: error });
    }
  });

  app.delete("/api/workout-programs/:id", async (req: Request, res: Response) => {
    const programId = parseInt(req.params.id);
    if (isNaN(programId)) {
      return res.status(400).json({ message: "Invalid program ID" });
    }

    const success = await storage.deleteWorkoutProgram(programId);
    if (!success) {
      return res.status(404).json({ message: "Workout program not found" });
    }

    res.status(204).send();
  });

  // Workout routes
  app.get("/api/workouts", async (req: Request, res: Response) => {
    const programId = parseInt(req.query.programId as string);
    if (isNaN(programId)) {
      return res.status(400).json({ message: "Invalid program ID" });
    }

    const workouts = await storage.getWorkouts(programId);
    res.json(workouts);
  });

  app.get("/api/workouts/:id", async (req: Request, res: Response) => {
    const workoutId = parseInt(req.params.id);
    if (isNaN(workoutId)) {
      return res.status(400).json({ message: "Invalid workout ID" });
    }

    const workout = await storage.getWorkout(workoutId);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.json(workout);
  });

  app.post("/api/workouts", async (req: Request, res: Response) => {
    try {
      const workoutData = insertWorkoutSchema.parse(req.body);
      const newWorkout = await storage.createWorkout(workoutData);
      res.status(201).json(newWorkout);
    } catch (error) {
      res.status(400).json({ message: "Invalid workout data", error: error });
    }
  });

  app.patch("/api/workouts/:id", async (req: Request, res: Response) => {
    const workoutId = parseInt(req.params.id);
    if (isNaN(workoutId)) {
      return res.status(400).json({ message: "Invalid workout ID" });
    }

    try {
      const workout = await storage.getWorkout(workoutId);
      if (!workout) {
        return res.status(404).json({ message: "Workout not found" });
      }

      const updatedWorkout = await storage.updateWorkout(workoutId, req.body);
      if (!updatedWorkout) {
        return res.status(404).json({ message: "Workout not found" });
      }

      res.json(updatedWorkout);
    } catch (error) {
      res.status(400).json({ message: "Invalid workout data", error: error });
    }
  });

  app.delete("/api/workouts/:id", async (req: Request, res: Response) => {
    const workoutId = parseInt(req.params.id);
    if (isNaN(workoutId)) {
      return res.status(400).json({ message: "Invalid workout ID" });
    }

    const success = await storage.deleteWorkout(workoutId);
    if (!success) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.status(204).send();
  });

  // Exercise routes
  app.get("/api/exercises", async (req: Request, res: Response) => {
    const workoutId = parseInt(req.query.workoutId as string);
    if (isNaN(workoutId)) {
      return res.status(400).json({ message: "Invalid workout ID" });
    }

    const exercises = await storage.getExercises(workoutId);
    res.json(exercises);
  });

  app.get("/api/exercises/:id", async (req: Request, res: Response) => {
    const exerciseId = parseInt(req.params.id);
    if (isNaN(exerciseId)) {
      return res.status(400).json({ message: "Invalid exercise ID" });
    }

    const exercise = await storage.getExercise(exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    res.json(exercise);
  });

  app.post("/api/exercises", async (req: Request, res: Response) => {
    try {
      const exerciseData = insertExerciseSchema.parse(req.body);
      const newExercise = await storage.createExercise(exerciseData);
      res.status(201).json(newExercise);
    } catch (error) {
      res.status(400).json({ message: "Invalid exercise data", error: error });
    }
  });

  app.patch("/api/exercises/:id", async (req: Request, res: Response) => {
    const exerciseId = parseInt(req.params.id);
    if (isNaN(exerciseId)) {
      return res.status(400).json({ message: "Invalid exercise ID" });
    }

    try {
      const exercise = await storage.getExercise(exerciseId);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      const updatedExercise = await storage.updateExercise(exerciseId, req.body);
      if (!updatedExercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      res.json(updatedExercise);
    } catch (error) {
      res.status(400).json({ message: "Invalid exercise data", error: error });
    }
  });

  app.delete("/api/exercises/:id", async (req: Request, res: Response) => {
    const exerciseId = parseInt(req.params.id);
    if (isNaN(exerciseId)) {
      return res.status(400).json({ message: "Invalid exercise ID" });
    }

    const success = await storage.deleteExercise(exerciseId);
    if (!success) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    res.status(204).send();
  });

  // Food Item routes
  app.get("/api/food-items", async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const foodItems = await storage.getFoodItems(userId);
    res.json(foodItems);
  });

  app.get("/api/food-items/:id", async (req: Request, res: Response) => {
    const foodItemId = parseInt(req.params.id);
    if (isNaN(foodItemId)) {
      return res.status(400).json({ message: "Invalid food item ID" });
    }

    const foodItem = await storage.getFoodItem(foodItemId);
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.json(foodItem);
  });

  app.get("/api/food-items/barcode/:barcode", async (req: Request, res: Response) => {
    const barcode = req.params.barcode;
    const foodItem = await storage.getFoodItemByBarcode(barcode);
    
    if (!foodItem) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.json(foodItem);
  });

  app.post("/api/food-items", async (req: Request, res: Response) => {
    try {
      const foodItemData = insertFoodItemSchema.parse(req.body);
      const newFoodItem = await storage.createFoodItem(foodItemData);
      res.status(201).json(newFoodItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid food item data", error: error });
    }
  });

  app.patch("/api/food-items/:id", async (req: Request, res: Response) => {
    const foodItemId = parseInt(req.params.id);
    if (isNaN(foodItemId)) {
      return res.status(400).json({ message: "Invalid food item ID" });
    }

    try {
      const foodItem = await storage.getFoodItem(foodItemId);
      if (!foodItem) {
        return res.status(404).json({ message: "Food item not found" });
      }

      const updatedFoodItem = await storage.updateFoodItem(foodItemId, req.body);
      if (!updatedFoodItem) {
        return res.status(404).json({ message: "Food item not found" });
      }

      res.json(updatedFoodItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid food item data", error: error });
    }
  });

  app.delete("/api/food-items/:id", async (req: Request, res: Response) => {
    const foodItemId = parseInt(req.params.id);
    if (isNaN(foodItemId)) {
      return res.status(400).json({ message: "Invalid food item ID" });
    }

    const success = await storage.deleteFoodItem(foodItemId);
    if (!success) {
      return res.status(404).json({ message: "Food item not found" });
    }

    res.status(204).send();
  });

  // Meal Log routes
  app.get("/api/meal-logs", async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    let date: Date | undefined;
    if (req.query.date) {
      date = new Date(req.query.date as string);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
    }

    const mealLogs = await storage.getMealLogs(userId, date);
    res.json(mealLogs);
  });

  app.get("/api/meal-logs/:id", async (req: Request, res: Response) => {
    const mealLogId = parseInt(req.params.id);
    if (isNaN(mealLogId)) {
      return res.status(400).json({ message: "Invalid meal log ID" });
    }

    const mealLog = await storage.getMealLog(mealLogId);
    if (!mealLog) {
      return res.status(404).json({ message: "Meal log not found" });
    }

    res.json(mealLog);
  });

  app.post("/api/meal-logs", async (req: Request, res: Response) => {
    try {
      const mealLogData = insertMealLogSchema.parse(req.body);
      const newMealLog = await storage.createMealLog(mealLogData);
      res.status(201).json(newMealLog);
    } catch (error) {
      res.status(400).json({ message: "Invalid meal log data", error: error });
    }
  });

  app.patch("/api/meal-logs/:id", async (req: Request, res: Response) => {
    const mealLogId = parseInt(req.params.id);
    if (isNaN(mealLogId)) {
      return res.status(400).json({ message: "Invalid meal log ID" });
    }

    try {
      const mealLog = await storage.getMealLog(mealLogId);
      if (!mealLog) {
        return res.status(404).json({ message: "Meal log not found" });
      }

      const updatedMealLog = await storage.updateMealLog(mealLogId, req.body);
      if (!updatedMealLog) {
        return res.status(404).json({ message: "Meal log not found" });
      }

      res.json(updatedMealLog);
    } catch (error) {
      res.status(400).json({ message: "Invalid meal log data", error: error });
    }
  });

  app.delete("/api/meal-logs/:id", async (req: Request, res: Response) => {
    const mealLogId = parseInt(req.params.id);
    if (isNaN(mealLogId)) {
      return res.status(400).json({ message: "Invalid meal log ID" });
    }

    const success = await storage.deleteMealLog(mealLogId);
    if (!success) {
      return res.status(404).json({ message: "Meal log not found" });
    }

    res.status(204).send();
  });

  // Progress Log routes
  app.get("/api/progress-logs", async (req: Request, res: Response) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (req.query.startDate) {
      startDate = new Date(req.query.startDate as string);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({ message: "Invalid start date format" });
      }
    }

    if (req.query.endDate) {
      endDate = new Date(req.query.endDate as string);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid end date format" });
      }
    }

    const progressLogs = await storage.getProgressLogs(userId, startDate, endDate);
    res.json(progressLogs);
  });

  app.get("/api/progress-logs/:id", async (req: Request, res: Response) => {
    const progressLogId = parseInt(req.params.id);
    if (isNaN(progressLogId)) {
      return res.status(400).json({ message: "Invalid progress log ID" });
    }

    const progressLog = await storage.getProgressLog(progressLogId);
    if (!progressLog) {
      return res.status(404).json({ message: "Progress log not found" });
    }

    res.json(progressLog);
  });

  app.post("/api/progress-logs", async (req: Request, res: Response) => {
    try {
      const progressLogData = insertProgressLogSchema.parse(req.body);
      const newProgressLog = await storage.createProgressLog(progressLogData);
      res.status(201).json(newProgressLog);
    } catch (error) {
      res.status(400).json({ message: "Invalid progress log data", error: error });
    }
  });

  app.patch("/api/progress-logs/:id", async (req: Request, res: Response) => {
    const progressLogId = parseInt(req.params.id);
    if (isNaN(progressLogId)) {
      return res.status(400).json({ message: "Invalid progress log ID" });
    }

    try {
      const progressLog = await storage.getProgressLog(progressLogId);
      if (!progressLog) {
        return res.status(404).json({ message: "Progress log not found" });
      }

      const updatedProgressLog = await storage.updateProgressLog(progressLogId, req.body);
      if (!updatedProgressLog) {
        return res.status(404).json({ message: "Progress log not found" });
      }

      res.json(updatedProgressLog);
    } catch (error) {
      res.status(400).json({ message: "Invalid progress log data", error: error });
    }
  });

  app.delete("/api/progress-logs/:id", async (req: Request, res: Response) => {
    const progressLogId = parseInt(req.params.id);
    if (isNaN(progressLogId)) {
      return res.status(400).json({ message: "Invalid progress log ID" });
    }

    const success = await storage.deleteProgressLog(progressLogId);
    if (!success) {
      return res.status(404).json({ message: "Progress log not found" });
    }

    res.status(204).send();
  });

  // Food API integration (simulation)
  app.get("/api/food-search", async (req: Request, res: Response) => {
    const query = req.query.query as string;
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    // Simulate external API response
    const results = [
      {
        id: "food_1",
        name: "Protein Bar",
        calories: 220,
        protein: 20,
        carbs: 22,
        fat: 8,
        servingSize: "1 bar (68g)"
      },
      {
        id: "food_2",
        name: "Greek Yogurt",
        calories: 130,
        protein: 12,
        carbs: 5,
        fat: 8,
        servingSize: "1 container (150g)"
      },
      {
        id: "food_3",
        name: "Chicken Breast",
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        servingSize: "100g"
      }
    ];

    setTimeout(() => {
      res.json({ results });
    }, 500);
  });

  app.get("/api/barcode/:code", async (req: Request, res: Response) => {
    const barcode = req.params.code;
    
    // Simulate barcode scan result
    const barcodeResults = {
      "1234567890": {
        name: "Protein Bar",
        calories: 220,
        protein: 20,
        carbs: 22,
        fat: 8,
        servingSize: "1 bar (68g)"
      },
      "9876543210": {
        name: "Greek Yogurt",
        calories: 130,
        protein: 12,
        carbs: 5,
        fat: 8,
        servingSize: "1 container (150g)"
      },
      "5432167890": {
        name: "Energy Drink",
        calories: 160,
        protein: 0,
        carbs: 40,
        fat: 0,
        servingSize: "1 can (355ml)"
      }
    };

    setTimeout(() => {
      if (barcode in barcodeResults) {
        res.json(barcodeResults[barcode as keyof typeof barcodeResults]);
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    }, 800);
  });

  const httpServer = createServer(app);
  return httpServer;
}
