import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminBreadcrumb } from '../../components/AdminLayout';
import { Plus, Pencil, Trash2, X, Save, AlertCircle, Building2, GripVertical, Download } from 'lucide-react';
import { downloadCSV, downloadSQL } from '../../lib/exportUtils';

interface Employer {
  id: string;
  name: string;
  short_name: string | null;
  website: string | null;
  industry: string | null;
  notes: string | null;
  sort_order: number;
}

const EMPTY: Omit<Employer, 'id'> = {
  name: '', short_name: '', website: '', industry: '', notes: '', sort_order: 0,
};

export function AdminEmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Employer | null>(null);
  const [form, setForm] = useState<Omit<Employer, 'id'>>(EMPTY);
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
    const { data } = await supabase
      .from('employers')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });
    setEmployers(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    const nextOrder = employers.length > 0 ? Math.max(...employers.map(e => e.sort_order)) + 1 : 1;
    const empty = { ...EMPTY, sort_order: nextOrder };
    setEditing({ id: '', ...empty });
    setForm(empty);
    setError('');
  }

  function openEdit(e: Employer) {
    setEditing(e);
    const { id, ...rest } = e;
    setForm(rest);
    setError('');
  }

  function closeEditor() { setEditing(null); setError(''); }

  function set(field: keyof Omit<Employer, 'id'>, val: unknown) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  async function save() {
    if (!form.name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      short_name: form.short_name || null,
      website: form.website || null,
      industry: form.industry || null,
      notes: form.notes || null,
    };
    const isNew = !editing?.id;
    const { error: err } = isNew
      ? await supabase.from('employers').insert(payload)
      : await supabase.from('employers').update(payload).eq('id', editing!.id);
    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false);
    closeEditor();
    load();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await supabase.from('employers').delete().eq('id', deleteId);
    setDeleteId(null);
    load();
  }

  const inputCls = 'w-full text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:border-accent-cyan';
  const labelCls = 'block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1';

  function exportData(format: 'csv' | 'sql') {
    const rows = employers.map(e => ({
      id: e.id,
      name: e.name,
      short_name: e.short_name ?? '',
      industry: e.industry ?? '',
      website: e.website ?? '',
      notes: e.notes ?? '',
      sort_order: e.sort_order,
    }));
    if (format === 'csv') downloadCSV('employers', rows);
    else downloadSQL('employers', 'employers', rows);
  }

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'Employers' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Employers</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">{employers.length} employer{employers.length !== 1 ? 's' : ''} — used to link projects to career roles</p>
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
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-white dark:text-dark-bg text-sm font-semibold hover:bg-accent-cyan/85 transition-colors"
          >
            <Plus size={15} /> Add Employer
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-light-elevated dark:bg-dark-elevated animate-pulse" />)}
        </div>
      ) : (
        <div className="rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-light-elevated dark:bg-dark-elevated text-xs text-light-muted dark:text-dark-muted uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-semibold w-8" />
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Short name</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Industry</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Website</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {employers.map(emp => (
                <tr key={emp.id} className="bg-light-card dark:bg-dark-card hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors">
                  <td className="px-4 py-3 text-light-muted dark:text-dark-muted">
                    <GripVertical size={14} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
                        <Building2 size={13} className="text-accent-cyan" />
                      </div>
                      <span className="font-medium text-light-text dark:text-dark-text">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-light-secondary dark:text-dark-secondary">{emp.short_name || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-light-secondary dark:text-dark-secondary">{emp.industry || '—'}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {emp.website ? (
                      <a href={emp.website} target="_blank" rel="noopener noreferrer" className="text-accent-cyan hover:underline truncate max-w-[160px] block">{emp.website.replace(/^https?:\/\//, '')}</a>
                    ) : <span className="text-light-muted dark:text-dark-muted">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEdit(emp)}
                        className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(emp.id)}
                        className="p-1.5 rounded-lg hover:bg-accent-red/10 text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {employers.length === 0 && (
            <div className="py-12 text-center text-light-muted dark:text-dark-muted text-sm">No employers yet. Add your first one.</div>
          )}
        </div>
      )}

      {/* Editor drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={closeEditor} />
          <div className="relative z-10 w-full max-w-lg bg-light-bg dark:bg-dark-elevated flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
              <h2 className="font-bold text-light-text dark:text-dark-text">{editing.id ? 'Edit Employer' : 'New Employer'}</h2>
              <button onClick={closeEditor} className="p-1.5 rounded-lg text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-card">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-red/10 text-accent-red text-sm">
                  <AlertCircle size={15} />{error}
                </div>
              )}

              <div>
                <label className={labelCls}>Name *</label>
                <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full legal or trading name" />
              </div>
              <div>
                <label className={labelCls}>Short name</label>
                <input className={inputCls} value={form.short_name ?? ''} onChange={e => set('short_name', e.target.value)} placeholder="Abbreviated name used in dropdowns" />
              </div>
              <div>
                <label className={labelCls}>Industry</label>
                <input className={inputCls} value={form.industry ?? ''} onChange={e => set('industry', e.target.value)} placeholder="e.g. Technology, Financial Services" />
              </div>
              <div>
                <label className={labelCls}>Website</label>
                <input className={inputCls} value={form.website ?? ''} onChange={e => set('website', e.target.value)} placeholder="https://example.com" />
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <textarea rows={3} className={inputCls} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Any internal notes about this employer" />
              </div>
              <div>
                <label className={labelCls}>Sort order</label>
                <input type="number" className={inputCls} value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))} />
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
            <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Delete employer?</h3>
            <p className="text-sm text-light-secondary dark:text-dark-secondary mb-5">Any projects linked to this employer will have the link cleared, but the projects themselves won't be deleted.</p>
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
