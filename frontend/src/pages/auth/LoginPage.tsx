import { ReactNode } from 'react';
import { LoginForm } from '@/components';

interface AuthLayoutProps {
  children?: ReactNode;
}

/**
 * Auth Layout - Background and centering for auth pages
 */
export const AuthLayout = ({ children }: AuthLayoutProps): JSX.Element => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full">
        {children}
      </div>
    </div>
  );
};

/**
 * Login Page
 */
export const LoginPage = (): JSX.Element => {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};
