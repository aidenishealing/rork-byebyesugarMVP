import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";

export default publicProcedure
  .input(z.object({
    phoneNumber: z.string(),
    password: z.string(),
  }))
  .mutation(async ({ input }) => {
    // In a real app, this would validate credentials against a database
    // For now, we'll just check against hardcoded values
    
    if (input.phoneNumber === "+1234567890" && input.password === "iamgod123") {
      return {
        success: true,
        user: {
          id: "admin-1",
          name: "Admin User",
          phoneNumber: "+1234567890",
          role: "admin" as const,
        }
      };
    } else if (input.phoneNumber === "+0987654321" && input.password === "client123") {
      return {
        success: true,
        user: {
          id: "client-1",
          name: "Test Client",
          phoneNumber: "+0987654321",
          role: "client" as const,
        }
      };
    }
    
    return {
      success: false,
      message: "Invalid credentials"
    };
  });