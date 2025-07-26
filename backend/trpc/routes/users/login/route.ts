import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export default publicProcedure
  .input(z.object({
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(1, 'Password is required'),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      const result = await ctx.db.authenticateUser(input.phoneNumber, input.password);
      
      if (!result.success) {
        throw new Error(result.error || 'Authentication failed');
      }
      
      return {
        success: true,
        message: "Login successful",
        user: result.data?.user,
        token: result.data?.token
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error instanceof Error ? error.message : 'Authentication failed');
    }
  });