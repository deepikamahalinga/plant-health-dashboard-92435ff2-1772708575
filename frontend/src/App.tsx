// App.tsx
import { useEffect } from 'react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useAuthStore } from '@/stores/authStore';
import MainLayout from '@/components/layouts/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Style imports
import '@/styles/globals.css';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { isAuthenticated, checkAuth } = useAuthStore();

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  return (
    <QueryClientProvider client={queryClient}>
      {isPublicRoute ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute isAuthenticated={isAuthenticated}>
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        </ProtectedRoute>
      )}
    </QueryClientProvider>
  );
}

export default MyApp;

// Route structure will be implemented in pages directory:
/*
pages/
├── index.tsx                    // Home/Dashboard
├── login.tsx                    // Login page
├── register.tsx                 // Registration page
├── forgot-password.tsx         // Password recovery
├── plants/
│   ├── index.tsx               // Plants list
│   ├── create.tsx              // Create plant
│   ├── [id]/
│   │   ├── index.tsx          // Plant details
│   │   └── edit.tsx           // Edit plant
├── 404.tsx                     // Custom 404 page
└── _error.tsx                  // Custom error page
*/

// Types for route protection
declare module 'next' {
  interface NextPageWithLayout {
    requireAuth?: boolean;
    layout?: React.ComponentType;
  }
}

declare module 'next/app' {
  type AppPropsWithLayout = AppProps & {
    Component: NextPageWithLayout;
  };
}