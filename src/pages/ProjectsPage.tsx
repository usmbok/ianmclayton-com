import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Filter, X, Lock, Eye,
  LayoutGrid, List, ChevronDown, Search, FolderOpen, BookOpen,
  FileText, ChevronRight,
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
    stripHtml(uc.summary_html),
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
// Tab bar
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
  const navigate = useNavigate();
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-light-muted dark:text-dark-muted">
            No case studies match your search.
          </div>
        )}
        {filtered.map(uc => {
          const badge = confidentialityBadge(uc.confidentiality);
          const label = uc.show_client_name && uc.client_name ? uc.client_name : uc.client_display_name;
          return (
            <button
              key={uc.id}
              onClick={() => navigate(`/case-studies/${uc.slug}`)}
              className="text-left rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-5 hover:border-accent-cyan/50 hover:shadow-md transition-all group"
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
                <ChevronRight size={15} className="flex-shrink-0 mt-0.5 text-light-muted dark:text-dark-muted group-hover:text-accent-cyan group-hover:translate-x-0.5 transition-all" />
              </div>

              <h3 className="font-semibold text-light-text dark:text-dark-text mb-1 leading-snug group-hover:text-accent-cyan transition-colors">
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
    </>
  );
}

// ─────────────────────────────────────────────
// Projects tab
// ─────────────────────────────────────────────

function ProjectsTab() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
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

      {/* List view */}
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
                <button
                  onClick={() => navigate(`/projects/${p.slug}`)}
                  className="w-full text-left rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-5 hover:border-accent-cyan/40 hover:shadow-sm transition-all group"
                >
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
                    <ChevronRight size={15} className="flex-shrink-0 mt-1 text-light-muted dark:text-dark-muted group-hover:text-accent-cyan group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-light-muted dark:text-dark-muted">No projects match your search.</div>
          )}
          {visible.map(p => {
            const badge = confidentialityBadge(p.confidentiality);
            const clientLabel = p.show_client_name && p.client_name ? p.client_name : p.client_display_name;
            return (
              <button
                key={p.id}
                onClick={() => navigate(`/projects/${p.slug}`)}
                className="text-left rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-5 hover:border-accent-cyan/50 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {p.project_type && <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${typeColor(p.project_type)}`}>{p.project_type}</span>}
                    {badge && <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}><badge.icon size={10} />{badge.label}</span>}
                    {p.featured && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-gold/10 text-accent-gold">Featured</span>}
                    {hasSearch && p._matchFields.filter(f => !['Title', 'Client', 'Summary'].includes(f)).slice(0, 2).map(f => (
                      <span key={f} className="text-[11px] px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan">{f}</span>
                    ))}
                  </div>
                  <ChevronRight size={15} className="flex-shrink-0 mt-0.5 text-light-muted dark:text-dark-muted group-hover:text-accent-cyan group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-semibold text-light-text dark:text-dark-text mb-1 leading-snug group-hover:text-accent-cyan transition-colors">
                  <Highlight text={p.title} query={searchQuery} />
                </h3>
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
    </>
  );
}

// ─────────────────────────────────────────────
// Page shell
// ─────────────────────────────────────────────

export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const tab: 'projects' | 'case-studies' = rawTab === 'case-studies' ? 'case-studies' : 'projects';

  const [projectCount, setProjectCount] = useState(0);
  const [useCaseCount, setUseCaseCount] = useState(0);

  useEffect(() => {
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'published')
      .then(({ count }) => setProjectCount(count ?? 0));
    supabase.from('use_cases').select('id', { count: 'exact', head: true }).eq('status', 'published')
      .then(({ count }) => setUseCaseCount(count ?? 0));
  }, []);

  function handleTabChange(t: 'projects' | 'case-studies') {
    setSearchParams(t === 'case-studies' ? { tab: 'case-studies' } : {}, { replace: true });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <p className="text-accent-cyan text-xs font-semibold uppercase tracking-widest mb-2">Portfolio</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text mb-3">Projects & Case Studies</h1>
        <p className="text-light-secondary dark:text-dark-secondary max-w-2xl">
          A curated archive of engagements across service management, intelligent automation, and digital transformation.
          Some clients are anonymised to preserve confidentiality.
        </p>
      </div>

      <TabBar active={tab} onChange={handleTabChange} projectCount={projectCount} useCaseCount={useCaseCount} />

      {tab === 'projects' ? <ProjectsTab /> : <CaseStudiesTab />}
    </div>
  );
}
