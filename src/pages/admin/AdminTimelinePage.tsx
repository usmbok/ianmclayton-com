import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminBreadcrumb } from '../../components/AdminLayout';
import { RichTextEditor } from '../../components/RichTextEditor';
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, X, Save, AlertCircle, Download } from 'lucide-react';
import { downloadCSV, downloadSQL, stripHtml } from '../../lib/exportUtils';

interface Entry {
  id: string;
  title: string;
  organisation: string | null;
  entry_date: string;
  entry_date_end: string | null;
  entry_type: string;
  summary: string;
  detail_html: string | null;
  role: string | null;
  industry: string | null;
  sm_themes: string[];
  automation_themes: string[];
  skills: string[];
  tags: string[];
  is_milestone: boolean;
  is_featured: boolean;
  status: string;
  confidentiality: string;
}

const ENTRY_TYPES = ['career', 'project', 'publication', 'award', 'education', 'speaking', 'milestone'];

const EMPTY: Omit<Entry, 'id'> = {
  title: '', organisation: '', entry_date: '', entry_date_end: null,
  entry_type: 'career', summary: '', detail_html: '', role: '', industry: '',
  sm_themes: [], automation_themes: [], skills: [], tags: [],
  is_milestone: false, is_featured: false, status: 'published', confidentiality: 'public',
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

export function AdminTimelinePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [form, setForm] = useState<Omit<Entry, 'id'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
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
    const { data } = await supabase.from('timeline_entries').select('*').order('entry_date', { ascending: false });
    setEntries(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() { setEditing({ id: '', ...EMPTY }); setForm(EMPTY); setError(''); }
  function openEdit(e: Entry) { setEditing(e); const { id, ...rest } = e; setForm(rest as Omit<Entry, 'id'>); setError(''); }
  function closeEditor() { setEditing(null); setError(''); }
  function set(field: keyof Omit<Entry, 'id'>, val: unknown) { setForm(prev => ({ ...prev, [field]: val })); }

  async function save() {
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!form.entry_date) { setError('Date is required'); return; }
    if (!form.summary.trim()) { setError('Summary is required'); return; }
    setSaving(true); setError('');
    const isNew = !editing?.id;
    const { error: err } = isNew
      ? await supabase.from('timeline_entries').insert(form)
      : await supabase.from('timeline_entries').update(form).eq('id', editing!.id);
    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false); closeEditor(); load();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await supabase.from('timeline_entries').delete().eq('id', deleteId);
    setDeleteId(null); load();
  }

  const filtered = typeFilter ? entries.filter(e => e.entry_type === typeFilter) : entries;
  const inputCls = 'w-full text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:border-accent-cyan';
  const labelCls = 'block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1';

  function exportData(format: 'csv' | 'sql') {
    const rows = filtered.map(e => ({
      id: e.id,
      title: e.title,
      entry_type: e.entry_type,
      organisation: e.organisation ?? '',
      role: e.role ?? '',
      industry: e.industry ?? '',
      entry_date: e.entry_date,
      entry_date_end: e.entry_date_end ?? '',
      status: e.status,
      confidentiality: e.confidentiality,
      is_milestone: e.is_milestone,
      is_featured: e.is_featured,
      sm_themes: e.sm_themes,
      automation_themes: e.automation_themes,
      skills: e.skills,
      tags: e.tags,
      summary: e.summary,
      detail: stripHtml(e.detail_html),
    }));
    if (format === 'csv') downloadCSV('timeline_entries', rows);
    else downloadSQL('timeline_entries', 'timeline_entries', rows);
  }

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'Timeline' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Timeline</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">{entries.length} entries</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative" ref={exportRef}>
            <button onClick={() => setExportOpen(o => !o)} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm text-light-secondary dark:text-dark-secondary hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors">
              <Download size={14} /> Export ({filtered.length})
            </button>
            {exportOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-light-bg dark:bg-dark-elevated border border-light-border dark:border-dark-border rounded-lg shadow-lg overflow-hidden z-10">
                <button onClick={() => { exportData('csv'); setExportOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-light-elevated dark:hover:bg-dark-card transition-colors">CSV</button>
                <button onClick={() => { exportData('sql'); setExportOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-light-text dark:text-dark-text hover:bg-light-elevated dark:hover:bg-dark-card transition-colors">SQL</button>
              </div>
            )}
          </div>
          <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-white dark:text-dark-bg text-sm font-semibold hover:bg-accent-cyan/85 transition-colors">
            <Plus size={15} /> New Entry
          </button>
        </div>
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setTypeFilter('')} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!typeFilter ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan' : 'border-light-border dark:border-dark-border text-light-secondary dark:text-dark-secondary'}`}>All</button>
        {ENTRY_TYPES.map(t => (
          <button key={t} onClick={() => setTypeFilter(t === typeFilter ? '' : t)} className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-colors ${typeFilter === t ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan' : 'border-light-border dark:border-dark-border text-light-secondary dark:text-dark-secondary'}`}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-light-elevated dark:bg-dark-elevated animate-pulse" />)}</div>
      ) : (
        <div className="rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-light-elevated dark:bg-dark-elevated text-xs text-light-muted dark:text-dark-muted uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {filtered.map(e => (
                <tr key={e.id} className="bg-light-card dark:bg-dark-card hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-light-text dark:text-dark-text flex items-center gap-1.5">
                      {e.is_milestone && <Star size={11} className="text-accent-gold flex-shrink-0" />}
                      {e.title}
                    </div>
                    {e.organisation && <div className="text-xs text-light-muted dark:text-dark-muted">{e.organisation}</div>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary capitalize">{e.entry_type}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-light-secondary dark:text-dark-secondary text-xs">{new Date(e.entry_date).getFullYear()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${e.status === 'published' ? 'bg-accent-green/10 text-accent-green' : 'bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted'}`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(e.id)} className="p-1.5 rounded-lg hover:bg-accent-red/10 text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-10 text-center text-light-muted dark:text-dark-muted text-sm">No entries yet.</div>}
        </div>
      )}

      {/* Editor */}
      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={closeEditor} />
          <div className="relative z-10 w-full max-w-2xl bg-light-bg dark:bg-dark-elevated flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
              <h2 className="font-bold text-light-text dark:text-dark-text">{editing.id ? 'Edit Entry' : 'New Entry'}</h2>
              <button onClick={closeEditor} className="p-1.5 rounded-lg text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-card"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-red/10 text-accent-red text-sm"><AlertCircle size={15} />{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Title *</label>
                  <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Entry title" />
                </div>
                <div>
                  <label className={labelCls}>Type</label>
                  <select className={inputCls} value={form.entry_type} onChange={e => set('entry_type', e.target.value)}>
                    {ENTRY_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Organisation</label>
                  <input className={inputCls} value={form.organisation ?? ''} onChange={e => set('organisation', e.target.value)} placeholder="Company / client" />
                </div>
                <div>
                  <label className={labelCls}>Start date *</label>
                  <input type="date" className={inputCls} value={form.entry_date} onChange={e => set('entry_date', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>End date</label>
                  <input type="date" className={inputCls} value={form.entry_date_end ?? ''} onChange={e => set('entry_date_end', e.target.value || null)} />
                </div>
                <div>
                  <label className={labelCls}>Role</label>
                  <input className={inputCls} value={form.role ?? ''} onChange={e => set('role', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Industry</label>
                  <input className={inputCls} value={form.industry ?? ''} onChange={e => set('industry', e.target.value)} />
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
                <div className="col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_milestone} onChange={e => set('is_milestone', e.target.checked)} className="w-4 h-4 accent-yellow-400" />
                    <span className="text-sm text-light-text dark:text-dark-text">Milestone</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="w-4 h-4 accent-cyan-400" />
                    <span className="text-sm text-light-text dark:text-dark-text">Featured</span>
                  </label>
                </div>
              </div>

              <div>
                <label className={labelCls}>Summary * (plain text)</label>
                <textarea rows={3} className={inputCls} value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="Brief summary of this entry" />
              </div>
              <div>
                <label className={labelCls}>Detail</label>
                <RichTextEditor value={form.detail_html ?? ''} onChange={v => set('detail_html', v)} placeholder="Extended detail for this entry…" />
              </div>
              <div>
                <label className={labelCls}>SM Themes</label>
                <TagInput value={form.sm_themes} onChange={v => set('sm_themes', v)} placeholder="Add theme, press Enter" />
              </div>
              <div>
                <label className={labelCls}>Skills</label>
                <TagInput value={form.skills} onChange={v => set('skills', v)} placeholder="Add skill, press Enter" />
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
            <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Delete entry?</h3>
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
