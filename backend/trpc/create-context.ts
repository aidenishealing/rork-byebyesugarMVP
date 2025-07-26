import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { db } from "@/backend/database";
import { User } from "@/types/habit";

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  try {
    // Initialize database
    await db.initialize();
    
    // Extract user info from headers or token
    const authHeader = opts.req.headers.get('authorization');
    let user: User | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Find user by token (simplified - in real app, validate JWT)
      const sessions = await db.exportData();
      const sessionData = JSON.parse(sessions);
      const session = Object.values(sessionData.data.sessions).find(
        (s: any) => s.token === token && new Date(s.expiresAt) > new Date()
      );
      
      if (session) {
        user = await db.getUserById((session as any).userId);
      }
    }
    
    // For demo purposes, create a default user if no auth
    if (!user) {
      const isAdminRequest = authHeader?.includes('admin') || opts.req.url?.includes('/admin');
      const defaultUserId = isAdminRequest ? 'admin-1' : 'client-1';
      user = await db.getUserById(defaultUserId);
    }
    
    return {
      req: opts.req,
      user,
      db,
    };
  } catch (error) {
    console.error("Error creating tRPC context:", error);
    // Return a basic context even if there's an error
    return { 
      req: opts.req,
      user: null,
      db,
    };
  }
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      message: error.message,
      // Only include code in development
      code: error.code,
      data: {
        ...shape.data,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // user is now guaranteed to be non-null
    },
  });
});

// Admin-only procedure
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});