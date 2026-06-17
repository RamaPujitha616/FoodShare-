import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await axios.post(`/api/auth/reset-password/${token}`, {
        password: data.password,
      });
      setSubmitting(false);
      if (res.data.success) {
        showToast('Password reset successful!', 'success');
        setSuccess(true);
      }
    } catch (error) {
      setSubmitting(false);
      showToast(error.response?.data?.message || 'Token is invalid or has expired', 'error');
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass p-8 rounded-2xl shadow-xl dark:border-slate-800">
        
        {/* Header */}
        <div className="text-center">
          <span className="text-4xl">🔐</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-gray-550 dark:text-gray-400">
            Set a new password for your FoodShare+ account.
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center pt-4">
            <div className="flex justify-center text-emerald-500">
              <CheckCircle size={64} className="animate-bounce" />
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">
              Your password has been successfully reset! You can now log in with your new credentials.
            </p>
            <Link
              to="/login"
              className="flex w-full justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 shadow-md"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-400 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Lock size={18} />
                  </span>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className={`block w-full rounded-xl border border-gray-250 bg-white/50 pl-10 pr-3 py-3 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white ${errors.password ? 'border-red-400' : ''}`}
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

              {/* Confirm New Password */}
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
                    className={`block w-full rounded-xl border border-gray-250 bg-white/50 pl-10 pr-3 py-3 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white ${errors.confirmPassword ? 'border-red-400' : ''}`}
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

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="group relative flex w-full justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 text-sm font-bold text-gray-550 hover:text-gray-700 dark:text-slate-450 dark:hover:text-slate-200"
              >
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
