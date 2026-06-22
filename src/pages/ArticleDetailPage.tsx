import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, ArrowLeft, Tag, ArrowRight } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  excerpt: string | null;
  content_html: string | null;
  category: string | null;
  tags: string[];
  published_at: string | null;
  reading_time_minutes: number | null;
}

interface RelatedArticle {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  excerpt: string | null;
  reading_time_minutes: number | null;
}

function formatDate(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data }) => {
        if (!data) { setNotFound(true); setLoading(false); return; }
        setArticle(data);
        setLoading(false);
        // fetch related by same category, excluding current
        if (data.category) {
          supabase
            .from('articles')
            .select('id,title,slug,category,excerpt,reading_time_minutes')
            .eq('status', 'published')
            .eq('category', data.category)
            .neq('id', data.id)
            .limit(3)
            .then(({ data: rel }) => setRelated(rel ?? []));
        }
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-light-elevated dark:bg-dark-elevated rounded w-3/4" />
          <div className="h-4 bg-light-elevated dark:bg-dark-elevated rounded w-1/2" />
          <div className="h-48 bg-light-elevated dark:bg-dark-elevated rounded" />
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">Article not found</h1>
        <Link to="/articles" className="text-accent-cyan hover:underline">Back to articles</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back */}
      <Link to="/articles" className="inline-flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted hover:text-accent-cyan transition-colors mb-8">
        <ArrowLeft size={14} /> All articles
      </Link>

      {/* Header */}
      <header className="mb-10">
        {article.category && (
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-cyan">{article.category}</span>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text mt-2 mb-3 leading-tight">
          {article.title}
        </h1>
        {article.subtitle && (
          <p className="text-xl text-light-secondary dark:text-dark-secondary mb-4">{article.subtitle}</p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-sm text-light-muted dark:text-dark-muted pb-6 border-b border-light-border dark:border-dark-border">
          {article.published_at && (
            <span className="flex items-center gap-1.5"><Calendar size={14} />{formatDate(article.published_at)}</span>
          )}
          {article.reading_time_minutes && (
            <span className="flex items-center gap-1.5"><Clock size={14} />{article.reading_time_minutes} min read</span>
          )}
        </div>
      </header>

      {/* Body */}
      {article.content_html ? (
        <div
          className="prose prose-lg max-w-none
            prose-headings:text-light-text dark:prose-headings:text-dark-text
            prose-p:text-light-secondary dark:prose-p:text-dark-secondary
            prose-strong:text-light-text dark:prose-strong:text-dark-text
            prose-a:text-accent-cyan prose-a:no-underline hover:prose-a:underline
            prose-li:text-light-secondary dark:prose-li:text-dark-secondary
            prose-blockquote:border-accent-cyan prose-blockquote:text-light-secondary dark:prose-blockquote:text-dark-secondary"
          dangerouslySetInnerHTML={{ __html: article.content_html }}
        />
      ) : (
        article.excerpt && <p className="text-lg text-light-secondary dark:text-dark-secondary leading-relaxed">{article.excerpt}</p>
      )}

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div className="mt-10 pt-6 border-t border-light-border dark:border-dark-border">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag size={13} className="text-light-muted dark:text-dark-muted" />
            {article.tags.map(t => (
              <span key={t} className="text-sm px-3 py-1 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Related articles */}
      {related.length > 0 && (
        <div className="mt-12 pt-8 border-t border-light-border dark:border-dark-border">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-light-muted dark:text-dark-muted mb-5">Related Articles</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(r => (
              <Link
                key={r.id}
                to={`/articles/${r.slug}`}
                className="group rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-5 hover:border-accent-cyan/40 transition-all"
              >
                {r.category && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-accent-cyan">{r.category}</span>
                )}
                <h3 className="mt-1.5 font-semibold text-light-text dark:text-dark-text text-sm leading-snug group-hover:text-accent-cyan transition-colors line-clamp-2">{r.title}</h3>
                {r.excerpt && (
                  <p className="text-xs text-light-secondary dark:text-dark-secondary mt-1.5 leading-relaxed line-clamp-2">{r.excerpt}</p>
                )}
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-accent-cyan">
                  Read <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="mt-10 pt-6 border-t border-light-border dark:border-dark-border">
        <Link to="/articles" className="inline-flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted hover:text-accent-cyan transition-colors">
          <ArrowLeft size={14} /> Back to all articles
        </Link>
      </div>
    </div>
  );
}
