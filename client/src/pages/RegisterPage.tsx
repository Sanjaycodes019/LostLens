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
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  studentId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  });

  const onSubmit = async (data: FormData) => {
    console.log('Form submitted with data:', data);
    console.log('Validation errors:', errors);
    try {
      await registerUser(data as Record<string, string>);
      showToast('Account created!', 'success');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      showToast(err instanceof Error ? err.message : 'Registration failed', 'error');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Create account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Full Name" {...register('name')} error={errors.name?.message} />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Student ID (optional)" {...register('studentId')} />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
          <Button type="submit" loading={isSubmitting} className="w-full">Create Account</Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="font-medium text-brand-600">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
