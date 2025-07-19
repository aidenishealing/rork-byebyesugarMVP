import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 500,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after a short delay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(err => {
        console.warn("Error hiding splash screen:", err);
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // Use a more reliable way to determine the API URL
  const apiUrl = Platform.select({
    web: process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://localhost:3000',
    default: 'http://localhost:3000', // For native, we'll use localhost
  });

  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: `${apiUrl}/api/trpc`,
        transformer: superjson,
      }),
    ],
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="client" options={{ headerShown: false }} />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
            <Stack.Screen name="chat" options={{ headerShown: false }} />
            <Stack.Screen name="admin/client/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="admin/client/[id]/add-habit" options={{ headerShown: false }} />
            <Stack.Screen name="admin/client/[id]/edit-habit/[date]" options={{ headerShown: false }} />
            <Stack.Screen name="admin/add-client" options={{ headerShown: false }} />
          </Stack>
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );
}