import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { Button, Input, Card } from '@/components/ui';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface LoginFormData {
  username: string;
  password: string;
}

/**
 * Login Form Component
 * Handles user login with 2FA support
 */
export const LoginForm = (): JSX.Element => {
  const navigate = useNavigate();
  const { login, requires2FA } = useAuth();
  
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Foydalanuvchi nomi kiritilishi shart';
    }

    if (!formData.password) {
      newErrors.password = 'Parol kiritilishi shart';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Parol kamida 4 ta belgidan iborat bo\'lishi kerak';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await login(formData);

      if (response.requires_2fa) {
        toast.success('OTP kod Telegram orqali yuborildi');
        navigate('/2fa-verify');
      } else {
        toast.success('Muvaffaqiyatli kirildi!');
        navigate('/dashboard');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      const message = axiosError.response?.data?.detail || 'Login xatosi yuz berdi';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // If 2FA is required, redirect
  if (requires2FA) {
    navigate('/2fa-verify');
    return <></>;
  }

  return (
    <Card className="w-full max-w-md mx-auto p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Gastro Analytics
        </h1>
        <p className="text-gray-600">Admin paneliga kirish</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Foydalanuvchi nomi"
          name="username"
          type="text"
          placeholder="username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          autoComplete="username"
          autoFocus
        />

        <Input
          label="Parol"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          size="lg"
        >
          Kirish
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Muammo bo'lsa, administrator bilan bog'laning
      </p>
    </Card>
  );
};
