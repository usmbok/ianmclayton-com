import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Lock, Eye, Calendar, ArrowRight, MessageSquareQuote, Building2 } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  slug: string;
  client_display_name: string | null;
  client_name: string | null;
  show_client_name: boolean;
  employer_id: string | null;
  employer: { name: string; short_name: string | null } | null;
  industry: string | null;
  date_start: string | null;
  date_end: string | null;
  status: string;
  confidentiality: string;
  featured: boolean;
  short_focus: string | null;
  project_type: string | null;
  role: string | null;
  sm_themes: string[];
  automation_themes: string[];
  tags: string[];
  context_html: string | null;
  challenge_html: string | null;
  my_role_html: string | null;
  approach_html: string | null;
  contributions_html: string | null;
  outcomes_html: string | null;
  lessons_html: string | null;
  client_comments_html: string | null;
}

function formatRange(start: string | null, end: string | null) {
  if (!start) return '';
  const s = new Date(start).getFullYear();
  if (!end) return `${s} – Present`;
  const e = new Date(end).getFullYear();
  return s === e ? `${s}` : `${s} – ${e}`;
}

const SECTIONS: { field: keyof Project; label: string }[] = [
  { field: 'context_html', label: 'Context' },
  { field: 'challenge_html', label: 'Challenge' },
  { field: 'my_role_html', label: 'My Role' },
  { field: 'approach_html', label: 'Approach' },
  { field: 'contributions_html', label: 'Contributions' },
  { field: 'outcomes_html', label: 'Outcomes' },
  { field: 'lessons_html', label: 'Lessons Learned' },
];

interface RelatedProject {
  id: string;
  title: string;
  slug: string;
  project_type: string | null;
  industry: string | null;
  short_focus: string | null;
}

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [related, setRelated] = useState<RelatedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('projects')
      .select('*, employer:employers(name, short_name)')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data }) => {
        if (!data) { setNotFound(true); setLoading(false); return; }
        setProject(data);
        setLoading(false);
        if (data.industry) {
          supabase
            .from('projects')
            .select('id,title,slug,project_type,industry,short_focus')
            .eq('status', 'published')
            .eq('industry', data.industry)
            .neq('id', data.id)
            .limit(3)
            .then(({ data: rel }) => setRelated(rel ?? []));
        }
      });
  }, [slug]);

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

  if (notFound || !project) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">Project not found</h1>
        <Link to="/projects" className="text-accent-cyan hover:underline">Back to projects</Link>
      </div>
    );
  }

  const hasSections = SECTIONS.some(s => project[s.field]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted hover:text-accent-cyan transition-colors mb-8">
        <ArrowLeft size={14} /> All projects
      </Link>

      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-wrap gap-2 mb-3">
          {project.project_type && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan capitalize">{project.project_type}</span>
          )}
          {project.confidentiality === 'sanitised' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-orange/10 text-accent-orange"><Eye size={11} />Anonymised</span>
          )}
          {project.confidentiality === 'private' && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-red/10 text-accent-red"><Lock size={11} />Confidential</span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-light-text dark:text-dark-text mb-2 leading-tight">{project.title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-light-muted dark:text-dark-muted mt-2 pb-6 border-b border-light-border dark:border-dark-border">
          {project.client_display_name && <span>{project.show_client_name && project.client_name ? project.client_name : project.client_display_name}</span>}
          {project.employer && (
            <span className="flex items-center gap-1"><Building2 size={13} />{project.employer.short_name || project.employer.name}</span>
          )}
          {project.industry && <span>{project.industry}</span>}
          {project.role && <span>{project.role}</span>}
          {(project.date_start || project.date_end) && (
            <span className="flex items-center gap-1"><Calendar size={13} />{formatRange(project.date_start, project.date_end)}</span>
          )}
        </div>
      </header>

      {/* Short focus */}
      {project.short_focus && (
        <div
          className="text-lg text-light-secondary dark:text-dark-secondary leading-relaxed mb-8 [&_p]:mb-2 [&_p:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: project.short_focus }}
        />
      )}

      {/* Case study sections */}
      {hasSections && (
        <div className="space-y-8">
          {SECTIONS.map(({ field, label }) => {
            const html = project[field] as string | null;
            if (!html) return null;
            return (
              <section key={field}>
                <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-3 pb-2 border-b border-light-border dark:border-dark-border">{label}</h2>
                <div
                  className="prose prose-base max-w-none
                    prose-headings:text-light-text dark:prose-headings:text-dark-text
                    prose-p:text-light-secondary dark:prose-p:text-dark-secondary
                    prose-strong:text-light-text dark:prose-strong:text-dark-text
                    prose-a:text-accent-cyan prose-a:no-underline hover:prose-a:underline
                    prose-li:text-light-secondary dark:prose-li:text-dark-secondary
                    prose-blockquote:border-accent-cyan"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </section>
            );
          })}
        </div>
      )}

      {/* Client comments */}
      {project.client_comments_html && (
        <div className="mt-10 rounded-xl border border-accent-cyan/20 bg-accent-cyan/5 px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquareQuote size={16} className="text-accent-cyan flex-shrink-0" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-accent-cyan">Client Comments</h2>
          </div>
          <div
            className="prose prose-base max-w-none
              prose-headings:text-light-text dark:prose-headings:text-dark-text
              prose-p:text-light-secondary dark:prose-p:text-dark-secondary
              prose-strong:text-light-text dark:prose-strong:text-dark-text
              prose-a:text-accent-cyan prose-a:no-underline hover:prose-a:underline
              prose-li:text-light-secondary dark:prose-li:text-dark-secondary
              prose-blockquote:border-accent-cyan"
            dangerouslySetInnerHTML={{ __html: project.client_comments_html }}
          />
        </div>
      )}

      {/* Themes & tags */}
      {(project.sm_themes?.length > 0 || project.automation_themes?.length > 0 || project.tags?.length > 0) && (
        <div className="mt-10 pt-6 border-t border-light-border dark:border-dark-border space-y-3">
          {(project.sm_themes?.length > 0 || project.automation_themes?.length > 0) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted mb-2">Themes</p>
              <div className="flex flex-wrap gap-2">
                {[...(project.sm_themes ?? []), ...(project.automation_themes ?? [])].map(t => (
                  <span key={t} className="text-sm px-3 py-1 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-secondary dark:text-dark-secondary">{t}</span>
                ))}
              </div>
            </div>
          )}
          {project.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.map(t => (
                <span key={t} className="text-sm px-3 py-1 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Related projects */}
      {related.length > 0 && (
        <div className="mt-12 pt-8 border-t border-light-border dark:border-dark-border">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-light-muted dark:text-dark-muted mb-5">Related Projects</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map(r => (
              <Link
                key={r.id}
                to={`/projects/${r.slug}`}
                className="group rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-5 hover:border-accent-cyan/40 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  {r.project_type && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan capitalize">{r.project_type}</span>
                  )}
                  {r.industry && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted">{r.industry}</span>
                  )}
                </div>
                <h3 className="font-semibold text-light-text dark:text-dark-text text-sm leading-snug group-hover:text-accent-cyan transition-colors line-clamp-2">{r.title}</h3>
                {r.short_focus && (
                  <div className="text-xs text-light-secondary dark:text-dark-secondary mt-1.5 leading-relaxed line-clamp-2 [&_p]:m-0" dangerouslySetInnerHTML={{ __html: r.short_focus }} />
                )}
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-accent-cyan">
                  View case study <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-light-border dark:border-dark-border">
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-light-muted dark:text-dark-muted hover:text-accent-cyan transition-colors">
          <ArrowLeft size={14} /> Back to all projects
        </Link>
      </div>
    </div>
  );
}
