import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminBreadcrumb } from '../../components/AdminLayout';
import { RichTextEditor } from '../../components/RichTextEditor';
import { Plus, Pencil, Trash2, X, Save, AlertCircle, ChevronDown } from 'lucide-react';

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

const EMPLOYMENT_TYPES = ['full-time', 'contract', 'advisory', 'consulting', 'part-time'];

const EMPTY: Omit<WorkHistory, 'id'> = {
  organisation: '', role_title: '', employment_type: 'full-time',
  date_start: '', date_end: null, is_current: false, location: '', summary: '',
  detail_html: '', key_achievements: [], client_type: '', domains: [], skills: [], sort_order: 0,
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

function AchievementsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  function updateAt(i: number, val: string) {
    const arr = [...value];
    arr[i] = val;
    onChange(arr);
  }
  function removeAt(i: number) { onChange(value.filter((_, idx) => idx !== i)); }

  return (
    <div className="space-y-2">
      {value.map((a, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-accent-cyan"
            value={a}
            onChange={e => updateAt(i, e.target.value)}
            placeholder={`Achievement ${i + 1}`}
          />
          <button onClick={() => removeAt(i)} className="p-2 rounded-lg text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors"><X size={14} /></button>
        </div>
      ))}
      <button
        onClick={() => onChange([...value, ''])}
        className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors flex items-center gap-1"
      >
        <Plus size={12} /> Add achievement
      </button>
    </div>
  );
}

export function AdminWorkHistoryPage() {
  const [roles, setRoles] = useState<WorkHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<WorkHistory | null>(null);
  const [form, setForm] = useState<Omit<WorkHistory, 'id'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from('work_history').select('*').order('sort_order', { ascending: true });
    setRoles(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    const nextOrder = roles.length > 0 ? Math.max(...roles.map(r => r.sort_order)) + 1 : 0;
    const empty = { ...EMPTY, sort_order: nextOrder };
    setEditing({ id: '', ...empty });
    setForm(empty);
    setError('');
  }
  function openEdit(r: WorkHistory) { setEditing(r); const { id, ...rest } = r; setForm(rest as Omit<WorkHistory, 'id'>); setError(''); }
  function closeEditor() { setEditing(null); setError(''); }
  function set(field: keyof Omit<WorkHistory, 'id'>, val: unknown) { setForm(prev => ({ ...prev, [field]: val })); }

  async function save() {
    if (!form.organisation.trim()) { setError('Organisation is required'); return; }
    if (!form.role_title.trim()) { setError('Role title is required'); return; }
    if (!form.date_start) { setError('Start date is required'); return; }
    setSaving(true); setError('');
    const payload = { ...form, date_end: form.is_current ? null : (form.date_end || null) };
    const isNew = !editing?.id;
    const { error: err } = isNew
      ? await supabase.from('work_history').insert(payload)
      : await supabase.from('work_history').update(payload).eq('id', editing!.id);
    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false); closeEditor(); load();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await supabase.from('work_history').delete().eq('id', deleteId);
    setDeleteId(null); load();
  }

  function formatDateShort(d: string | null, isCurrent: boolean) {
    if (!d) return isCurrent ? 'Present' : '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  const inputCls = 'w-full text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:border-accent-cyan';
  const labelCls = 'block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1';

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'Work History' }]} />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Work History</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">{roles.length} roles</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-white dark:text-dark-bg text-sm font-semibold hover:bg-accent-cyan/85 transition-colors">
          <Plus size={15} /> New Role
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-light-elevated dark:bg-dark-elevated animate-pulse" />)}</div>
      ) : (
        <div className="rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-light-elevated dark:bg-dark-elevated text-xs text-light-muted dark:text-dark-muted uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Role</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Period</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {roles.map(r => (
                <tr key={r.id} className="bg-light-card dark:bg-dark-card hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-light-text dark:text-dark-text flex items-center gap-1.5">
                      {r.is_current && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent-cyan text-white dark:text-dark-bg">Current</span>}
                      {r.role_title}
                    </div>
                    <div className="text-xs text-light-muted dark:text-dark-muted">{r.organisation}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary capitalize">{r.employment_type}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-light-muted dark:text-dark-muted">
                    {formatDateShort(r.date_start, false)} – {formatDateShort(r.date_end, r.is_current)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg hover:bg-accent-red/10 text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {roles.length === 0 && <div className="py-10 text-center text-light-muted dark:text-dark-muted text-sm">No work history entries yet.</div>}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={closeEditor} />
          <div className="relative z-10 w-full max-w-2xl bg-light-bg dark:bg-dark-elevated flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
              <h2 className="font-bold text-light-text dark:text-dark-text">{editing.id ? 'Edit Role' : 'New Role'}</h2>
              <button onClick={closeEditor} className="p-1.5 rounded-lg text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-card"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-red/10 text-accent-red text-sm"><AlertCircle size={15} />{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Role title *</label>
                  <input className={inputCls} value={form.role_title} onChange={e => set('role_title', e.target.value)} placeholder="e.g. Principal Consultant" />
                </div>
                <div className="col-span-2">
                  <label className={labelCls}>Organisation *</label>
                  <input className={inputCls} value={form.organisation} onChange={e => set('organisation', e.target.value)} placeholder="Company name" />
                </div>
                <div>
                  <label className={labelCls}>Employment type</label>
                  <select className={inputCls} value={form.employment_type} onChange={e => set('employment_type', e.target.value)}>
                    {EMPLOYMENT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <input className={inputCls} value={form.location ?? ''} onChange={e => set('location', e.target.value)} placeholder="City, Country" />
                </div>
                <div>
                  <label className={labelCls}>Start date *</label>
                  <input type="date" className={inputCls} value={form.date_start} onChange={e => set('date_start', e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>End date</label>
                  <input type="date" className={inputCls} value={form.date_end ?? ''} disabled={form.is_current} onChange={e => set('date_end', e.target.value || null)} />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="wh-current" checked={form.is_current} onChange={e => set('is_current', e.target.checked)} className="w-4 h-4 accent-cyan-400" />
                  <label htmlFor="wh-current" className="text-sm text-light-text dark:text-dark-text cursor-pointer">Current role</label>
                </div>
                <div>
                  <label className={labelCls}>Client type</label>
                  <input className={inputCls} value={form.client_type ?? ''} onChange={e => set('client_type', e.target.value)} placeholder="Enterprise, SMB, Government…" />
                </div>
                <div>
                  <label className={labelCls}>Sort order</label>
                  <input type="number" min={0} className={inputCls} value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Summary</label>
                <textarea rows={3} className={inputCls} value={form.summary ?? ''} onChange={e => set('summary', e.target.value)} placeholder="Role overview" />
              </div>
              <div>
                <label className={labelCls}>Key Achievements</label>
                <AchievementsInput value={form.key_achievements} onChange={v => set('key_achievements', v)} />
              </div>
              <div>
                <label className={labelCls}>Domains</label>
                <TagInput value={form.domains} onChange={v => set('domains', v)} placeholder="Add domain, press Enter" />
              </div>
              <div>
                <label className={labelCls}>Skills</label>
                <TagInput value={form.skills} onChange={v => set('skills', v)} placeholder="Add skill, press Enter" />
              </div>
              <div>
                <label className={labelCls}>Detail</label>
                <RichTextEditor value={form.detail_html ?? ''} onChange={v => set('detail_html', v)} placeholder="Extended role detail…" />
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
            <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Delete this role?</h3>
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
