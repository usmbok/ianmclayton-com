import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminBreadcrumb } from '../../components/AdminLayout';
import { RichTextEditor } from '../../components/RichTextEditor';
import {
  Save, AlertCircle, CheckCircle, Plus, Pencil, Trash2,
  X, Star, Eye, EyeOff, Search,
} from 'lucide-react';
import { BANNER_ICON_NAMES, renderBannerIcon } from '../HomePage';

// ─── Icon Picker ───────────────────────────────────────────────────────────────

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [panelSize, setPanelSize] = useState({ width: 340, height: 288 });
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeState = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  function startResize(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    resizeState.current = { startX: e.clientX, startY: e.clientY, startW: panelSize.width, startH: panelSize.height };

    function onMove(e: MouseEvent) {
      if (!resizeState.current) return;
      const dx = e.clientX - resizeState.current.startX;
      const dy = e.clientY - resizeState.current.startY;
      setPanelSize({
        width:  Math.max(260, Math.min(640, resizeState.current.startW + dx)),
        height: Math.max(180, Math.min(600, resizeState.current.startH + dy)),
      });
    }
    function onUp() {
      resizeState.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  const filtered = query.trim()
    ? BANNER_ICON_NAMES.filter(n => n.toLowerCase().includes(query.toLowerCase()))
    : BANNER_ICON_NAMES;

  // Reserve ~80px for search bar + footer; rest is the scrollable grid
  const gridHeight = Math.max(80, panelSize.height - 84);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setQuery(''); }}
        className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text hover:border-accent-cyan transition-colors text-left"
      >
        {value ? (
          <>
            <span className="text-accent-cyan flex-shrink-0">{renderBannerIcon(value, 16)}</span>
            <span className="flex-1 font-mono text-xs">{value}</span>
          </>
        ) : (
          <span className="text-light-muted dark:text-dark-muted flex-1">Choose icon…</span>
        )}
        <span className="text-light-muted dark:text-dark-muted text-xs flex-shrink-0">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          className="absolute z-50 top-full left-0 mt-1 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-elevated shadow-2xl overflow-hidden flex flex-col"
          style={{ width: panelSize.width, height: panelSize.height }}
        >
          {/* Search bar */}
          <div className="flex-shrink-0 p-2 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-light-elevated dark:bg-dark-card">
              <Search size={13} className="text-light-muted dark:text-dark-muted flex-shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search 1500+ Lucide icons…"
                className="flex-1 text-xs bg-transparent outline-none text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text">
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable icon grid */}
          <div className="flex-1 overflow-y-auto p-2" style={{ height: gridHeight }}>
            <div className="grid grid-cols-5 gap-1">
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-lg border text-[10px] transition-colors aspect-square ${
                  !value
                    ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan'
                    : 'border-transparent hover:border-light-border dark:hover:border-dark-border text-light-muted dark:text-dark-muted'
                }`}
              >
                <span className="text-sm leading-none">—</span>
                <span className="leading-tight">None</span>
              </button>

              {filtered.map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => { onChange(name); setOpen(false); }}
                  title={name}
                  className={`flex flex-col items-center justify-center gap-0.5 p-2 rounded-lg border text-[10px] transition-colors aspect-square ${
                    value === name
                      ? 'border-accent-cyan bg-accent-cyan/10 text-accent-cyan'
                      : 'border-transparent hover:border-light-border dark:hover:border-dark-border text-light-secondary dark:text-dark-secondary hover:text-light-text dark:hover:text-dark-text'
                  }`}
                >
                  <span className={value === name ? 'text-accent-cyan' : ''}>{renderBannerIcon(name, 18)}</span>
                  <span className="truncate w-full text-center leading-tight">{name.replace(/([A-Z])/g, ' $1').trim()}</span>
                </button>
              ))}

              {filtered.length === 0 && (
                <div className="col-span-5 py-6 text-center text-xs text-light-muted dark:text-dark-muted">
                  No icons match "{query}"
                </div>
              )}
            </div>
          </div>

          {/* Footer + resize handle */}
          <div className="flex-shrink-0 flex items-center justify-between px-3 py-1.5 border-t border-light-border dark:border-dark-border">
            <span className="text-[10px] text-light-muted dark:text-dark-muted">
              {filtered.length} icons · drag corner to resize
            </span>
            {/* Corner resize grip */}
            <div
              onMouseDown={startResize}
              className="cursor-se-resize select-none text-light-muted dark:text-dark-muted hover:text-accent-cyan transition-colors ml-2"
              title="Drag to resize"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <rect x="8" y="0" width="2" height="12" rx="1" opacity="0.4" />
                <rect x="4" y="4" width="2" height="8" rx="1" opacity="0.6" />
                <rect x="0" y="8" width="2" height="4" rx="1" opacity="1" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type Tab = 'hero' | 'slides' | 'expertise' | 'settings';

// ─── Hero tab ──────────────────────────────────────────────────────────────────

interface HeroValues {
  hero_eyebrow: string;
  hero_heading_html: string;
  hero_body_html: string;
  hero_btn1_label: string; hero_btn1_url: string;
  hero_btn2_label: string; hero_btn2_url: string;
  hero_btn3_label: string; hero_btn3_url: string;
  hero_btn4_label: string; hero_btn4_url: string;
}

const HERO_DEFAULTS: HeroValues = {
  hero_eyebrow: 'Service Management · Intelligent Automation',
  hero_heading_html: '',
  hero_body_html: '',
  hero_btn1_label: 'Explore my journey', hero_btn1_url: '/timeline',
  hero_btn2_label: 'View projects',       hero_btn2_url: '/projects',
  hero_btn3_label: 'Read articles',       hero_btn3_url: '/articles',
  hero_btn4_label: 'Contact',             hero_btn4_url: '/contact',
};

function HeroTab() {
  const [values, setValues] = useState<HeroValues>(HERO_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    supabase.from('site_settings').select('key,value').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(r => { map[r.key] = r.value ?? ''; });
        setValues(prev => ({ ...prev, ...map } as HeroValues));
      }
      setLoading(false);
    });
  }, []);

  function set(k: keyof HeroValues, v: string) {
    setValues(prev => ({ ...prev, [k]: v }));
    setStatus('idle');
  }

  async function save() {
    setSaving(true); setStatus('idle');
    const upserts = (Object.keys(values) as (keyof HeroValues)[]).map(k => ({ key: k, value: values[k] }));
    const { error } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' });
    setSaving(false);
    if (error) { setErrMsg(error.message); setStatus('err'); }
    else { setStatus('ok'); setTimeout(() => setStatus('idle'), 3000); }
  }

  const inp = 'w-full text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:border-accent-cyan';
  const lbl = 'block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1';

  if (loading) return <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-light-elevated dark:bg-dark-elevated animate-pulse" />)}</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      {status === 'err' && <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-red/10 text-accent-red text-sm"><AlertCircle size={15} />{errMsg}</div>}
      {status === 'ok'  && <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-green/10 text-accent-green text-sm"><CheckCircle size={15} />Saved.</div>}

      <div>
        <label className={lbl}>Eyebrow text</label>
        <input className={inp} value={values.hero_eyebrow} onChange={e => set('hero_eyebrow', e.target.value)} placeholder="Service Management · Intelligent Automation" />
      </div>
      <div>
        <label className={lbl}>Heading (rich text — italics render as cyan accent)</label>
        <RichTextEditor value={values.hero_heading_html} onChange={v => set('hero_heading_html', v)} placeholder="Ian M. Clayton" minHeight={100} />
      </div>
      <div>
        <label className={lbl}>Body copy (rich text)</label>
        <RichTextEditor value={values.hero_body_html} onChange={v => set('hero_body_html', v)} placeholder="Introductory paragraphs…" minHeight={140} />
      </div>

      <div className="pt-2 border-t border-light-border dark:border-dark-border">
        <p className="text-xs font-bold uppercase tracking-widest text-light-muted dark:text-dark-muted mb-3">Buttons (up to 4)</p>
        <div className="grid grid-cols-2 gap-3">
          {([1, 2, 3, 4] as const).map(n => (
            <div key={n} className="col-span-2 grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Button {n} label</label>
                <input className={inp} value={(values as Record<string, string>)[`hero_btn${n}_label`]} onChange={e => set(`hero_btn${n}_label` as keyof HeroValues, e.target.value)} placeholder={`Button ${n} label`} />
              </div>
              <div>
                <label className={lbl}>Button {n} URL</label>
                <input className={inp} value={(values as Record<string, string>)[`hero_btn${n}_url`]} onChange={e => set(`hero_btn${n}_url` as keyof HeroValues, e.target.value)} placeholder="/page-path" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-white dark:text-dark-bg text-sm font-semibold hover:bg-accent-cyan/85 disabled:opacity-50 transition-colors">
        <Save size={14} />{saving ? 'Saving…' : 'Save hero'}
      </button>
    </div>
  );
}

// ─── Banner Slides tab ─────────────────────────────────────────────────────────

interface Slide {
  id: string;
  label: string;
  content_html: string;
  icon: string | null;
  active: boolean;
  sort_order: number;
}

const SLIDE_EMPTY: Omit<Slide, 'id'> = { label: '', content_html: '', icon: '', active: true, sort_order: 10 };

function SlidesTab() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [form, setForm] = useState<Omit<Slide, 'id'>>(SLIDE_EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from('banner_slides').select('*').order('sort_order').order('label');
    setSlides(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    const nextOrder = slides.length ? Math.max(...slides.map(s => s.sort_order)) + 10 : 10;
    const empty = { ...SLIDE_EMPTY, sort_order: nextOrder };
    setEditing({ id: '', ...empty });
    setForm(empty);
    setError('');
  }

  function openEdit(s: Slide) {
    setEditing(s);
    const { id, ...rest } = s;
    setForm(rest);
    setError('');
  }

  function closeEditor() { setEditing(null); setError(''); }

  function set(field: keyof Omit<Slide, 'id'>, val: unknown) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  async function save() {
    if (!form.label.trim()) { setError('Label is required'); return; }
    setSaving(true); setError('');
    const payload = { ...form, icon: form.icon || null };
    const isNew = !editing?.id;
    const { error: err } = isNew
      ? await supabase.from('banner_slides').insert(payload)
      : await supabase.from('banner_slides').update(payload).eq('id', editing!.id);
    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false); closeEditor(); load();
  }

  async function toggleActive(s: Slide) {
    await supabase.from('banner_slides').update({ active: !s.active }).eq('id', s.id);
    load();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await supabase.from('banner_slides').delete().eq('id', deleteId);
    setDeleteId(null); load();
  }

  const inp = 'w-full text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:border-accent-cyan';
  const lbl = 'block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1';
  const activeCount = slides.filter(s => s.active).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-light-muted dark:text-dark-muted">{slides.length} slide{slides.length !== 1 ? 's' : ''} ({activeCount} active)</p>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-white dark:text-dark-bg text-sm font-semibold hover:bg-accent-cyan/85 transition-colors">
          <Plus size={15} /> New slide
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-light-elevated dark:bg-dark-elevated animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {slides.map(s => (
            <div key={s.id} className="rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary">{s.label}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${s.active ? 'bg-accent-green/10 text-accent-green' : 'bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted'}`}>
                      {s.active ? <Eye size={10} /> : <EyeOff size={10} />}{s.active ? 'Active' : 'Hidden'}
                    </span>
                    <span className="text-xs text-light-muted dark:text-dark-muted">Order {s.sort_order}</span>
                  </div>
                  <div
                    className="text-sm text-light-secondary dark:text-dark-secondary line-clamp-1"
                    dangerouslySetInnerHTML={{ __html: s.content_html }}
                  />
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleActive(s)} title="Toggle active" className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted hover:text-accent-cyan transition-colors">
                    {s.active ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteId(s.id)} className="p-1.5 rounded-lg hover:bg-accent-red/10 text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {slides.length === 0 && <p className="text-center py-8 text-sm text-light-muted dark:text-dark-muted">No slides yet.</p>}
        </div>
      )}

      {/* Editor drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={closeEditor} />
          <div className="relative z-10 w-full max-w-lg bg-light-bg dark:bg-dark-elevated flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
              <h2 className="font-bold text-light-text dark:text-dark-text">{editing.id ? 'Edit Slide' : 'New Slide'}</h2>
              <button onClick={closeEditor} className="p-1.5 rounded-lg text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-card"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-red/10 text-accent-red text-sm"><AlertCircle size={15} />{error}</div>}
              <div>
                <label className={lbl}>Label (internal name) *</label>
                <input className={inp} value={form.label} onChange={e => set('label', e.target.value)} placeholder="e.g. ITSM Lifetime Award" />
              </div>
              <div>
                <label className={lbl}>Content (rich text)</label>
                <RichTextEditor value={form.content_html} onChange={v => set('content_html', v)} placeholder="Slide text…" minHeight={120} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Icon</label>
                  <IconPicker value={form.icon ?? ''} onChange={v => set('icon', v || null)} />
                </div>
                <div>
                  <label className={lbl}>Sort order</label>
                  <input type="number" className={inp} value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="slide-active" checked={form.active} onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-cyan-400" />
                <label htmlFor="slide-active" className="text-sm text-light-text dark:text-dark-text cursor-pointer">Active (visible on site)</label>
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
            <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Delete slide?</h3>
            <p className="text-sm text-light-secondary dark:text-dark-secondary mb-5">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm text-light-secondary dark:text-dark-secondary hover:bg-light-elevated transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-accent-red text-white text-sm font-semibold hover:bg-accent-red/85 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Expertise Areas tab ───────────────────────────────────────────────────────

interface ExpertiseArea {
  id: string;
  title: string;
  description: string;
  detail_html: string | null;
  tags: string[];
  sort_order: number;
  featured: boolean;
}

const EXPERTISE_EMPTY: Omit<ExpertiseArea, 'id'> = {
  title: '', description: '', detail_html: '', tags: [], sort_order: 10, featured: false,
};

function ExpertiseTab() {
  const [areas, setAreas] = useState<ExpertiseArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ExpertiseArea | null>(null);
  const [form, setForm] = useState<Omit<ExpertiseArea, 'id'>>(EXPERTISE_EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');

  async function load() {
    const { data } = await supabase.from('expertise_areas').select('*').order('sort_order');
    setAreas(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    const nextOrder = areas.length ? Math.max(...areas.map(a => a.sort_order)) + 1 : 1;
    const empty = { ...EXPERTISE_EMPTY, sort_order: nextOrder };
    setEditing({ id: '', ...empty });
    setForm(empty);
    setTagInput('');
    setError('');
  }

  function openEdit(a: ExpertiseArea) {
    setEditing(a);
    const { id, ...rest } = a;
    setForm({ ...rest, tags: rest.tags ?? [] });
    setTagInput('');
    setError('');
  }

  function closeEditor() { setEditing(null); setError(''); }

  function setField(field: keyof Omit<ExpertiseArea, 'id'>, val: unknown) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setField('tags', [...form.tags, t]);
    setTagInput('');
  }

  async function save() {
    if (!form.title.trim()) { setError('Title is required'); return; }
    setSaving(true); setError('');
    const payload = { ...form, detail_html: form.detail_html || null };
    const isNew = !editing?.id;
    const { error: err } = isNew
      ? await supabase.from('expertise_areas').insert(payload)
      : await supabase.from('expertise_areas').update(payload).eq('id', editing!.id);
    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false); closeEditor(); load();
  }

  async function toggleFeatured(a: ExpertiseArea) {
    await supabase.from('expertise_areas').update({ featured: !a.featured }).eq('id', a.id);
    load();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await supabase.from('expertise_areas').delete().eq('id', deleteId);
    setDeleteId(null); load();
  }

  const inp = 'w-full text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text placeholder:text-light-muted dark:placeholder:text-dark-muted focus:outline-none focus:border-accent-cyan';
  const lbl = 'block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1';

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-light-muted dark:text-dark-muted">{areas.length} area{areas.length !== 1 ? 's' : ''}</p>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-white dark:text-dark-bg text-sm font-semibold hover:bg-accent-cyan/85 transition-colors">
          <Plus size={15} /> New area
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-light-elevated dark:bg-dark-elevated animate-pulse" />)}</div>
      ) : (
        <div className="rounded-xl border border-light-border dark:border-dark-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-light-elevated dark:bg-dark-elevated text-xs text-light-muted dark:text-dark-muted uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">#</th>
                <th className="text-left px-4 py-3 font-semibold">Title</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Description</th>
                <th className="text-left px-4 py-3 font-semibold">Featured</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {areas.map(a => (
                <tr key={a.id} className="bg-light-card dark:bg-dark-card hover:bg-light-elevated dark:hover:bg-dark-elevated transition-colors">
                  <td className="px-4 py-3 text-light-muted dark:text-dark-muted text-xs">{a.sort_order}</td>
                  <td className="px-4 py-3 font-medium text-light-text dark:text-dark-text">{a.title}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-light-secondary dark:text-dark-secondary text-xs max-w-xs truncate">{a.description}</td>
                  <td className="px-4 py-3">
                    <Star size={14} className={a.featured ? 'text-accent-gold fill-accent-gold' : 'text-light-muted dark:text-dark-muted'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => toggleFeatured(a)} title="Toggle featured" className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted hover:text-accent-gold transition-colors"><Star size={14} /></button>
                      <button onClick={() => openEdit(a)} className="p-1.5 rounded-lg hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => setDeleteId(a.id)} className="p-1.5 rounded-lg hover:bg-accent-red/10 text-light-muted dark:text-dark-muted hover:text-accent-red transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {areas.length === 0 && <p className="text-center py-8 text-sm text-light-muted dark:text-dark-muted">No expertise areas yet.</p>}
        </div>
      )}

      {/* Editor drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/50" onClick={closeEditor} />
          <div className="relative z-10 w-full max-w-xl bg-light-bg dark:bg-dark-elevated flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
              <h2 className="font-bold text-light-text dark:text-dark-text">{editing.id ? 'Edit Expertise Area' : 'New Expertise Area'}</h2>
              <button onClick={closeEditor} className="p-1.5 rounded-lg text-light-muted dark:text-dark-muted hover:bg-light-elevated dark:hover:bg-dark-card"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-red/10 text-accent-red text-sm"><AlertCircle size={15} />{error}</div>}
              <div>
                <label className={lbl}>Title *</label>
                <input className={inp} value={form.title} onChange={e => setField('title', e.target.value)} placeholder="e.g. Service Management Strategy" />
              </div>
              <div>
                <label className={lbl}>Short description (plain text, shown on home card)</label>
                <textarea rows={2} className={inp} value={form.description} onChange={e => setField('description', e.target.value)} placeholder="One or two sentence summary…" />
              </div>
              <div>
                <label className={lbl}>Detail (rich text — expanded content)</label>
                <RichTextEditor value={form.detail_html ?? ''} onChange={v => setField('detail_html', v)} placeholder="Expanded description…" minHeight={150} />
              </div>
              <div>
                <label className={lbl}>Tags (press Enter to add)</label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {form.tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan">
                      {t}<button onClick={() => setField('tags', form.tags.filter(x => x !== t))}><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <input
                  className={inp}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
                  placeholder="Add tag…"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Sort order</label>
                  <input type="number" className={inp} value={form.sort_order} onChange={e => setField('sort_order', Number(e.target.value))} />
                </div>
                <div className="flex items-end pb-1">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="exp-featured" checked={form.featured} onChange={e => setField('featured', e.target.checked)} className="w-4 h-4 accent-cyan-400" />
                    <label htmlFor="exp-featured" className="text-sm text-light-text dark:text-dark-text cursor-pointer">Featured</label>
                  </div>
                </div>
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
            <h3 className="font-bold text-light-text dark:text-dark-text mb-2">Delete area?</h3>
            <p className="text-sm text-light-secondary dark:text-dark-secondary mb-5">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm text-light-secondary dark:text-dark-secondary hover:bg-light-elevated transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-accent-red text-white text-sm font-semibold hover:bg-accent-red/85 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Settings tab ──────────────────────────────────────────────────────────────

function SettingsTab() {
  const [delayMs, setDelayMs] = useState('5000');
  const [autoplay, setAutoplay] = useState(true);
  const [tmEnabled, setTmEnabled] = useState(true);
  const [tmAutoplay, setTmAutoplay] = useState(true);
  const [tmDelayMs, setTmDelayMs] = useState('6000');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    supabase.from('site_settings').select('key,value').in('key', [
      'banner_slide_delay_ms', 'banner_autoplay',
      'testimonials_section_enabled', 'testimonials_autoplay', 'testimonials_slide_delay_ms',
    ]).then(({ data }) => {
      if (data) {
        data.forEach(r => {
          if (r.key === 'banner_slide_delay_ms') setDelayMs(r.value ?? '5000');
          if (r.key === 'banner_autoplay') setAutoplay(r.value !== 'false');
          if (r.key === 'testimonials_section_enabled') setTmEnabled(r.value !== 'false');
          if (r.key === 'testimonials_autoplay') setTmAutoplay(r.value !== 'false');
          if (r.key === 'testimonials_slide_delay_ms') setTmDelayMs(r.value ?? '6000');
        });
      }
      setLoading(false);
    });
  }, []);

  async function save() {
    setSaving(true); setStatus('idle');
    const upserts = [
      { key: 'banner_slide_delay_ms', value: delayMs },
      { key: 'banner_autoplay', value: String(autoplay) },
      { key: 'testimonials_section_enabled', value: String(tmEnabled) },
      { key: 'testimonials_autoplay', value: String(tmAutoplay) },
      { key: 'testimonials_slide_delay_ms', value: tmDelayMs },
    ];
    const { error } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' });
    setSaving(false);
    if (error) { setErrMsg(error.message); setStatus('err'); }
    else { setStatus('ok'); setTimeout(() => setStatus('idle'), 3000); }
  }

  if (loading) return <div className="h-10 w-64 rounded-lg bg-light-elevated dark:bg-dark-elevated animate-pulse" />;

  const delaySec = Math.round(Number(delayMs) / 1000);
  const tmDelaySec = Math.round(Number(tmDelayMs) / 1000);

  function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
    return (
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <div
          onClick={() => onChange(!value)}
          className={`rounded-full transition-colors relative cursor-pointer ${value ? 'bg-accent-cyan' : 'bg-light-border dark:bg-dark-border'}`}
          style={{ height: '22px', width: '40px' }}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
        <span className="text-sm text-light-text dark:text-dark-text">{label}</span>
      </label>
    );
  }

  return (
    <div className="max-w-lg space-y-5">
      {status === 'err' && <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-red/10 text-accent-red text-sm"><AlertCircle size={15} />{errMsg}</div>}
      {status === 'ok'  && <div className="flex items-center gap-2 p-3 rounded-lg bg-accent-green/10 text-accent-green text-sm"><CheckCircle size={15} />Settings saved.</div>}

      <div className="rounded-xl border border-light-border dark:border-dark-border p-5 space-y-5">
        <h3 className="text-sm font-bold text-light-text dark:text-dark-text">Banner strip settings</h3>
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <label className="block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1">Slide rotation (seconds)</label>
            <input
              type="number"
              min={1}
              max={60}
              className="w-20 text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-accent-cyan"
              value={delaySec}
              onChange={e => setDelayMs(String(Number(e.target.value) * 1000))}
            />
          </div>
          <Toggle value={autoplay} onChange={setAutoplay} label="Slide autoplay" />
        </div>
      </div>

      <div className="rounded-xl border border-light-border dark:border-dark-border p-5 space-y-5">
        <h3 className="text-sm font-bold text-light-text dark:text-dark-text">Testimonials slider settings</h3>
        <Toggle value={tmEnabled} onChange={setTmEnabled} label="Show testimonials section on home page" />
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <label className="block text-xs font-semibold text-light-muted dark:text-dark-muted mb-1">Slide rotation (seconds)</label>
            <input
              type="number"
              min={1}
              max={60}
              className="w-20 text-sm px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text focus:outline-none focus:border-accent-cyan"
              value={tmDelaySec}
              onChange={e => setTmDelayMs(String(Number(e.target.value) * 1000))}
            />
          </div>
          <Toggle value={tmAutoplay} onChange={setTmAutoplay} label="Slide autoplay" />
        </div>
      </div>

      <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-white dark:text-dark-bg text-sm font-semibold hover:bg-accent-cyan/85 disabled:opacity-50 transition-colors">
        <Save size={14} />{saving ? 'Saving…' : 'Save settings'}
      </button>
    </div>
  );
}

// ─── Root page ─────────────────────────────────────────────────────────────────

export function AdminHomePage() {
  const [tab, setTab] = useState<Tab>('hero');

  const tabs: { id: Tab; label: string }[] = [
    { id: 'hero',      label: 'Hero' },
    { id: 'slides',    label: 'Banner Slides' },
    { id: 'expertise', label: 'Expertise Areas' },
    { id: 'settings',  label: 'Settings' },
  ];

  return (
    <div>
      <AdminBreadcrumb items={[{ label: 'Home Page' }]} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">Home Page</h1>
          <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">Manage hero, banner strip, expertise areas, and display settings</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-8 p-1 rounded-xl bg-light-elevated dark:bg-dark-elevated w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-light-bg dark:bg-dark-card text-light-text dark:text-dark-text shadow-sm'
                : 'text-light-muted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'hero'      && <HeroTab />}
      {tab === 'slides'    && <SlidesTab />}
      {tab === 'expertise' && <ExpertiseTab />}
      {tab === 'settings'  && <SettingsTab />}
    </div>
  );
}
