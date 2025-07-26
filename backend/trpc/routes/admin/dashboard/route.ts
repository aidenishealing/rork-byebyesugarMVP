import { z } from "zod";
import { adminProcedure } from "@/backend/trpc/create-context";

export const adminDashboardRoute = adminProcedure
  .input(z.object({
    dateRange: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
  }))
  .query(async ({ input, ctx }) => {
    try {
      const dashboardData = await ctx.db.getAdminDashboardData(ctx.user.id);
      
      return {
        success: true,
        data: dashboardData
      };
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    }
  });

export default adminDashboardRoute;