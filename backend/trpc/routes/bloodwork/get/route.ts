import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';
import { BloodworkDocument } from '@/types/habit';

const getBloodworkSchema = z.object({
  userId: z.string().optional(), // For admin to get specific user's documents
});

export const getBloodworkProcedure = protectedProcedure
  .input(getBloodworkSchema)
  .query(async ({ input, ctx }: { input: any; ctx: any }) => {
    try {
      const { userId } = input;
      const requestingUserId = ctx.user?.id || 'demo-user';
      const isAdmin = ctx.user?.role === 'admin';
      
      // Determine which user's documents to fetch
      const targetUserId = userId && isAdmin ? userId : requestingUserId;
      
      // In a real application, you would fetch from database
      // For this demo, we'll return mock data
      const mockDocuments: BloodworkDocument[] = [
        {
          id: 'doc_1',
          userId: targetUserId,
          fileName: 'Blood_Test_Results_Jan_2024.pdf',
          fileType: 'application/pdf',
          fileSize: 2048576, // 2MB
          uploadDate: '2024-01-15T10:30:00Z',
          fileUrl: `https://storage.example.com/bloodwork/${targetUserId}/doc_1`,
        },
        {
          id: 'doc_2',
          userId: targetUserId,
          fileName: 'Lab_Report_Dec_2023.pdf',
          fileType: 'application/pdf',
          fileSize: 1536000, // 1.5MB
          uploadDate: '2023-12-20T14:45:00Z',
          fileUrl: `https://storage.example.com/bloodwork/${targetUserId}/doc_2`,
        },
        {
          id: 'doc_3',
          userId: targetUserId,
          fileName: 'Glucose_Monitoring_Chart.png',
          fileType: 'image/png',
          fileSize: 512000, // 500KB
          uploadDate: '2023-12-10T09:15:00Z',
          fileUrl: `https://storage.example.com/bloodwork/${targetUserId}/doc_3`,
        },
      ];
      
      // Sort by upload date (newest first)
      const sortedDocuments = mockDocuments.sort((a, b) => 
        new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
      
      console.log(`Fetching bloodwork documents for user: ${targetUserId}`);
      
      return {
        success: true,
        documents: sortedDocuments,
      };
    } catch (error) {
      console.error('Error fetching bloodwork documents:', error);
      throw new Error('Failed to fetch bloodwork documents');
    }
  });

export default getBloodworkProcedure;