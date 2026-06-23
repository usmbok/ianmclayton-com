import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Quote, Star, Tag } from 'lucide-react';

interface Testimonial {
  id: string;
  quote: string;
  attributed_name: string;
  attributed_role: string | null;
  attributed_organisation: string | null;
  relationship_context: string | null;
  tags: string[];
  featured: boolean;
  sort_order: number;
  related_project_id: string | null;
}

function isHtml(s: string) {
  return s.trimStart().startsWith('<');
}

export function TestimonialDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('testimonials')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data }) => {
        if (!data) { setNotFound(true); setLoading(false); return; }
        setTestimonial(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-light-elevated dark:bg-dark-elevated rounded w-32" />
          <div className="h-40 bg-light-elevated dark:bg-dark-elevated rounded" />
          <div className="h-4 bg-light-elevated dark:bg-dark-elevated rounded w-48" />
        </div>
      </div>
    );
  }

  if (notFound || !testimonial) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">Testimonial not found</h1>
        <Link to="/testimonials" className="text-accent-cyan hover:underline">Back to testimonials</Link>
      </div>
    );
  }

  const t = testimonial;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to="/testimonials"
        className="inline-flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted hover:text-accent-cyan transition-colors mb-10"
      >
        <ArrowLeft size={14} /> All testimonials
      </Link>

      {/* Quote card */}
      <div className={`rounded-2xl border p-8 sm:p-10 mb-8 ${
        t.featured
          ? 'border-accent-cyan/30 bg-accent-cyan/5'
          : 'border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card'
      }`}>
        <Quote size={36} className={`mb-6 ${t.featured ? 'text-accent-cyan' : 'text-light-muted dark:text-dark-muted'}`} />

        {isHtml(t.quote) ? (
          <div
            className="text-xl sm:text-2xl leading-relaxed text-light-text dark:text-dark-text font-medium
              [&_p]:mb-4 [&_p:last-child]:mb-0
              [&_strong]:text-light-text [&_strong]:dark:text-dark-text"
            dangerouslySetInnerHTML={{ __html: t.quote }}
          />
        ) : (
          <p className="text-xl sm:text-2xl leading-relaxed text-light-text dark:text-dark-text font-medium">
            "{t.quote}"
          </p>
        )}
      </div>

      {/* Attribution */}
      <div className="flex items-start gap-4 px-2 mb-8">
        <div className="w-12 h-12 rounded-full bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
          <span className="text-accent-cyan font-bold text-lg">{t.attributed_name.charAt(0)}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-light-text dark:text-dark-text">{t.attributed_name}</h2>
            {t.featured && <Star size={16} className="text-accent-gold" />}
          </div>
          {(t.attributed_role || t.attributed_organisation) && (
            <p className="text-sm text-light-secondary dark:text-dark-secondary mt-0.5">
              {[t.attributed_role, t.attributed_organisation].filter(Boolean).join(' · ')}
            </p>
          )}
          {t.relationship_context && (
            <p className="text-sm text-light-muted dark:text-dark-muted mt-1 italic">{t.relationship_context}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      {t.tags?.length > 0 && (
        <div className="pt-6 border-t border-light-border dark:border-dark-border">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag size={13} className="text-light-muted dark:text-dark-muted flex-shrink-0" />
            {t.tags.map(tag => (
              <Link
                key={tag}
                to={`/testimonials?tag=${encodeURIComponent(tag)}`}
                className="text-xs px-2.5 py-1 rounded-full border border-light-border dark:border-dark-border text-light-secondary dark:text-dark-secondary hover:border-accent-cyan hover:text-accent-cyan transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-light-border dark:border-dark-border">
        <Link to="/testimonials" className="inline-flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted hover:text-accent-cyan transition-colors">
          <ArrowLeft size={14} /> Back to all testimonials
        </Link>
      </div>
    </div>
  );
}
