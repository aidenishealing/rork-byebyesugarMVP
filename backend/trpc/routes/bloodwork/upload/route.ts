import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

const uploadBloodworkSchema = z.object({
  userId: z.string().optional(), // For admin uploading on behalf of client
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().positive('File size must be positive'),
  fileData: z.string().min(1, 'File data is required'),
});

export const uploadBloodworkProcedure = protectedProcedure
  .input(uploadBloodworkSchema)
  .mutation(async ({ input, ctx }) => {
    try {
      const { fileName, fileType, fileSize, fileData, userId } = input;
      
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
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(fileType)) {
        throw new Error('Invalid file type. Only PDF, DOCX, TXT, JPEG, and PNG files are allowed.');
      }
      
      // Validate file size (10MB limit as specified)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (fileSize > maxSize) {
        throw new Error('File size exceeds 10MB limit. Please select a smaller file.');
      }
      
      // Log file processing info
      console.log(`Processing file: ${fileName}, size: ${fileSize} bytes, base64 length: ${fileData.length}`);
      
      // Simulate file URL (in production, this would be the actual storage URL)
      const fileUrl = `https://storage.example.com/bloodwork/${targetUserId}/${Date.now()}`;
      
      const result = await ctx.db.saveBloodworkDocument(
        {
          userId: targetUserId,
          fileName,
          fileType,
          fileSize,
          uploadDate: new Date().toISOString(),
          fileUrl,
          fileData, // Store base64 data for demo
        },
        ctx.user.id
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to upload bloodwork document');
      }
      
      return {
        success: true,
        data: result.data,
        message: 'Bloodwork document uploaded successfully',
      };
    } catch (error) {
      console.error('Error uploading bloodwork document:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload bloodwork document');
    }
  });

export default uploadBloodworkProcedure;