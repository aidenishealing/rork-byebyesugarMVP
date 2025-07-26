import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";

export default protectedProcedure
  .input(z.object({
    userId: z.string().optional(), // For admin editing client habits
    date: z.string(),
    weightCheck: z.union([z.literal('yes'), z.literal('no'), z.null()]),
    morningAcvWater: z.union([z.literal('yes'), z.literal('no'), z.null()]),
    championWorkout: z.union([z.literal('yes'), z.literal('no'), z.null()]),
    meal10am: z.string(),
    hungerTimes: z.string(),
    outdoorTime: z.string(),
    energyLevel2pm: z.number().min(1).max(10),
    meal6pm: z.string(),
    energyLevel8pm: z.number().min(1).max(10),
    wimHof: z.union([z.literal('yes'), z.literal('no'), z.null()]),
    trackedSleep: z.union([z.literal('yes'), z.literal('no'), z.null()]),
    dayDescription: z.string(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      // Determine target user ID
      const targetUserId = input.userId || ctx.user.id;
      
      // Check permissions
      if (ctx.user.role === 'client' && targetUserId !== ctx.user.id) {
        throw new Error('Access denied');
      }
      
      if (ctx.user.role === 'admin' && input.userId) {
        const adminClients = await ctx.db.getAllClients(ctx.user.id);
        const hasAccess = adminClients.some(client => client.id === input.userId);
        if (!hasAccess) {
          throw new Error('Access denied');
        }
      }
      
      const { userId, ...habitData } = input;
      const result = await ctx.db.saveDailyHabits(
        {
          ...habitData,
          userId: targetUserId,
        },
        ctx.user.id
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save habits');
      }
      
      return {
        success: true,
        message: result.data?.lastEditedBy ? "Habit entry updated successfully by admin" : "Habits saved successfully",
        data: result.data
      };
    } catch (error) {
      console.error('Error saving habits:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to save habits');
    }
  });