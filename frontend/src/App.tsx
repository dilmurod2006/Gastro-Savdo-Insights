import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, ThemeProvider, SidebarProvider } from '@/contexts';
import { router } from '@/routes';

/**
 * Main Application Component
 */
function App(): JSX.Element {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SidebarProvider>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
