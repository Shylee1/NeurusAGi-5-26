import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { NewsPage } from './pages/NewsPage';
import { PricingPage } from './pages/PricingPage';
import { InvestorsPage } from './pages/InvestorsPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { PreSalePage } from './pages/PreSalePage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import NotFound from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { Seo } from './components/Seo';
import { pageByPath } from './lib/site';
import type { ReactElement } from 'react';

// One real, shareable URL per page: /  /about  /news  /pricing
// /investors  /contact  /presale  /login  /signup  /onboarding
// /dashboard  /admin  /change-password   (see src/lib/site.ts + sitemap.xml)
function page(path: string, element: ReactElement) {
  return <><Seo page={pageByPath(path)} />{element}</>;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col particle-bg">
        <a href="#main-content" className="sr-only focus:not-sr-only">Skip to main content</a>
        <Header />
        <main id="main-content" className="flex-1 pt-16 sm:pt-20">
          <Routes>
            <Route path="/" element={page('/', <HomePage />)} />
            <Route path="/about" element={page('/about', <AboutPage />)} />
            <Route path="/news" element={page('/news', <NewsPage />)} />
            <Route path="/pricing" element={page('/pricing', <PricingPage />)} />
            <Route path="/investors" element={page('/investors', <InvestorsPage />)} />
            <Route path="/contact" element={page('/contact', <ContactPage />)} />
            <Route path="/login" element={page('/login', <LoginPage />)} />
            <Route path="/signup" element={page('/signup', <SignupPage />)} />
            <Route path="/onboarding" element={page('/onboarding', <OnboardingPage />)} />
            <Route path="/presale" element={page('/presale', <PreSalePage />)} />
            <Route path="/change-password" element={page('/change-password', <ChangePasswordPage />)} />
            <Route path="/dashboard" element={page('/dashboard', <ProtectedRoute><DashboardPage /></ProtectedRoute>)} />
            <Route path="/admin" element={page('/admin', <AdminRoute><AdminDashboardPage /></AdminRoute>)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}
export default App;
