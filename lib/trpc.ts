import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

// Get the base URL for the API
const getBaseUrl = () => {
  // Use different URLs based on platform and environment
  if (Platform.OS === 'web') {
    // In production (deployed), use the current domain
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return window.location.origin;
    }
    // In development, use the environment variable or localhost
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://localhost:3000';
  }
  
  // For native platforms, use localhost or tunnel URL
  return process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://localhost:3000';
};

// Create a standalone client for use outside of React components
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        try {
          const response = await fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            console.error(`HTTP ${response.status}: ${response.statusText}`);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          return response;
        } catch (error) {
          console.error('tRPC fetch error:', error);
          if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error('Failed to fetch - please check your internet connection');
          }
          throw error;
        }
      },
    }),
  ],
});