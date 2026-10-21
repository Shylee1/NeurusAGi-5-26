import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../lib/authService';
import { toast } from 'sonner';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authService.signOut();
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/news', label: 'News' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/investors', label: 'Investors' },
  { to: '/early-access', label: 'Early Access' },
  { to: '/contact', label: 'Contact' }];


  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20" style={{ background: 'rgba(0,4,8,0.88)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center group flex-shrink-0">
            <img
              src="/neurus-logo-bg.jpeg"
              alt="NeurusAGi Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl group-hover:scale-105 transition-transform duration-300 object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Primary" className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) =>
            <Link
              key={link.to}
              to={link.to}
              aria-current={isActive(link.to) ? 'page' : undefined}
              className={`text-sm font-medium transition-colors duration-300 ${
              isActive(link.to) ?
              'text-primary' :
              'text-muted-foreground hover:text-foreground'}`
              }>
              
                {link.label}
              </Link>
            )}
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ?
            <>
                {isAdmin &&
              <Link
                to="/admin"
                className="btn-secondary text-sm">
                
                    Admin
                  </Link>
              }
                <Link
                to="/dashboard"
                className="btn-ghost text-sm flex items-center space-x-2">
                
                  <User className="w-4 h-4" />
                  <span>{profile?.username || 'Dashboard'}</span>
                </Link>
                <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                className="text-muted-foreground hover:text-destructive transition-colors">
                
                  <LogOut aria-hidden="true" className="w-5 h-5" />
                </button>
              </> :

            <>
                <Link to="/login" className="btn-ghost text-sm">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary text-sm">
                  Get Started
                </Link>
              </>
            }
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            className="md:hidden text-foreground hover:text-primary transition-colors">
            
            {isMenuOpen ? <X aria-hidden="true" className="w-6 h-6" /> : <Menu aria-hidden="true" className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen &&
      <div
        id="mobile-menu"
        className="md:hidden border-t border-primary/20"
        style={{
          width: '280px',
          maxWidth: '85vw',
          marginLeft: 'auto',
          background: 'rgba(0,8,12,0.96)',
          boxShadow: '-4px 4px 40px rgba(0,206,209,0.18), 0 0 0 1px rgba(0,206,209,0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(0,206,209,0.18)',
          borderBottom: '1px solid rgba(0,206,209,0.12)',
          borderRadius: '0 0 0 16px'
        }}>
        
          <div className="px-5 py-6 space-y-4">
            {navLinks.map((link) =>
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setIsMenuOpen(false)}
            aria-current={isActive(link.to) ? 'page' : undefined}
            className={`block text-base font-medium transition-colors duration-300 ${
            isActive(link.to) ?
            'text-primary' :
            'text-muted-foreground hover:text-foreground'}`
            }>
            
                {link.label}
              </Link>
          )}
            
            <div className="pt-4 border-t border-primary/20 space-y-3">
              {user ?
            <>
                  {isAdmin &&
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className="block btn-secondary text-center text-sm">
                
                      Admin Dashboard
                    </Link>
              }
                  <Link
                to="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className="block btn-ghost text-center text-sm">
                
                    My Dashboard
                  </Link>
                  <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full btn-ghost text-center text-sm text-destructive">
                
                    Logout
                  </button>
                </> :

            <>
                  <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block btn-ghost text-center text-sm">
                
                    Login
                  </Link>
                  <Link
                to="/signup"
                onClick={() => setIsMenuOpen(false)}
                className="block btn-primary text-center text-sm">
                
                    Get Started
                  </Link>
                </>
            }
            </div>
          </div>
        </div>
      }
    </header>);

}