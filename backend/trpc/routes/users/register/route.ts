import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export default publicProcedure
  .input(z.object({
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.enum(['client', 'admin']).optional().default('client'),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      const result = await ctx.db.createUser(
        {
          name: input.name,
          phoneNumber: input.phoneNumber,
          role: input.role,
          isActive: true
        },
        input.password
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }
      
      // Auto-login after registration
      const authResult = await ctx.db.authenticateUser(input.phoneNumber, input.password);
      
      return {
        success: true,
        message: "User registered successfully",
        user: result.data,
        token: authResult.success ? authResult.data?.token : undefined
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  });