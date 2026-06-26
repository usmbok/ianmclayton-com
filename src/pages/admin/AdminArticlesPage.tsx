import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminBreadcrumb } from '../../components/AdminLayout';
import { RichTextEditor } from '../../components/RichTextEditor';
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, X, Save, AlertCircle, Download } from 'lucide-react';
import { downloadCSV, downloadSQL, stripHtml } from '../../lib/exportUtils';

interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  excerpt: string | null;
  content_html: string | null;
  category: string | null;
  tags: string[];
  status: string;
  featured: boolean;
  published_at: string | null;
  reading_time_minutes: number | null;
}

const EMPTY: Omit<Article, 'id'> = {
  title: '', subtitle: '', slug: '', excerpt: '', content_html: '',
  category: '', tags: [], status: 'draft', featured: false,
  published_at: '', reading_time_minutes: 5,
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {value.map(v => (
          <span key={v} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan">
            {v}<button onClick={() => onChange(value.filter(x => x !== v))}><X size={10} /></button>
          </span>
        ))}
      </div>
      <input type="text" value={input}
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

export function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState<Omit<Article, 'id'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function load() {
    const { data } = await supabase.from('articles').select('*').order('published_at', { ascending: false });
    setArticles(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing({ id: '', ...EMPTY }); setForm(EMPTY); setError(''); }
  function openEdit(a: Article) { setEditing(a); const { id, ...rest } = a; setForm(rest as Omit<Article, 'id'>); setError(''); }
  function closeEditor() { setEditing(null); setError(''); }
  function set(field: keyof Omit<Article, 'id'>, val: unknown) {
    setForm(prev => ({ ...prev, [field]: val }));
    if (field === 'title' && !editing?.id) {
      setForm(prev => ({ ...prev, slug: slugify(val as string) }));
    }
  }

  async function save() {
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.slug.trim()) { setError('Slug is required'); return; }
    setSaving(true); setError('');
    const payload = {
      ...form,
      published_at: form.status === 'published' && !form.published_at ? new Date().toISOString() : form.published_at || null,
      reading_time_minutes: form.reading_time_minutes ?? 5,
    };
    const isNew = !editing?.id;
    const { error: err } = isNew
      ? await supabase.from('articles').insert(payload)
      : await supabase.from('articles').update(payload).eq('id', editing!.id);
    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false); closeEditor(); load();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await supabase.from('articles').delete().eq('id', deleteId);
    setDeleteId(null); load();
  }

  async function toggleFeatured(a: Article) {
    await supabase.from('articles').update({ featured: !a.featured }).eq('id', a.id);
    load();
  }

  async function toggleStatus(a: Article) {
    const newStatus = a.status === 'published' ? 'draft' : 'published';
    const update: Partial<Article> = { status: newStatus };
    if (newStatus === 'published' && !a.published_at) update.published_at = new Date().toISOString();
    await supabase.from('articles').update(update).eq('id', a.id);
    load();
  }

  const inputCls = 'w-full text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:border-accent-cyan';
  const labelCls = 'block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1';

  function exportData(format: 'csv' | 'sql') {
    const rows = articles.map(a => ({
      id: a.id,
      title: a.title,
      subtitle: a.subtitle ?? '',
      slug: a.slug,
      category: a.category ?? '',
      status: a.status,
      featured: a.featured,
      published_at: a.published_at ?? '',
      reading_time_minutes: a.reading_time_minutes ?? '',
      tags: a.tags,
      excerpt: a.excerpt ?? '',
      content: stripHtml(a.content_html),
    }));
    if (format === 'csv') downloadCSV('articles', rows);
    else downloadSQL('articles', 'articles', rows);
  }

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'Articles' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Articles</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">{articles.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={exportRef}>
            <button onClick={() => setExportOpen(o => !o)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm text-light-secondary dark:text-dark-secondary hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors">
              <Download size={14} /> Export
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-light-bg dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg shadow-lg overflow-hidden z-10">
                <button onClick={() => { exportData('csv'); setExportOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-light-elevated dark:hover:bg-dark-card transition-colors">CSV</button>
                <button onClick={() => { exportData('sql'); setExportOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-light-elevated dark:hover:bg-dark-card transition-colors">SQL</button>
              </div>
            )}
          </div>
          <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-white dark:text-dark-bg text-sm font-semibold hover:bg-accent-cyan/85 transition-colors">
            <Plus size={15} /> New Article
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-light-elevated dark:bg-dark-elevated animate-pulse" />)}</div>
      ) : (
        <div className="rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-light-elevated dark:bg-dark-elevated text-xs text-light-muted dark:text-dark-muted uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Published</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {articles.map(a => (
                <tr key={a.id} className="bg-light-card dark:bg-dark-card hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-light-text dark:text-dark-text">{a.title}</div>
                    {a.subtitle && <div className="text-xs text-light-muted dark:text-dark-muted">{a.subtitle}</div>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-light-secondary dark:text-dark-secondary capitalize">{a.category || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-light-muted dark:text-dark-muted">
                    {a.published_at ? new Date(a.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${a.status === 'published' ? 'bg-accent-green/10 text-accent-green' : 'bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted'}`}>{a.status}</span>
                      {a.featured && <Star size={12} className="text-accent-gold" />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => toggleFeatured(a)} title="Toggle featured" className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted hover:text-accent-gold transition-colors"><Star size={14} /></button>
                      <button onClick={() => toggleStatus(a)} title="Toggle publish" className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted hover:text-accent-cyan transition-colors">
                        {a.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(a.id)} className="p-1.5 rounded-lg hover:bg-accent-red/10 text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {articles.length === 0 && <div className="py-10 text-center text-light-muted dark:text-dark-muted text-sm">No articles yet.</div>}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={closeEditor} />
          <div className="relative z-10 w-full max-w-2xl bg-light-bg dark:bg-dark-elevated flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
              <h2 className="font-bold text-light-text dark:text-dark-text">{editing.id ? 'Edit Article' : 'New Article'}</h2>
              <button onClick={closeEditor} className="p-1.5 rounded-lg text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-card"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-red/10 text-accent-red text-sm"><AlertCircle size={15} />{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Title *</label>
                  <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Article title" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Subtitle</label>
                  <input className={inputCls} value={form.subtitle ?? ''} onChange={e => set('subtitle', e.target.value)} placeholder="Optional subtitle" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Slug *</label>
                  <input className={inputCls} value={form.slug} onChange={e => set('slug', slugify(e.target.value))} placeholder="url-friendly-slug" />
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  <input className={inputCls} value={form.category ?? ''} onChange={e => set('category', e.target.value)} placeholder="e.g. Service Management" />
                </div>
                <div>
                  <label className={labelCls}>Reading time (min)</label>
                  <input type="number" min={1} className={inputCls} value={form.reading_time_minutes ?? 5} onChange={e => set('reading_time_minutes', parseInt(e.target.value) || 5)} />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Published date</label>
                  <input type="date" className={inputCls} value={form.published_at ? form.published_at.split('T')[0] : ''} onChange={e => set('published_at', e.target.value ? new Date(e.target.value).toISOString() : null)} />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="art-featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-cyan-400" />
                  <label htmlFor="art-featured" className="text-sm text-light-text dark:text-dark-text cursor-pointer">Featured</label>
                </div>
              </div>
              <div>
                <label className={labelCls}>Excerpt</label>
                <textarea rows={3} className={inputCls} value={form.excerpt ?? ''} onChange={e => set('excerpt', e.target.value)} placeholder="Short description shown in article listings" />
              </div>
              <div>
                <label className={labelCls}>Tags</label>
                <TagInput value={form.tags} onChange={v => set('tags', v)} placeholder="Add tag, press Enter" />
              </div>
              <div>
                <label className={labelCls}>Content</label>
                <RichTextEditor value={form.content_html ?? ''} onChange={v => set('content_html', v)} placeholder="Article content…" minHeight={300} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-light-border dark:border-dark-border flex justify-end gap-3">
              <button onClick={closeEditor} className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm text-light-secondary dark:text-dark-secondary hover:bg-light-elevated dark:hover:bg-dark-card transition-colors">Cancel</button>
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-white dark:text-dark-bg text-sm font-semibold hover:bg-accent-cyan/85 disabled:opacity-50 transition-colors">
                <Save size={14} />{saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 bg-light-bg dark:bg-dark-elevated rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Delete article?</h3>
            <p className="text-sm text-light-secondary dark:text-dark-secondary mb-5">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm text-light-secondary dark:text-dark-secondary">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-accent-red text-white text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
