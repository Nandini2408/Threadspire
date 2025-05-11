import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, 
  Search, 
  Moon, 
  Sun, 
  User, 
  ChevronDown,
  LogOut,
  BookOpen,
  Settings,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "../ThemeProvider";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  return (
    <nav className="border-b border-border py-4 px-4 md:px-6 lg:px-8 bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo with Icon */}
        <Link to="/" className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-playfair text-xl md:text-2xl font-semibold">
            ThreadSpire
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 flex-1 justify-start ml-8">
          <Link to="/" className="nav-popout text-foreground/80 hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/explore" className="nav-popout text-foreground/80 hover:text-foreground transition-colors">
            Explore
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/library" className="nav-popout text-foreground/80 hover:text-foreground transition-colors">
                My Library
              </Link>
              {location.pathname !== "/create" && (
                <Link to="/create" className="nav-popout">
                  <Button variant="outline">Create</Button>
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right Menu: Search, Theme Toggle, Auth */}
        <div className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" size="icon" aria-label="Search" asChild>
            <Link to="/explore">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-threadspire-navy text-white flex items-center justify-center overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt={user.user_metadata?.name || 'User'} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <span className="hidden lg:inline-block">{user?.user_metadata?.name || 'User'}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/profile/${user?.id || 'me'}`} className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/library" className="flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>My Library</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="flex items-center text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-4 pb-2 px-4 space-y-4 animate-fade-in">
          <Link 
            to="/" 
            className="block py-2 text-foreground/80 hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/explore" 
            className="block py-2 text-foreground/80 hover:text-foreground"
            onClick={() => setMobileMenuOpen(false)}
          >
            Explore
          </Link>
          {isAuthenticated ? (
            <>
              <Link 
                to="/library" 
                className="block py-2 text-foreground/80 hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Library
              </Link>
              {location.pathname !== "/create" && (
                <Link 
                  to="/create" 
                  className="block py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full">Create</Button>
                </Link>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-threadspire-navy text-white flex items-center justify-center overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt={user.user_metadata?.name || 'User'} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <span>{user?.user_metadata?.name || 'User'}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={logout}
                  className="text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Log out
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2 pt-2 border-t border-border">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              </Button>
              <Button size="sm" className="flex-1" asChild>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </Button>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark Mode
                </>
              )}
            </Button>
            <Button variant="ghost" size="sm" aria-label="Search" asChild>
              <Link to="/explore" onClick={() => setMobileMenuOpen(false)}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
