import { useState, FormEvent, ChangeEvent, useRef, useEffect, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { Button, Card } from '@/components/ui';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

const OTP_LENGTH = 6;

/**
 * Two Factor Verification Form Component
 * Handles OTP input for 2FA verification
 */
export const TwoFactorForm = (): JSX.Element => {
  const navigate = useNavigate();
  const { verify2FA, requires2FA, clearTempToken } = useAuth();
  
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no temp token
  useEffect(() => {
    if (!requires2FA) {
      navigate('/login');
    }
  }, [requires2FA, navigate]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle OTP input change
  const handleChange = (index: number, value: string): void => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key down events
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, OTP_LENGTH);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, index) => {
      if (index < OTP_LENGTH) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or last input
    const focusIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    const otpCode = otp.join('');
    
    if (otpCode.length !== OTP_LENGTH) {
      toast.error('Iltimos, to\'liq OTP kodni kiriting');
      return;
    }

    setIsLoading(true);

    try {
      await verify2FA(otpCode);
      toast.success('Muvaffaqiyatli tasdiqlandi!');
      navigate('/dashboard');
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      const message = axiosError.response?.data?.detail || 'OTP tasdiqlashda xatolik';
      toast.error(message);
      // Clear OTP on error
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = (): void => {
    clearTempToken();
    navigate('/login');
  };

  return (
    <Card className="w-full max-w-md mx-auto p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Ikki bosqichli tasdiqlash
        </h1>
        <p className="text-gray-600">
          Telegram orqali yuborilgan 6 xonali kodni kiriting
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg
                focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none
                transition-colors duration-200"
              disabled={isLoading}
            />
          ))}
        </div>

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          size="lg"
        >
          Tasdiqlash
        </Button>

        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={handleCancel}
          disabled={isLoading}
        >
          Bekor qilish
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Kod kelmadimi? Telegram ilovangizni tekshiring
      </p>
    </Card>
  );
};
