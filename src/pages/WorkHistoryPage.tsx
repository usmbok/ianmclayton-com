import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, ChevronDown, Briefcase, Filter, X } from 'lucide-react';

interface WorkHistory {
  id: string;
  organisation: string;
  role_title: string;
  employment_type: string;
  date_start: string;
  date_end: string | null;
  is_current: boolean;
  location: string | null;
  summary: string | null;
  detail_html: string | null;
  key_achievements: string[];
  client_type: string | null;
  domains: string[];
  skills: string[];
  sort_order: number;
}

const EMPLOYMENT_COLORS: Record<string, string> = {
  'full-time':  'bg-accent-blue/10 text-accent-blue dark:text-accent-blue-dark',
  contract:     'bg-accent-cyan/10 text-accent-cyan',
  advisory:     'bg-accent-gold/10 text-accent-gold',
  consulting:   'bg-accent-green/10 text-accent-green',
  'part-time':  'bg-accent-orange/10 text-accent-orange',
};

function formatDate(d: string | null, isCurrent: boolean) {
  if (!d) return isCurrent ? 'Present' : '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatRange(start: string, end: string | null, isCurrent: boolean) {
  return `${formatDate(start, false)} – ${end ? formatDate(end, false) : 'Present'}`;
}

function calcDuration(start: string, end: string | null) {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  const yrs = Math.floor(months / 12);
  const mo = months % 12;
  if (yrs === 0) return `${mo}mo`;
  if (mo === 0) return `${yrs}yr`;
  return `${yrs}yr ${mo}mo`;
}

export function WorkHistoryPage() {
  const [roles, setRoles] = useState<WorkHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState('');
  const [domainFilter, setDomainFilter] = useState('');

  useEffect(() => {
    supabase
      .from('work_history')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        setRoles(data ?? []);
        setLoading(false);
      });
  }, []);

  function toggle(id: string) {
    setExpanded(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  const employmentTypes = [...new Set(roles.map(r => r.employment_type).filter(Boolean))];
  const allDomains = [...new Set(roles.flatMap(r => r.domains ?? []))];

  const filtered = roles.filter(r => {
    if (typeFilter && r.employment_type !== typeFilter) return false;
    if (domainFilter && !(r.domains ?? []).includes(domainFilter)) return false;
    return true;
  });

  const activeFilters = [typeFilter, domainFilter].filter(Boolean).length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-light-elevated dark:bg-dark-elevated animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-accent-cyan text-xs font-semibold uppercase tracking-widest mb-2">Career</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text mb-3">Work History</h1>
        <p className="text-light-secondary dark:text-dark-secondary max-w-2xl">
          Roles held across service management, consulting, advisory, and operational transformation over four decades.
        </p>
      </div>

      {/* Filters */}
      {(employmentTypes.length > 0 || allDomains.length > 0) && (
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <Filter size={13} className="text-light-muted dark:text-dark-muted" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-accent-cyan capitalize"
          >
            <option value="">All types</option>
            {employmentTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {allDomains.length > 0 && (
            <select
              value={domainFilter}
              onChange={e => setDomainFilter(e.target.value)}
              className="text-sm px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-accent-cyan"
            >
              <option value="">All domains</option>
              {allDomains.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
          {activeFilters > 0 && (
            <button
              onClick={() => { setTypeFilter(''); setDomainFilter(''); }}
              className="inline-flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors"
            >
              <X size={12} /> Clear
            </button>
          )}
          <span className="ml-auto text-sm text-light-muted dark:text-dark-muted">{filtered.length} role{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Expand / Collapse all */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs text-light-muted dark:text-dark-muted">{filtered.length} role{filtered.length !== 1 ? 's' : ''}</span>
        <button
          onClick={() => setExpanded(expanded.size === filtered.length ? new Set() : new Set(filtered.map(r => r.id)))}
          className="inline-flex items-center gap-1 text-xs font-medium text-accent-cyan hover:text-accent-cyan/75 transition-colors"
        >
          <ChevronDown size={13} className={`transition-transform duration-200 ${expanded.size === filtered.length ? 'rotate-180' : ''}`} />
          {expanded.size === filtered.length ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      {/* Timeline list */}
      <div className="relative pl-6 border-l-2 border-light-border dark:border-dark-border space-y-2">
        {filtered.map(role => {
          const isExpanded = expanded.has(role.id);
          const empColor = EMPLOYMENT_COLORS[role.employment_type] ?? 'bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary';

          return (
            <div key={role.id} className="relative">
              {/* Dot */}
              <div className={`absolute -left-[31px] top-5 w-3.5 h-3.5 rounded-full border-2 border-light-bg dark:border-dark-bg ${role.is_current ? 'bg-accent-cyan' : 'bg-light-border dark:bg-dark-border'}`} />

              <div className="rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card overflow-hidden">
                <button
                  className="w-full text-left p-5 hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors"
                  onClick={() => toggle(role.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {role.is_current && (
                          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-accent-cyan text-white dark:text-dark-bg">Current</span>
                        )}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${empColor}`}>
                          {role.employment_type}
                        </span>
                      </div>
                      <h3 className="font-bold text-light-text dark:text-dark-text leading-snug">{role.role_title}</h3>
                      <p className="text-sm font-medium text-accent-cyan mt-0.5">{role.organisation}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                      <div className="text-right">
                        <p className="text-xs text-light-muted dark:text-dark-muted">{formatRange(role.date_start, role.date_end, role.is_current)}</p>
                        <p className="text-[11px] text-light-muted/70 dark:text-dark-muted/70">{calcDuration(role.date_start, role.date_end)}</p>
                      </div>
                      <ChevronDown size={16} className={`text-light-muted dark:text-dark-muted transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-light-muted dark:text-dark-muted">
                    {role.location && (
                      <span className="flex items-center gap-1"><MapPin size={11} />{role.location}</span>
                    )}
                    {role.client_type && (
                      <span className="flex items-center gap-1"><Briefcase size={11} />{role.client_type}</span>
                    )}
                  </div>

                  {role.summary && (
                    <p className="mt-3 text-sm text-light-secondary dark:text-dark-secondary leading-relaxed line-clamp-2">{role.summary}</p>
                  )}
                </button>

                {/* Expanded detail — animated */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-5 pb-5 pt-1 border-t border-light-border dark:border-dark-border space-y-4">
                    {role.detail_html && (
                      <div
                        className="text-sm text-light-secondary dark:text-dark-secondary leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: role.detail_html }}
                      />
                    )}

                    {role.key_achievements?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2">Key Achievements</h4>
                        <ul className="space-y-1.5">
                          {role.key_achievements.map((a, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-light-secondary dark:text-dark-secondary">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent-cyan flex-shrink-0" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {role.domains?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2">Domains</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {role.domains.map(d => (
                            <span key={d} className="text-[11px] px-2 py-0.5 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary">{d}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {role.skills?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {role.skills.map(s => (
                            <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center text-light-muted dark:text-dark-muted">No work history entries found.</div>
      )}
    </div>
  );
}
