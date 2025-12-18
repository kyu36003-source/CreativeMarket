'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletConnect } from './WalletConnect';
import { Button } from './ui/button';
import {
  Home,
  TrendingUp,
  Trophy,
  User,
  PlusCircle,
  BarChart3,
} from 'lucide-react';

type NavItem = {
  href: '/' | '/markets' | '/create' | '/leaderboard' | '/reputation';
  label: string;
  icon: any;
};

export function Navigation() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/markets' as const, label: 'Markets', icon: TrendingUp },
    { href: '/create' as const, label: 'Create', icon: PlusCircle },
    { href: '/leaderboard' as const, label: 'Leaderboard', icon: Trophy },
    { href: '/reputation' as const, label: 'My Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden sm:inline-block">
              PredictBNB
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>

          {/* Wallet Connect */}
          <WalletConnect />
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center space-x-1 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Button
                key={item.href}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className="gap-2 whitespace-nowrap"
                asChild
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
