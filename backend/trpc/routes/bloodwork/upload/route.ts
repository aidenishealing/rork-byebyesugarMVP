import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { BloodworkDocument } from '@/types/habit';

const uploadBloodworkSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().min(1, 'File type is required'),
  fileSize: z.number().positive('File size must be positive'),
  fileData: z.string().min(1, 'File data is required'),
});

export const uploadBloodworkProcedure = protectedProcedure
  .input(uploadBloodworkSchema)
  .mutation(async ({ input, ctx }: { input: any; ctx: any }) => {
    try {
      const { fileName, fileType, fileSize, fileData } = input;
      const userId = ctx.user?.id || 'demo-user';
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(fileType)) {
        throw new Error('Invalid file type. Only PDF, DOCX, TXT, JPEG, and PNG files are allowed.');
      }
      
      // Validate file size (5MB limit for better compatibility)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (fileSize > maxSize) {
        throw new Error('File size exceeds 5MB limit.');
      }
      
      // Validate base64 data length to prevent memory issues
      // Base64 encoding increases size by ~33%, so 5MB file becomes ~6.7MB
      if (fileData.length > 7 * 1024 * 1024) { // ~7MB base64 limit for 5MB files
        throw new Error('File data too large for processing.');
      }
      
      // Log file processing info
      console.log(`Processing file: ${fileName}, size: ${fileSize} bytes, base64 length: ${fileData.length}`);
      
      // In a real application, you would:
      // 1. Save the file to a secure storage service (AWS S3, Google Cloud Storage, etc.)
      // 2. Store the document metadata in a database
      // 3. Return the document information
      
      // For this demo, we'll simulate the upload process
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const uploadDate = new Date().toISOString();
      
      // Simulate file URL (in production, this would be the actual storage URL)
      const fileUrl = `https://storage.example.com/bloodwork/${userId}/${documentId}`;
      
      const document: BloodworkDocument = {
        id: documentId,
        userId,
        fileName,
        fileType,
        fileSize,
        uploadDate,
        fileUrl,
      };
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, save to database here
      console.log('Bloodwork document uploaded successfully:', {
        id: document.id,
        fileName: document.fileName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        uploadDate: document.uploadDate
      });
      
      return {
        success: true,
        document,
        message: 'Bloodwork document uploaded successfully',
      };
    } catch (error) {
      console.error('Error uploading bloodwork document:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to upload bloodwork document');
    }
  });

export default uploadBloodworkProcedure;