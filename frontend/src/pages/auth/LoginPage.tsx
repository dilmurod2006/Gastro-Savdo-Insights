import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { Button, Input } from '@/components/ui';
import { LayoutDashboard, ArrowRight, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export const LoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { login, requires2FA } = useAuth();
  
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  // Form Handlers
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!formData.username.trim()) newErrors.username = 'Foydalanuvchi nomi kiritilishi shart';
    if (!formData.password) newErrors.password = 'Parol kiritilishi shart';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await login(formData);
      if (response.requires_2fa) {
        toast.success('Xavfsizlik kodi yuborildi');
        navigate('/2fa-verify');
      } else {
        toast.success('Xush kelibsiz!');
        navigate('/dashboard');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ detail: string }>;
      const message = axiosError.response?.data?.detail || 'Login yoki parol xato';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (requires2FA) {
    navigate('/2fa-verify');
    return <></>;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-900/20 rounded-full blur-[120px] opacity-40 animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      <div className="w-full max-w-md p-4 relative z-10 animate-fade-in-up">
        {/* Logo Section */}
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-primary-500 to-primary-700 rounded-2xl shadow-xl shadow-primary-500/30 mb-6 transform hover:scale-105 transition-transform duration-300">
             <LayoutDashboard size={32} className="text-white" />
           </div>
           <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
             Gastro Insights
           </h1>
           <p className="text-slate-400 text-sm font-medium">
             Tizimga xavfsiz kirish
           </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Foydalanuvchi nomi</label>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="admin"
                  error={errors.username}
                  autoFocus
                  className="h-12 bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-primary-500/20 transition-all"
                />
              </div>
              
              <div className="relative">
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Parol</label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  error={errors.password}
                  className="h-12 bg-slate-900/60 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary-500 focus:ring-primary-500/20 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              size="lg"
              className="h-12 text-base font-semibold bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 border-0 transition-all duration-300 group mt-2"
            >
              <span className="mr-2">Kirish</span>
              {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col items-center gap-4 text-center">
             <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
               <Lock size={12} />
               <span>256-bit xavfsiz shifrlash</span>
             </div>
             <p className="text-xs text-slate-600">
               © 2026 Gastro Savdo
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
