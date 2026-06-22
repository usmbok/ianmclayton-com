import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Award, Users, Mic, ArrowRight, CheckCircle,
  Lightbulb, Target, Globe, Zap, Briefcase,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface ExpertiseArea {
  id: string;
  title: string;
  description: string;
  tags: string[];
  sort_order: number;
  featured: boolean;
}

const EXPERTISE_ICONS = [Lightbulb, Target, Globe, Zap, BookOpen, Users, Award, Mic];

const staticExpertise: ExpertiseArea[] = [
  { id: '1', title: 'Service Management Strategy', description: 'Enterprise service strategy, operating model design, and organisational alignment for IT and business services.', tags: ['strategy', 'enterprise IT'], sort_order: 1, featured: true },
  { id: '2', title: 'Operating Model Design', description: 'Designing scalable and sustainable operating models for IT and business service delivery.', tags: ['operating model', 'organisational design'], sort_order: 2, featured: true },
  { id: '3', title: 'ITIL, USM & Service Architecture', description: 'Deep expertise in ITIL, USMBOK, and architectural approaches for service excellence.', tags: ['ITIL', 'USM', 'USMBOK'], sort_order: 3, featured: true },
  { id: '4', title: 'Intelligent Automation', description: 'Applying automation, orchestration, and AI where it creates measurable operational value.', tags: ['automation', 'RPA', 'AI'], sort_order: 4, featured: true },
  { id: '5', title: 'AI in Service Operations', description: 'Practical AI adoption for service desks, IT operations, knowledge management, and employee experience.', tags: ['AI', 'AIOps', 'ITSM'], sort_order: 5, featured: true },
  { id: '6', title: 'Governance & Value Realisation', description: 'Governance structures and measurement frameworks that prove and sustain business value.', tags: ['governance', 'value realisation'], sort_order: 6, featured: false },
  { id: '7', title: 'Human-Centred Service Design', description: 'Putting people at the centre of service design, delivery, and improvement.', tags: ['human-centred', 'CX', 'design thinking'], sort_order: 7, featured: false },
  { id: '8', title: 'Knowledge & Experience Design', description: 'Designing knowledge systems that reduce friction and amplify organisational capability.', tags: ['knowledge management', 'KCS'], sort_order: 8, featured: false },
];

export function AboutPage() {
  const { settings } = useSiteSettings();
  const [expertise, setExpertise] = useState<ExpertiseArea[]>([]);

  useEffect(() => {
    supabase
      .from('expertise_areas')
      .select('id, title, description, tags, sort_order, featured')
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) setExpertise(data);
      });
  }, []);

  const displayExpertise = expertise.length > 0 ? expertise : staticExpertise;

  return (
    <div className="bg-light-bg dark:bg-dark-bg">

      {/* ── Hero / Bio ─────────────────────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-cyan/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-cyan/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            {/* left — name / credentials */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <p className="section-label">About</p>
                <h1 className="text-4xl sm:text-5xl font-bold text-light-text dark:text-dark-text leading-tight mt-2">
                  Ian M. <span className="text-accent-cyan">Clayton</span>
                </h1>
              </div>

              <p className="text-light-secondary dark:text-dark-secondary text-lg leading-relaxed">
                {settings.tagline || 'Service Management. Intelligent Automation. Human Value.'}
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { icon: BookOpen, text: 'Author of the USMBOK' },
                  { icon: Award,    text: 'ITSM Industry Lifetime Achievement Award' },
                  { icon: Globe,    text: settings.location || 'Sarasota, Florida, USA' },
                  { icon: Users,    text: '30+ years practitioner & advisor' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon size={18} className="text-accent-cyan flex-shrink-0" />
                    <span className="text-light-secondary dark:text-dark-secondary text-sm">{text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
                  Get in touch <ArrowRight size={16} />
                </Link>
                <Link
                  to="/work-history"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:border-accent-cyan transition-colors text-sm font-medium"
                >
                  Work history
                </Link>
              </div>
            </div>

            {/* right — full bio */}
            <div className="lg:col-span-3 space-y-5">
              {settings.bio_full ? (
                settings.bio_full.split('\n\n').map((para, i) => (
                  <p key={i} className="text-light-secondary dark:text-dark-secondary leading-relaxed text-[1.05rem]">
                    {para}
                  </p>
                ))
              ) : (
                <>
                  <p className="text-light-secondary dark:text-dark-secondary leading-relaxed text-[1.05rem]">
                    Ian M. Clayton is a globally recognised authority in service management and intelligent
                    automation with over three decades of practitioner, advisory, and thought leadership
                    experience. He is the author of the Universal Service Management Body of Knowledge
                    (USMBOK) and a recipient of the ITSM industry lifetime achievement award.
                  </p>
                  <p className="text-light-secondary dark:text-dark-secondary leading-relaxed text-[1.05rem]">
                    Ian advises organisations navigating the intersection of service management modernisation
                    and intelligent automation adoption — helping them cut through theory to land durable,
                    measurable outcomes.
                  </p>
                  <p className="text-light-secondary dark:text-dark-secondary leading-relaxed text-[1.05rem]">
                    He works across sectors including financial services, government, technology, and
                    healthcare — bringing a rare blend of deep domain knowledge and pragmatic delivery
                    experience to every engagement.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Expertise areas ────────────────────────────────────────────── */}
      <section className="py-20 bg-light-elevated dark:bg-dark-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <p className="section-label">Areas of Expertise</p>
            <h2 className="section-title mt-2">What Ian brings to the table</h2>
            <p className="mt-4 text-light-secondary dark:text-dark-secondary leading-relaxed">
              Three decades of practitioner experience distilled into eight focused disciplines — from
              service strategy and operating model design through to AI adoption and knowledge architecture.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayExpertise.map((area, i) => {
              const Icon = EXPERTISE_ICONS[i % EXPERTISE_ICONS.length];
              return (
                <div
                  key={area.id}
                  className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 hover:border-accent-cyan/50 transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 flex items-center justify-center mb-4 group-hover:bg-accent-cyan/20 transition-colors">
                    <Icon size={20} className="text-accent-cyan" />
                  </div>
                  <h3 className="card-title mb-2">{area.title}</h3>
                  <p className="text-light-muted dark:text-dark-muted text-sm leading-relaxed line-clamp-3">
                    {area.description}
                  </p>
                  {area.tags && area.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {area.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted border border-light-border dark:border-dark-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Philosophy & Approach ───────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="section-label">Philosophy</p>
              <h2 className="section-title mt-2">Pragmatism over prescription</h2>
              <p className="mt-4 text-light-secondary dark:text-dark-secondary leading-relaxed">
                Ian's approach is grounded in one conviction: frameworks and certifications are tools,
                not destinations. The goal is always measurable improvement for real people in real
                organisations — not compliance with a body of knowledge.
              </p>
              <p className="mt-4 text-light-secondary dark:text-dark-secondary leading-relaxed">
                This means asking hard questions about what value actually looks like in context,
                cutting through fashionable methodology to what will actually work, and staying with
                organisations long enough to see outcomes land.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'Start with outcomes, not frameworks',
                  'Design for the humans who deliver and consume services',
                  'Automate to amplify, not to displace',
                  'Measure what matters, not what is easy to count',
                  'Governance should enable, not obstruct',
                ].map((principle) => (
                  <div key={principle} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-accent-cyan flex-shrink-0 mt-0.5" />
                    <span className="text-light-secondary dark:text-dark-secondary text-sm leading-relaxed">
                      {principle}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {[
                {
                  number: '30+',
                  label: 'Years in service management',
                  desc: 'Practitioner experience across enterprise IT, consulting, and advisory roles.',
                },
                {
                  number: '100+',
                  label: 'Organisations advised',
                  desc: 'From FTSE 100 enterprises to government agencies across five continents.',
                },
                {
                  number: '1',
                  label: 'Body of knowledge authored',
                  desc: 'The Universal Service Management Body of Knowledge — USMBOK.',
                },
                {
                  number: '∞',
                  label: 'Commitment to human value',
                  desc: 'Technology serves people. That principle never changes.',
                },
              ].map(({ number, label, desc }) => (
                <div
                  key={label}
                  className="flex gap-6 p-5 bg-light-elevated dark:bg-dark-elevated rounded-xl border border-light-border dark:border-dark-border"
                >
                  <div className="text-3xl font-bold text-accent-cyan flex-shrink-0 w-14 text-right leading-none pt-1">
                    {number}
                  </div>
                  <div>
                    <div className="font-semibold text-light-text dark:text-dark-text text-sm">{label}</div>
                    <div className="text-light-muted dark:text-dark-muted text-sm mt-0.5 leading-relaxed">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── USMBOK & Publications ───────────────────────────────────────── */}
      <section className="py-20 bg-light-elevated dark:bg-dark-elevated">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-3 space-y-5">
              <div>
                <p className="section-label">Publications</p>
                <h2 className="section-title mt-2">
                  Universal Service Management{' '}
                  <span className="text-accent-cyan">Body of Knowledge</span>
                </h2>
              </div>
              <p className="text-light-secondary dark:text-dark-secondary leading-relaxed">
                The USMBOK is the definitive practitioner reference for service management — bridging
                strategy, architecture, delivery, and continual improvement into a coherent, vendor-neutral
                framework that organisations actually use.
              </p>
              <p className="text-light-secondary dark:text-dark-secondary leading-relaxed">
                Unlike compliance-driven frameworks, USMBOK is designed to be adapted. It treats service
                management as a living discipline, not a checklist — giving practitioners the vocabulary,
                models, and decision frameworks to navigate real complexity.
              </p>
              <div className="pt-2">
                <Link to="/articles" className="btn-primary inline-flex items-center gap-2">
                  Read Ian's writing <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-7 space-y-4">
                <div className="w-12 h-12 bg-accent-cyan/10 rounded-xl flex items-center justify-center">
                  <BookOpen size={24} className="text-accent-cyan" />
                </div>
                <h3 className="font-bold text-light-text dark:text-dark-text text-lg">Key works</h3>
                <div className="space-y-1 text-sm">
                  {[
                    { title: 'Universal Service Management Body of Knowledge (USMBOK)', year: 'Ongoing edition' },
                    { title: 'Service Intelligence — AI in the Service Desk', year: 'Article series' },
                    { title: 'The Automation Paradox', year: 'White paper' },
                    { title: 'Rethinking the Service Catalogue', year: 'Industry publication' },
                  ].map(({ title, year }) => (
                    <div key={title} className="flex justify-between gap-4 py-2.5 border-b border-light-border dark:border-dark-border last:border-0">
                      <span className="text-light-secondary dark:text-dark-secondary leading-snug">{title}</span>
                      <span className="text-light-muted dark:text-dark-muted flex-shrink-0 text-xs pt-0.5">{year}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Speaking & Advisory CTA ─────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-8 hover:border-accent-cyan/50 transition-all group">
              <div className="w-12 h-12 bg-accent-cyan/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-accent-cyan/20 transition-colors">
                <Mic size={24} className="text-accent-cyan" />
              </div>
              <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-3">Speaking engagements</h3>
              <p className="text-light-secondary dark:text-dark-secondary text-sm leading-relaxed mb-5">
                Ian speaks at major industry conferences, leadership summits, and internal executive
                events on service management modernisation, intelligent automation, AI governance, and
                the future of service delivery. Known for substance over slides.
              </p>
              <ul className="space-y-2 mb-6">
                {['Keynote presentations', 'Panel discussions', 'Workshop facilitation', 'Executive roundtables'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-light-secondary dark:text-dark-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="btn-primary inline-flex items-center gap-2 text-sm">
                Enquire about speaking <ArrowRight size={14} />
              </Link>
            </div>

            <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-8 hover:border-accent-cyan/50 transition-all group">
              <div className="w-12 h-12 bg-accent-cyan/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-accent-cyan/20 transition-colors">
                <Briefcase size={24} className="text-accent-cyan" />
              </div>
              <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-3">Advisory & consulting</h3>
              <p className="text-light-secondary dark:text-dark-secondary text-sm leading-relaxed mb-5">
                Strategic advisory engagements for organisations seeking to modernise their service
                management approach, adopt intelligent automation responsibly, or redesign operating
                models for a new era. Engagements are outcome-focused and time-bound.
              </p>
              <ul className="space-y-2 mb-6">
                {['Service strategy review', 'Operating model design', 'AI readiness assessment', 'Transformation advisory'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-light-secondary dark:text-dark-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="btn-primary inline-flex items-center gap-2 text-sm">
                Start a conversation <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
