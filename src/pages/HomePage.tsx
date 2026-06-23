import { useEffect, useState, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { ArrowRight, Lightbulb, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Project {
  id: string;
  title: string;
  slug: string;
  client_display_name: string;
  industry: string;
  short_focus: string;
  project_type: string;
  tags: string[];
}

interface TimelineEntry {
  id: string;
  title: string;
  organisation: string | null;
  entry_date: string;
  entry_type: string;
  summary: string;
  is_milestone: boolean;
}

interface Article {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  excerpt: string | null;
  category: string | null;
  reading_time_minutes: number | null;
  published_at: string | null;
}

interface Testimonial {
  id: string;
  quote: string;
  attributed_name: string;
  attributed_role: string | null;
  attributed_organisation: string | null;
  featured: boolean;
}

interface ExpertiseArea {
  id: string;
  title: string;
  description: string;
  sort_order: number;
}

interface BannerSlide {
  id: string;
  label: string;
  content_html: string;
  icon: string | null;
  sort_order: number;
}

interface HeroSettings {
  hero_eyebrow: string;
  hero_heading_html: string;
  hero_body_html: string;
  hero_btn1_label: string; hero_btn1_url: string;
  hero_btn2_label: string; hero_btn2_url: string;
  hero_btn3_label: string; hero_btn3_url: string;
  hero_btn4_label: string; hero_btn4_url: string;
  banner_slide_delay_ms: string;
  banner_autoplay: string;
  testimonials_section_enabled: string;
  testimonials_autoplay: string;
  testimonials_slide_delay_ms: string;
}

const ENTRY_TYPE_STYLE: Record<string, string> = {
  award:       'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  publication: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  career:      'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  speaking:    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
  project:     'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  milestone:   'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

// Dynamically resolve any Lucide icon by name at runtime
export function renderBannerIcon(name: string | null | undefined, size = 20): React.ReactNode {
  if (!name) return <Lightbulb size={size} />;
  // Lucide icons are React.forwardRef objects (typeof === 'object'), not plain functions.
  // Only check for existence, not typeof.
  const IconComp = (LucideIcons as Record<string, React.ComponentType<{ size?: number }>>)[name];
  if (!IconComp) return <Lightbulb size={size} />;
  return <IconComp size={size} />;
}

// Curated list exported for use in admin icon picker (covers professional, tech, awards, ideas, etc.)
export const BANNER_ICON_NAMES: string[] = [
  // Awards & Recognition
  'Award', 'Trophy', 'Medal', 'Star', 'BadgeCheck', 'Crown', 'Ribbon',
  // Knowledge & Learning
  'BookOpen', 'BookMarked', 'BookText', 'GraduationCap', 'Library', 'FileText', 'Newspaper', 'ScrollText',
  // Business & Professional
  'Briefcase', 'Building', 'Building2', 'Handshake', 'Network', 'Presentation', 'ClipboardList', 'FolderOpen',
  // Technology & Automation
  'Cpu', 'Bot', 'Workflow', 'Layers', 'GitBranch', 'Code2', 'Terminal', 'Wrench', 'Settings', 'Cog', 'Puzzle',
  // Analytics & Data
  'BarChart', 'BarChart2', 'BarChart3', 'TrendingUp', 'TrendingDown', 'LineChart', 'PieChart', 'Activity', 'Gauge',
  // Ideas & Innovation
  'Lightbulb', 'Zap', 'Rocket', 'Wand2', 'Sparkles', 'FlaskConical', 'Microscope',
  // People & Community
  'Users', 'User', 'UserCheck', 'Heart', 'HandHeart', 'Globe', 'Globe2',
  // Security & Trust
  'ShieldCheck', 'Shield', 'Lock', 'Eye', 'Fingerprint', 'Key', 'ShieldAlert',
  // Navigation & Goals
  'Target', 'Compass', 'MapPin', 'Navigation', 'Map', 'Milestone',
  // Communication
  'Mail', 'MessageSquare', 'Phone', 'Radio', 'Share2', 'Megaphone', 'Rss',
  // Status & Process
  'CheckCircle', 'CheckCircle2', 'AlertTriangle', 'Info', 'Clock', 'Calendar', 'Flag', 'Tag', 'ListChecks', 'ClipboardCheck',
  // Finance & Value
  'DollarSign', 'TrendingUp', 'Banknote', 'Coins', 'PiggyBank',
  // Infrastructure & Scale
  'Server', 'Database', 'Cloud', 'CloudCog', 'HardDrive', 'Factory', 'Package',
];

export function HomePage() {
  const navigate = useNavigate();
  const [projects, setProjects]         = useState<Project[]>([]);
  const [timeline, setTimeline]         = useState<TimelineEntry[]>([]);
  const [articles, setArticles]         = useState<Article[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [expertise, setExpertise]       = useState<ExpertiseArea[]>([]);
  const [slides, setSlides]             = useState<BannerSlide[]>([]);
  const [heroSettings, setHeroSettings] = useState<Partial<HeroSettings>>({});

  // Banner slider
  const [trackIndex, setTrackIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Testimonials slider
  const [tmTrackIndex, setTmTrackIndex] = useState(0);
  const [tmIsAnimating, setTmIsAnimating] = useState(true);
  const tmAutoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const delayMs  = Number(heroSettings.banner_slide_delay_ms ?? 5000);
  const autoplay = heroSettings.banner_autoplay !== 'false';

  // We always clone exactly 3 items at the end so the loop works at all breakpoints
  const CLONE_COUNT = 3;
  // extended = real slides + clone of first CLONE_COUNT slides
  const extendedSlides = slides.length > 0
    ? [...slides, ...slides.slice(0, Math.min(CLONE_COUNT, slides.length))]
    : [];
  const N = extendedSlides.length;

  // CSS math:
  //   Each item is 25% of container on desktop (4 visible), 50% on tablet, 100% on mobile
  //   Track width  = N / VISIBLE * 100% of container
  //   Item width   = 100 / N % of track  →  equals 100/VISIBLE % of container ✓
  //   translateX   = -(trackIndex * 100 / N) %  of track  →  moves exactly 1 item per step
  //
  // We use tailwind responsive classes for item/track widths; translateX uses the same formula.
  const translatePct = N > 0 ? -(trackIndex * 100) / N : 0;

  // Responsive VISIBLE count (used only for showing/hiding controls)
  const [visibleCount, setVisibleCount] = useState(3);
  useEffect(() => {
    function update() {
      setVisibleCount(window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // ── Testimonials slider settings ──
  const tmDelayMs  = Number(heroSettings.testimonials_slide_delay_ms ?? 6000);
  const tmAutoplay = heroSettings.testimonials_autoplay !== 'false';
  const tmEnabled  = heroSettings.testimonials_section_enabled !== 'false';

  const TM_CLONE = 2;
  const tmExtended = testimonials.length > 0
    ? [...testimonials, ...testimonials.slice(0, Math.min(TM_CLONE, testimonials.length))]
    : [];
  const TM_N = tmExtended.length;
  // Show 1 on mobile, 2 on tablet, 3 on desktop
  const tmTranslatePct = TM_N > 0 ? -(tmTrackIndex * 100) / TM_N : 0;

  // Snap back from clone zone
  useEffect(() => {
    if (testimonials.length === 0 || tmTrackIndex < testimonials.length) return;
    const id = setTimeout(() => {
      setTmIsAnimating(false);
      setTmTrackIndex(0);
    }, 520);
    return () => clearTimeout(id);
  }, [tmTrackIndex, testimonials.length]);

  useEffect(() => {
    if (tmIsAnimating) return;
    const id = requestAnimationFrame(() => setTmIsAnimating(true));
    return () => cancelAnimationFrame(id);
  }, [tmIsAnimating]);

  useEffect(() => {
    if (tmAutoTimerRef.current) clearInterval(tmAutoTimerRef.current);
    if (tmAutoplay && testimonials.length > 1) {
      tmAutoTimerRef.current = setInterval(() => {
        setTmIsAnimating(true);
        setTmTrackIndex(i => i + 1);
      }, tmDelayMs);
    }
    return () => { if (tmAutoTimerRef.current) clearInterval(tmAutoTimerRef.current); };
  }, [tmAutoplay, tmDelayMs, testimonials.length]);

  function tmPrev() {
    setTmIsAnimating(true);
    setTmTrackIndex(i => (i <= 0 ? testimonials.length - 1 : i - 1));
  }
  function tmNext() {
    setTmIsAnimating(true);
    setTmTrackIndex(i => i + 1);
  }

  useEffect(() => {
    Promise.all([
      supabase.from('projects').select('id,title,slug,client_display_name,industry,short_focus,project_type,tags').eq('featured', true).limit(3),
      supabase.from('timeline_entries').select('id,title,organisation,entry_date,entry_type,summary,is_milestone').order('entry_date', { ascending: false }).limit(3),
      supabase.from('articles').select('id,title,subtitle,slug,excerpt,category,reading_time_minutes,published_at').eq('featured', true).eq('status', 'published').limit(3),
      supabase.from('testimonials').select('id,quote,attributed_name,attributed_role,attributed_organisation,featured').eq('featured', true).eq('status', 'published').order('sort_order', { ascending: true }).limit(6),
      supabase.from('expertise_areas').select('id,title,description,sort_order').order('sort_order', { ascending: true }),
      supabase.from('banner_slides').select('id,label,content_html,icon,sort_order').eq('active', true).order('sort_order'),
      supabase.from('site_settings').select('key,value'),
    ]).then(([p, t, a, tm, e, sl, ss]) => {
      setProjects(p.data ?? []);
      setTimeline(t.data ?? []);
      setArticles(a.data ?? []);
      setTestimonials(tm.data ?? []);
      setExpertise(e.data ?? []);
      setSlides(sl.data ?? []);
      if (ss.data) {
        const map: Partial<HeroSettings> = {};
        ss.data.forEach(r => { (map as Record<string, string>)[r.key] = r.value ?? ''; });
        setHeroSettings(map);
      }
    });
  }, []);

  // Snap back from clone zone after transition completes
  useEffect(() => {
    if (slides.length === 0 || trackIndex < slides.length) return;
    const id = setTimeout(() => {
      setIsAnimating(false);
      setTrackIndex(0);
    }, 520);
    return () => clearTimeout(id);
  }, [trackIndex, slides.length]);

  // Re-enable animation on the frame after the instant snap
  useEffect(() => {
    if (isAnimating) return;
    const id = requestAnimationFrame(() => setIsAnimating(true));
    return () => cancelAnimationFrame(id);
  }, [isAnimating]);

  // Autoplay
  useEffect(() => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    if (autoplay && slides.length > 1) {
      autoTimerRef.current = setInterval(() => {
        setIsAnimating(true);
        setTrackIndex(i => i + 1);
      }, delayMs);
    }
    return () => { if (autoTimerRef.current) clearInterval(autoTimerRef.current); };
  }, [autoplay, delayMs, slides.length]);

  function manualPrev() {
    setIsAnimating(true);
    setTrackIndex(i => (i <= 0 ? slides.length - 1 : i - 1));
  }
  function manualNext() {
    setIsAnimating(true);
    setTrackIndex(i => i + 1);
  }

  // Hero values with fallback
  const eyebrow     = heroSettings.hero_eyebrow || 'Service Management · Intelligent Automation';
  const headingHtml = heroSettings.hero_heading_html;
  const bodyHtml    = heroSettings.hero_body_html;

  const btns = [1, 2, 3, 4].map(n => ({
    label: (heroSettings as Record<string, string>)[`hero_btn${n}_label`] ?? '',
    url:   (heroSettings as Record<string, string>)[`hero_btn${n}_url`]   ?? '',
  })).filter(b => b.label && b.url);

  return (
    <div>
      {/* Full-bleed banner hero */}
      <section className="relative w-full overflow-hidden" style={{ height: 'clamp(460px, 65vh, 620px)' }}>
        <img
          src="/images/Ian_headshot_banner_black_and_white copy copy copy.png"
          alt="Ian M. Clayton"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'left 35%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent from-30% via-black/50 via-55% to-black/85" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

        <div className="relative z-10 w-full h-full flex items-center justify-end px-6 sm:px-10 lg:px-16">
          <div className="w-full sm:w-4/5 lg:w-[58%] xl:w-[55%] py-10 lg:py-14">
            <p className="text-accent-cyan text-xs font-semibold uppercase tracking-widest mb-5">
              {eyebrow}
            </p>
            {headingHtml ? (
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-white mb-6 [&_em]:not-italic [&_em]:text-accent-cyan"
                dangerouslySetInnerHTML={{ __html: headingHtml }}
              />
            ) : (
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-white mb-6">
                Ian M. <span className="text-accent-cyan">Clayton</span>
              </h1>
            )}
            {bodyHtml ? (
              <div
                className="text-white/85 text-lg sm:text-xl leading-relaxed mb-10 max-w-lg [&_p]:mb-3 [&_p:last-child]:mb-0 [&_p+p]:text-white/65 [&_p+p]:text-sm"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : (
              <>
                <p className="text-white/85 text-lg sm:text-xl leading-relaxed mb-4 max-w-lg">
                  Service management thought leader, intelligent automation advocate, author, practitioner, and industry lifetime award recipient.
                </p>
                <p className="text-white/65 text-sm leading-relaxed mb-10 max-w-md">
                  This site is a personal archive of my work, projects, lessons, articles, and career journey across service management, digital operations, transformation, and automation.
                </p>
              </>
            )}
            <div className="flex flex-wrap gap-3">
              {btns.length > 0 ? btns.map((b, i) => (
                i === 0 ? (
                  <Link key={i} to={b.url} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-cyan text-gray-900 text-sm font-semibold hover:bg-accent-cyan/85 transition-colors">
                    {b.label} <ArrowRight size={15} />
                  </Link>
                ) : (
                  <Link key={i} to={b.url} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition-colors">{b.label}</Link>
                )
              )) : (
                <>
                  <Link to="/timeline" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-cyan text-gray-900 text-sm font-semibold hover:bg-accent-cyan/85 transition-colors">Explore my journey <ArrowRight size={15} /></Link>
                  <Link to="/projects"  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition-colors">View projects</Link>
                  <Link to="/articles"  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition-colors">Read articles</Link>
                  <Link to="/contact"   className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition-colors">Contact</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sliding Credibility Strip */}
      <section className="border-y border-light-border dark:border-dark-border bg-light-elevated/50 dark:bg-dark-elevated/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {slides.length > 0 ? (
            <div className="relative group">
              {/* Overflow clip */}
              <div className="overflow-hidden">
                {/*
                  Track: N items laid out horizontally.
                  Width = N / 3 * 100% (desktop shows 3), N / 2 * 100% (tablet), N * 100% (mobile).
                  translateX moves by 100/N % per item step — always correct regardless of breakpoint.
                */}
                <div
                  style={{
                    display: 'flex',
                    // Track width so each item fills 1/VISIBLE of the container at each breakpoint.
                    // We express this as N columns worth of 25% (desktop), 50% (tablet), 100% (mobile).
                    // Use a CSS calc targeting the widest breakpoint; tailwind class overrides handle smaller screens.
                    width: `${(N / 3) * 100}%`,
                    transform: `translateX(${translatePct}%)`,
                    transition: isAnimating ? 'transform 500ms ease-in-out' : 'none',
                    willChange: 'transform',
                  }}
                >
                  {extendedSlides.map((s, i) => (
                    <div
                      key={`${s.id}-${i}`}
                      style={{ flex: `0 0 ${100 / N}%`, minWidth: 0 }}
                      className="pr-6"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-accent-cyan mt-0.5 flex-shrink-0">
                          {renderBannerIcon(s.icon)}
                        </div>
                        <div
                          className="text-sm text-light-text dark:text-dark-text leading-snug [&_p]:m-0"
                          dangerouslySetInnerHTML={{ __html: s.content_html }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prev / Next arrows */}
              {slides.length > visibleCount && (
                <>
                  <button
                    onClick={manualPrev}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-light-bg dark:bg-dark-card border border-light-border dark:border-dark-border flex items-center justify-center text-light-muted dark:text-dark-muted hover:text-accent-cyan hover:border-accent-cyan transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={manualNext}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-light-bg dark:bg-dark-card border border-light-border dark:border-dark-border flex items-center justify-center text-light-muted dark:text-dark-muted hover:text-accent-cyan hover:border-accent-cyan transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={14} />
                  </button>
                </>
              )}

              {/* Dot indicators */}
              {slides.length > visibleCount && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setIsAnimating(true); setTrackIndex(i); }}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        (trackIndex % slides.length) === i
                          ? 'w-4 bg-accent-cyan'
                          : 'w-1.5 bg-light-border dark:bg-dark-border'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <CredentialItem icon={renderBannerIcon('Award')}     text="ITSM Industry Lifetime Award Recipient" />
              <CredentialItem icon={renderBannerIcon('BookOpen')}  text="Author: Universal Service Management Body of Knowledge (USMBOK)" />
              <CredentialItem icon={renderBannerIcon('Lightbulb')} text="Service Management & Intelligent Automation Practitioner" />
              <CredentialItem icon={renderBannerIcon('Briefcase')} text="Transformation / Advisory / Thought Leadership" />
            </div>
          )}
        </div>
      </section>

      {/* Expertise */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="mb-10">
          <p className="section-label">What I Focus On</p>
          <h2 className="section-title">Areas of Expertise</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(expertise.length ? expertise : staticExpertise).map((area) => (
            <div key={area.id ?? area.title} className="card card-hover p-5">
              <h3 className="card-title mb-2">{area.title}</h3>
              <p className="text-xs text-light-muted dark:text-dark-muted leading-relaxed">{area.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      {projects.length > 0 && (
        <section className="bg-light-elevated/40 dark:bg-dark-elevated/40 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="section-label">Selected Work</p>
                <h2 className="section-title">Featured Projects</h2>
              </div>
              <Link to="/projects" className="text-sm font-medium text-accent-cyan hover:underline flex items-center gap-1 flex-shrink-0">
                All projects <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {projects.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Timeline Highlights */}
      {timeline.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-label">Career Journey</p>
              <h2 className="section-title">Timeline Highlights</h2>
            </div>
            <Link to="/timeline" className="text-sm font-medium text-accent-cyan hover:underline flex items-center gap-1 flex-shrink-0">
              Full timeline <ArrowRight size={14} />
            </Link>
          </div>
          <div className="relative space-y-0">
            {timeline.map((entry, i) => (
              <TimelineCard key={entry.id} entry={entry} isLast={i === timeline.length - 1} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Articles */}
      {articles.length > 0 && (
        <section className="bg-light-elevated/40 dark:bg-dark-elevated/40 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="section-label">Writing & Ideas</p>
                <h2 className="section-title">Featured Articles</h2>
              </div>
              <Link to="/articles" className="text-sm font-medium text-accent-cyan hover:underline flex items-center gap-1 flex-shrink-0">
                All articles <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {articles.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Slider */}
      {tmEnabled && testimonials.length > 0 && (
        <section className="bg-dark-bg py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent-cyan mb-2">What Others Say</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">Testimonials</h2>
              </div>
              <Link to="/testimonials" className="text-sm font-medium text-accent-cyan hover:underline flex items-center gap-1 flex-shrink-0">
                All testimonials <ArrowRight size={14} />
              </Link>
            </div>

            <div className="relative group">
              <div className="overflow-hidden">
                <div
                  style={{
                    display: 'flex',
                    width: `${(TM_N / 3) * 100}%`,
                    transform: `translateX(${tmTranslatePct}%)`,
                    transition: tmIsAnimating ? 'transform 500ms ease-in-out' : 'none',
                    willChange: 'transform',
                  }}
                >
                  {tmExtended.map((t, i) => (
                    <div
                      key={`${t.id}-${i}`}
                      style={{ flex: `0 0 ${100 / TM_N}%`, minWidth: 0 }}
                      className="pr-5"
                    >
                      <button
                        onClick={() => navigate(`/testimonials/${t.id}`)}
                        className={`w-full text-left rounded-2xl border p-6 flex flex-col h-full group/card transition-all hover:shadow-lg ${
                          t.featured
                            ? 'border-accent-cyan/30 bg-accent-cyan/5 hover:border-accent-cyan/50'
                            : 'border-dark-border bg-dark-elevated hover:border-accent-cyan/30'
                        }`}
                      >
                        <Quote size={22} className={`mb-4 flex-shrink-0 ${t.featured ? 'text-accent-cyan' : 'text-dark-muted'}`} />
                        <p className="text-dark-secondary text-sm leading-relaxed flex-1 italic line-clamp-4 mb-5">
                          "{t.quote.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}"
                        </p>
                        <div className="pt-4 border-t border-dark-border">
                          <p className="text-white text-sm font-semibold group-hover/card:text-accent-cyan transition-colors">{t.attributed_name}</p>
                          {(t.attributed_role || t.attributed_organisation) && (
                            <p className="text-dark-muted text-xs mt-0.5">
                              {[t.attributed_role, t.attributed_organisation].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {testimonials.length > 1 && (
                <>
                  <button
                    onClick={tmPrev}
                    className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-dark-elevated border border-dark-border flex items-center justify-center text-dark-muted hover:text-accent-cyan hover:border-accent-cyan transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    onClick={tmNext}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-dark-elevated border border-dark-border flex items-center justify-center text-dark-muted hover:text-accent-cyan hover:border-accent-cyan transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={15} />
                  </button>
                </>
              )}

              {testimonials.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-6">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setTmIsAnimating(true); setTmTrackIndex(i); }}
                      aria-label={`Go to testimonial ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        (tmTrackIndex % testimonials.length) === i
                          ? 'w-4 bg-accent-cyan'
                          : 'w-1.5 bg-dark-border'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card p-10 text-center">
          <h2 className="section-title mb-3">Ready to connect?</h2>
          <p className="text-light-secondary dark:text-dark-secondary mb-6 max-w-lg mx-auto">
            Whether it is speaking, advisory, collaboration, or a project enquiry, I would be glad to hear from you.
          </p>
          <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
            Get in touch <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CredentialItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-accent-cyan mt-0.5 flex-shrink-0">{icon}</div>
      <p className="text-sm text-light-text dark:text-dark-text leading-snug">{text}</p>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="card card-hover p-6 flex flex-col group border-t-2 border-accent-cyan"
    >
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary">
          {project.industry}
        </span>
        {project.project_type && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary">
            {project.project_type}
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold text-light-text dark:text-dark-text mb-2 group-hover:text-accent-cyan transition-colors leading-snug">
        {project.title}
      </h3>
      <div className="text-xs text-light-secondary dark:text-dark-secondary mb-4 flex-1 leading-relaxed line-clamp-3 [&_p]:m-0"
        dangerouslySetInnerHTML={{ __html: project.short_focus ?? '' }}
      />
      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.tags.slice(0, 2).map(tag => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded bg-accent-cyan/10 text-accent-cyan font-medium">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1 text-xs font-medium text-accent-cyan mt-auto">
        View case study <ArrowRight size={12} />
      </div>
    </Link>
  );
}

function TimelineCard({ entry, isLast }: { entry: TimelineEntry; isLast: boolean }) {
  const typeStyle = ENTRY_TYPE_STYLE[entry.entry_type] ?? 'bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted';
  const year = entry.entry_date ? new Date(entry.entry_date).getFullYear() : '';

  return (
    <div className="flex gap-6 pb-8 relative">
      {!isLast && (
        <div className="absolute left-[19px] top-8 bottom-0 w-px bg-light-border dark:bg-dark-border" />
      )}
      <div className="flex-shrink-0 mt-1">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
          entry.is_milestone ? 'bg-accent-cyan text-gray-900' : 'bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary'
        }`}>
          {year}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${typeStyle}`}>
            {entry.entry_type}
          </span>
          {entry.organisation && (
            <span className="text-xs text-light-muted dark:text-dark-muted truncate">{entry.organisation}</span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-light-text dark:text-dark-text mb-1 leading-snug">{entry.title}</h3>
        <p className="text-xs text-light-secondary dark:text-dark-secondary leading-relaxed line-clamp-2">{entry.summary}</p>
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  const publishedYear = article.published_at ? new Date(article.published_at).getFullYear() : null;
  return (
    <Link to={`/articles/${article.slug}`} className="card card-hover p-6 flex flex-col group">
      <div className="flex items-center gap-3 mb-4">
        {article.category && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan">
            {article.category}
          </span>
        )}
        <div className="flex items-center gap-3 text-xs text-light-muted dark:text-dark-muted ml-auto">
          {article.reading_time_minutes && <span>{article.reading_time_minutes} min read</span>}
          {publishedYear && <span>{publishedYear}</span>}
        </div>
      </div>
      <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-1.5 group-hover:text-accent-cyan transition-colors leading-snug">
        {article.title}
      </h3>
      {article.subtitle && (
        <p className="text-sm font-medium text-light-secondary dark:text-dark-secondary mb-3">{article.subtitle}</p>
      )}
      {article.excerpt && (
        <p className="text-sm text-light-secondary dark:text-dark-secondary leading-relaxed line-clamp-3 flex-1">{article.excerpt}</p>
      )}
      <div className="flex items-center gap-1 text-xs font-medium text-accent-cyan mt-4">
        Read article <ArrowRight size={12} />
      </div>
    </Link>
  );
}

const staticExpertise = [
  { id: '1', title: 'Service Management Strategy', description: 'Enterprise service strategy, operating model design, and organisational alignment.', sort_order: 1 },
  { id: '2', title: 'Operating Model Design',       description: 'Designing scalable operating models for IT and business services.', sort_order: 2 },
  { id: '3', title: 'ITIL / USM / Service Architecture', description: 'Frameworks, standards, and architectural approaches for service excellence.', sort_order: 3 },
  { id: '4', title: 'Intelligent Automation',       description: 'Applying automation, AI, and orchestration where it creates measurable value.', sort_order: 4 },
  { id: '5', title: 'AI in Service Operations',     description: 'Practical AI adoption for service desks, operations, and knowledge management.', sort_order: 5 },
  { id: '6', title: 'Governance & Value Realisation', description: 'Ensuring governance, adoption, and business value from service investments.', sort_order: 6 },
  { id: '7', title: 'Human-centred Service Improvement', description: 'Putting people at the centre of service design, delivery, and improvement.', sort_order: 7 },
  { id: '8', title: 'Knowledge & Experience Design', description: 'Designing knowledge systems and employee/customer experience journeys.', sort_order: 8 },
];
