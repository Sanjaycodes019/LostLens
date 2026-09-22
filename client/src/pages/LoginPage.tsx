import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      showToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Login failed', 'error');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Sign in to LostLens</h1>
        <p className="mt-2 text-sm text-slate-500">Campus lost & found platform</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
          <Button type="submit" loading={isSubmitting} className="w-full">Sign In</Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          No account? <Link to="/register" className="font-medium text-brand-600">Register</Link>
        </p>
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          Demo: aarav.demo@campus.edu / Demo@1234 (run npm run seed first)
        </div>
      </Card>
    </div>
  );
}
