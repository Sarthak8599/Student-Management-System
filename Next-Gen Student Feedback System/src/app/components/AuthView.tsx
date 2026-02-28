import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { GlassCard } from './ui/GlassCard';
import { toast } from 'sonner';
import { Role, Department } from '../types';
import { motion } from 'motion/react';
import { BookOpen, Shield, User, GraduationCap, Lock, Mail, Building, ArrowLeft, KeyRound } from 'lucide-react';
import { setUserRole } from '../utils/storage';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

type AuthState = 'login' | 'signup' | 'forgot-password' | 'verify-otp' | 'reset-password' | 'verify-email';

export const AuthView = () => {
  const [view, setView] = useState<AuthState>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('student');
  const [department, setDepartment] = useState<Department>('CS');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const COOLDOWN_SECONDS = 60;
  const COOLDOWN_KEY = 'lastEmailSentAt';

  useEffect(() => {
    // Check for existing cooldown on mount
    const lastSent = localStorage.getItem(COOLDOWN_KEY);
    if (lastSent) {
      const elapsed = Math.floor((Date.now() - parseInt(lastSent)) / 1000);
      const remaining = Math.max(0, COOLDOWN_SECONDS - elapsed);
      if (remaining > 0) {
        setCountdown(remaining);
      }
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const departments: Department[] = ['CS', 'AIML', 'ENTC', 'CHEMICAL'];

  // Resend verification email
  const handleResendVerification = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-40c29f38/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend verification');
      }

      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      if (error.message?.includes('Email not confirmed') || 
          error.message?.includes('email confirmation') ||
          error.message?.includes('Invalid login credentials') && view === 'login') {
        setAuthError('Email not confirmed. Please check your inbox and confirm your email address.');
      } else {
        setAuthError(error.message || 'Authentication failed');
      }
      toast.error(error.message);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === 'login') {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Send login notification email
        try {
          const deviceInfo = navigator.userAgent.substring(0, 100);
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-40c29f38/login-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              email,
              timestamp: new Date().toISOString(),
              device: deviceInfo
            }),
          });
        } catch (notifyError) {
          // Silent fail - don't block login if notification fails
          console.log('Login notification failed:', notifyError);
        }
        
        toast.success('Welcome back!');
        // Redirect to dashboard after successful login
        window.location.href = '/dashboard';
      } else if (view === 'signup') {
        // Use server endpoint for signup to bypass email confirmation
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-40c29f38/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email,
            password,
            data: {
              name,
              role,
              department: role === 'student' ? department : undefined,
            },
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create account');
        }

        const user = result.user;
        
        // Also save to KV store for redundancy/admin listing
        if (user) {
           await setUserRole({
             id: user.id,
             email: user.email!,
             name: name,
             role: role,
             department: role === 'student' ? department : undefined,
           });
        }

        toast.success('Account created! Please check your email for verification code.');
        setView('verify-email');
      } else if (view === 'verify-email') {
        // Use Supabase's built-in resend verification
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email,
        });
        
        if (error) throw error;
        toast.success('Verification email sent! Please check your inbox.');
        setView('login');
      } else if (view === 'forgot-password') {
        // Check cooldown before sending
        if (countdown > 0) {
          setAuthError(`Please wait ${countdown} seconds before requesting another reset link.`);
          return;
        }
        
        // Send magic link for password reset
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/auth/callback?type=recovery'
        });
        if (error) throw error;
        
        // Start cooldown timer
        localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
        setCountdown(COOLDOWN_SECONDS);
        
        toast.success('Password reset link sent to your email!');
        setView('verify-email');
      } else if (view === 'verify-otp') {
        // Verify OTP
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'email'
        });
        
        if (error) throw error;
        toast.success('Verified! Please set a new password.');
        setView('reset-password');
      } else if (view === 'reset-password') {
        // Update Password
        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (error) throw error;
        toast.success('Password updated successfully!');
        // Redirect to dashboard after password reset
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.log('Auth error:', error.message, error.name); // Debug log
      if (error.message?.includes('email rate limit exceeded')) {
        setAuthError('Too many password reset attempts. Please try again later.');
      } else if (error.message?.includes('Email not confirmed') || 
          error.message?.includes('email confirmation') ||
          error.message?.includes('Email address not confirmed') ||
          error.message?.includes('User email not verified')) {
        setAuthError('Email not confirmed. Please check your inbox and confirm your email address.');
      } else if (error.name === 'AuthApiError' || error?.constructor?.name === 'AuthApiError') {
        // For all other Supabase AuthApiError messages
        setAuthError(error.message);
      } else {
        // Generic fallback for any other unexpected errors
        setAuthError(error.message || 'An unexpected error occurred. Please try again.');
      }
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD] p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#E9E6F7]/60 blur-3xl" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#CFE7F5]/50 blur-3xl" />
        <div className="absolute -bottom-[10%] left-[30%] w-[35%] h-[35%] rounded-full bg-[#C8BFE7]/40 blur-3xl" />
      </div>

      <GlassCard className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-gradient-to-br from-[#7A6AD8] to-[#5B4FCF] rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-[#7A6AD8]/30"
          >
            <GraduationCap className="text-white w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-bold text-[#2E2E4D] mb-2">
            {view === 'login' && 'Welcome Back'}
            {view === 'signup' && 'Join EduPulse'}
            {view === 'forgot-password' && 'Reset Password'}
            {view === 'verify-otp' && 'Enter OTP'}
            {view === 'reset-password' && 'New Password'}
            {view === 'verify-email' && 'Verify Your Email'}
          </h1>
          <p className="text-[#6B6B8A]">
            {view === 'login' && 'Sign in to access your dashboard'}
            {view === 'signup' && 'Create an account to get started'}
            {view === 'forgot-password' && 'Select your role and enter email to receive a password reset link'}
            {view === 'verify-otp' && 'Check your email for the verification code'}
            {view === 'reset-password' && 'Enter your new secure password'}
            {view === 'verify-email' && 'Please check your email for the verification code'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {(view === 'signup' || view === 'forgot-password') && (
            <div className="space-y-4">
              {view === 'signup' && (
                <div className="relative">
                  <User className="absolute left-3 top-3 text-[#9C8ADE] w-5 h-5" />
                  <Input
                    placeholder="Full Name"
                    className="pl-11"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-2">
                {(['student', 'faculty', 'admin'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`p-3 rounded-xl text-sm font-medium border-2 transition-all ${
                      role === r 
                        ? 'bg-[#E9E6F7] border-[#7A6AD8] text-[#5B4FCF]' 
                        : 'bg-white border-[#E9E6F7] text-[#6B6B8A] hover:border-[#C8BFE7]'
                    }`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>

              {role === 'student' && view === 'signup' && (
                <div className="relative">
                   <Building className="absolute left-3 top-3 text-[#9C8ADE] w-5 h-5" />
                   <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as Department)}
                    className="w-full bg-white border-2 border-[#E9E6F7] rounded-2xl px-11 py-3 text-sm text-[#2E2E4D] focus:outline-none focus:ring-2 focus:ring-[#7A6AD8]/30 focus:border-[#7A6AD8] appearance-none"
                   >
                     {departments.map(d => (
                       <option key={d} value={d}>{d}</option>
                     ))}
                   </select>
                </div>
              )}
            </div>
          )}

          {view === 'verify-otp' ? (
             <div className="relative">
               <KeyRound className="absolute left-3 top-3 text-[#9C8ADE] w-5 h-5" />
               <Input
                 type="text"
                 placeholder="Enter 6-digit OTP"
                 className="pl-11 tracking-widest"
                 value={otp}
                 onChange={(e) => setOtp(e.target.value)}
                 required
               />
             </div>
          ) : view === 'reset-password' ? (
            <div className="relative">
               <Lock className="absolute left-3 top-3 text-[#9C8ADE] w-5 h-5" />
               <Input
                 type="password"
                 placeholder="New Password"
                 className="pl-11"
                 value={newPassword}
                 onChange={(e) => setNewPassword(e.target.value)}
                 required
               />
             </div>
          ) : view === 'verify-email' ? (
            <div className="text-center py-4">
              <Mail className="w-12 h-12 text-[#7A6AD8] mx-auto mb-3" />
              <p className="text-[#6B6B8A] mb-2">Verification email sent to:</p>
              <p className="text-[#2E2E4D] font-medium mb-4">{email}</p>
              <p className="text-[#9C8ADE] text-sm">Click the button below to resend the verification email.</p>
            </div>
          ) : (
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-[#9C8ADE] w-5 h-5" />
              <Input
                type="email"
                placeholder="Email Address"
                className="pl-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          {(view === 'login' || view === 'signup') && (
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-[#9C8ADE] w-5 h-5" />
              <Input
                type="password"
                placeholder="Password"
                className="pl-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full" isLoading={loading} disabled={countdown > 0}>
            {view === 'login' && 'Sign In'}
            {view === 'signup' && 'Create Account'}
            {view === 'forgot-password' && (countdown > 0 ? `Wait ${countdown}s` : 'Send Reset Link')}
            {view === 'verify-otp' && 'Verify Code'}
            {view === 'reset-password' && 'Update Password'}
            {view === 'verify-email' && 'Resend Verification Email'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {view === 'login' && (
            <>
              <button
                onClick={() => setView('forgot-password')}
                className="block w-full text-sm text-[#9C8ADE] hover:text-[#5B4FCF] transition-colors"
              >
                Forgot Password?
              </button>
              <button
                onClick={() => setView('signup')}
                className="text-sm text-[#6B6B8A] hover:text-[#5B4FCF] transition-colors"
              >
                Don't have an account? Sign up
              </button>
            </>
          )}

          {view === 'signup' && (
            <button
              onClick={() => setView('login')}
              className="text-sm text-[#6B6B8A] hover:text-[#5B4FCF] transition-colors"
            >
              Already have an account? Sign in
            </button>
          )}

          {(view === 'forgot-password' || view === 'verify-otp' || view === 'verify-email') && (
             <button
              onClick={() => setView('login')}
              className="flex items-center justify-center w-full text-sm text-[#6B6B8A] hover:text-[#5B4FCF] transition-colors gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
