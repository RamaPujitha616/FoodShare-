import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, User, Mail, Phone, Lock, Home, Landmark } from 'lucide-react';

const Register = () => {
  const { register: signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  // Pre-select role if passed in query (e.g. from homepage "Join as NGO")
  const defaultRole = searchParams.get('role') === 'ngo' ? 'ngo' : 'donor';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: defaultRole,
    },
  });

  const selectedRole = watch('role');
  const password = watch('password');

  const onSubmit = async (data) => {
    setSubmitting(true);
    const result = await signup(data);
    setSubmitting(false);

    if (result.success) {
      showToast('Registration successful! Welcome.', 'success');
      if (data.role === 'ngo') {
        navigate('/ngo');
      } else {
        navigate('/donor');
      }
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="flex min-h-[90vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8 glass p-8 rounded-2xl shadow-xl dark:border-slate-800">
        
        {/* Header */}
        <div className="text-center">
          <span className="text-4xl">🥗</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-550 dark:text-gray-400">
            Join the FoodShare+ mission to fight food waste and hunger.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <User size={18} />
                </span>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className={`block w-full rounded-xl border border-gray-250 bg-white/50 pl-10 pr-3 py-2.5 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white ${errors.name ? 'border-red-400' : ''}`}
                  {...register('name', { required: 'Name is required' })}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className={`block w-full rounded-xl border border-gray-250 bg-white/50 pl-10 pr-3 py-2.5 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white ${errors.email ? 'border-red-400' : ''}`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Phone size={18} />
                </span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+919876543210"
                  className={`block w-full rounded-xl border border-gray-250 bg-white/50 pl-10 pr-3 py-2.5 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white ${errors.phone ? 'border-red-400' : ''}`}
                  {...register('phone', { required: 'Phone is required' })}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Role Selector */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-1.5">
                Join As
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition-colors ${selectedRole === 'donor' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-350' : 'bg-white/50 border-gray-200 dark:bg-slate-800/40 dark:border-slate-750'}`}>
                  <input
                    type="radio"
                    value="donor"
                    className="accent-emerald-600"
                    {...register('role')}
                  />
                  <span className="text-sm font-semibold">Individual / Restaurant Donor</span>
                </label>
                <label className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition-colors ${selectedRole === 'ngo' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-350' : 'bg-white/50 border-gray-200 dark:bg-slate-800/40 dark:border-slate-750'}`}>
                  <input
                    type="radio"
                    value="ngo"
                    className="accent-emerald-600"
                    {...register('role')}
                  />
                  <span className="text-sm font-semibold">NGO / Volunteer Group</span>
                </label>
              </div>
            </div>

            {/* NGO Fields (Conditional) */}
            {selectedRole === 'ngo' && (
              <>
                <div className="sm:col-span-2">
                  <label htmlFor="orgName" className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-1.5">
                    Organization Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Landmark size={18} />
                    </span>
                    <input
                      id="orgName"
                      type="text"
                      placeholder="Robin Hood Army, Feeding India, etc."
                      className={`block w-full rounded-xl border border-gray-250 bg-white/50 pl-10 pr-3 py-2.5 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white ${errors.orgName ? 'border-red-400' : ''}`}
                      {...register('orgName', { required: 'Organization name is required for NGOs' })}
                    />
                  </div>
                  {errors.orgName && (
                    <p className="mt-1 text-xs text-red-500">{errors.orgName.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-1.5">
                    Organization Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-start pt-3 pl-3 text-gray-400">
                      <Home size={18} />
                    </span>
                    <textarea
                      id="address"
                      rows={2}
                      placeholder="Specify complete office/hub address..."
                      className={`block w-full rounded-xl border border-gray-250 bg-white/50 pl-10 pr-3 py-2.5 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white ${errors.address ? 'border-red-400' : ''}`}
                      {...register('address', { required: 'Address is required for NGOs' })}
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
                  )}
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`block w-full rounded-xl border border-gray-250 bg-white/50 pl-10 pr-3 py-2.5 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white ${errors.password ? 'border-red-400' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock size={18} />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className={`block w-full rounded-xl border border-gray-250 bg-white/50 pl-10 pr-3 py-2.5 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white ${errors.confirmPassword ? 'border-red-400' : ''}`}
                  {...register('confirmPassword', {
                    required: 'Confirm password is required',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="group relative flex w-full justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <span className="flex items-center gap-1.5">
                  <UserPlus size={18} /> Sign Up
                </span>
              )}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">Already have an account? </span>
            <Link
              to="/login"
              className="font-semibold text-primary-650 hover:underline dark:text-primary-450"
            >
              Log in
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Register;
