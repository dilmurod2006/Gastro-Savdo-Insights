import { TwoFactorForm } from '@/components';

/**
 * Two Factor Verification Page
 */
export const TwoFactorPage = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full">
        <TwoFactorForm />
      </div>
    </div>
  );
};
