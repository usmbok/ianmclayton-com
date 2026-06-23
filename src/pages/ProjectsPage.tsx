import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Filter, X, ChevronRight, Lock, Eye, ExternalLink,
  LayoutGrid, List, ChevronDown, Search, FolderOpen, BookOpen, FileText,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Shared types & helpers
// ─────────────────────────────────────────────

interface Project {
  id: string;
  title: string;
  slug: string;
  client_display_name: string | null;
  client_name: string | null;
  show_client_name: boolean;
  employer: { name: string; short_name: string | null } | null;
  client_type: string | null;
  industry: string | null;
  date_start: string | null;
  date_end: string | null;
  status: string;
  confidentiality: string;
  featured: boolean;
  short_focus: string | null;
  project_type: string | null;
  role: string | null;
  sm_themes: string[];
  automation_themes: string[];
  tags: string[];
  context_html: string | null;
  challenge_html: string | null;
  outcomes_html: string | null;
}

interface UseCase {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  client_display_name: string | null;
  client_name: string | null;
  show_client_name: boolean;
  industry: string | null;
  servicenow_product: string | null;
  project_type: string | null;
  employer: { name: string; short_name: string | null } | null;
  summary_html: string | null;
  challenge_html: string | null;
  solution_html: string | null;
  outcomes_html: string | null;
  outcome_bullets: string[];
  pdf_path: string | null;
  tags: string[];
  confidentiality: string;
  featured: boolean;
  date_delivered: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  transformation: 'bg-accent-blue/10 text-accent-blue dark:text-accent-blue-dark',
  automation: 'bg-accent-cyan/10 text-accent-cyan',
  advisory: 'bg-accent-gold/10 text-accent-gold',
  implementation: 'bg-accent-green/10 text-accent-green',
  assessment: 'bg-accent-orange/10 text-accent-orange',
  migration: 'bg-accent-blue/10 text-accent-blue',
  upgrade: 'bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary',
  default: 'bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary',
};

function typeColor(type: string | null) {
  if (!type) return TYPE_COLORS.default;
  return TYPE_COLORS[type.toLowerCase()] ?? TYPE_COLORS.default;
}

function confidentialityBadge(level: string) {
  if (level === 'sanitised') return { label: 'Anonymised', icon: Eye, cls: 'text-accent-orange bg-accent-orange/10' };
  if (level === 'private') return { label: 'Confidential', icon: Lock, cls: 'text-accent-red bg-accent-red/10' };
  return null;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start) return '';
  const sy = new Date(start).getFullYear();
  if (!end) return `${sy} – present`;
  const ey = new Date(end).getFullYear();
  return sy === ey ? `${sy}` : `${sy} – ${ey}`;
}

function stripHtml(html: string | null): string {
  return html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

function matchProject(p: Project, q: string): { matches: boolean; fields: string[] } {
  if (!q) return { matches: true, fields: [] };
  const lower = q.toLowerCase();
  const fields: string[] = [];

  const checks: [string, string | null | undefined][] = [
    ['Title', p.title],
    ['Client', p.show_client_name && p.client_name ? p.client_name : p.client_display_name],
    ['Industry', p.industry],
    ['Type', p.project_type],
    ['Role', p.role],
    ['Summary', stripHtml(p.short_focus)],
    ['Context', stripHtml(p.context_html)],
    ['Challenge', stripHtml(p.challenge_html)],
    ['Outcomes', stripHtml(p.outcomes_html)],
  ];
  for (const [label, val] of checks) {
    if (val?.toLowerCase().includes(lower)) fields.push(label);
  }
  const allThemes = [...(p.sm_themes ?? []), ...(p.automation_themes ?? [])];
  if (allThemes.some(t => t.toLowerCase().includes(lower))) fields.push('Themes');
  if ((p.tags ?? []).some(t => t.toLowerCase().includes(lower))) fields.push('Tags');

  return { matches: fields.length > 0, fields };
}

function matchUseCase(uc: UseCase, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return [
    uc.title, uc.subtitle, uc.client_display_name,
    uc.show_client_name ? uc.client_name : null,
    uc.industry, uc.servicenow_product, uc.project_type,
    stripHtml(uc.summary_html), stripHtml(uc.challenge_html),
    stripHtml(uc.solution_html), stripHtml(uc.outcomes_html),
    ...(uc.tags ?? []),
    ...(uc.outcome_bullets ?? []),
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

// ─────────────────────────────────────────────
// Tab component
// ─────────────────────────────────────────────

function TabBar({ active, onChange, projectCount, useCaseCount }: {
  active: 'projects' | 'case-studies';
  onChange: (t: 'projects' | 'case-studies') => void;
  projectCount: number;
  useCaseCount: number;
}) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-light-elevated dark:bg-dark-elevated w-fit mb-8">
      {([
        { id: 'projects', label: 'Projects', icon: FolderOpen, count: projectCount },
        { id: 'case-studies', label: 'Case Studies', icon: BookOpen, count: useCaseCount },
      ] as const).map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            active === tab.id
              ? 'bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text shadow-sm'
              : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
          }`}
        >
          <tab.icon size={15} />
          {tab.label}
          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center transition-colors ${
            active === tab.id
              ? 'bg-accent-cyan/15 text-accent-cyan'
              : 'bg-light-border dark:bg-dark-border text-light-muted dark:text-dark-muted'
          }`}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Case Studies tab
// ─────────────────────────────────────────────

function CaseStudiesTab() {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState<UseCase | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from('use_cases')
      .select('*, employer:employers(name, short_name)')
      .eq('status', 'published')
      .order('date_delivered', { ascending: false })
      .then(({ data }) => {
        setUseCases(data ?? []);
        setLoading(false);
      });
  }, []);

  const products = [...new Set(useCases.map(uc => uc.servicenow_product).filter(Boolean))] as string[];
  const types = [...new Set(useCases.map(uc => uc.project_type).filter(Boolean))] as string[];

  const filtered = useCases.filter(uc => {
    if (!matchUseCase(uc, searchQuery)) return false;
    if (productFilter && uc.servicenow_product !== productFilter) return false;
    if (typeFilter && uc.project_type !== typeFilter) return false;
    return true;
  });

  const hasSearch = searchQuery.trim().length > 0;
  const activeFilters = [productFilter, typeFilter].filter(Boolean).length;

  function clearAll() { setSearchQuery(''); setProductFilter(''); setTypeFilter(''); }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(3)].map((_, i) => <div key={i} className="h-56 rounded-xl bg-light-elevated dark:bg-dark-elevated animate-pulse" />)}
      </div>
    );
  }

  const clientLabel = (uc: UseCase) =>
    uc.show_client_name && uc.client_name ? uc.client_name : uc.client_display_name;

  return (
    <>
      {/* Search */}
      <div className="mb-4">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
          hasSearch
            ? 'border-accent-cyan bg-accent-cyan/5 shadow-sm shadow-accent-cyan/10'
            : 'border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card hover:border-light-text/30 dark:hover:border-dark-text/30'
        }`}>
          <Search size={17} className={`flex-shrink-0 ${hasSearch ? 'text-accent-cyan' : 'text-light-muted dark:text-dark-muted'}`} />
          <input
            ref={searchRef}
            type="text" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search titles, clients, products, outcomes, tags…"
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

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <Filter size={14} className="text-light-muted dark:text-dark-muted" />
        <select value={productFilter} onChange={e => setProductFilter(e.target.value)}
          className={`text-sm rounded-lg border px-3 py-1.5 bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text transition-colors ${productFilter ? 'border-accent-cyan' : 'border-light-border dark:border-dark-border'}`}>
          <option value="">All products</option>
          {products.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className={`text-sm rounded-lg border px-3 py-1.5 bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text transition-colors ${typeFilter ? 'border-accent-cyan' : 'border-light-border dark:border-dark-border'}`}>
          <option value="">All types</option>
          {types.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
        </select>
        {(hasSearch || activeFilters > 0) && (
          <button onClick={clearAll} className="inline-flex items-center gap-1.5 text-sm text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors">
            <X size={13} /> Clear all
          </button>
        )}
        <span className="ml-auto text-sm text-light-muted dark:text-dark-muted">{filtered.length} case stud{filtered.length !== 1 ? 'ies' : 'y'}</span>
      </div>

      {/* Cards */}
      <div className={`flex gap-6 ${selected ? 'items-start' : ''}`}>
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1 ${selected ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-light-muted dark:text-dark-muted">
              No case studies match your search.
            </div>
          )}
          {filtered.map(uc => {
            const badge = confidentialityBadge(uc.confidentiality);
            const isActive = selected?.id === uc.id;
            const label = clientLabel(uc);
            return (
              <button
                key={uc.id}
                onClick={() => setSelected(isActive ? null : uc)}
                className={`text-left rounded-xl border p-5 transition-all hover:shadow-md ${
                  isActive
                    ? 'border-accent-cyan bg-accent-cyan/5'
                    : 'border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card hover:border-accent-cyan/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {uc.project_type && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${typeColor(uc.project_type)}`}>{uc.project_type}</span>
                    )}
                    {badge && (
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                        <badge.icon size={10} />{badge.label}
                      </span>
                    )}
                    {uc.featured && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-gold/10 text-accent-gold">Featured</span>
                    )}
                  </div>
                  <ChevronRight size={15} className={`flex-shrink-0 mt-0.5 transition-transform ${isActive ? 'rotate-90 text-accent-cyan' : 'text-light-muted dark:text-dark-muted'}`} />
                </div>

                <h3 className="font-semibold text-light-text dark:text-dark-text mb-1 leading-snug">
                  <Highlight text={uc.title} query={searchQuery} />
                </h3>
                {uc.subtitle && (
                  <p className="text-xs text-light-muted dark:text-dark-muted mb-1 italic">{uc.subtitle}</p>
                )}
                {label && (
                  <p className="text-xs text-light-muted dark:text-dark-muted mb-2">
                    <Highlight text={label} query={searchQuery} />
                  </p>
                )}
                {uc.summary_html && (
                  <div className="text-sm text-light-secondary dark:text-dark-secondary leading-relaxed line-clamp-2 mb-3 [&_p]:m-0" dangerouslySetInnerHTML={{ __html: uc.summary_html }} />
                )}

                <div className="flex items-center justify-between text-xs text-light-muted dark:text-dark-muted mt-auto pt-2 border-t border-light-border dark:border-dark-border">
                  <span>{uc.servicenow_product ?? uc.industry ?? ''}</span>
                  <div className="flex items-center gap-2">
                    {uc.pdf_path && <FileText size={12} className="text-accent-cyan" />}
                    <span>{formatDate(uc.date_delivered)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Desktop detail panel */}
        {selected && (
          <div className="hidden lg:block lg:w-[420px] xl:w-[480px] flex-shrink-0 sticky top-6">
            <div className="rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-elevated overflow-hidden">
              <div className="p-6 border-b border-light-border dark:border-dark-border">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex flex-wrap gap-1.5">
                    {selected.project_type && (
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${typeColor(selected.project_type)}`}>{selected.project_type}</span>
                    )}
                    {(() => {
                      const b = confidentialityBadge(selected.confidentiality);
                      return b ? (
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${b.cls}`}>
                          <b.icon size={10} />{b.label}
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-card text-light-muted dark:text-dark-muted">
                    <X size={16} />
                  </button>
                </div>
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-1">{selected.title}</h2>
                {selected.subtitle && <p className="text-sm text-light-muted dark:text-dark-muted italic mb-1">{selected.subtitle}</p>}
                {clientLabel(selected) && (
                  <p className="text-sm text-light-secondary dark:text-dark-secondary mb-1">{clientLabel(selected)}</p>
                )}
                <p className="text-xs text-light-muted dark:text-dark-muted">
                  {[selected.servicenow_product, selected.industry, formatDate(selected.date_delivered)].filter(Boolean).join(' · ')}
                </p>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5 text-sm">
                {selected.summary_html && (
                  <div className="text-light-secondary dark:text-dark-secondary leading-relaxed [&_p]:mb-1" dangerouslySetInnerHTML={{ __html: selected.summary_html }} />
                )}
                {selected.challenge_html && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2">Challenge</h4>
                    <div className="text-light-secondary dark:text-dark-secondary leading-relaxed [&_ul]:ml-4 [&_ul]:space-y-1 [&_li]:list-disc" dangerouslySetInnerHTML={{ __html: selected.challenge_html }} />
                  </div>
                )}
                {selected.solution_html && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2">Solution</h4>
                    <div className="text-light-secondary dark:text-dark-secondary leading-relaxed [&_ul]:ml-4 [&_ul]:space-y-1 [&_li]:list-disc" dangerouslySetInnerHTML={{ __html: selected.solution_html }} />
                  </div>
                )}
                {selected.outcome_bullets?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2">Key Outcomes</h4>
                    <ul className="space-y-2">
                      {selected.outcome_bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-light-secondary dark:text-dark-secondary">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-cyan flex-shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {selected.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selected.tags.map(t => (
                      <span key={t} className={`text-[11px] px-2 py-0.5 rounded-full ${
                        searchQuery && t.toLowerCase().includes(searchQuery.toLowerCase())
                          ? 'bg-accent-cyan/20 text-accent-cyan ring-1 ring-accent-cyan/40'
                          : 'bg-light-elevated dark:bg-dark-card text-light-muted dark:text-dark-muted'
                      }`}>{t}</span>
                    ))}
                  </div>
                )}
                {selected.pdf_path && (
                  <div className="pt-2 flex items-center gap-3">
                    <a
                      href={`/${selected.pdf_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan text-sm font-medium hover:bg-accent-cyan/20 transition-colors"
                    >
                      <FileText size={14} /> Download Case Study (PDF)
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile detail drawer */}
      {selected && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative z-10 bg-light-bg dark:bg-dark-elevated rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-light-border dark:border-dark-border">
              <h2 className="font-bold text-light-text dark:text-dark-text leading-snug pr-4">{selected.title}</h2>
              <button onClick={() => setSelected(null)} className="flex-shrink-0 p-1 rounded-lg text-light-muted dark:text-dark-muted"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              {selected.subtitle && <p className="text-xs text-light-muted dark:text-dark-muted italic">{selected.subtitle}</p>}
              {clientLabel(selected) && <p className="text-sm text-light-secondary dark:text-dark-secondary">{clientLabel(selected)}</p>}
              {selected.summary_html && <div className="text-light-secondary dark:text-dark-secondary [&_p]:mb-1" dangerouslySetInnerHTML={{ __html: selected.summary_html }} />}
              {selected.outcome_bullets?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2">Key Outcomes</h4>
                  <ul className="space-y-2">
                    {selected.outcome_bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-light-secondary dark:text-dark-secondary">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-cyan flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selected.pdf_path && (
                <a
                  href={`/${selected.pdf_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan text-sm font-medium hover:bg-accent-cyan/20 transition-colors"
                >
                  <FileText size={14} /> Download Case Study (PDF)
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// Projects tab (unchanged logic, extracted)
// ─────────────────────────────────────────────

function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Project | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(9);

  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [themeFilter, setThemeFilter] = useState('');

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase
      .from('projects')
      .select('*, employer:employers(name, short_name)')
      .eq('status', 'published')
      .order('date_start', { ascending: false })
      .then(({ data }) => {
        setProjects(data ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => { setVisibleCount(9); }, [searchQuery, industryFilter, typeFilter, themeFilter]);
  useEffect(() => {
    if (selected && !filtered.find(p => p.id === selected.id)) setSelected(null);
  });

  const industries = [...new Set(projects.map(p => p.industry).filter(Boolean))] as string[];
  const types = [...new Set(projects.map(p => p.project_type).filter(Boolean))] as string[];
  const allThemes = [...new Set(projects.flatMap(p => [...(p.sm_themes ?? []), ...(p.automation_themes ?? [])]))] as string[];

  const matchResults = projects.map(p => ({ p, ...matchProject(p, searchQuery) }));
  const filtered = matchResults
    .filter(({ matches, p }) => {
      if (!matches) return false;
      if (industryFilter && p.industry !== industryFilter) return false;
      if (typeFilter && p.project_type !== typeFilter) return false;
      if (themeFilter && ![...(p.sm_themes ?? []), ...(p.automation_themes ?? [])].includes(themeFilter)) return false;
      return true;
    })
    .map(({ p, fields }) => ({ ...p, _matchFields: fields }));

  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;
  const activeFilters = [industryFilter, typeFilter, themeFilter].filter(Boolean).length;
  const hasSearch = searchQuery.trim().length > 0;

  const clearAll = useCallback(() => {
    setSearchQuery(''); setIndustryFilter(''); setTypeFilter(''); setThemeFilter('');
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => <div key={i} className="h-52 rounded-xl bg-light-elevated dark:bg-dark-elevated animate-pulse" />)}
      </div>
    );
  }

  return (
    <>
      {/* Search bar */}
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
            placeholder="Search titles, clients, industries, themes, tags, topics…"
            className="flex-1 bg-transparent text-sm text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted outline-none"
          />
          {hasSearch && (
            <button onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
              className="flex-shrink-0 p-1 rounded-md text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors" title="Clear search">
              <X size={14} />
            </button>
          )}
        </div>

        {hasSearch && filtered.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 px-1">
            <span className="text-xs text-light-muted dark:text-dark-muted">{filtered.length} match{filtered.length !== 1 ? 'es' : ''} in:</span>
            {[...new Set(filtered.flatMap(p => (p as typeof p & { _matchFields: string[] })._matchFields))].map(f => (
              <span key={f} className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan">{f}</span>
            ))}
          </div>
        )}
        {hasSearch && filtered.length === 0 && (
          <p className="mt-2 text-xs text-light-muted dark:text-dark-muted px-1">
            No projects found for <span className="font-semibold text-light-text dark:text-dark-text">"{searchQuery}"</span>.{' '}
            <button onClick={() => setSearchQuery('')} className="text-accent-cyan hover:underline">Clear search</button>
          </p>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors ${
            filterOpen || activeFilters > 0
              ? 'border-accent-cyan text-accent-cyan bg-accent-cyan/5'
              : 'border-light-border dark:border-dark-border text-light-secondary dark:text-dark-secondary hover:border-light-text dark:hover:border-dark-text'
          }`}
        >
          <Filter size={14} />
          Filters
          {activeFilters > 0 && (
            <span className="ml-0.5 bg-accent-cyan text-white dark:text-dark-bg text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{activeFilters}</span>
          )}
        </button>

        {industryFilter && (
          <button onClick={() => setIndustryFilter('')} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary hover:bg-accent-red/10 hover:text-accent-red transition-colors">
            {industryFilter} <X size={10} />
          </button>
        )}
        {typeFilter && (
          <button onClick={() => setTypeFilter('')} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary hover:bg-accent-red/10 hover:text-accent-red transition-colors">
            {typeFilter} <X size={10} />
          </button>
        )}
        {themeFilter && (
          <button onClick={() => setThemeFilter('')} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary hover:bg-accent-red/10 hover:text-accent-red transition-colors">
            {themeFilter} <X size={10} />
          </button>
        )}
        {(activeFilters > 0 || hasSearch) && (
          <button onClick={clearAll} className="inline-flex items-center gap-1.5 text-sm text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors">
            <X size={13} /> Clear all
          </button>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-light-muted dark:text-dark-muted">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</span>
          <div className="flex rounded-lg border border-light-border dark:border-dark-border overflow-hidden">
            <button onClick={() => setView('grid')} title="Grid view"
              className={`p-2 transition-colors ${view === 'grid' ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-elevated'}`}>
              <LayoutGrid size={15} />
            </button>
            <button onClick={() => setView('list')} title="Timeline view"
              className={`p-2 transition-colors border-l border-light-border dark:border-dark-border ${view === 'list' ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-elevated'}`}>
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="mb-6 p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-elevated grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">Industry</label>
            <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}
              className="w-full rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-card text-light-text dark:text-dark-text text-sm px-3 py-2">
              <option value="">All industries</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">Project type</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="w-full rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-card text-light-text dark:text-dark-text text-sm px-3 py-2">
              <option value="">All types</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">Theme</label>
            <select value={themeFilter} onChange={e => setThemeFilter(e.target.value)}
              className="w-full rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-card text-light-text dark:text-dark-text text-sm px-3 py-2">
              <option value="">All themes</option>
              {allThemes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      )}

      {view === 'list' ? (
        <div className="relative pl-6 border-l-2 border-light-border dark:border-dark-border space-y-2">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-light-muted dark:text-dark-muted">No projects match your search.</div>
          )}
          {visible.map(p => {
            const badge = confidentialityBadge(p.confidentiality);
            const clientLabel = p.show_client_name && p.client_name ? p.client_name : p.client_display_name;
            return (
              <div key={p.id} className="relative">
                <div className={`absolute -left-[31px] top-5 w-3.5 h-3.5 rounded-full border-2 border-light-bg dark:border-dark-bg ${p.featured ? 'bg-accent-cyan' : 'bg-light-border dark:bg-dark-border'}`} />
                <div className="rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-5 hover:border-accent-cyan/30 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 text-right pt-0.5">
                      <span className="text-xs font-bold text-accent-cyan leading-snug">{formatDateRange(p.date_start, p.date_end)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-1.5">
                        {p.project_type && <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${typeColor(p.project_type)}`}>{p.project_type}</span>}
                        {badge && <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}><badge.icon size={10} />{badge.label}</span>}
                        {p.industry && <span className="text-[11px] px-2 py-0.5 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted">{p.industry}</span>}
                        {hasSearch && p._matchFields.filter(f => !['Title', 'Client'].includes(f)).map(f => (
                          <span key={f} className="text-[11px] px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan">matches {f}</span>
                        ))}
                      </div>
                      <h3 className="font-semibold text-light-text dark:text-dark-text group-hover:text-accent-cyan transition-colors leading-snug">
                        <Highlight text={p.title} query={searchQuery} />
                      </h3>
                      {clientLabel && <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5"><Highlight text={clientLabel} query={searchQuery} /></p>}
                      {p.short_focus && <div className="text-sm text-light-secondary dark:text-dark-secondary mt-1.5 leading-relaxed line-clamp-2 [&_p]:m-0" dangerouslySetInnerHTML={{ __html: p.short_focus }} />}
                    </div>
                    <Link to={`/projects/${p.slug}`} className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-accent-cyan hover:gap-2 transition-all mt-0.5">
                      View <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`flex gap-6 ${selected ? 'items-start' : ''}`}>
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1 transition-all ${selected ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center text-light-muted dark:text-dark-muted">No projects match your search.</div>
            )}
            {visible.map(p => {
              const badge = confidentialityBadge(p.confidentiality);
              const isActive = selected?.id === p.id;
              const clientLabel = p.show_client_name && p.client_name ? p.client_name : p.client_display_name;
              return (
                <button key={p.id} onClick={() => setSelected(isActive ? null : p)}
                  className={`text-left rounded-xl border p-5 transition-all hover:shadow-md ${isActive ? 'border-accent-cyan bg-accent-cyan/5 dark:bg-accent-cyan/5' : 'border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card hover:border-accent-cyan/40'}`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      {p.project_type && <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${typeColor(p.project_type)}`}>{p.project_type}</span>}
                      {badge && <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}><badge.icon size={10} />{badge.label}</span>}
                      {p.featured && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-gold/10 text-accent-gold">Featured</span>}
                      {hasSearch && p._matchFields.filter(f => !['Title', 'Client', 'Summary'].includes(f)).slice(0, 2).map(f => (
                        <span key={f} className="text-[11px] px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan">{f}</span>
                      ))}
                    </div>
                    <ChevronRight size={15} className={`flex-shrink-0 mt-0.5 transition-transform ${isActive ? 'rotate-90 text-accent-cyan' : 'text-light-muted dark:text-dark-muted'}`} />
                  </div>
                  <h3 className="font-semibold text-light-text dark:text-dark-text mb-1 leading-snug"><Highlight text={p.title} query={searchQuery} /></h3>
                  {clientLabel && <p className="text-xs text-light-muted dark:text-dark-muted mb-2"><Highlight text={clientLabel} query={searchQuery} /></p>}
                  {p.short_focus && <div className="text-sm text-light-secondary dark:text-dark-secondary leading-relaxed line-clamp-2 mb-3 [&_p]:m-0" dangerouslySetInnerHTML={{ __html: p.short_focus }} />}
                  <div className="flex items-center justify-between text-xs text-light-muted dark:text-dark-muted mt-auto pt-2 border-t border-light-border dark:border-dark-border">
                    <span><Highlight text={p.industry ?? ''} query={searchQuery} /></span>
                    <span>{formatDateRange(p.date_start, p.date_end)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Desktop detail panel */}
          {selected && (
            <div className="hidden lg:block lg:w-[400px] xl:w-[460px] flex-shrink-0 sticky top-6">
              <div className="rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-elevated overflow-hidden">
                <div className="p-6 border-b border-light-border dark:border-dark-border">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex flex-wrap gap-1.5">
                      {selected.project_type && <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${typeColor(selected.project_type)}`}>{selected.project_type}</span>}
                      {(() => { const b = confidentialityBadge(selected.confidentiality); return b ? <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${b.cls}`}><b.icon size={10} />{b.label}</span> : null; })()}
                    </div>
                    <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-card text-light-muted dark:text-dark-muted"><X size={16} /></button>
                  </div>
                  <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-1"><Highlight text={selected.title} query={searchQuery} /></h2>
                  {(selected.show_client_name && selected.client_name ? selected.client_name : selected.client_display_name) && (
                    <p className="text-sm text-light-secondary dark:text-dark-secondary mb-1">
                      <Highlight text={selected.show_client_name && selected.client_name ? selected.client_name : selected.client_display_name!} query={searchQuery} />
                    </p>
                  )}
                  <p className="text-xs text-light-muted dark:text-dark-muted">
                    {[selected.industry, selected.role, formatDateRange(selected.date_start, selected.date_end)].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5 text-sm">
                  {selected.short_focus && <div className="text-light-secondary dark:text-dark-secondary leading-relaxed [&_p]:mb-1 [&_p:last-child]:mb-0" dangerouslySetInnerHTML={{ __html: selected.short_focus }} />}
                  {selected.context_html && <div><h4 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2">Context</h4><div className="prose-sm text-light-secondary dark:text-dark-secondary" dangerouslySetInnerHTML={{ __html: selected.context_html }} /></div>}
                  {selected.challenge_html && <div><h4 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2">Challenge</h4><div className="prose-sm text-light-secondary dark:text-dark-secondary" dangerouslySetInnerHTML={{ __html: selected.challenge_html }} /></div>}
                  {selected.outcomes_html && <div><h4 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2">Outcomes</h4><div className="prose-sm text-light-secondary dark:text-dark-secondary" dangerouslySetInnerHTML={{ __html: selected.outcomes_html }} /></div>}
                  {(selected.sm_themes?.length > 0 || selected.automation_themes?.length > 0) && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2">Themes</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {[...(selected.sm_themes ?? []), ...(selected.automation_themes ?? [])].map(t => (
                          <span key={t} className={`text-[11px] px-2 py-0.5 rounded-full transition-colors ${searchQuery && t.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-accent-cyan/20 text-accent-cyan ring-1 ring-accent-cyan/40' : 'bg-light-elevated dark:bg-dark-card text-light-secondary dark:text-dark-secondary'}`}>{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selected.tags.map(t => (
                        <span key={t} className={`text-[11px] px-2 py-0.5 rounded-full transition-colors ${searchQuery && t.toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-accent-cyan/20 text-accent-cyan ring-1 ring-accent-cyan/40' : 'bg-light-elevated dark:bg-dark-card text-light-muted dark:text-dark-muted'}`}>{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="pt-2">
                    <Link to={`/projects/${selected.slug}`} className="inline-flex items-center gap-2 text-accent-cyan text-sm font-medium hover:gap-3 transition-all">
                      Full case study <ExternalLink size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button onClick={() => setVisibleCount(v => v + 9)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-light-border dark:border-dark-border text-sm font-medium text-light-secondary dark:text-dark-secondary hover:border-accent-cyan hover:text-accent-cyan transition-colors">
            <ChevronDown size={15} />
            Load more ({filtered.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Mobile detail drawer */}
      {selected && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="relative z-10 bg-light-bg dark:bg-dark-elevated rounded-t-2xl max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-light-border dark:border-dark-border">
              <h2 className="font-bold text-light-text dark:text-dark-text">{selected.title}</h2>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg text-light-muted dark:text-dark-muted"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              {selected.short_focus && <div className="text-light-secondary dark:text-dark-secondary [&_p]:mb-1 [&_p:last-child]:mb-0" dangerouslySetInnerHTML={{ __html: selected.short_focus }} />}
              {selected.context_html && <div><h4 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">Context</h4><div className="text-light-secondary dark:text-dark-secondary" dangerouslySetInnerHTML={{ __html: selected.context_html }} /></div>}
              {selected.outcomes_html && <div><h4 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-1.5">Outcomes</h4><div className="text-light-secondary dark:text-dark-secondary" dangerouslySetInnerHTML={{ __html: selected.outcomes_html }} /></div>}
              <Link to={`/projects/${selected.slug}`} className="inline-flex items-center gap-2 text-accent-cyan text-sm font-medium">Full case study <ExternalLink size={13} /></Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// Page shell
// ─────────────────────────────────────────────

export function ProjectsPage() {
  const [tab, setTab] = useState<'projects' | 'case-studies'>('projects');
  const [projectCount, setProjectCount] = useState(0);
  const [useCaseCount, setUseCaseCount] = useState(0);

  useEffect(() => {
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'published')
      .then(({ count }) => setProjectCount(count ?? 0));
    supabase.from('use_cases').select('id', { count: 'exact', head: true }).eq('status', 'published')
      .then(({ count }) => setUseCaseCount(count ?? 0));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-accent-cyan text-xs font-semibold uppercase tracking-widest mb-2">Portfolio</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text mb-3">Projects & Case Studies</h1>
        <p className="text-light-secondary dark:text-dark-secondary max-w-2xl">
          A curated archive of engagements across service management, intelligent automation, and digital transformation.
          Some clients are anonymised to preserve confidentiality.
        </p>
      </div>

      <TabBar active={tab} onChange={setTab} projectCount={projectCount} useCaseCount={useCaseCount} />

      {tab === 'projects' ? <ProjectsTab /> : <CaseStudiesTab />}
    </div>
  );
}
