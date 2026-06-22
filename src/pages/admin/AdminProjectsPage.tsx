import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminBreadcrumb } from '../../components/AdminLayout';
import { RichTextEditor } from '../../components/RichTextEditor';
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, X, Save, AlertCircle, Search, Filter } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  slug: string;
  client_display_name: string | null;
  client_name: string | null;
  show_client_name: boolean;
  employer_id: string | null;
  industry: string | null;
  project_type: string | null;
  status: string;
  confidentiality: string;
  featured: boolean;
  short_focus: string | null;
  role: string | null;
  date_start: string | null;
  date_end: string | null;
  sm_themes: string[];
  automation_themes: string[];
  tags: string[];
  context_html: string | null;
  challenge_html: string | null;
  my_role_html: string | null;
  approach_html: string | null;
  outcomes_html: string | null;
  lessons_html: string | null;
  client_comments_html: string | null;
}

const EMPTY: Omit<Project, 'id'> = {
  title: '', slug: '', client_display_name: '', client_name: '', show_client_name: false,
  employer_id: null,
  industry: '', project_type: '',
  status: 'published', confidentiality: 'public', featured: false,
  short_focus: '', role: '', date_start: '', date_end: '',
  sm_themes: [], automation_themes: [], tags: [],
  context_html: '', challenge_html: '', my_role_html: '',
  approach_html: '', outcomes_html: '', lessons_html: '',
  client_comments_html: '',
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function stripHtml(html: string | null): string {
  return html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

function matchProject(p: Project, q: string, employerName?: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  const clientLabel = p.show_client_name && p.client_name ? p.client_name : p.client_display_name;
  return [
    p.title,
    clientLabel,
    p.client_name,
    p.industry,
    p.project_type,
    p.role,
    employerName,
    stripHtml(p.short_focus),
    stripHtml(p.context_html),
    stripHtml(p.challenge_html),
    stripHtml(p.outcomes_html),
    ...(p.sm_themes ?? []),
    ...(p.automation_themes ?? []),
    ...(p.tags ?? []),
  ].some(v => v?.toLowerCase().includes(lower));
}

function ArrayField({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {value.map(v => (
          <span key={v} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan">
            {v}
            <button onClick={() => onChange(value.filter(x => x !== v))}><X size={10} /></button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
            e.preventDefault();
            if (!value.includes(input.trim())) onChange([...value, input.trim()]);
            setInput('');
          }
        }}
        placeholder={placeholder}
        className="w-full text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:border-accent-cyan"
      />
    </div>
  );
}

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [employers, setEmployers] = useState<{ id: string; name: string; short_name: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<Omit<Project, 'id'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [employerFilter, setEmployerFilter] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  async function load() {
    const [{ data: proj }, { data: emps }] = await Promise.all([
      supabase.from('projects').select('*').order('date_start', { ascending: false }),
      supabase.from('employers').select('id,name,short_name').order('sort_order').order('name'),
    ]);
    setProjects(proj ?? []);
    setEmployers(emps ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing({ id: '', ...EMPTY });
    setForm(EMPTY);
    setError('');
  }

  function openEdit(p: Project) {
    setEditing(p);
    const { id, ...rest } = p;
    setForm(rest as Omit<Project, 'id'>);
    setError('');
  }

  function closeEditor() { setEditing(null); setError(''); }

  function set(field: keyof Omit<Project, 'id'>, val: unknown) {
    setForm(prev => ({ ...prev, [field]: val }));
    if (field === 'title' && !editing?.id) {
      setForm(prev => ({ ...prev, slug: slugify(val as string) }));
    }
  }

  async function save() {
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.slug.trim()) { setError('Slug is required'); return; }
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      date_start: form.date_start || null,
      date_end: form.date_end || null,
    };
    const isNew = !editing?.id;
    const { error: err } = isNew
      ? await supabase.from('projects').insert(payload)
      : await supabase.from('projects').update(payload).eq('id', editing!.id);
    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false);
    closeEditor();
    load();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await supabase.from('projects').delete().eq('id', deleteId);
    setDeleteId(null);
    load();
  }

  async function toggleFeatured(p: Project) {
    await supabase.from('projects').update({ featured: !p.featured }).eq('id', p.id);
    load();
  }

  async function toggleStatus(p: Project) {
    await supabase.from('projects').update({ status: p.status === 'published' ? 'draft' : 'published' }).eq('id', p.id);
    load();
  }

  const inputCls = 'w-full text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:border-accent-cyan';
  const labelCls = 'block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1';

  // Dropdown options derived from loaded data
  const types = [...new Set(projects.map(p => p.project_type).filter(Boolean))] as string[];
  const industries = [...new Set(projects.map(p => p.industry).filter(Boolean))] as string[];
  const employerMap = Object.fromEntries(employers.map(e => [e.id, e.short_name || e.name]));

  // Apply search + filters
  const filtered = projects.filter(p => {
    const employerName = p.employer_id ? employerMap[p.employer_id] : undefined;
    if (!matchProject(p, searchQuery, employerName)) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    if (typeFilter && p.project_type !== typeFilter) return false;
    if (industryFilter && p.industry !== industryFilter) return false;
    if (employerFilter && p.employer_id !== employerFilter) return false;
    return true;
  });

  const hasSearch = searchQuery.trim().length > 0;
  const activeFilters = [statusFilter, typeFilter, industryFilter, employerFilter].filter(Boolean).length;

  function clearAll() {
    setSearchQuery('');
    setStatusFilter('');
    setTypeFilter('');
    setIndustryFilter('');
    setEmployerFilter('');
  }

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'Projects' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Projects</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">
            {hasSearch || activeFilters > 0
              ? <>{filtered.length} of {projects.length} shown</>
              : <>{projects.length} total</>
            }
          </p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-white dark:text-dark-bg text-sm font-semibold hover:bg-accent-cyan/85 transition-colors">
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-3">
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${
          hasSearch
            ? 'border-accent-cyan bg-accent-cyan/5'
            : 'border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card'
        }`}>
          <Search size={15} className={`flex-shrink-0 ${hasSearch ? 'text-accent-cyan' : 'text-light-muted dark:text-dark-muted'}`} />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search titles, clients, industries, themes, tags, topics…"
            className="flex-1 bg-transparent text-sm text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted outline-none"
          />
          {hasSearch && (
            <button
              onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
              className="flex-shrink-0 p-1 rounded-md text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Filter size={13} className="text-light-muted dark:text-dark-muted flex-shrink-0" />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className={`text-xs rounded-lg border px-2.5 py-1.5 bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text transition-colors ${
            statusFilter ? 'border-accent-cyan text-accent-cyan' : 'border-light-border dark:border-dark-border'
          }`}
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className={`text-xs rounded-lg border px-2.5 py-1.5 bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text transition-colors ${
            typeFilter ? 'border-accent-cyan text-accent-cyan' : 'border-light-border dark:border-dark-border'
          }`}
        >
          <option value="">All types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={industryFilter}
          onChange={e => setIndustryFilter(e.target.value)}
          className={`text-xs rounded-lg border px-2.5 py-1.5 bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text transition-colors ${
            industryFilter ? 'border-accent-cyan text-accent-cyan' : 'border-light-border dark:border-dark-border'
          }`}
        >
          <option value="">All industries</option>
          {industries.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <select
          value={employerFilter}
          onChange={e => setEmployerFilter(e.target.value)}
          className={`text-xs rounded-lg border px-2.5 py-1.5 bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text transition-colors ${
            employerFilter ? 'border-accent-cyan text-accent-cyan' : 'border-light-border dark:border-dark-border'
          }`}
        >
          <option value="">All employers</option>
          {employers.map(e => <option key={e.id} value={e.id}>{e.short_name || e.name}</option>)}
        </select>
        {(hasSearch || activeFilters > 0) && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors"
          >
            <X size={11} /> Clear all
          </button>
        )}
        {hasSearch && filtered.length === 0 && (
          <span className="text-xs text-light-muted dark:text-dark-muted ml-1">No results for "{searchQuery}"</span>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-light-elevated dark:bg-dark-elevated animate-pulse" />)}</div>
      ) : (
        <div className="rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-light-elevated dark:bg-dark-elevated text-xs text-light-muted dark:text-dark-muted uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Industry</th>
                <th className="text-left px-4 py-3 font-semibold hidden xl:table-cell">Employer</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {filtered.map(p => (
                <tr key={p.id} className="bg-light-card dark:bg-dark-card hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-light-text dark:text-dark-text">{p.title}</div>
                    {p.client_display_name && <div className="text-xs text-light-muted dark:text-dark-muted">{p.client_display_name}</div>}
                    {p.client_name && (
                      <div className="inline-flex items-center gap-1 text-[11px] mt-0.5 text-light-muted dark:text-dark-muted">
                        {p.show_client_name ? <Eye size={10} className="text-accent-cyan" /> : <EyeOff size={10} />}
                        <span className={p.show_client_name ? 'text-accent-cyan' : ''}>{p.client_name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-light-secondary dark:text-dark-secondary capitalize">{p.project_type || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-light-secondary dark:text-dark-secondary">{p.industry || '—'}</td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    {p.employer_id ? (
                      <span className="text-xs font-medium text-light-secondary dark:text-dark-secondary">
                        {employerMap[p.employer_id] ?? '—'}
                      </span>
                    ) : (
                      <span className="text-xs text-light-muted dark:text-dark-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${p.status === 'published' ? 'bg-accent-green/10 text-accent-green' : 'bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted'}`}>
                        {p.status}
                      </span>
                      {p.featured && <Star size={12} className="text-accent-gold" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => toggleFeatured(p)} title="Toggle featured" className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted hover:text-accent-gold transition-colors">
                        <Star size={14} />
                      </button>
                      <button onClick={() => toggleStatus(p)} title="Toggle status" className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted hover:text-accent-cyan transition-colors">
                        {p.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-accent-red/10 text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div className="py-12 text-center text-light-muted dark:text-dark-muted text-sm">
              {hasSearch || activeFilters > 0 ? 'No projects match your search.' : 'No projects yet. Create your first one.'}
            </div>
          )}
        </div>
      )}

      {/* Editor drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={closeEditor} />
          <div className="relative z-10 w-full max-w-2xl bg-light-bg dark:bg-dark-elevated flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
              <h2 className="font-bold text-light-text dark:text-dark-text">{editing.id ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={closeEditor} className="p-1.5 rounded-lg text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-card"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-red/10 text-accent-red text-sm">
                  <AlertCircle size={15} />{error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Title *</label>
                  <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Project title" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Slug *</label>
                  <input className={inputCls} value={form.slug} onChange={e => set('slug', slugify(e.target.value))} placeholder="url-friendly-slug" />
                </div>
                <div>
                  <label className={labelCls}>Project name</label>
                  <input className={inputCls} value={form.client_display_name ?? ''} onChange={e => set('client_display_name', e.target.value)} placeholder="e.g. 'Global Insurance Group' or 'Anonymised'" />
                </div>
                <div>
                  <label className={labelCls}>Industry</label>
                  <input className={inputCls} value={form.industry ?? ''} onChange={e => set('industry', e.target.value)} placeholder="e.g. Financial Services" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Client name (actual company — admin only unless shown publicly)</label>
                  <div className="flex gap-2">
                    <input className={inputCls} value={form.client_name ?? ''} onChange={e => set('client_name', e.target.value)} placeholder="e.g. Wawanesa Insurance, Navy Federal Credit Union" />
                    <button
                      type="button"
                      onClick={() => set('show_client_name', !form.show_client_name)}
                      title={form.show_client_name ? 'Currently visible publicly — click to hide' : 'Currently hidden publicly — click to show'}
                      className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                        form.show_client_name
                          ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan'
                          : 'border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-accent-cyan/50'
                      }`}
                    >
                      {form.show_client_name ? <Eye size={13} /> : <EyeOff size={13} />}
                      {form.show_client_name ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-light-muted dark:text-dark-muted">
                    {form.show_client_name ? 'Client name will be shown on the public project page.' : 'Client name is hidden from public pages — only Project name is shown.'}
                  </p>
                </div>
                <div>
                  <label className={labelCls}>Project type</label>
                  <input className={inputCls} value={form.project_type ?? ''} onChange={e => set('project_type', e.target.value)} placeholder="transformation, automation…" />
                </div>
                <div>
                  <label className={labelCls}>Employer</label>
                  <select className={inputCls} value={form.employer_id ?? ''} onChange={e => set('employer_id', e.target.value || null)}>
                    <option value="">— Not linked —</option>
                    {employers.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.short_name || emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Role</label>
                  <input className={inputCls} value={form.role ?? ''} onChange={e => set('role', e.target.value)} placeholder="Lead consultant, advisor…" />
                </div>
                <div>
                  <label className={labelCls}>Start date</label>
                  <input type="date" className={inputCls} value={form.date_start ?? ''} onChange={e => set('date_start', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>End date</label>
                  <input type="date" className={inputCls} value={form.date_end ?? ''} onChange={e => set('date_end', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Confidentiality</label>
                  <select className={inputCls} value={form.confidentiality} onChange={e => set('confidentiality', e.target.value)}>
                    <option value="public">Public</option>
                    <option value="sanitised">Anonymised</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="proj-featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-cyan-400" />
                  <label htmlFor="proj-featured" className="text-sm text-light-text dark:text-dark-text cursor-pointer">Featured on home page</label>
                </div>
              </div>

              <div>
                <label className={labelCls}>Short focus (summary)</label>
                <RichTextEditor value={form.short_focus ?? ''} onChange={v => set('short_focus', v)} placeholder="One-line description of the engagement" minHeight={80} />
              </div>

              <div>
                <label className={labelCls}>SM Themes (press Enter to add)</label>
                <ArrayField value={form.sm_themes} onChange={v => set('sm_themes', v)} placeholder="e.g. ITSM, Service Catalogue…" />
              </div>
              <div>
                <label className={labelCls}>Intelligent Automation themes</label>
                <ArrayField value={form.automation_themes} onChange={v => set('automation_themes', v)} placeholder="e.g. RPA, AI ops…" />
              </div>
              <div>
                <label className={labelCls}>Tags</label>
                <ArrayField value={form.tags} onChange={v => set('tags', v)} placeholder="Add tags…" />
              </div>

              {(['context_html', 'challenge_html', 'my_role_html', 'approach_html', 'outcomes_html', 'lessons_html'] as const).map(field => (
                <div key={field}>
                  <label className={labelCls}>{field.replace('_html', '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</label>
                  <RichTextEditor value={(form[field] as string) ?? ''} onChange={v => set(field, v)} placeholder={`${field.replace('_html', '').replace(/_/g, ' ')}…`} minHeight={120} />
                </div>
              ))}

              <div className="pt-2 border-t border-light-border dark:border-dark-border">
                <label className={labelCls}>Client Comments</label>
                <p className="text-[11px] text-light-muted dark:text-dark-muted mb-1.5">Feedback, testimonials, or commentary received from the client — displayed on the public project page.</p>
                <RichTextEditor value={form.client_comments_html ?? ''} onChange={v => set('client_comments_html', v)} placeholder="Enter any client feedback or comments…" minHeight={120} />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-light-border dark:border-dark-border flex items-center justify-end gap-3">
              <button onClick={closeEditor} className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm text-light-secondary dark:text-dark-secondary hover:bg-light-elevated dark:hover:bg-dark-card transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-white dark:text-dark-bg text-sm font-semibold hover:bg-accent-cyan/85 disabled:opacity-50 transition-colors">
                <Save size={14} />{saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 bg-light-bg dark:bg-dark-elevated rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Delete project?</h3>
            <p className="text-sm text-light-secondary dark:text-dark-secondary mb-5">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm text-light-secondary dark:text-dark-secondary hover:bg-light-elevated dark:hover:bg-dark-card transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-accent-red text-white text-sm font-semibold hover:bg-accent-red/85 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
