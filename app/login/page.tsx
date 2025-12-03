"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { User, Lock, Mail, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserRole } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password, role);
      console.log("success", success)
      if (success) {
        router.push('/');
      } else {
        setError('Invalid credentials or role mismatch. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (testEmail: string, testPassword: string, testRole: UserRole) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setRole(testRole);
    setError('');
    setLoading(true);

    try {
      const success = await login(testEmail, testPassword, testRole);
      if (success) {
        router.push('/');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex flex-col justify-center space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-lg p-3 shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-foreground">InheritX HRMS</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Streamline your human resources management
            </p>
          </div>

          <div className="space-y-4 pt-8">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border">
              <User className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Employee Portal</h3>
                <p className="text-sm text-muted-foreground">
                  Personal dashboard and self-service
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Card>
            <CardHeader className='!px-0'>
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <p className="text-muted-foreground mt-0">
                Enter your credentials to access your account
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Password
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
                  >
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </motion.div>
                )}

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full"
                  loading={loading}
                  loadingText="Signing in..."
                >
                  Sign In
                </Button>

              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

