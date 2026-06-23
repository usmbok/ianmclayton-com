import { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Lock, Eye, Calendar, Building2, FileText, CheckCircle2 } from 'lucide-react';

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
  employer: { name: string; short_name: string | null } | null;
  summary_html: string | null;
  challenge_html: string | null;
  solution_html: string | null;
  outcomes_html: string | null;
  outcome_bullets: string[];
  pdf_path: string | null;
  tags: string[];
  confidentiality: string;
  featured: boolean;
  date_delivered: string | null;
}

interface RelatedUseCase {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  servicenow_product: string | null;
  project_type: string | null;
  summary_html: string | null;
}

const TYPE_COLORS: Record<string, string> = {
  transformation: 'bg-accent-blue/10 text-accent-blue',
  automation: 'bg-accent-cyan/10 text-accent-cyan',
  advisory: 'bg-accent-gold/10 text-accent-gold',
  implementation: 'bg-accent-green/10 text-accent-green',
  assessment: 'bg-accent-orange/10 text-accent-orange',
  migration: 'bg-accent-blue/10 text-accent-blue',
  default: 'bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary',
};

function typeColor(type: string | null) {
  if (!type) return TYPE_COLORS.default;
  return TYPE_COLORS[type.toLowerCase()] ?? TYPE_COLORS.default;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function stripHtml(html: string | null) {
  return html ? html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

const SECTIONS: { field: keyof UseCase; label: string }[] = [
  { field: 'summary_html', label: 'Overview' },
  { field: 'challenge_html', label: 'The Challenge' },
  { field: 'solution_html', label: 'Solution Approach' },
  { field: 'outcomes_html', label: 'Outcomes' },
];

export function UseCaseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [related, setRelated] = useState<RelatedUseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('use_cases')
      .select('*, employer:employers(name, short_name)')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data }) => {
        if (!data) { setNotFound(true); setLoading(false); return; }
        setUseCase(data);
        setLoading(false);
        if (data.servicenow_product) {
          supabase
            .from('use_cases')
            .select('id,title,slug,subtitle,servicenow_product,project_type,summary_html')
            .eq('status', 'published')
            .eq('servicenow_product', data.servicenow_product)
            .neq('id', data.id)
            .limit(3)
            .then(({ data: rel }) => setRelated(rel ?? []));
        }
      });
  }, [slug]);

  const backLabel = searchParams.get('from') === 'case-studies' ? 'Case Studies' : 'Projects & Case Studies';
  const backHref = '/projects?tab=case-studies';

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-light-elevated dark:bg-dark-elevated rounded w-2/3" />
          <div className="h-4 bg-light-elevated dark:bg-dark-elevated rounded w-1/3" />
          <div className="h-48 bg-light-elevated dark:bg-dark-elevated rounded" />
        </div>
      </div>
    );
  }

  if (notFound || !useCase) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">Case study not found</h1>
        <Link to="/projects?tab=case-studies" className="text-accent-cyan hover:underline">Back to case studies</Link>
      </div>
    );
  }

  const clientLabel = useCase.show_client_name && useCase.client_name
    ? useCase.client_name
    : useCase.client_display_name;

  const hasSections = SECTIONS.some(s => useCase[s.field]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        to={backHref}
        className="inline-flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted hover:text-accent-cyan transition-colors mb-8"
      >
        <ArrowLeft size={14} /> {backLabel}
      </Link>

      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-wrap gap-2 mb-3">
          {useCase.project_type && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${typeColor(useCase.project_type)}`}>
              {useCase.project_type}
            </span>
          )}
          {useCase.servicenow_product && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan">
              {useCase.servicenow_product}
            </span>
          )}
          {useCase.confidentiality === 'sanitised' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-orange/10 text-accent-orange">
              <Eye size={11} />Anonymised
            </span>
          )}
          {useCase.confidentiality === 'private' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-red/10 text-accent-red">
              <Lock size={11} />Confidential
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text mb-2 leading-tight">
          {useCase.title}
        </h1>
        {useCase.subtitle && (
          <p className="text-lg text-light-muted dark:text-dark-muted italic mb-3">{useCase.subtitle}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-light-muted dark:text-dark-muted mt-2 pb-6 border-b border-light-border dark:border-dark-border">
          {clientLabel && <span>{clientLabel}</span>}
          {useCase.employer && (
            <span className="flex items-center gap-1.5">
              <Building2 size={13} />{useCase.employer.short_name || useCase.employer.name}
            </span>
          )}
          {useCase.industry && <span>{useCase.industry}</span>}
          {useCase.date_delivered && (
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />{formatDate(useCase.date_delivered)}
            </span>
          )}
        </div>
      </header>

      {/* PDF download — prominent above content if available */}
      {useCase.pdf_path && (
        <div className="mb-8 flex items-center gap-4 p-4 rounded-xl border border-accent-cyan/20 bg-accent-cyan/5">
          <FileText size={20} className="text-accent-cyan flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-light-text dark:text-dark-text">Full Case Study (PDF)</p>
            <p className="text-xs text-light-muted dark:text-dark-muted">Download the complete reference document</p>
          </div>
          <a
            href={`/${useCase.pdf_path}`}
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-cyan text-white dark:text-dark-bg text-sm font-semibold hover:bg-accent-cyan/85 transition-colors"
          >
            <FileText size={14} /> Download
          </a>
        </div>
      )}

      {/* Outcome bullets — key results summary card */}
      {useCase.outcome_bullets?.length > 0 && (
        <div className="mb-10 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-light-muted dark:text-dark-muted mb-4">Key Results</h2>
          <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {useCase.outcome_bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 size={15} className="mt-0.5 text-accent-cyan flex-shrink-0" />
                <span className="text-sm text-light-secondary dark:text-dark-secondary leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main narrative sections */}
      {hasSections && (
        <div className="space-y-10">
          {SECTIONS.map(({ field, label }) => {
            const html = useCase[field] as string | null;
            if (!html) return null;
            return (
              <section key={field}>
                <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-3 pb-2 border-b border-light-border dark:border-dark-border">
                  {label}
                </h2>
                <div
                  className="prose prose-base max-w-none
                    prose-headings:text-light-text dark:prose-headings:text-dark-text
                    prose-p:text-light-secondary dark:prose-p:text-dark-secondary
                    prose-strong:text-light-text dark:prose-strong:text-dark-text
                    prose-a:text-accent-cyan prose-a:no-underline hover:prose-a:underline
                    prose-li:text-light-secondary dark:prose-li:text-dark-secondary
                    prose-ul:ml-4 prose-li:marker:text-accent-cyan
                    prose-blockquote:border-accent-cyan"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </section>
            );
          })}
        </div>
      )}

      {/* Tags */}
      {useCase.tags?.length > 0 && (
        <div className="mt-10 pt-6 border-t border-light-border dark:border-dark-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-3">Tags</p>
          <div className="flex flex-wrap gap-2">
            {useCase.tags.map(t => (
              <span key={t} className="text-sm px-3 py-1 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* Related case studies */}
      {related.length > 0 && (
        <div className="mt-12 pt-8 border-t border-light-border dark:border-dark-border">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-light-muted dark:text-dark-muted mb-5">Related Case Studies</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(r => (
              <Link
                key={r.id}
                to={`/case-studies/${r.slug}`}
                className="group rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-5 hover:border-accent-cyan/40 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  {r.project_type && (
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${typeColor(r.project_type)}`}>{r.project_type}</span>
                  )}
                  {r.servicenow_product && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan">{r.servicenow_product}</span>
                  )}
                </div>
                <h3 className="font-semibold text-light-text dark:text-dark-text text-sm leading-snug group-hover:text-accent-cyan transition-colors line-clamp-2">{r.title}</h3>
                {r.subtitle && <p className="text-xs text-light-muted dark:text-dark-muted italic mt-0.5 line-clamp-1">{r.subtitle}</p>}
                {r.summary_html && (
                  <p className="text-xs text-light-secondary dark:text-dark-secondary mt-1.5 leading-relaxed line-clamp-2">{stripHtml(r.summary_html)}</p>
                )}
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-accent-cyan">
                  View case study <ArrowLeft size={12} className="rotate-180" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-light-border dark:border-dark-border">
        <Link to="/projects?tab=case-studies" className="inline-flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted hover:text-accent-cyan transition-colors">
          <ArrowLeft size={14} /> Back to all case studies
        </Link>
      </div>
    </div>
  );
}
