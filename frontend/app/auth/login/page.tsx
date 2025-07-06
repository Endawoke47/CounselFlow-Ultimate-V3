"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { Scale, Eye, EyeOff, Shield, Zap, Brain, FileText, Users, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await login(formData.email, formData.password);
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-counselflow-dark to-counselflow-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="7"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white">
          {/* Logo & Title */}
          <div className="mb-12">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Scale className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">CounselFlow</h1>
                <p className="text-counselflow-light text-lg">Ultimate V3</p>
              </div>
            </div>
            <p className="text-xl text-counselflow-light leading-relaxed">
              Enterprise-grade legal practice management powered by AI
            </p>
          </div>

          {/* Key Features */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-counselflow-bright/20 rounded-lg flex items-center justify-center">
                <Brain className="h-6 w-6 text-counselflow-bright" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">AI-Powered Legal Analysis</h3>
                <p className="text-counselflow-light">Contract analysis, document generation, and legal research</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-counselflow-bright/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-counselflow-bright" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Complete Client Management</h3>
                <p className="text-counselflow-light">Comprehensive client lifecycle and matter tracking</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-counselflow-bright/20 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-counselflow-bright" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Enterprise Security</h3>
                <p className="text-counselflow-light">Role-based access control and audit logging</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-counselflow-bright/20 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-counselflow-bright" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Workflow Automation</h3>
                <p className="text-counselflow-light">Streamlined processes and intelligent task management</p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="flex items-center space-x-6 text-sm text-counselflow-light">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Enterprise Ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-counselflow-primary rounded-xl flex items-center justify-center">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-counselflow-dark">CounselFlow</span>
                <div className="text-sm text-counselflow-neutral">Ultimate V3</div>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-counselflow-dark mb-2">Welcome back</h2>
            <p className="text-counselflow-neutral">
              Sign in to your CounselFlow account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-counselflow-dark font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="h-12 border-2 border-gray-200 focus:border-counselflow-primary focus:ring-counselflow-primary/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-counselflow-dark font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-12 border-2 border-gray-200 focus:border-counselflow-primary focus:ring-counselflow-primary/20 pr-12"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-counselflow-neutral" />
                  ) : (
                    <Eye className="h-5 w-5 text-counselflow-neutral" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-counselflow-primary hover:text-counselflow-dark transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-counselflow-primary hover:bg-counselflow-dark text-white font-medium transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-counselflow-light/30 rounded-lg border border-counselflow-primary/20">
            <p className="text-sm font-medium text-counselflow-dark mb-2">Demo Access:</p>
            <p className="text-xs text-counselflow-neutral">
              <strong>Email:</strong> admin@counselflow.com<br />
              <strong>Password:</strong> password123
            </p>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-counselflow-neutral">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="text-counselflow-primary hover:text-counselflow-dark font-medium transition-colors"
              >
                Contact your administrator
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}