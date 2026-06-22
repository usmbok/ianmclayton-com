import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Quote, Star, Filter, X } from 'lucide-react';

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

export function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [tagFilter, setTagFilter] = useState('');

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setTestimonials(data ?? []);
        setLoading(false);
      });
  }, []);

  const allTags = [...new Set(testimonials.flatMap(t => t.tags ?? []))] as string[];

  const filtered = tagFilter
    ? testimonials.filter(t => (t.tags ?? []).includes(tagFilter))
    : testimonials;

  const featured = filtered.filter(t => t.featured);
  const rest = filtered.filter(t => !t.featured);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-light-elevated dark:bg-dark-elevated animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  function TestimonialCard({ t }: { t: Testimonial }) {
    return (
      <div className={`rounded-xl border p-6 flex flex-col ${
        t.featured
          ? 'border-accent-cyan/40 bg-accent-cyan/5 dark:bg-accent-cyan/5'
          : 'border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card'
      }`}>
        <Quote size={20} className={`flex-shrink-0 mb-3 ${t.featured ? 'text-accent-cyan' : 'text-light-muted dark:text-dark-muted'}`} />
        <blockquote className="flex-1 text-light-secondary dark:text-dark-secondary text-sm leading-relaxed mb-4">
          "{t.quote}"
        </blockquote>
        <div className="border-t border-light-border dark:border-dark-border pt-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-light-text dark:text-dark-text text-sm">{t.attributed_name}</p>
              {(t.attributed_role || t.attributed_organisation) && (
                <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                  {[t.attributed_role, t.attributed_organisation].filter(Boolean).join(', ')}
                </p>
              )}
              {t.relationship_context && (
                <p className="text-[11px] text-light-muted/70 dark:text-dark-muted/70 mt-0.5 italic">{t.relationship_context}</p>
              )}
            </div>
            {t.featured && <Star size={14} className="text-accent-gold flex-shrink-0 mt-0.5" />}
          </div>
          {t.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {t.tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setTagFilter(tag === tagFilter ? '' : tag)}
                  className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                    tagFilter === tag
                      ? 'bg-accent-cyan/20 text-accent-cyan'
                      : 'bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted hover:bg-accent-cyan/10 hover:text-accent-cyan'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-accent-cyan text-xs font-semibold uppercase tracking-widest mb-2">Endorsements</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text mb-3">What People Say</h1>
        <p className="text-light-secondary dark:text-dark-secondary max-w-2xl">
          Reflections from clients, peers, and colleagues across a career spanning service management, automation, and consulting.
        </p>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-8">
          <Filter size={13} className="text-light-muted dark:text-dark-muted" />
          <button
            onClick={() => setTagFilter('')}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              !tagFilter ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan' : 'border-light-border dark:border-dark-border text-light-secondary dark:text-dark-secondary hover:border-accent-cyan/30'
            }`}
          >
            All
          </button>
          {allTags.map(t => (
            <button
              key={t}
              onClick={() => setTagFilter(t === tagFilter ? '' : t)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                tagFilter === t ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan' : 'border-light-border dark:border-dark-border text-light-secondary dark:text-dark-secondary hover:border-accent-cyan/30'
              }`}
            >
              {t}
            </button>
          ))}
          {tagFilter && (
            <button onClick={() => setTagFilter('')} className="inline-flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors">
              <X size={12} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <div className="mb-8">
          {!tagFilter && <h2 className="text-xs font-semibold uppercase tracking-widest text-light-muted dark:text-dark-muted mb-4">Featured</h2>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map(t => <TestimonialCard key={t.id} t={t} />)}
          </div>
        </div>
      )}

      {/* Rest */}
      {rest.length > 0 && (
        <div>
          {!tagFilter && featured.length > 0 && <h2 className="text-xs font-semibold uppercase tracking-widest text-light-muted dark:text-dark-muted mb-4">More</h2>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map(t => <TestimonialCard key={t.id} t={t} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-16 text-center text-light-muted dark:text-dark-muted">No testimonials match the current filter.</div>
      )}
    </div>
  );
}
