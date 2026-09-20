import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ============================================
// RATE LIMITING (in-memory, per-process)
// ============================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of Array.from(rateLimitStore.entries())) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // every minute

export function rateLimit(
  identifier: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  entry.count++;
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

export function rateLimitResponse(resetAt: number) {
  return NextResponse.json(
    { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}

// ============================================
// INPUT SANITIZATION
// ============================================

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

export function sanitizeHtml(input: string): string {
  return input.replace(/[&<>"'\/]/g, (char) => HTML_ENTITIES[char] || char);
}

export function sanitizeObject<T extends Record<string, any>>(obj: T, fields: string[]): T {
  const sanitized = { ...obj };
  for (const field of fields) {
    if (typeof sanitized[field] === 'string') {
      (sanitized as any)[field] = sanitizeHtml(sanitized[field]);
    }
  }
  return sanitized;
}

// ============================================
// IDOR / BOLA PROTECTION
// ============================================

export function verifyOwnership(
  resourceOwnerId: string | null | undefined,
  currentUserId: string,
  userRole?: string,
  adminRole?: string
): boolean {
  if (adminRole) return true; // admins can access any resource
  if (userRole === 'ADMIN') return true;
  return resourceOwnerId === currentUserId;
}

export function forbiddenResponse(message: string = 'Access denied') {
  return NextResponse.json(
    { success: false, error: { code: 'FORBIDDEN', message } },
    { status: 403 }
  );
}

export function notFoundResponse(message: string = 'Resource not found') {
  return NextResponse.json(
    { success: false, error: { code: 'NOT_FOUND', message } },
    { status: 404 }
  );
}

export function unauthorizedResponse(message: string = 'Not authenticated') {
  return NextResponse.json(
    { success: false, error: { code: 'UNAUTHORIZED', message } },
    { status: 401 }
  );
}

export function validationErrorResponse(message: string, details?: any) {
  return NextResponse.json(
    { success: false, error: { code: 'VALIDATION_ERROR', message, details } },
    { status: 400 }
  );
}

export function conflictResponse(message: string) {
  return NextResponse.json(
    { success: false, error: { code: 'CONFLICT', message } },
    { status: 409 }
  );
}

export function internalErrorResponse(message: string = 'An unexpected error occurred') {
  return NextResponse.json(
    { success: false, error: { code: 'INTERNAL_ERROR', message } },
    { status: 500 }
  );
}

// ============================================
// SECURITY HEADERS
// ============================================

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
};

// ============================================
// BOOKING NUMBER GENERATION
// ============================================

let bookingCounter = 0;

export function generateBookingNumber(): string {
  const year = new Date().getFullYear();
  const random = crypto.randomInt(100000, 999999);
  bookingCounter++;
  return `AB-${year}-${String(random).padStart(6, '0')}`;
}

// ============================================
// IDEMPOTENCY
// ============================================

export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}
