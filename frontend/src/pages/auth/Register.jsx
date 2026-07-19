import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import StudyRouteLogo from '../../assets/brand/studyroute-logo-light.svg';
import StudyRouteMark from '../../assets/brand/studyroute-logo-mark.svg';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const fadeInUpLeft = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 1.0, ease: 'easeOut' } },
};

const staggerContainerLeft = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.35,
    },
  },
};

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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      import('react-hot-toast').then(({ toast }) => {
        toast.success('Account created successfully!');
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full flex flex-col lg:flex-row font-sans bg-slate-900 min-h-[100dvh] lg:h-[100dvh] lg:overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/images/hero-bg(1).jpg"
          alt="University campus"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/60 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/50 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent lg:hidden"></div>
      </div>

      {/* Left Content Area (55-60%) */}
      <motion.div
        variants={staggerContainerLeft}
        initial="initial"
        animate="animate"
        className="relative z-10 flex flex-col w-full lg:w-[60%] px-5 pt-6 pb-4 sm:p-6 md:p-10 lg:p-12 xl:px-20 xl:py-16 h-auto min-h-0 flex-none lg:h-full"
      >
        {/* Top: Logo */}
        <motion.div variants={fadeInUpLeft}>
          <img
            src={StudyRouteLogo}
            alt="StudyRoute"
            className="h-8 md:h-10 w-auto"
          />
        </motion.div>

        {/* Inner Flex Wrapper for Editorial and Stats */}
        <div className="lg:flex lg:flex-1 lg:flex-col lg:justify-center">
          {/* Middle: Editorial Content */}
          <motion.div variants={fadeInUpLeft} className="mt-8 lg:mt-0 max-w-xl">
            <p className="text-white/80 text-xs font-bold tracking-[0.2em] uppercase mb-3 lg:mb-4">
              Start your university planning journey
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-editorial text-white font-semibold leading-[1.1] mb-3 lg:mb-5">
              Your future starts here.
            </h1>
            <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed max-w-lg font-light">
              Create one academic profile and discover universities that truly match your goals and ambitions.
            </p>
          </motion.div>

          {/* Bottom: Trust Indicators */}
          <motion.div variants={fadeInUpLeft} className="flex flex-row gap-4 sm:gap-6 md:gap-10 mt-3 lg:mt-8 items-center">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-2xl md:text-3xl font-editorial text-white font-semibold">70+</span>
              <span className="text-white/70 text-[11px] sm:text-xs leading-tight max-w-[100px]">destinations</span>
            </div>
            <div className="h-8 sm:h-10 w-px bg-white/20"></div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-2xl md:text-3xl font-editorial text-white font-semibold">Verified</span>
              <span className="text-white/70 text-[11px] sm:text-xs leading-tight max-w-[100px]">records-first</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Content Area (White Card) (34-40%) */}
      <div className="relative z-10 w-full lg:w-[40%] flex items-center justify-center p-[clamp(12px,3vh,16px)] sm:p-6 lg:p-8 lg:h-full">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="w-full max-w-[420px] bg-white rounded-[1.5rem] shadow-2xl shadow-black/20 border border-slate-100 p-[clamp(20px,5vw,24px)] sm:p-8 lg:px-8 lg:py-4 flex flex-col max-h-none lg:max-h-[calc(100dvh-48px)] overflow-y-auto custom-scrollbar"
        >
          <motion.div variants={fadeInUp} className="mb-0 shrink-0">
            <h2 className="font-editorial text-slate-900 font-semibold leading-tight flex flex-col">
              <span className="text-lg sm:text-xl text-slate-600 font-medium">Join</span>
              <span className="text-2xl sm:text-[1.75rem] mt-1 lg:mt-1.5 mb-1 lg:mb-1 flex items-center gap-2">
                <img src={StudyRouteMark} alt="" className="h-[1em] w-auto text-slate-900" />
                StudyRoute
              </span>
            </h2>
            <p className="text-slate-500 text-sm font-medium mb-[clamp(8px,2vh,12px)] lg:mb-2">
              Your Profile. Your Decision. Your Journey.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-2 lg:space-y-1 flex-1 flex flex-col justify-center">
            {error && (
              <div className="p-2 text-sm font-medium text-destructive bg-destructive/10 rounded-xl text-center">
                {error}
              </div>
            )}

            <motion.div variants={fadeInUp} className="space-y-1">
              <label htmlFor="full_name" className="text-sm font-medium text-slate-700 ml-1">Full Name</label>
              <Input
                id="full_name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                icon={User}
                error={errors.full_name?.message}
                {...register('full_name')}
                className="h-11 lg:h-10 bg-slate-50/50"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                icon={Mail}
                error={errors.email?.message}
                {...register('email')}
                className="h-11 lg:h-10 bg-slate-50/50"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-slate-700 ml-1">Password</label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                icon={Lock}
                error={errors.password?.message}
                {...register('password')}
                className="h-11 lg:h-10 bg-slate-50/50"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-1">
              <label htmlFor="confirm_password" className="text-sm font-medium text-slate-700 ml-1">Confirm Password</label>
              <Input
                id="confirm_password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                icon={Lock}
                error={errors.confirm_password?.message}
                {...register('confirm_password')}
                className="h-11 lg:h-10 bg-slate-50/50"
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="pt-1">
              <Button
                type="submit"
                className="w-full h-11 lg:h-10 text-base lg:text-sm font-semibold bg-gradient-to-r from-blue-600 via-teal-500 to-blue-600 animate-gradient-shift text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-1 border-0 flex items-center justify-center gap-2 group transition-all"
                isLoading={loading}
              >
                Create Account
                {!loading && <ArrowRight className="w-5 h-5 lg:w-4 lg:h-4 transition-transform group-hover:translate-x-1" />}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={fadeInUp} className="mt-3 flex items-center gap-4 lg:mt-2 shrink-0">
            <div className="h-px bg-slate-100 flex-1"></div>
            <span className="text-slate-400 text-xs font-medium">or</span>
            <div className="h-px bg-slate-100 flex-1"></div>
          </motion.div>

          <motion.div variants={fadeInUp} className="mt-3 lg:mt-2 w-full block shrink-0">
            <Link to="/login" className="w-full block">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 lg:h-10 text-slate-700 lg:text-sm font-semibold border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors bg-white shadow-sm"
              >
                Sign into your account
              </Button>
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default Register;
