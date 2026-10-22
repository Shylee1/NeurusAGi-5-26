import { useMemo, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Search, X, List, Globe } from 'lucide-react';
import { articles, articlePath, getArticleBySlug, type Article } from '../data/articles';
import { ArticleModal } from '../components/ArticleModal';
import { SphereGallery } from '../components/SphereGallery';
import { Seo, JsonLd } from '../components/Seo';
import { articleListSchema, articleSchema, breadcrumbSchema, webPageSchema } from '../lib/schema';
import { SITE } from '../lib/site';

export function NewsPage() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'sphere' | 'list'>('sphere');

  const selectedArticle = getArticleBySlug(slug);
  const notFound = Boolean(slug) && !selectedArticle;

  const filteredArticles = useMemo(
    () =>
      articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm],
  );

  const openArticle = (article: Article) => navigate(articlePath(article));
  const closeArticle = () => navigate('/news');

  // Update the document title when the modal opens on a deep link.
  useEffect(() => {
    if (slug && !selectedArticle) {
      document.title = `Article not found | ${SITE.name}`;
    }
  }, [slug, selectedArticle]);

  const listTitle = 'AGI Questions and Answers';
  const listDescription =
    'Direct answers to the questions people ask most about artificial general intelligence: what AGI is, when it arrives, how it is built, and what it changes.';

  return (
    <div className="min-h-screen">
      {selectedArticle ? (
        <Seo
          title={selectedArticle.title}
          description={selectedArticle.excerpt}
          path={`/news/${selectedArticle.slug}`}
          type="article"
          image={selectedArticle.thumbnail}
          publishedAt={selectedArticle.publishedAt}
          updatedAt={selectedArticle.updatedAt}
        />
      ) : (
        <Seo title={listTitle} description={listDescription} path="/news" />
      )}

      <JsonLd
        data={
          selectedArticle
            ? [
                articleSchema(selectedArticle),
                breadcrumbSchema([
                  { name: 'Home', path: '/' },
                  { name: 'News & Insights', path: '/news' },
                  { name: selectedArticle.title, path: `/news/${selectedArticle.slug}` },
                ]),
              ]
            : [webPageSchema('/news', listTitle, listDescription), articleListSchema(articles)]
        }
      />

      {/* Header */}
      <section className="section-container pb-0">
        {!selectedArticle && (
          <div className="text-center mb-8">
            <h1 className="heading-xl">News &amp; Insights</h1>
          </div>
        )}

        {/* Search + View Toggle */}
        <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto mb-6">
          <div className="relative flex-1 w-full">
            <label htmlFor="article-search" className="sr-only">
              Search articles
            </label>
            <Search
              aria-hidden="true"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground"
            />
            <input
              id="article-search"
              type="search"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-12 pr-12"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X aria-hidden="true" className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div
            role="group"
            aria-label="Article view"
            style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,206,209,0.18)' }}
            className="flex rounded-lg overflow-hidden flex-shrink-0"
          >
            <button
              type="button"
              onClick={() => setViewMode('sphere')}
              aria-pressed={viewMode === 'sphere'}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                viewMode === 'sphere'
                  ? 'bg-primary text-black'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Globe aria-hidden="true" className="w-4 h-4" />
              <span className="hidden sm:inline">Sphere</span>
              <span className="sr-only sm:hidden">Sphere view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-pressed={viewMode === 'list'}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-primary text-black'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List aria-hidden="true" className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
              <span className="sr-only sm:hidden">Grid view</span>
            </button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center mb-2" aria-live="polite">
          {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
          {searchTerm ? ' found' : ' total'}
        </p>
      </section>

      {notFound && (
        <section className="section-container pt-4">
          <div className="max-w-2xl mx-auto text-center feature-block p-8">
            <h2 className="heading-md text-2xl mb-3">That article could not be found</h2>
            <p className="text-muted-foreground mb-6">
              The link may be out of date. Browse every article on the news page instead.
            </p>
            <Link to="/news" className="btn-primary">
              View all articles
            </Link>
          </div>
        </section>
      )}

      {/* Sphere View */}
      {viewMode === 'sphere' && (
        <section className="py-4 px-4 overflow-hidden" aria-label="Article sphere">
          {searchTerm ? (
            /* When searching, fall back to grid so results are visible */
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
              {filteredArticles.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <p className="text-muted-foreground">No articles match your search.</p>
                </div>
              )}
            </div>
          ) : (
            <SphereGallery articles={articles} onArticleClick={openArticle} />
          )}
        </section>
      )}

      {/* List / Grid View */}
      {viewMode === 'list' && (
        <section className="section-container pt-4" aria-label="Article grid">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
          {filteredArticles.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No articles match your search.</p>
            </div>
          )}
        </section>
      )}

      {/* Article Modal */}
      {selectedArticle && <ArticleModal article={selectedArticle} onClose={closeArticle} />}
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      to={articlePath(article)}
      className="feature-block group cursor-pointer block"
      style={{ padding: '0', overflow: 'hidden' }}
    >
      {article.thumbnail && (
        <div className="aspect-video overflow-hidden">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5">
        <h3
          className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2"
          style={{ lineHeight: 1.4 }}
        >
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-primary/10 pt-3">
          <span>By {article.author}</span>
          <span className="text-primary text-xs font-medium">Read more</span>
        </div>
      </div>
    </Link>
  );
}
