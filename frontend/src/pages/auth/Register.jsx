import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name is too short'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      await registerUser({
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        role: 'student'
      });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try a different email.');
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
          <label className="text-sm font-medium ml-1">Full Name</label>
          <Input
            type="text"
            placeholder="John Doe"
            icon={User}
            error={errors.full_name?.message}
            {...register('full_name')}
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium ml-1">Email Address</label>
          <Input
            type="email"
            placeholder="john@example.com"
            icon={Mail}
            error={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium ml-1">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password?.message}
            {...register('password')}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium ml-1">Confirm Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.confirm_password?.message}
            {...register('confirm_password')}
          />
        </div>

        <Button type="submit" className="w-full" isLoading={loading}>
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default Register;
