'use client';

import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { logout } from '@/lib/auth/actions';
import { APP_NAME, ROUTES } from '@/lib/shared/constants';
import Link from 'next/link';

export function Header() {
  const { data: user, isLoading } = useCurrentUser();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" href={ROUTES.HOME}>
            <span className="hidden font-bold sm:inline-block">
              {APP_NAME}
            </span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center">
            {!isLoading && user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                >
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={ROUTES.AUTH.LOGIN}>Connexion</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={ROUTES.AUTH.REGISTER}>S&apos;inscrire</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
