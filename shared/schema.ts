import { pgTable, text, serial, integer, boolean, json, timestamp, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  weight: real("weight"),
  weightGoal: real("weight_goal"),
  dailyCalories: integer("daily_calories"),
  proteinTarget: integer("protein_target"),
  workoutsPerWeek: integer("workouts_per_week"),
  profileType: text("profile_type").default("Fitness Enthusiast"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Workout Program Schema
export const workoutPrograms = pgTable("workout_programs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  difficulty: text("difficulty").notNull(),
  workoutsCount: integer("workouts_count").notNull(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWorkoutProgramSchema = createInsertSchema(workoutPrograms).omit({
  id: true,
  createdAt: true,
});

// Workout Schema (for specific workouts within a program)
export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration"), // in minutes
  status: text("status").default("not_started"), // not_started, in_progress, completed
  scheduledDay: text("scheduled_day"), // Monday, Tuesday, etc.
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
});

// Exercise Schema
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  sets: integer("sets"),
  reps: integer("reps"),
  weight: real("weight"),
  completed: boolean("completed").default(false),
  notes: text("notes"),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

// Food Item Schema
export const foodItems = pgTable("food_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  servingSize: text("serving_size"),
  barcode: text("barcode"),
});

export const insertFoodItemSchema = createInsertSchema(foodItems).omit({
  id: true,
});

// Meal Log Schema
export const mealLogs = pgTable("meal_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").defaultNow(),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  foodItems: json("food_items").notNull(), // array of food items with quantities
  totalCalories: integer("total_calories").notNull(),
  totalProtein: real("total_protein").notNull(),
  totalCarbs: real("total_carbs").notNull(),
  totalFat: real("total_fat").notNull(),
});

export const insertMealLogSchema = createInsertSchema(mealLogs).omit({
  id: true,
  date: true,
});

// Progress Tracking Schema
export const progressLogs = pgTable("progress_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").defaultNow(),
  weight: real("weight"),
  caloriesConsumed: integer("calories_consumed"),
  proteinConsumed: real("protein_consumed"),
  carbsConsumed: real("carbs_consumed"),
  fatConsumed: real("fat_consumed"),
  workoutsCompleted: integer("workouts_completed"),
  exercisesCompleted: integer("exercises_completed"),
});

export const insertProgressLogSchema = createInsertSchema(progressLogs).omit({
  id: true,
  date: true,
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  workoutPrograms: many(workoutPrograms),
  foodItems: many(foodItems),
  mealLogs: many(mealLogs),
  progressLogs: many(progressLogs),
}));

export const workoutProgramsRelations = relations(workoutPrograms, ({ one, many }) => ({
  user: one(users, {
    fields: [workoutPrograms.userId],
    references: [users.id],
  }),
  workouts: many(workouts),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  program: one(workoutPrograms, {
    fields: [workouts.programId],
    references: [workoutPrograms.id],
  }),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  workout: one(workouts, {
    fields: [exercises.workoutId],
    references: [workouts.id],
  }),
}));

export const foodItemsRelations = relations(foodItems, ({ one }) => ({
  user: one(users, {
    fields: [foodItems.userId],
    references: [users.id],
  }),
}));

export const mealLogsRelations = relations(mealLogs, ({ one }) => ({
  user: one(users, {
    fields: [mealLogs.userId],
    references: [users.id],
  }),
}));

export const progressLogsRelations = relations(progressLogs, ({ one }) => ({
  user: one(users, {
    fields: [progressLogs.userId],
    references: [users.id],
  }),
}));

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type WorkoutProgram = typeof workoutPrograms.$inferSelect;
export type InsertWorkoutProgram = z.infer<typeof insertWorkoutProgramSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type FoodItem = typeof foodItems.$inferSelect;
export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;

export type MealLog = typeof mealLogs.$inferSelect;
export type InsertMealLog = z.infer<typeof insertMealLogSchema>;

export type ProgressLog = typeof progressLogs.$inferSelect;
export type InsertProgressLog = z.infer<typeof insertProgressLogSchema>;
