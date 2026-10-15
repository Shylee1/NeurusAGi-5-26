import { useEffect } from 'react';
import { X } from 'lucide-react';
import { ArticleContent } from './ArticleContent';

interface Article {
  id: string;
  title: string;
  content: string;
  author?: string;
  company?: string;
  thumbnail?: string;
}

interface ArticleModalProps {
  article: Article;
  onClose: () => void;
}

export function ArticleModal({ article, onClose }: ArticleModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={onClose}
      role="presentation"
    >
      <div
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
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-modal-title"
      >
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(0,206,209,0.15)', background: 'rgba(0,0,0,0.3)' }}
        >
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            {article.author && `By ${article.author}`}
            {article.company && ` · ${article.company}`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-all duration-200 hover:bg-destructive/20 text-muted-foreground hover:text-white flex-shrink-0"
            style={{ border: '1px solid rgba(0,206,209,0.2)' }}
            aria-label={`Close ${article.title}`}
            title="Close article"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 sm:px-10 py-6 sm:py-8">
          <h2
            id="article-modal-title"
            className="font-bold mb-6 gradient-text"
            style={{ fontSize: 'clamp(1.1rem, 3vw, 1.75rem)', lineHeight: 1.3 }}
          >
            {article.title}
          </h2>

          {article.thumbnail && (
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full rounded-lg mb-6 object-cover"
              style={{ maxHeight: 240 }}
              loading="lazy"
            />
          )}

          <ArticleContent content={article.content} />
        </div>
      </div>
    </div>
  );
}
