import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Filter, X, Star, Briefcase, BookOpen, Award, GraduationCap, Mic, Zap, ChevronDown, Search } from 'lucide-react';

interface TimelineEntry {
  id: string;
  title: string;
  organisation: string | null;
  entry_date: string;
  entry_date_end: string | null;
  entry_type: string;
  summary: string;
  detail_html: string | null;
  role: string | null;
  sm_themes: string[];
  automation_themes: string[];
  skills: string[];
  tags: string[];
  is_milestone: boolean;
  is_featured: boolean;
  industry: string | null;
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; dot: string }> = {
  career:      { label: 'Career',      icon: Briefcase,    color: 'text-accent-blue dark:text-accent-blue-dark',  dot: 'bg-accent-blue dark:bg-accent-blue-dark' },
  project:     { label: 'Project',     icon: Zap,          color: 'text-accent-cyan',    dot: 'bg-accent-cyan' },
  publication: { label: 'Publication', icon: BookOpen,     color: 'text-accent-green',   dot: 'bg-accent-green' },
  award:       { label: 'Award',       icon: Award,        color: 'text-accent-gold',    dot: 'bg-accent-gold' },
  education:   { label: 'Education',   icon: GraduationCap, color: 'text-accent-orange', dot: 'bg-accent-orange' },
  speaking:    { label: 'Speaking',    icon: Mic,          color: 'text-accent-blue dark:text-accent-blue-dark',  dot: 'bg-accent-blue dark:bg-accent-blue-dark' },
  milestone:   { label: 'Milestone',  icon: Star,         color: 'text-accent-gold',    dot: 'bg-accent-gold' },
};

function formatYear(dateStr: string) {
  return new Date(dateStr).getFullYear();
}

function formatMonthYear(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatRange(start: string, end: string | null) {
  if (!end) return formatMonthYear(start);
  const sy = formatYear(start), ey = formatYear(end);
  if (sy === ey) return `${sy}`;
  return `${formatMonthYear(start)} – ${formatMonthYear(end)}`;
}

export function TimelinePage() {
  useEffect(() => {
    supabase
      .from('timeline_entries')
      .select('*')
      .eq('status', 'published')
      .order('entry_date', { ascending: false })
      .then(({ data }) => {
        setEntries(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = typeFilter.length > 0
    ? entries.filter(e => typeFilter.includes(e.entry_type))
    : entries;

  const searched = search.trim()
    ? filtered.filter(e => {
        const q = search.toLowerCase();
        return (
          e.title.toLowerCase().includes(q) ||
          (e.summary ?? '').toLowerCase().includes(q) ||
          (e.organisation ?? '').toLowerCase().includes(q) ||
          (e.tags ?? []).some(t => t.toLowerCase().includes(q))
        );
      })
    : filtered;

  // Group by year
  const byYear = searched.reduce<Record<number, TimelineEntry[]>>((acc, e) => {
    const yr = formatYear(e.entry_date);
    if (!acc[yr]) acc[yr] = [];
    acc[yr].push(e);
    return acc;
  }, {});
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  function toggleType(t: string) {
    setTypeFilter(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function selectEntry(e: TimelineEntry) {
    setSelected(prev => prev?.id === e.id ? null : e);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-light-elevated dark:bg-dark-elevated animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-accent-cyan text-xs font-semibold uppercase tracking-widest mb-2">Career Journey</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text mb-3">Timeline</h1>
        <p className="text-light-secondary dark:text-dark-secondary max-w-2xl">
          A chronological view of career milestones, projects, publications, awards, and key events.
        </p>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            filterOpen || typeFilter.length > 0
              ? 'border-accent-cyan text-accent-cyan bg-accent-cyan/5'
              : 'border-light-border dark:border-dark-border text-light-secondary dark:text-dark-secondary'
          }`}
        >
          <Filter size={12} /> Filter by type
          {typeFilter.length > 0 && (
            <span className="bg-accent-cyan text-white dark:text-dark-bg text-[10px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{typeFilter.length}</span>
          )}
        </button>

        {filterOpen && (
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const active = typeFilter.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleType(key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                    active
                      ? `border-current bg-current/10 ${cfg.color}`
                      : 'border-light-border dark:border-dark-border text-light-secondary dark:text-dark-secondary hover:border-current/40'
                  }`}
                >
                  <Icon size={11} />{cfg.label}
                </button>
              );
            })}
          </div>
        )}

        {typeFilter.length > 0 && (
          <button onClick={() => setTypeFilter([])} className="inline-flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors">
            <X size={12} /> Clear
          </button>
        )}

        <span className="ml-auto text-xs text-light-muted dark:text-dark-muted">{searched.length} entries</span>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search entries…"
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-elevated text-light-text dark:text-dark-text text-sm placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:border-accent-cyan"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Split layout */}
      <div className="flex gap-8 items-start">
        {/* Timeline */}
        <div className="flex-1 min-w-0">
          {years.map(year => (
            <div key={year}>
              {/* Year sticky marker */}
              <div className="flex items-center gap-3 mb-4 sticky top-16 z-10 bg-light-elevated/90 dark:bg-dark-bg/90 backdrop-blur-sm py-2 -mx-2 px-2 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-light-card dark:bg-dark-card border-2 border-accent-cyan flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-accent-cyan">{year}</span>
                </div>
                <div className="flex-1 h-px bg-light-border dark:bg-dark-border" />
                <span className="text-xs text-light-muted dark:text-dark-muted">{byYear[year].length}</span>
              </div>

              {/* Entries for this year */}
              <div className="relative ml-6 pl-6 border-l-2 border-light-border dark:border-dark-border mb-8 space-y-1">
                {byYear[year].map((entry, idx) => {
                  const cfg = TYPE_CONFIG[entry.entry_type] ?? TYPE_CONFIG.milestone;
                  const Icon = cfg.icon;
                  const isSelected = selected?.id === entry.id;
                  const isExpanded = expanded.has(entry.id);
                  const isLast = idx === byYear[year].length - 1;

                  return (
                    <div key={entry.id} className="relative">
                      {/* Dot on the line */}
                      <div className={`absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full border-2 border-light-bg dark:border-dark-bg ${cfg.dot} ${entry.is_milestone ? 'w-5 h-5 -left-[35px] top-3' : ''}`} />

                      <div
                        className={`rounded-xl border p-4 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-accent-cyan bg-accent-cyan/5 dark:bg-accent-cyan/5'
                            : 'border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card hover:border-accent-cyan/30'
                        }`}
                        onClick={() => selectEntry(entry)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Type icon */}
                          <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 ${cfg.dot}/10`}>
                            <Icon size={14} className={cfg.color} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                  {entry.is_milestone && (
                                    <span className="text-[10px] font-bold uppercase tracking-wide text-accent-gold">Milestone</span>
                                  )}
                                  {entry.is_featured && !entry.is_milestone && (
                                    <Star size={11} className="text-accent-gold flex-shrink-0" />
                                  )}
                                  <span className={`text-[11px] font-semibold capitalize ${cfg.color}`}>{cfg.label}</span>
                                </div>
                                <h3 className="font-semibold text-light-text dark:text-dark-text leading-snug">{entry.title}</h3>
                                {entry.organisation && (
                                  <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">{entry.organisation}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="text-xs text-light-muted dark:text-dark-muted whitespace-nowrap">
                                  {formatRange(entry.entry_date, entry.entry_date_end)}
                                </span>
                                {entry.detail_html && (
                                  <button
                                    onClick={e => { e.stopPropagation(); toggleExpand(entry.id); }}
                                    className="p-0.5 rounded text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors"
                                  >
                                    <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                  </button>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-light-secondary dark:text-dark-secondary mt-1.5 leading-relaxed line-clamp-2">
                              {entry.summary}
                            </p>

                            {/* Inline expansion */}
                            {isExpanded && entry.detail_html && (
                              <div
                                className="mt-3 pt-3 border-t border-light-border dark:border-dark-border text-sm text-light-secondary dark:text-dark-secondary leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: entry.detail_html }}
                              />
                            )}

                            {/* Tags */}
                            {entry.tags?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {entry.tags.slice(0, 4).map(t => (
                                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted">{t}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {searched.length === 0 && (
            <div className="py-16 text-center text-light-muted dark:text-dark-muted">
              No entries match the current filter.
            </div>
          )}
        </div>

        {/* Detail panel (desktop) */}
        {selected && (
          <div ref={detailRef} className="hidden lg:block lg:w-[360px] xl:w-[420px] flex-shrink-0 sticky top-6">
            <div className="rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-elevated overflow-hidden">
              {(() => {
                const cfg = TYPE_CONFIG[selected.entry_type] ?? TYPE_CONFIG.milestone;
                const Icon = cfg.icon;
                return (
                  <>
                    <div className={`px-6 py-5 border-b border-light-border dark:border-dark-border`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className={`w-9 h-9 rounded-xl ${cfg.dot}/15 flex items-center justify-center`}>
                          <Icon size={18} className={cfg.color} />
                        </div>
                        <button onClick={() => setSelected(null)} className="p-1 rounded-lg text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-card">
                          <X size={15} />
                        </button>
                      </div>
                      <span className={`text-xs font-semibold capitalize ${cfg.color}`}>{cfg.label}</span>
                      {selected.is_milestone && <span className="ml-2 text-xs font-bold text-accent-gold uppercase tracking-wide">· Milestone</span>}
                      <h2 className="text-lg font-bold text-light-text dark:text-dark-text mt-1 mb-1">{selected.title}</h2>
                      {selected.organisation && <p className="text-sm text-light-secondary dark:text-dark-secondary">{selected.organisation}</p>}
                      <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                        {[selected.role, formatRange(selected.entry_date, selected.entry_date_end), selected.industry].filter(Boolean).join(' · ')}
                      </p>
                    </div>

                    <div className="p-6 max-h-[55vh] overflow-y-auto space-y-4 text-sm">
                      <p className="text-light-secondary dark:text-dark-secondary leading-relaxed">{selected.summary}</p>

                      {selected.detail_html && (
                        <div
                          className="text-light-secondary dark:text-dark-secondary leading-relaxed pt-3 border-t border-light-border dark:border-dark-border"
                          dangerouslySetInnerHTML={{ __html: selected.detail_html }}
                        />
                      )}

                      {(selected.sm_themes?.length > 0 || selected.automation_themes?.length > 0) && (
                        <div className="pt-3 border-t border-light-border dark:border-dark-border">
                          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2">Themes</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {[...(selected.sm_themes ?? []), ...(selected.automation_themes ?? [])].map(t => (
                              <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-light-elevated dark:bg-dark-card text-light-secondary dark:text-dark-secondary">{t}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selected.skills?.length > 0 && (
                        <div className="pt-3 border-t border-light-border dark:border-dark-border">
                          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {selected.skills.map(s => (
                              <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Mobile detail drawer */}
      {selected && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative z-10 bg-light-bg dark:bg-dark-elevated rounded-t-2xl max-h-[70vh] overflow-y-auto">
            {(() => {
              const cfg = TYPE_CONFIG[selected.entry_type] ?? TYPE_CONFIG.milestone;
              const Icon = cfg.icon;
              return (
                <>
                  <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-light-border dark:border-dark-border">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={cfg.color} />
                      <h2 className="font-bold text-light-text dark:text-dark-text">{selected.title}</h2>
                    </div>
                    <button onClick={() => setSelected(null)} className="p-1 rounded-lg text-light-muted dark:text-dark-muted"><X size={18} /></button>
                  </div>
                  <div className="p-5 space-y-3 text-sm">
                    {selected.organisation && <p className="text-light-muted dark:text-dark-muted">{selected.organisation} · {formatRange(selected.entry_date, selected.entry_date_end)}</p>}
                    <p className="text-light-secondary dark:text-dark-secondary leading-relaxed">{selected.summary}</p>
                    {selected.detail_html && (
                      <div className="text-light-secondary dark:text-dark-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: selected.detail_html }} />
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
