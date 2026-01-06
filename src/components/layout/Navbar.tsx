import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Shield, LayoutDashboard, MessageSquare, User, LogOut, Home, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { MobileNotificationsDropdown } from '@/components/notifications/MobileNotificationsDropdown';

export function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={user ? '/home' : '/'} className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-bold">Probable</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">hedge</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link to="/home">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Link to="/chat">
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat</span>
                </Button>
              </Link>
              <NotificationsDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          {user && <MobileNotificationsDropdown />}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-lg font-bold">Probable</span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">hedge</span>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-6">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-12"
                      onClick={() => handleNavigate('/home')}
                    >
                      <Home className="h-5 w-5" />
                      Home
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-12"
                      onClick={() => handleNavigate('/dashboard')}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-12"
                      onClick={() => handleNavigate('/chat')}
                    >
                      <MessageSquare className="h-5 w-5" />
                      Chat
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-12"
                      onClick={() => handleNavigate('/profile')}
                    >
                      <User className="h-5 w-5" />
                      Profile
                    </Button>
                    <div className="border-t my-2" />
                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-12 text-destructive hover:text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      className="justify-start gap-3 h-12"
                      onClick={() => handleNavigate('/auth')}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="justify-start gap-3 h-12"
                      onClick={() => handleNavigate('/auth?mode=signup')}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}