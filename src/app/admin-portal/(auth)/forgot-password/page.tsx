"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API endpoint to generate a reset token and email it
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl relative">
        <Link href="/admin-portal/login" className="absolute top-8 left-8 text-slate-400 hover:text-slate-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-center">Reset Password</h1>
          <p className="text-sm text-slate-500 mt-2 text-center">Enter your work email and we'll send you a link to reset your password.</p>
        </div>
        
        {isSubmitted ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-md text-sm text-center">
            If an admin account exists with that email, a reset link has been sent. Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <Input id="email" name="email" type="email" placeholder="admin@company.com" required />
            </div>
            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800">
              Send Reset Link
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
