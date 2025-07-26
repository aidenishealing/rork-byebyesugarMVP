import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";

export default protectedProcedure
  .input(z.object({
    userId: z.string().optional(), // For admin viewing client habits
    date: z.string().optional(),
    page: z.number().min(1).optional().default(1),
    limit: z.number().min(1).max(100).optional().default(20),
  }))
  .query(async ({ input, ctx }) => {
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
      
      // If a specific date is requested
      if (input.date) {
        const habit = await ctx.db.getDailyHabitByDate(targetUserId, input.date);
        return {
          success: true,
          data: habit
        };
      }
      
      // Otherwise return paginated habits for this user
      const result = await ctx.db.getDailyHabits(targetUserId, input.page, input.limit);
      
      return {
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          hasMore: result.hasMore
        }
      };
    } catch (error) {
      console.error('Error fetching habits:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch habits');
    }
  });