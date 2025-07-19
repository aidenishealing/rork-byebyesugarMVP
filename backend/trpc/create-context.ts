import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  try {
    // Extract user info from headers or token (simplified for demo)
    const authHeader = opts.req.headers.get('authorization');
    
    // In a real app, you would validate the token and get user info from database
    // For demo purposes, we'll create a mock user
    // Check if this is an admin request (simplified logic)
    const isAdminRequest = authHeader?.includes('admin') || opts.req.url?.includes('/admin');
    
    const user = {
      id: isAdminRequest ? 'admin-user' : 'demo-user',
      name: isAdminRequest ? 'Admin User' : 'Demo User',
      phoneNumber: '+1234567890',
      role: (isAdminRequest ? 'admin' : 'client') as 'admin' | 'client',
    };
    
    return {
      req: opts.req,
      user,
      // You can add more context items here like database connections, auth, etc.
    };
  } catch (error) {
    console.error("Error creating tRPC context:", error);
    // Return a basic context even if there's an error
    return { 
      req: opts.req,
      user: {
        id: 'demo-user',
        name: 'Demo User',
        phoneNumber: '+1234567890',
        role: 'client' as 'admin' | 'client',
      }
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
export const protectedProcedure = t.procedure;