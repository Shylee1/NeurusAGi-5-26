import { Link } from 'react-router-dom';
import { Mail, PenLine } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: 'rgba(0,0,0,0.06)', borderTop: '1px solid rgba(0,206,209,0.12)' }} className="mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main grid */}
        <nav aria-label="Footer" className="grid grid-cols-2 md:grid-cols-4 gap-6">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <img src="/neurus-logo-bg.jpeg" alt="NeurusAGi" className="w-8 h-8 rounded-md object-cover" />
              <span className="text-base font-bold gradient-text">NeurusAGi</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[180px]">
              A quantum leap in intelligence. The first true AGi.
            </p>
            <div className="flex gap-3">
              <a href="mailto:jt@neurusagi.com" aria-label="Email NeurusAGi" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail aria-hidden="true" className="w-4 h-4" />
              </a>
              <a
                href="https://medium.com/@NeurusAGi.JeremyTaylor"
                target="_blank"
                rel="me noopener noreferrer"
                aria-label="Jeremy Taylor on Medium"
                className="text-muted-foreground hover:text-primary transition-colors">
                <PenLine aria-hidden="true" className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Navigate</h2>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About' },
                { to: '/news', label: 'News' },
                { to: '/pricing', label: 'Pricing' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Company</h2>
            <ul className="space-y-2">
              {[
                { to: '/early-access', label: 'Early Access' },
                { to: '/investors', label: 'Investors' },
                { to: '/contact', label: 'Contact' },
                { to: '/login', label: 'Sign In' },
                { to: '/signup', label: 'Get Started' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Legal</h2>
            <ul className="space-y-2">
              <li><span className="text-xs text-muted-foreground">[Privacy Policy]</span></li>
              <li><span className="text-xs text-muted-foreground">[Terms of Service]</span></li>
              <li><span className="text-xs text-muted-foreground">[Cookie Policy]</span></li>
              <li>
                <a href="/sitemap.xml" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Sitemap
                </a>
              </li>
              <li>
                <a href="/llms.txt" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  llms.txt
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Bottom bar */}
        <div className="mt-6 pt-4 border-t border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">&copy; {currentYear} NeurusAGi. All rights reserved.</p>
          <p className="text-xs text-muted-foreground">Founded by <span className="text-primary/70">Jeremy Taylor</span></p>
        </div>
      </div>
    </footer>
  );
}
