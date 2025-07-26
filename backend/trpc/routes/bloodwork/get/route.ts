import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

const getBloodworkSchema = z.object({
  userId: z.string().optional(), // For admin to get specific user's documents
});

export const getBloodworkProcedure = protectedProcedure
  .input(getBloodworkSchema)
  .query(async ({ input, ctx }) => {
    try {
      const { userId } = input;
      
      // Determine target user ID
      const targetUserId = userId || ctx.user.id;
      
      // Check permissions
      if (ctx.user.role === 'client' && targetUserId !== ctx.user.id) {
        throw new Error('Access denied');
      }
      
      if (ctx.user.role === 'admin' && userId) {
        const adminClients = await ctx.db.getAllClients(ctx.user.id);
        const hasAccess = adminClients.some(client => client.id === userId);
        if (!hasAccess) {
          throw new Error('Access denied');
        }
      }
      
      const documents = await ctx.db.getBloodworkDocuments(targetUserId);
      
      console.log(`Fetching bloodwork documents for user: ${targetUserId}`);
      
      return {
        success: true,
        data: documents,
      };
    } catch (error) {
      console.error('Error fetching bloodwork documents:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch bloodwork documents');
    }
  });

export default getBloodworkProcedure;