import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Quote, Star, Filter, X, Search, LayoutGrid, List, ChevronRight } from 'lucide-react';

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

function isHtml(s: string | null) {
  return !!s && s.trimStart().startsWith('<');
}

function stripHtml(html: string | null): string {
  return html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

function quoteText(t: Testimonial): string {
  return isHtml(t.quote) ? stripHtml(t.quote) : t.quote;
}

function matchTestimonial(t: Testimonial, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return [
    quoteText(t),
    t.attributed_name,
    t.attributed_role,
    t.attributed_organisation,
    t.relationship_context,
    ...(t.tags ?? []),
  ].some(v => v?.toLowerCase().includes(lower));
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-accent-cyan/20 text-accent-cyan rounded px-0.5 not-italic">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function TestimonialsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState(searchParams.get('tag') ?? '');
  const [contextFilter, setContextFilter] = useState('');

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from('testimonials')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        // Filter active ones client-side (column may not exist yet in older envs)
        setTestimonials((data ?? []).filter((t: Testimonial & { active?: boolean }) => t.active !== false));
        setLoading(false);
      });
  }, []);

  const allTags = [...new Set(testimonials.flatMap(t => t.tags ?? []))] as string[];
  const allContexts = [...new Set(testimonials.map(t => t.relationship_context).filter(Boolean))] as string[];

  const filtered = testimonials.filter(t => {
    if (!matchTestimonial(t, searchQuery)) return false;
    if (tagFilter && !(t.tags ?? []).includes(tagFilter)) return false;
    if (contextFilter && t.relationship_context !== contextFilter) return false;
    return true;
  });

  const hasSearch = searchQuery.trim().length > 0;
  const activeFilters = [tagFilter, contextFilter].filter(Boolean).length;

  function clearAll() {
    setSearchQuery('');
    setTagFilter('');
    setContextFilter('');
    setSearchParams({});
  }

  function setTag(tag: string) {
    const next = tag === tagFilter ? '' : tag;
    setTagFilter(next);
    setSearchParams(next ? { tag: next } : {}, { replace: true });
  }

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

      {/* Search */}
      <div className="mb-4">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
          hasSearch
            ? 'border-accent-cyan bg-accent-cyan/5 shadow-sm shadow-accent-cyan/10'
            : 'border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card hover:border-light-text/30 dark:hover:border-dark-text/30'
        }`}>
          <Search size={17} className={`flex-shrink-0 transition-colors ${hasSearch ? 'text-accent-cyan' : 'text-light-muted dark:text-dark-muted'}`} />
          <input
            ref={searchRef}
            type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search quotes, names, roles, organisations, tags…"
            className="flex-1 bg-transparent text-sm text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted outline-none"
          />
          {hasSearch && (
            <button onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
              className="flex-shrink-0 p-1 rounded-md text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Filter size={14} className="text-light-muted dark:text-dark-muted flex-shrink-0" />

        {/* Tag pills */}
        <button
          onClick={() => setTag('')}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !tagFilter ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan' : 'border-light-border dark:border-dark-border text-light-secondary dark:text-dark-secondary hover:border-accent-cyan/30'
          }`}
        >
          All
        </button>
        {allTags.map(t => (
          <button key={t} onClick={() => setTag(t)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              tagFilter === t ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan' : 'border-light-border dark:border-dark-border text-light-secondary dark:text-dark-secondary hover:border-accent-cyan/30'
            }`}>
            {t}
          </button>
        ))}

        {/* Context filter dropdown */}
        {allContexts.length > 0 && (
          <select value={contextFilter} onChange={e => setContextFilter(e.target.value)}
            className={`text-xs rounded-lg border px-2.5 py-1.5 bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text transition-colors ${contextFilter ? 'border-accent-cyan' : 'border-light-border dark:border-dark-border'}`}>
            <option value="">All contexts</option>
            {allContexts.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {(hasSearch || activeFilters > 0) && (
          <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors">
            <X size={12} /> Clear all
          </button>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-light-muted dark:text-dark-muted">{filtered.length} testimonial{filtered.length !== 1 ? 's' : ''}</span>
          <div className="flex rounded-lg border border-light-border dark:border-dark-border overflow-hidden">
            <button onClick={() => setView('grid')} title="Grid view"
              className={`p-2 transition-colors ${view === 'grid' ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-elevated'}`}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setView('list')} title="List view"
              className={`p-2 transition-colors border-l border-light-border dark:border-dark-border ${view === 'list' ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-elevated'}`}>
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-light-muted dark:text-dark-muted">No testimonials match your search.</div>
      )}

      {view === 'list' ? (
        /* ── List view ─────────────────────────────────── */
        <div className="space-y-3">
          {filtered.map(t => {
            const text = quoteText(t);
            return (
              <button
                key={t.id}
                onClick={() => navigate(`/testimonials/${t.id}`)}
                className="w-full text-left rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-5 hover:border-accent-cyan/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-4">
                  <Quote size={18} className={`flex-shrink-0 mt-0.5 ${t.featured ? 'text-accent-cyan' : 'text-light-muted dark:text-dark-muted'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-light-secondary dark:text-dark-secondary leading-relaxed line-clamp-2 mb-2">
                      <Highlight text={`"${text}"`} query={searchQuery} />
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-light-text dark:text-dark-text group-hover:text-accent-cyan transition-colors">
                        <Highlight text={t.attributed_name} query={searchQuery} />
                      </span>
                      {(t.attributed_role || t.attributed_organisation) && (
                        <span className="text-xs text-light-muted dark:text-dark-muted">
                          {[t.attributed_role, t.attributed_organisation].filter(Boolean).join(', ')}
                        </span>
                      )}
                      {t.featured && <Star size={12} className="text-accent-gold" />}
                    </div>
                    {t.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {t.tags.map(tag => (
                          <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                            tagFilter === tag ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted'
                          }`}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={15} className="flex-shrink-0 mt-1 text-light-muted dark:text-dark-muted group-hover:text-accent-cyan group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        /* ── Grid view ─────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(t => {
            const text = quoteText(t);
            return (
              <button
                key={t.id}
                onClick={() => navigate(`/testimonials/${t.id}`)}
                className={`text-left rounded-xl border p-6 flex flex-col hover:shadow-md transition-all group ${
                  t.featured
                    ? 'border-accent-cyan/40 bg-accent-cyan/5 hover:border-accent-cyan/60'
                    : 'border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card hover:border-accent-cyan/40'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <Quote size={20} className={`flex-shrink-0 ${t.featured ? 'text-accent-cyan' : 'text-light-muted dark:text-dark-muted'}`} />
                  <ChevronRight size={14} className="text-light-muted dark:text-dark-muted group-hover:text-accent-cyan group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>

                <blockquote className="flex-1 text-light-secondary dark:text-dark-secondary text-sm leading-relaxed mb-4 line-clamp-4">
                  <Highlight text={`"${text}"`} query={searchQuery} />
                </blockquote>

                <div className="border-t border-light-border dark:border-dark-border pt-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-light-text dark:text-dark-text text-sm group-hover:text-accent-cyan transition-colors">
                        <Highlight text={t.attributed_name} query={searchQuery} />
                      </p>
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
                          onClick={e => { e.stopPropagation(); setTag(tag); }}
                          className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                            tagFilter === tag ? 'bg-accent-cyan/20 text-accent-cyan' : 'bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted hover:bg-accent-cyan/10 hover:text-accent-cyan'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
