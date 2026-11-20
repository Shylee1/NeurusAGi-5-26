import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { PUBLIC_ROUTES } from '../lib/site';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Seo
        title="Page not found"
        description="This page does not exist. Browse NeurusAGi news and insights, investor information, or request early access instead."
        path="/404"
        noindex
      />
      <div className="max-w-lg w-full text-center glass-strong rounded-2xl p-10 neural-glow">
        <p className="text-xs uppercase tracking-[0.2em] text-primary mb-3">Error 404</p>
        <h1 className="heading-xl mb-4">We could not find that page</h1>
        <p className="text-muted-foreground mb-8">
          The link may be out of date or mistyped. Here is where most people are heading.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {PUBLIC_ROUTES.filter((route) => route.path !== '/').map((route) => (
            <Link key={route.path} to={route.path} className="btn-ghost text-sm">
              {route.label}
            </Link>
          ))}
        </div>
        <Link to="/" className="btn-primary text-sm">
          Back to home
        </Link>
      </div>
    </div>
  );
};

export { NotFound };
export default NotFound;
