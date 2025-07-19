import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

// Define the input schema using Zod
const habitSchema = z.object({
  date: z.string(),
  weightCheck: z.union([z.string(), z.number(), z.null()]),
  morningAcvWater: z.union([z.string(), z.number(), z.null()]),
  championWorkout: z.union([z.string(), z.number(), z.null()]),
  meal10am: z.string(),
  hungerTimes: z.string(),
  outdoorTime: z.string(),
  energyLevel2pm: z.number(),
  meal6pm: z.string(),
  energyLevel8pm: z.number(),
  wimHof: z.union([z.string(), z.number(), z.null()]),
  trackedSleep: z.union([z.string(), z.number(), z.null()]),
  dayDescription: z.string().optional(),
});

export default publicProcedure
  .input(z.object({
    userId: z.string(),
    habit: habitSchema
  }))
  .mutation(async ({ input }) => {
    // In a real app, this would save to a database
    // For now, we'll just return success
    
    return {
      success: true,
      message: "Habit saved successfully",
      habit: input.habit,
    };
  });