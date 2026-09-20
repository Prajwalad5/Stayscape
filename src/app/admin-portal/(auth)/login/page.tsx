"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert } from "lucide-react";
import { useState } from "react";
import { loginAction } from "./actions";

export default function AdminLogin() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError(null);
    try {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
        setIsPending(false);
      }
    } catch (e) {
      // In Next.js, redirect() throws an error that we must re-throw
      // so the router can intercept it and navigate.
      setIsPending(false);
      throw e; 
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-center">Company Control Portal</h1>
          <p className="text-sm text-slate-500 mt-2">Restricted access. Authorized personnel only.</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Work Email or Login ID</Label>
            <Input id="email" name="email" type="text" placeholder="admin@company.com or john.admin" required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a href="/admin-portal/forgot-password" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Forgot password?
              </a>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button type="submit" disabled={isPending} className="w-full bg-slate-900 hover:bg-slate-800">
            {isPending ? "Signing In..." : "Sign In to Portal"}
          </Button>
        </form>
      </div>
    </div>
  )
}
