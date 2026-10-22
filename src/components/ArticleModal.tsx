import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { Article } from '../data/articles';

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
}

export function ArticleModal({ article, onClose }: ArticleModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Lock body scroll when open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Move focus into the dialog and restore it when it closes
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const published = new Date(article.publishedAt);
  const wordCount = article.content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const readingMinutes = Math.max(1, Math.round(wordCount / 220));

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-title"
        aria-describedby="article-summary"
        className="relative flex flex-col"
        style={{
          width: '90vw',
          maxWidth: 860,
          maxHeight: '88vh',
          background: 'rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,206,209,0.22)',
          borderRadius: 16,
          boxShadow: '0 0 40px rgba(0,206,209,0.25), 0 0 80px rgba(255,215,0,0.1)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky close button */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(0,206,209,0.15)', background: 'rgba(0,0,0,0.3)' }}
        >
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            {article.author && `By ${article.author}`}
            {article.company && article.company !== article.author && ` · ${article.company}`}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 hover:bg-destructive/20 text-muted-foreground hover:text-white flex-shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            style={{ border: '1px solid rgba(0,206,209,0.2)' }}
            aria-label="Close article"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-10 py-6 sm:py-8">
          <article itemScope itemType="https://schema.org/NewsArticle">
            <h1
              id="article-title"
              itemProp="headline"
              className="font-bold mb-6 gradient-text"
              style={{ fontSize: 'clamp(1.1rem, 3vw, 1.75rem)', lineHeight: 1.3 }}
            >
              {article.title}
            </h1>

            <p id="article-summary" className="text-sm text-muted-foreground mb-4">
              <time dateTime={article.publishedAt} itemProp="datePublished">
                {published.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
              <span aria-hidden="true"> · </span>
              {readingMinutes} min read
              <span aria-hidden="true"> · </span>
              <Link to="/about" className="text-primary hover:underline" itemProp="author">
                {article.author}
              </Link>
            </p>

            {article.thumbnail && (
              <img
                src={article.thumbnail}
                alt={article.title}
                itemProp="image"
                className="w-full rounded-lg mb-6 object-cover"
                style={{ maxHeight: 240 }}
              />
            )}

            <div
              className="prose prose-invert max-w-none"
              style={{
                '--tw-prose-body': 'hsl(180 100% 95%)',
                '--tw-prose-headings': 'hsl(180 100% 41%)',
                '--tw-prose-links': 'hsl(180 100% 41%)',
                '--tw-prose-bold': 'hsl(45 100% 51%)',
              } as React.CSSProperties}
              itemProp="articleBody"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <div className="mt-8 pt-6 border-t border-primary/15 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <Link to="/#early-access" className="btn-primary text-sm text-center">
                Request Early Access
              </Link>
              <Link to="/news" className="btn-ghost text-sm text-center" onClick={onClose}>
                All articles
              </Link>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
