'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { FiMail, FiLock, FiArrowRight, FiUser } from 'react-icons/fi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); // true for login, false for register
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(email, password);
      } else {
        // For registration, we need a username as well
        const username = email.split('@')[0]; // Simple username from email
        result = await register(username, email, password);
      }

      if (result.success) {
        router.push('/'); // Redirect to home after successful login/register
      } else {
        setError(result.error || (isLogin ? 'Login failed' : 'Registration failed'));
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel - Black and White Theme */}
      <div className="w-full md:w-3/5 bg-gradient-to-br from-gray-800 to-black p-8 flex flex-col justify-between">
        <div>
          <div className="text-white text-2xl font-bold">To-Do List App</div>
        </div>
        
        <div className="max-w-md mx-auto text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-lg mb-8 opacity-90">
            {isLogin 
              ? "To keep connected with us please login with your personal info" 
              : "Create an account to get started with our service"}
          </p>
          
          <div className="flex justify-center space-x-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <FiUser className="text-white text-xl" />
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <FiMail className="text-white text-xl" />
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <FiLock className="text-white text-xl" />
            </div>
          </div>
          
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="bg-white text-black hover:bg-gray-200 font-medium py-3 px-8 rounded-full transition duration-300 flex items-center justify-center mx-auto"
          >
            {isLogin ? 'CREATE ACCOUNT' : 'SIGN IN'} 
            <FiArrowRight className="ml-2" />
          </button>
        </div>
        
        <div className="text-white/70 text-sm">
          © {new Date().getFullYear()} To-Do List App. All rights reserved.
        </div>
      </div>

      {/* Right Panel - White Background */}
      <div className="w-full md:w-2/5 bg-white p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <p className="text-gray-500 mt-2">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Fill in your details to create an account'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={email.split('@')[0]} // Use email prefix as username
                    disabled
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black disabled:opacity-50"
                    placeholder="Username"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Username derived from your email address
                </p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-black hover:bg-gray-800 focus:ring-black'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="font-medium text-black hover:text-gray-700 focus:outline-none"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}