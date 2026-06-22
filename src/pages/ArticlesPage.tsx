import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, Tag, Search, ArrowRight } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  excerpt: string | null;
  category: string | null;
  tags: string[];
  featured: boolean;
  published_at: string | null;
  reading_time_minutes: number | null;
}

function formatDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    supabase
      .from('articles')
      .select('id,title,subtitle,slug,excerpt,category,tags,featured,published_at,reading_time_minutes')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setArticles(data ?? []);
        setLoading(false);
      });
  }, []);

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))] as string[];

  const filtered = articles.filter(a => {
    if (categoryFilter && a.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        (a.excerpt ?? '').toLowerCase().includes(q) ||
        (a.tags ?? []).some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const featured = filtered.filter(a => a.featured);
  const rest = filtered.filter(a => !a.featured);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-light-elevated dark:bg-dark-elevated animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-accent-cyan text-xs font-semibold uppercase tracking-widest mb-2">Writing</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text mb-3">Articles</h1>
        <p className="text-light-secondary dark:text-dark-secondary max-w-2xl">
          Perspectives on service management, intelligent automation, and the future of digital operations.
        </p>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-elevated text-light-text dark:text-dark-text text-sm placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:border-accent-cyan"
          />
        </div>
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setCategoryFilter('')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                !categoryFilter ? 'bg-accent-cyan text-white dark:text-dark-bg' : 'border border-light-border dark:border-dark-border text-light-secondary dark:text-dark-secondary hover:bg-light-elevated dark:hover:bg-dark-elevated'
              }`}
            >
              All
            </button>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c === categoryFilter ? '' : c)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  categoryFilter === c ? 'bg-accent-cyan text-white dark:text-dark-bg' : 'border border-light-border dark:border-dark-border text-light-secondary dark:text-dark-secondary hover:bg-light-elevated dark:hover:bg-dark-elevated'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Featured articles */}
      {featured.length > 0 && !search && !categoryFilter && (
        <div className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-light-muted dark:text-dark-muted mb-4">Featured</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {featured.map(a => (
              <Link
                key={a.id}
                to={`/articles/${a.slug}`}
                className="group rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-6 hover:border-accent-cyan/40 hover:shadow-md transition-all"
              >
                {a.category && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-cyan">{a.category}</span>
                )}
                <h3 className="mt-2 font-bold text-light-text dark:text-dark-text text-lg leading-snug group-hover:text-accent-cyan transition-colors">{a.title}</h3>
                {a.subtitle && <p className="mt-1 text-sm text-light-secondary dark:text-dark-secondary">{a.subtitle}</p>}
                {a.excerpt && <p className="mt-2 text-sm text-light-secondary dark:text-dark-secondary leading-relaxed line-clamp-3">{a.excerpt}</p>}
                <div className="mt-4 flex items-center justify-between text-xs text-light-muted dark:text-dark-muted">
                  <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(a.published_at)}</span>
                  {a.reading_time_minutes && <span className="flex items-center gap-1"><Clock size={11} />{a.reading_time_minutes} min read</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All / filtered articles */}
      {(search || categoryFilter || featured.length === 0) && (
        <div className="space-y-3">
          {filtered.map(a => (
            <Link
              key={a.id}
              to={`/articles/${a.slug}`}
              className="group flex gap-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-5 hover:border-accent-cyan/40 hover:shadow-md transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {a.category && <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-cyan">{a.category}</span>}
                  {a.featured && <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-accent-gold/10 text-accent-gold">Featured</span>}
                </div>
                <h3 className="font-semibold text-light-text dark:text-dark-text group-hover:text-accent-cyan transition-colors leading-snug">{a.title}</h3>
                {a.subtitle && <p className="text-xs text-light-secondary dark:text-dark-secondary mt-0.5">{a.subtitle}</p>}
                {a.excerpt && <p className="text-sm text-light-secondary dark:text-dark-secondary mt-1.5 leading-relaxed line-clamp-2">{a.excerpt}</p>}
                {a.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {a.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted">{t}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end justify-between flex-shrink-0 text-xs text-light-muted dark:text-dark-muted">
                <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(a.published_at)}</span>
                {a.reading_time_minutes && <span className="flex items-center gap-1"><Clock size={11} />{a.reading_time_minutes} min</span>}
                <ArrowRight size={14} className="text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {!search && !categoryFilter && rest.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-light-muted dark:text-dark-muted mb-4">All Articles</h2>
          <div className="space-y-3">
            {rest.map(a => (
              <Link
                key={a.id}
                to={`/articles/${a.slug}`}
                className="group flex gap-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-5 hover:border-accent-cyan/40 hover:shadow-md transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {a.category && <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-cyan">{a.category}</span>}
                  </div>
                  <h3 className="font-semibold text-light-text dark:text-dark-text group-hover:text-accent-cyan transition-colors leading-snug">{a.title}</h3>
                  {a.excerpt && <p className="text-sm text-light-secondary dark:text-dark-secondary mt-1 leading-relaxed line-clamp-2">{a.excerpt}</p>}
                </div>
                <div className="flex flex-col items-end justify-between flex-shrink-0 text-xs text-light-muted dark:text-dark-muted">
                  <span>{formatDate(a.published_at)}</span>
                  {a.reading_time_minutes && <span>{a.reading_time_minutes} min</span>}
                  <ArrowRight size={14} className="text-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-16 text-center text-light-muted dark:text-dark-muted">
          No articles match your search.
        </div>
      )}
    </div>
  );
}
