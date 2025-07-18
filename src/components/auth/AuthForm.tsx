'use client';

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Input,
  Button,
  Tabs,
  Tab,
} from '@heroui/react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

export function AuthForm() {
  const { signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await signIn(loginForm.email, loginForm.password);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      await signUp(signupForm.email, signupForm.password, signupForm.name);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">BalanceSheet Reconciler</h1>
          <p className="mt-2 text-gray-600">Modern balance sheet reconciliation</p>
        </div>
        
        <Card className="w-full">
          <CardBody>
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(key as string)}
              variant="underlined"
              classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-primary",
                tab: "max-w-fit px-0 h-12",
              }}
            >
              <Tab key="login" title="Sign In">
                <form onSubmit={handleLogin} className="space-y-4 mt-6">
                  <Input
                    type="email"
                    label="Email"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    startContent={<Mail className="text-gray-400" size={18} />}
                    isRequired
                  />
                  
                  <Input
                    type={isVisible ? 'text' : 'password'}
                    label="Password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    startContent={<Lock className="text-gray-400" size={18} />}
                    endContent={
                      <button
                        className="focus:outline-none"
                        type="button"
                        onClick={() => setIsVisible(!isVisible)}
                      >
                        {isVisible ? (
                          <EyeOff className="text-gray-400" size={18} />
                        ) : (
                          <Eye className="text-gray-400" size={18} />
                        )}
                      </button>
                    }
                    isRequired
                  />
                  
                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}
                  
                  <Button
                    type="submit"
                    color="primary"
                    className="w-full"
                    isLoading={loading}
                  >
                    Sign In
                  </Button>
                </form>
              </Tab>
              
              <Tab key="signup" title="Sign Up">
                <form onSubmit={handleSignup} className="space-y-4 mt-6">
                  <Input
                    type="text"
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    startContent={<User className="text-gray-400" size={18} />}
                    isRequired
                  />
                  
                  <Input
                    type="email"
                    label="Email"
                    placeholder="Enter your email"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    startContent={<Mail className="text-gray-400" size={18} />}
                    isRequired
                  />
                  
                  <Input
                    type={isVisible ? 'text' : 'password'}
                    label="Password"
                    placeholder="Enter your password"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    startContent={<Lock className="text-gray-400" size={18} />}
                    endContent={
                      <button
                        className="focus:outline-none"
                        type="button"
                        onClick={() => setIsVisible(!isVisible)}
                      >
                        {isVisible ? (
                          <EyeOff className="text-gray-400" size={18} />
                        ) : (
                          <Eye className="text-gray-400" size={18} />
                        )}
                      </button>
                    }
                    isRequired
                  />
                  
                  <Input
                    type={isVisible ? 'text' : 'password'}
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    startContent={<Lock className="text-gray-400" size={18} />}
                    isRequired
                  />
                  
                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}
                  
                  <Button
                    type="submit"
                    color="primary"
                    className="w-full"
                    isLoading={loading}
                  >
                    Create Account
                  </Button>
                </form>
              </Tab>
            </Tabs>
          </CardBody>
        </Card>
        
        <div className="text-center text-sm text-gray-600">
          <p>Demo credentials:</p>
          <p>Email: demo@example.com | Password: demo123</p>
        </div>
      </div>
    </div>
  );
}