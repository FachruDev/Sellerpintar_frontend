'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getInitials, stringToColor } from '@/lib/utils';
import { LogOut, Menu, LayoutDashboard, UserCircle2 } from 'lucide-react';
import { Button, Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui-bundle';
import { cn } from '@/lib/utils';

export function NavBar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
  ];

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Kiri: Brand + Nav */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary hover:text-primary/90"
          >
            <UserCircle2 className="w-7 h-7" />
            ProjectHub
          </Link>
          <div className="hidden md:flex items-center gap-2 ml-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Kanan: User menu */}
        <div className="flex items-center gap-2">
          {/* Dekstop User Menu */}
          <div className="hidden md:flex items-center relative">
            <button
              className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-muted/80 border transition"
              onClick={() => setIsUserMenuOpen((v) => !v)}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                style={{
                  backgroundColor: user?.email
                    ? stringToColor(user.email)
                    : '#4F46E5',
                }}
              >
                {getInitials(user?.email || '')}
              </div>
              <span className="hidden lg:block text-sm text-foreground">
                {user?.email}
              </span>
            </button>
            {/* Menu Dropdown */}
            {isUserMenuOpen && (
              <div
                className="absolute right-0 top-12 w-52 rounded-md shadow-xl bg-background border z-40 animate-in fade-in slide-in-from-top-2"
                tabIndex={-1}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                  {user?.email}
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 rounded-none"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </Button>
              </div>
            )}
          </div>

          {/* Android Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Buka menu navigasi"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
            <SheetHeader>
              <SheetTitle>Menu Navigasi</SheetTitle>
              </SheetHeader>
              <div className="flex items-center gap-2 p-4 border-b">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{
                    backgroundColor: user?.email
                      ? stringToColor(user.email)
                      : '#4F46E5',
                  }}
                >
                  {getInitials(user?.email || '')}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-semibold text-foreground">
                    {user?.email}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 rounded text-base font-medium transition-colors',
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {link.name}
                      </Link>
                    );
                  })}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 mt-4"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </Button>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}