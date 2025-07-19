import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from "react-native";

export const trpc = createTRPCReact<AppRouter>();

// Get the base URL for the API
const getBaseUrl = () => {
  // Use different URLs based on platform
  if (Platform.OS === 'web') {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://localhost:3000';
  }
  
  // For native platforms, use localhost
  return 'http://localhost:3000';
};

// Create a standalone client for use outside of React components
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});