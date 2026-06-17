import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Mail, ArrowLeft, Send, AlertCircle } from 'lucide-react';

const ForgotPassword = () => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [resetInfo, setResetInfo] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await axios.post('/api/auth/forgot-password', { email: data.email });
      setSubmitting(false);
      if (res.data.success) {
        showToast('Password reset link generated!', 'success');
        setResetInfo(res.data);
      }
    } catch (error) {
      setSubmitting(false);
      showToast(error.response?.data?.message || 'Error executing forgot password request.', 'error');
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass p-8 rounded-2xl shadow-xl dark:border-slate-800">
        
        {/* Header */}
        <div className="text-center">
          <span className="text-4xl">🔑</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-gray-550 dark:text-gray-400 font-medium leading-relaxed px-4">
            Enter your email address and we'll generate a password reset link.
          </p>
        </div>

        {/* Info Card / Simulated Email */}
        {resetInfo && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-2.5 dark:border-blue-900/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider">Simulated Email Output</span>
            </div>
            <p className="text-xs leading-relaxed">
              Since email servers are optional, the backend generated a reset link directly for testing:
            </p>
            <div className="bg-white/80 dark:bg-slate-900/80 p-2 rounded border border-blue-150 dark:border-blue-900 text-xs select-all break-all font-mono">
              <Link to={`/reset-password/${resetInfo.resetToken}`} className="text-primary-650 hover:underline dark:text-primary-400">
                {resetInfo.resetUrl}
              </Link>
            </div>
            <p className="text-[10px] text-gray-450 dark:text-gray-500 italic">
              Click the link above to proceed with your password reset.
            </p>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                className={`block w-full rounded-xl border border-gray-250 bg-white/50 pl-10 pr-3 py-3 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-white ${errors.email ? 'border-red-400' : ''}`}
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

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="group relative flex w-full justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Send size={18} /> Generate Link
                </span>
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
      </div>
    </div>
  );
};

export default ForgotPassword;
