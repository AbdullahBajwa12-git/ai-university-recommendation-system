import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const user = await login(data.email, data.password);
      import('react-hot-toast').then(({ toast }) => {
        toast.success('Welcome back.');
      });
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-lg text-center">
            {error}
          </div>
        )}
        
        <div className="space-y-1">
          <label className="text-sm font-medium ml-1">Email Address</label>
          <Input
            type="email"
            placeholder="name@university.edu"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center px-1">
            <label className="text-sm font-medium">Password</label>
            <Link to="/forgot-password" size="xs" className="text-xs text-primary hover:underline">
              Forgot?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <Button type="submit" className="w-full" isLoading={loading}>
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Create Account
        </Link>
      </p>
    </div>
  );
};

export default Login;
