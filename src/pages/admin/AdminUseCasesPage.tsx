import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminBreadcrumb } from '../../components/AdminLayout';
import { RichTextEditor } from '../../components/RichTextEditor';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, X, Save, AlertCircle,
  Search, Filter, FileText,
} from 'lucide-react';

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
  employer_id: string | null;
  summary_html: string | null;
  challenge_html: string | null;
  solution_html: string | null;
  outcomes_html: string | null;
  outcome_bullets: string[];
  pdf_path: string | null;
  tags: string[];
  status: string;
  confidentiality: string;
  featured: boolean;
  date_delivered: string | null;
}

const EMPTY: Omit<UseCase, 'id'> = {
  title: '', slug: '', subtitle: '',
  client_display_name: '', client_name: '', show_client_name: false,
  industry: '', servicenow_product: '', project_type: 'implementation',
  employer_id: null,
  summary_html: '', challenge_html: '', solution_html: '', outcomes_html: '',
  outcome_bullets: [],
  pdf_path: '',
  tags: [],
  status: 'draft', confidentiality: 'public', featured: false,
  date_delivered: '',
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function stripHtml(html: string | null): string {
  return html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

function matchUseCase(uc: UseCase, q: string, employerName?: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return [
    uc.title, uc.subtitle, uc.client_display_name, uc.client_name,
    uc.industry, uc.servicenow_product, uc.project_type, employerName,
    stripHtml(uc.summary_html), stripHtml(uc.challenge_html),
    stripHtml(uc.solution_html), stripHtml(uc.outcomes_html),
    ...(uc.tags ?? []),
    ...(uc.outcome_bullets ?? []),
  ].some(v => v?.toLowerCase().includes(lower));
}

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {value.map(v => (
          <span key={v} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan">
            {v}<button type="button" onClick={() => onChange(value.filter(x => x !== v))}><X size={10} /></button>
          </span>
        ))}
      </div>
      <input
        type="text" value={input}
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

function BulletListField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('');
  return (
    <div className="space-y-2">
      {value.map((bullet, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-accent-cyan flex-shrink-0" />
          <div className="flex-1 text-sm text-light-text dark:text-dark-text bg-light-elevated dark:bg-dark-elevated rounded-lg px-3 py-2">
            {bullet}
          </div>
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="mt-1.5 p-1 rounded text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && input.trim()) {
              e.preventDefault();
              onChange([...value, input.trim()]);
              setInput('');
            }
          }}
          placeholder="Type a bullet point and press Enter…"
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:border-accent-cyan"
        />
        {input.trim() && (
          <button
            type="button"
            onClick={() => { onChange([...value, input.trim()]); setInput(''); }}
            className="px-3 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan text-xs font-semibold hover:bg-accent-cyan/20 transition-colors"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
}

export function AdminUseCasesPage() {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [employers, setEmployers] = useState<{ id: string; name: string; short_name: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<UseCase | null>(null);
  const [form, setForm] = useState<Omit<UseCase, 'id'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [employerFilter, setEmployerFilter] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  async function load() {
    const [{ data: ucs }, { data: emps }] = await Promise.all([
      supabase.from('use_cases').select('*').order('date_delivered', { ascending: false }),
      supabase.from('employers').select('id,name,short_name').order('sort_order').order('name'),
    ]);
    setUseCases(ucs ?? []);
    setEmployers(emps ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing({ id: '', ...EMPTY }); setForm(EMPTY); setError(''); }
  function openEdit(uc: UseCase) {
    setEditing(uc);
    const { id, ...rest } = uc;
    setForm(rest as Omit<UseCase, 'id'>);
    setError('');
  }
  function closeEditor() { setEditing(null); setError(''); }

  function set(field: keyof Omit<UseCase, 'id'>, val: unknown) {
    setForm(prev => {
      const next = { ...prev, [field]: val };
      if (field === 'title' && !editing?.id) next.slug = slugify(val as string);
      return next;
    });
  }

  async function save() {
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.slug.trim()) { setError('Slug is required'); return; }
    setSaving(true); setError('');
    const payload = { ...form, date_delivered: form.date_delivered || null };
    const isNew = !editing?.id;
    const { error: err } = isNew
      ? await supabase.from('use_cases').insert(payload)
      : await supabase.from('use_cases').update(payload).eq('id', editing!.id);
    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false); closeEditor(); load();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await supabase.from('use_cases').delete().eq('id', deleteId);
    setDeleteId(null); load();
  }

  async function toggleFeatured(uc: UseCase) {
    await supabase.from('use_cases').update({ featured: !uc.featured }).eq('id', uc.id);
    load();
  }

  async function toggleStatus(uc: UseCase) {
    await supabase.from('use_cases').update({ status: uc.status === 'published' ? 'draft' : 'published' }).eq('id', uc.id);
    load();
  }

  const inputCls = 'w-full text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:border-accent-cyan';
  const labelCls = 'block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1';

  const employerMap = Object.fromEntries(employers.map(e => [e.id, e.short_name || e.name]));
  const products = [...new Set(useCases.map(uc => uc.servicenow_product).filter(Boolean))] as string[];

  const filtered = useCases.filter(uc => {
    const empName = uc.employer_id ? employerMap[uc.employer_id] : undefined;
    if (!matchUseCase(uc, searchQuery, empName)) return false;
    if (statusFilter && uc.status !== statusFilter) return false;
    if (productFilter && uc.servicenow_product !== productFilter) return false;
    if (employerFilter && uc.employer_id !== employerFilter) return false;
    return true;
  });

  const hasSearch = searchQuery.trim().length > 0;
  const activeFilters = [statusFilter, productFilter, employerFilter].filter(Boolean).length;

  function clearAll() {
    setSearchQuery(''); setStatusFilter(''); setProductFilter(''); setEmployerFilter('');
  }

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'Use Cases' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Use Cases</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">
            {hasSearch || activeFilters > 0
              ? <>{filtered.length} of {useCases.length} shown</>
              : <>{useCases.length} total</>
            }
          </p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-white dark:text-dark-bg text-sm font-semibold hover:bg-accent-cyan/85 transition-colors">
          <Plus size={15} /> New Use Case
        </button>
      </div>

      {/* Search */}
      <div className="mb-3">
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all ${
          hasSearch ? 'border-accent-cyan bg-accent-cyan/5' : 'border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card'
        }`}>
          <Search size={15} className={`flex-shrink-0 ${hasSearch ? 'text-accent-cyan' : 'text-light-muted dark:text-dark-muted'}`} />
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
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Filter size={13} className="text-light-muted dark:text-dark-muted flex-shrink-0" />
        {([
          { value: statusFilter, set: setStatusFilter, placeholder: 'All statuses', options: [{ v: 'published', l: 'Published' }, { v: 'draft', l: 'Draft' }] },
        ] as const).map(({ value, placeholder, options }) => (
          <select key={placeholder}
            value={value}
            onChange={e => setStatusFilter(e.target.value)}
            className={`text-xs rounded-lg border px-2.5 py-1.5 bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text transition-colors ${value ? 'border-accent-cyan text-accent-cyan' : 'border-light-border dark:border-dark-border'}`}
          >
            <option value="">{placeholder}</option>
            {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        ))}
        <select value={productFilter} onChange={e => setProductFilter(e.target.value)}
          className={`text-xs rounded-lg border px-2.5 py-1.5 bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text transition-colors ${productFilter ? 'border-accent-cyan text-accent-cyan' : 'border-light-border dark:border-dark-border'}`}>
          <option value="">All products</option>
          {products.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={employerFilter} onChange={e => setEmployerFilter(e.target.value)}
          className={`text-xs rounded-lg border px-2.5 py-1.5 bg-light-card dark:bg-dark-card text-light-text dark:text-dark-text transition-colors ${employerFilter ? 'border-accent-cyan text-accent-cyan' : 'border-light-border dark:border-dark-border'}`}>
          <option value="">All employers</option>
          {employers.map(e => <option key={e.id} value={e.id}>{e.short_name || e.name}</option>)}
        </select>
        {(hasSearch || activeFilters > 0) && (
          <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors">
            <X size={11} /> Clear all
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-light-elevated dark:bg-dark-elevated animate-pulse" />)}</div>
      ) : (
        <div className="rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-light-elevated dark:bg-dark-elevated text-xs text-light-muted dark:text-dark-muted uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Product</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Employer</th>
                <th className="text-left px-4 py-3 font-semibold hidden xl:table-cell">PDF</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {filtered.map(uc => (
                <tr key={uc.id} className="bg-light-card dark:bg-dark-card hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-light-text dark:text-dark-text">{uc.title}</div>
                    {uc.subtitle && <div className="text-xs text-light-muted dark:text-dark-muted mt-0.5">{uc.subtitle}</div>}
                    {uc.client_name && (
                      <div className="inline-flex items-center gap-1 text-[11px] mt-0.5 text-light-muted dark:text-dark-muted">
                        {uc.show_client_name ? <Eye size={10} className="text-accent-cyan" /> : <EyeOff size={10} />}
                        <span className={uc.show_client_name ? 'text-accent-cyan' : ''}>{uc.client_name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-light-secondary dark:text-dark-secondary">{uc.servicenow_product || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {uc.employer_id ? (
                      <span className="text-xs font-medium text-light-secondary dark:text-dark-secondary">{employerMap[uc.employer_id] ?? '—'}</span>
                    ) : <span className="text-xs text-light-muted dark:text-dark-muted">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    {uc.pdf_path ? (
                      <a href={`/${uc.pdf_path}`} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-accent-cyan hover:underline">
                        <FileText size={11} /> PDF
                      </a>
                    ) : <span className="text-xs text-light-muted dark:text-dark-muted">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${uc.status === 'published' ? 'bg-accent-green/10 text-accent-green' : 'bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted'}`}>
                        {uc.status}
                      </span>
                      {uc.featured && <Star size={12} className="text-accent-gold" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => toggleFeatured(uc)} title="Toggle featured" className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted hover:text-accent-gold transition-colors">
                        <Star size={14} />
                      </button>
                      <button onClick={() => toggleStatus(uc)} title="Toggle status" className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted hover:text-accent-cyan transition-colors">
                        {uc.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => openEdit(uc)} className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(uc.id)} className="p-1.5 rounded-lg hover:bg-accent-red/10 text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-light-muted dark:text-dark-muted text-sm">
              {hasSearch || activeFilters > 0 ? 'No use cases match your search.' : 'No use cases yet. Create your first one.'}
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
              <h2 className="font-bold text-light-text dark:text-dark-text">{editing.id ? 'Edit Use Case' : 'New Use Case'}</h2>
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
                  <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Use case title" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Slug *</label>
                  <input className={inputCls} value={form.slug} onChange={e => set('slug', slugify(e.target.value))} placeholder="url-friendly-slug" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Subtitle / Tagline</label>
                  <input className={inputCls} value={form.subtitle ?? ''} onChange={e => set('subtitle', e.target.value)} placeholder="e.g. Global Cybersecurity Leader | ServiceNow CSM" />
                </div>

                <div>
                  <label className={labelCls}>Client display name</label>
                  <input className={inputCls} value={form.client_display_name ?? ''} onChange={e => set('client_display_name', e.target.value)} placeholder="e.g. 'Global Insurance Group'" />
                </div>
                <div>
                  <label className={labelCls}>Industry</label>
                  <input className={inputCls} value={form.industry ?? ''} onChange={e => set('industry', e.target.value)} placeholder="e.g. Financial Services" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Client name (actual — admin only unless shown publicly)</label>
                  <div className="flex gap-2">
                    <input className={inputCls} value={form.client_name ?? ''} onChange={e => set('client_name', e.target.value)} placeholder="e.g. Thales / Imperva" />
                    <button
                      type="button"
                      onClick={() => set('show_client_name', !form.show_client_name)}
                      className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                        form.show_client_name ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan' : 'border-light-border dark:border-dark-border text-light-muted dark:text-dark-muted hover:border-accent-cyan/50'
                      }`}
                    >
                      {form.show_client_name ? <Eye size={13} /> : <EyeOff size={13} />}
                      {form.show_client_name ? 'Visible' : 'Hidden'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>ServiceNow Product</label>
                  <input className={inputCls} value={form.servicenow_product ?? ''} onChange={e => set('servicenow_product', e.target.value)} placeholder="e.g. CSM, ITSM, HRSD…" />
                </div>
                <div>
                  <label className={labelCls}>Project type</label>
                  <select className={inputCls} value={form.project_type ?? 'implementation'} onChange={e => set('project_type', e.target.value)}>
                    <option value="implementation">Implementation</option>
                    <option value="advisory">Advisory</option>
                    <option value="migration">Migration</option>
                    <option value="upgrade">Upgrade</option>
                    <option value="assessment">Assessment</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Employer</label>
                  <select className={inputCls} value={form.employer_id ?? ''} onChange={e => set('employer_id', e.target.value || null)}>
                    <option value="">— Not linked —</option>
                    {employers.map(emp => <option key={emp.id} value={emp.id}>{emp.short_name || emp.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Date delivered</label>
                  <input type="date" className={inputCls} value={form.date_delivered ?? ''} onChange={e => set('date_delivered', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
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
                <div className="col-span-2">
                  <label className={labelCls}>PDF attachment path (relative to /public/)</label>
                  <input className={inputCls} value={form.pdf_path ?? ''} onChange={e => set('pdf_path', e.target.value)} placeholder="case-studies/my-case-study.pdf" />
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="uc-featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-cyan-400" />
                  <label htmlFor="uc-featured" className="text-sm text-light-text dark:text-dark-text cursor-pointer">Featured</label>
                </div>
              </div>

              <div>
                <label className={labelCls}>Tags (press Enter to add)</label>
                <TagInput value={form.tags} onChange={v => set('tags', v)} placeholder="e.g. ServiceNow, CSM, Migration…" />
              </div>

              <div>
                <label className={labelCls}>Summary</label>
                <RichTextEditor value={form.summary_html ?? ''} onChange={v => set('summary_html', v)} placeholder="Brief summary of the use case…" minHeight={100} />
              </div>
              <div>
                <label className={labelCls}>Challenge</label>
                <RichTextEditor value={form.challenge_html ?? ''} onChange={v => set('challenge_html', v)} placeholder="Describe the client challenge…" minHeight={140} />
              </div>
              <div>
                <label className={labelCls}>Solution Approach</label>
                <RichTextEditor value={form.solution_html ?? ''} onChange={v => set('solution_html', v)} placeholder="Describe the solution and approach…" minHeight={140} />
              </div>
              <div>
                <label className={labelCls}>Outcomes (narrative)</label>
                <RichTextEditor value={form.outcomes_html ?? ''} onChange={v => set('outcomes_html', v)} placeholder="Narrative description of outcomes…" minHeight={100} />
              </div>
              <div>
                <label className={labelCls}>Outcome bullets (for summary cards)</label>
                <BulletListField value={form.outcome_bullets} onChange={v => set('outcome_bullets', v)} />
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
            <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Delete use case?</h3>
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
