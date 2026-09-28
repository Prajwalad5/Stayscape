'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Search,
  Globe,
  Menu,
  User,
  Heart,
  MessageSquare,
  CalendarDays,
  Home,
  LogOut,
  Settings,
  Building2,
  LayoutDashboard,
  Shield,
  Plus,
  Calendar,
  Star,
  BarChart3
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useCurrentUser, useIsHost, useIsAdmin } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageIcon } from '@/components/messages/message-icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { GlobalSearch } from '@/components/search/global-search';

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useCurrentUser();
  const isHost = useIsHost();
  const isAdmin = useIsAdmin();
  const isHostDashboard = pathname?.startsWith('/host');
  const isAdminDashboard = pathname?.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Stay<span className="text-primary">Scape</span>
          </span>
        </Link>

        {/* Center - Search (desktop) */}
        {!isHostDashboard && !isAdminDashboard && (
          <div className="hidden md:block w-full max-w-md mx-4">
            <GlobalSearch compact />
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isAuthenticated && !isHostDashboard && !isAdminDashboard && (
            <Link href={isHost ? '/host/dashboard' : '/host/get-started'}>
              <Button variant="ghost" size="sm" className="hidden md:flex">
                {isHost ? 'Switch to hosting' : 'List Your Property'}
              </Button>
            </Link>
          )}

          {isHostDashboard && (
            <Link href="/">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                Switch to traveling
              </Button>
            </Link>
          )}

          {isAuthenticated && <MessageIcon userId={user?.id || ''} />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 rounded-full px-2 py-1 h-auto"
                aria-label="User menu"
              >
                <Menu className="h-4 w-4" />
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {isAuthenticated ? getInitials(user?.name) : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isAuthenticated ? (
                <>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  {!isHostDashboard && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/guest/trips" className="cursor-pointer">
                          <CalendarDays className="mr-2 h-4 w-4" /> My Rentals
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/guest/favorites" className="cursor-pointer">
                          <Heart className="mr-2 h-4 w-4" /> Saved
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/messages" className="cursor-pointer">
                          <MessageSquare className="mr-2 h-4 w-4" /> Messages
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {isHost && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link
                          href={isHostDashboard ? '/' : '/host/dashboard'}
                          className="cursor-pointer"
                        >
                          <Building2 className="mr-2 h-4 w-4" />
                          {isHostDashboard ? 'Switch to traveling' : 'Switch to hosting'}
                        </Link>
                      </DropdownMenuItem>
                      
                      {isHostDashboard && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href="/host/dashboard" className="cursor-pointer">
                              <Building2 className="mr-2 h-4 w-4" /> Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/host/reservations" className="cursor-pointer">
                              <CalendarDays className="mr-2 h-4 w-4" /> Rentals
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/host/calendar" className="cursor-pointer">
                              <Calendar className="mr-2 h-4 w-4" /> Calendar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/messages" className="cursor-pointer">
                              <MessageSquare className="mr-2 h-4 w-4" /> Messages
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/host/reviews" className="cursor-pointer">
                              <Star className="mr-2 h-4 w-4" /> Reviews
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/host/analytics" className="cursor-pointer">
                              <BarChart3 className="mr-2 h-4 w-4" /> Analytics
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href="/host/listings/new" className="cursor-pointer">
                              <Plus className="mr-2 h-4 w-4" /> Create listing
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}

                      <DropdownMenuSeparator />
                    </>
                  )}

                  {!isHost && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/host/get-started" className="cursor-pointer">
                          <Building2 className="mr-2 h-4 w-4" /> Become a Host
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin-portal" className="cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" /> Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/guest/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="cursor-pointer text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="cursor-pointer font-medium">
                      Log in
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/register" className="cursor-pointer">
                      Sign up
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/host/get-started" className="cursor-pointer">
                      <Building2 className="mr-2 h-4 w-4" /> List Your Property
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
