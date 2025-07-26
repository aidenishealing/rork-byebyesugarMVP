import { z } from "zod";
import { protectedProcedure, adminProcedure } from "@/backend/trpc/create-context";

// Get all clients (admin only)
export const listClientsRoute = adminProcedure
  .input(z.object({
    page: z.number().min(1).optional().default(1),
    limit: z.number().min(1).max(100).optional().default(20),
    search: z.string().optional(),
  }))
  .query(async ({ input, ctx }) => {
    try {
      const clients = await ctx.db.getAllClients(ctx.user.id);
      
      // Filter by search if provided
      let filteredClients = clients;
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        filteredClients = clients.filter(client => 
          client.name.toLowerCase().includes(searchLower) ||
          client.phoneNumber.includes(input.search!)
        );
      }
      
      // Paginate results
      const total = filteredClients.length;
      const startIndex = (input.page - 1) * input.limit;
      const endIndex = startIndex + input.limit;
      const paginatedClients = filteredClients.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedClients,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          hasMore: endIndex < total
        }
      };
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw new Error('Failed to fetch clients');
    }
  });

// Get single client details
export const getClientRoute = protectedProcedure
  .input(z.object({
    clientId: z.string(),
  }))
  .query(async ({ input, ctx }) => {
    try {
      // Check permissions
      if (ctx.user.role === 'client' && ctx.user.id !== input.clientId) {
        throw new Error('Access denied');
      }
      
      if (ctx.user.role === 'admin') {
        const adminClients = await ctx.db.getAllClients(ctx.user.id);
        const hasAccess = adminClients.some(client => client.id === input.clientId);
        if (!hasAccess) {
          throw new Error('Access denied');
        }
      }
      
      const client = await ctx.db.getClientById(input.clientId);
      if (!client) {
        throw new Error('Client not found');
      }
      
      return {
        success: true,
        data: client
      };
    } catch (error) {
      console.error('Error fetching client:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch client');
    }
  });

// Update client profile
export const updateClientRoute = protectedProcedure
  .input(z.object({
    clientId: z.string(),
    name: z.string().min(2).optional(),
    phoneNumber: z.string().min(10).optional(),
    profileData: z.object({
      age: z.number().min(1).max(150).optional(),
      weight: z.number().min(1).max(1000).optional(),
      height: z.number().min(1).max(300).optional(),
      medicalConditions: z.array(z.string()).optional(),
      goals: z.array(z.string()).optional(),
    }).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      // Check permissions
      if (ctx.user.role === 'client' && ctx.user.id !== input.clientId) {
        throw new Error('Access denied');
      }
      
      if (ctx.user.role === 'admin') {
        const adminClients = await ctx.db.getAllClients(ctx.user.id);
        const hasAccess = adminClients.some(client => client.id === input.clientId);
        if (!hasAccess) {
          throw new Error('Access denied');
        }
      }
      
      const client = await ctx.db.getClientById(input.clientId);
      if (!client) {
        throw new Error('Client not found');
      }
      
      const updates: any = {};
      if (input.name) updates.name = input.name;
      if (input.phoneNumber) updates.phoneNumber = input.phoneNumber;
      if (input.profileData) {
        updates.profileData = { ...client.profileData, ...input.profileData };
      }
      
      const result = await ctx.db.updateUser(input.clientId, updates, ctx.user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update client');
      }
      
      return {
        success: true,
        data: result.data,
        message: 'Client updated successfully'
      };
    } catch (error) {
      console.error('Error updating client:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update client');
    }
  });

// Assign client to admin
export const assignClientRoute = adminProcedure
  .input(z.object({
    clientId: z.string(),
    adminId: z.string().optional(), // If not provided, assign to current admin
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      const adminId = input.adminId || ctx.user.id;
      
      const result = await ctx.db.assignClientToAdmin(input.clientId, adminId, ctx.user.id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to assign client');
      }
      
      return {
        success: true,
        data: result.data,
        message: 'Client assigned successfully'
      };
    } catch (error) {
      console.error('Error assigning client:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to assign client');
    }
  });

export default {
  list: listClientsRoute,
  get: getClientRoute,
  update: updateClientRoute,
  assign: assignClientRoute,
};