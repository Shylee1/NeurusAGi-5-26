import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../lib/authService';
import { toast } from 'sonner';

/**
 * One compact bar and one menu, at every width.
 *
 * The previous header spread seven links plus two account buttons across the
 * top of the screen on desktop, which crowded the page and left no room for
 * the content. Everything now lives behind a single menu button.
 */
const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/news', label: 'News' },
  { to: '/early-access', label: 'Early Access' },
  { to: '/investors', label: 'Investors' },
  { to: '/contact', label: 'Contact' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, isAdmin } = useAuth();
  const location = useLocation();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // Close on navigation.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-primary/20"
      style={{
        background: 'rgba(0,4,8,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 flex-shrink-0 group"
            aria-label="NeurusAGi home"
          >
            <img
              src="/neurus-logo-bg.jpeg"
              alt=""
              width={36}
              height={36}
              className="w-9 h-9 rounded-lg object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <span className="text-base font-bold tracking-tight text-foreground">
              NeurusAGi
            </span>
          </Link>

          <button
            ref={buttonRef}
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="site-menu"
            className="inline-flex items-center justify-center w-11 h-11 -mr-1 rounded-lg text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            {isMenuOpen ? (
              <X aria-hidden="true" className="w-6 h-6" />
            ) : (
              <Menu aria-hidden="true" className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <>
          {/* Tap-away backdrop */}
          <div
            className="fixed inset-0 top-16 bg-black/60 z-40"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            id="site-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            tabIndex={-1}
            className="fixed right-0 top-16 z-50 w-[min(20rem,88vw)] max-h-[calc(100dvh-4rem)] overflow-y-auto border-l border-b border-primary/20 outline-none"
            style={{
              background: 'rgba(0,8,12,0.98)',
              boxShadow: '-8px 8px 60px rgba(0,206,209,0.16)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '0 0 0 16px',
            }}
          >
            <nav aria-label="Primary" className="px-2 py-3">
              <ul>
                {NAV_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      aria-current={isActive(link.to) ? 'page' : undefined}
                      className={`block px-4 py-3.5 rounded-lg text-base font-medium transition-colors ${
                        isActive(link.to)
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="px-4 pb-5 pt-4 border-t border-primary/15 space-y-2.5">
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin" className="block btn-secondary text-center text-sm">
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center gap-2 btn-ghost text-sm"
                  >
                    <User aria-hidden="true" className="w-4 h-4" />
                    <span>{profile?.username || 'My Dashboard'}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 btn-ghost text-sm text-destructive"
                  >
                    <LogOut aria-hidden="true" className="w-4 h-4" />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/early-access"
                    className="block btn-primary text-center text-sm"
                  >
                    Request Early Access
                  </Link>
                  <Link
                    to="/login"
                    className="block btn-ghost text-center text-sm"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
