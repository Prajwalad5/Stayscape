"use server"

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect";

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    await signIn("credentials", { 
      email, 
      password, 
      redirectTo: "/admin-portal/dashboard" 
    });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error; // This allows Next.js to do the actual redirect!
    }
    
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: "Invalid email or password." };
        case 'CallbackRouteError':
          const cause = (error.cause as any)?.err?.message;
          if (cause) {
            return { error: cause };
          }
          return { error: "Your account is not authorized to access this portal." };
        default:
          return { error: "An unexpected authentication error occurred." };
      }
    }

    if (error instanceof Error) {
      if (error.message.includes("Account is temporarily locked")) {
        return { error: error.message };
      }
    }
    
    return { error: "An unexpected error occurred." };
  }
}
