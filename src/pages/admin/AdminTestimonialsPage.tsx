import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminBreadcrumb } from '../../components/AdminLayout';
import { RichTextEditor } from '../../components/RichTextEditor';
import { Plus, Pencil, Trash2, Star, X, Save, AlertCircle, GripVertical, Eye, EyeOff, Download } from 'lucide-react';
import { downloadCSV, downloadSQL, stripHtml } from '../../lib/exportUtils';

interface Testimonial {
  id: string;
  quote: string;
  attributed_name: string;
  attributed_role: string | null;
  attributed_organisation: string | null;
  relationship_context: string | null;
  tags: string[];
  featured: boolean;
  active: boolean;
  sort_order: number;
  status: string;
}

const EMPTY: Omit<Testimonial, 'id'> = {
  quote: '', attributed_name: '', attributed_role: '', attributed_organisation: '',
  relationship_context: '', tags: [], featured: false, active: true, sort_order: 0, status: 'published',
};

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

export function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<Omit<Testimonial, 'id'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from('testimonials').select('*').order('sort_order', { ascending: true });
    setTestimonials(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    const nextOrder = testimonials.length > 0 ? Math.max(...testimonials.map(t => t.sort_order)) + 1 : 0;
    const empty = { ...EMPTY, sort_order: nextOrder };
    setEditing({ id: '', ...empty });
    setForm(empty);
    setError('');
  }
  function openEdit(t: Testimonial) { setEditing(t); const { id, ...rest } = t; setForm(rest as Omit<Testimonial, 'id'>); setError(''); }
  function closeEditor() { setEditing(null); setError(''); }
  function set(field: keyof Omit<Testimonial, 'id'>, val: unknown) { setForm(prev => ({ ...prev, [field]: val })); }

  async function save() {
    if (!form.quote.trim()) { setError('Quote is required'); return; }
    if (!form.attributed_name.trim()) { setError('Name is required'); return; }
    setSaving(true); setError('');
    const isNew = !editing?.id;
    const { error: err } = isNew
      ? await supabase.from('testimonials').insert(form)
      : await supabase.from('testimonials').update(form).eq('id', editing!.id);
    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false); closeEditor(); load();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await supabase.from('testimonials').delete().eq('id', deleteId);
    setDeleteId(null); load();
  }

  async function toggleFeatured(t: Testimonial) {
    await supabase.from('testimonials').update({ featured: !t.featured }).eq('id', t.id);
    load();
  }

  async function toggleActive(t: Testimonial) {
    await supabase.from('testimonials').update({ active: !t.active }).eq('id', t.id);
    load();
  }

  const inputCls = 'w-full text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:border-accent-cyan';
  const labelCls = 'block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1';

  function exportData(format: 'csv' | 'sql') {
    const rows = testimonials.map(t => ({
      id: t.id,
      quote: stripHtml(t.quote),
      attributed_name: t.attributed_name,
      attributed_role: t.attributed_role ?? '',
      attributed_organisation: t.attributed_organisation ?? '',
      relationship_context: t.relationship_context ?? '',
      tags: t.tags,
      featured: t.featured,
      active: t.active,
      status: t.status,
      sort_order: t.sort_order,
    }));
    if (format === 'csv') downloadCSV('testimonials', rows);
    else downloadSQL('testimonials', 'testimonials', rows);
  }

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'Testimonials' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Testimonials</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">{testimonials.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm text-light-secondary dark:text-dark-secondary hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors">
              <Download size={14} /> Export
            </button>
            <div className="absolute right-0 top-full mt-1 w-32 bg-light-bg dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg shadow-lg overflow-hidden hidden group-hover:block z-10">
              <button onClick={() => exportData('csv')} className="w-full text-left px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-light-elevated dark:hover:bg-dark-card transition-colors">CSV</button>
              <button onClick={() => exportData('sql')} className="w-full text-left px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-light-elevated dark:hover:bg-dark-card transition-colors">SQL</button>
            </div>
          </div>
          <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-white dark:text-dark-bg text-sm font-semibold hover:bg-accent-cyan/85 transition-colors">
            <Plus size={15} /> New Testimonial
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-lg bg-light-elevated dark:bg-dark-elevated animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {testimonials.map(t => (
            <div key={t.id} className="flex items-start gap-3 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-4">
              <GripVertical size={16} className="text-light-muted dark:text-dark-muted mt-1 flex-shrink-0 cursor-grab" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-light-secondary dark:text-dark-secondary leading-relaxed line-clamp-2 mb-1.5">"{t.quote}"</p>
                <p className="text-xs font-medium text-light-text dark:text-dark-text">{t.attributed_name}</p>
                {(t.attributed_role || t.attributed_organisation) && (
                  <p className="text-[11px] text-light-muted dark:text-dark-muted">{[t.attributed_role, t.attributed_organisation].filter(Boolean).join(', ')}</p>
                )}
                {t.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {t.tags.map(tag => <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted">{tag}</span>)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${t.status === 'published' ? 'bg-accent-green/10 text-accent-green' : 'bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted'}`}>{t.status}</span>
                <button onClick={() => toggleActive(t)} title="Toggle active" className={`p-1.5 rounded-lg transition-colors ${t.active !== false ? 'text-accent-cyan hover:text-accent-cyan/70' : 'text-light-muted dark:text-dark-muted hover:text-accent-cyan'}`}>
                  {t.active !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => toggleFeatured(t)} className={`p-1.5 rounded-lg transition-colors ${t.featured ? 'text-accent-gold' : 'text-light-muted dark:text-dark-muted hover:text-accent-gold'}`}><Star size={14} /></button>
                <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted transition-colors"><Pencil size={14} /></button>
                <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg hover:bg-accent-red/10 text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {testimonials.length === 0 && <div className="py-12 text-center text-light-muted dark:text-dark-muted text-sm">No testimonials yet.</div>}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={closeEditor} />
          <div className="relative z-10 w-full max-w-xl bg-light-bg dark:bg-dark-elevated flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
              <h2 className="font-bold text-light-text dark:text-dark-text">{editing.id ? 'Edit Testimonial' : 'New Testimonial'}</h2>
              <button onClick={closeEditor} className="p-1.5 rounded-lg text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-card"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-red/10 text-accent-red text-sm"><AlertCircle size={15} />{error}</div>}
              <div>
                <label className={labelCls}>Quote *</label>
                <RichTextEditor value={form.quote} onChange={v => set('quote', v)} placeholder="The testimonial quote…" minHeight={140} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Name *</label>
                  <input className={inputCls} value={form.attributed_name} onChange={e => set('attributed_name', e.target.value)} placeholder="John Smith" />
                </div>
                <div>
                  <label className={labelCls}>Role</label>
                  <input className={inputCls} value={form.attributed_role ?? ''} onChange={e => set('attributed_role', e.target.value)} placeholder="CIO, VP of Operations…" />
                </div>
                <div>
                  <label className={labelCls}>Organisation</label>
                  <input className={inputCls} value={form.attributed_organisation ?? ''} onChange={e => set('attributed_organisation', e.target.value)} placeholder="Company name" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Relationship context</label>
                  <input className={inputCls} value={form.relationship_context ?? ''} onChange={e => set('relationship_context', e.target.value)} placeholder="e.g. Client engagement, ITSM consultancy" />
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Sort order</label>
                  <input type="number" min={0} className={inputCls} value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="test-featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 accent-cyan-400" />
                  <label htmlFor="test-featured" className="text-sm text-light-text dark:text-dark-text cursor-pointer">Featured</label>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="test-active" checked={form.active !== false} onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-cyan-400" />
                  <label htmlFor="test-active" className="text-sm text-light-text dark:text-dark-text cursor-pointer">Active (visible on site)</label>
                </div>
              </div>
              <div>
                <label className={labelCls}>Tags</label>
                <TagInput value={form.tags} onChange={v => set('tags', v)} placeholder="Add tag, press Enter" />
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
            <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Delete testimonial?</h3>
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
