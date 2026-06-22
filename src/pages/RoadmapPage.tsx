import { CheckCircle2, Circle, Clock, Database, Layout } from 'lucide-react';
import { roadmapPhases, RoadmapItem, RoadmapPhase } from '../data/roadmap';

function StatusIcon({ status }: { status: string }) {
  if (status === 'complete') return <CheckCircle2 size={16} className="text-accent-green" />;
  if (status === 'in-progress') return <Clock size={16} className="text-accent-orange" />;
  if (status === 'n/a') return <span className="text-xs text-dark-muted dark:text-dark-muted text-light-muted">n/a</span>;
  return <Circle size={16} className="text-light-muted dark:text-dark-muted" />;
}

function PhaseBadge({ status }: { status: RoadmapPhase['status'] }) {
  const styles = {
    'Complete': 'bg-accent-green/15 text-accent-green border-accent-green/30',
    'In Progress': 'bg-accent-orange/15 text-accent-orange border-accent-orange/30',
    'Not Started': 'bg-light-elevated dark:bg-dark-elevated text-light-muted dark:text-dark-muted border-light-border dark:border-dark-border',
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${styles[status]}`}>
      {status}
    </span>
  );
}

function ProgressBar({ items, type }: { items: RoadmapItem[]; type: 'ui' | 'data' }) {
  const relevant = items.filter(i => (type === 'ui' ? i.uiStatus : i.dataStatus) !== 'n/a');
  if (relevant.length === 0) return null;
  const complete = relevant.filter(i => (type === 'ui' ? i.uiStatus : i.dataStatus) === 'complete').length;

  return (
    <div className="flex items-center gap-2 text-xs">
      {type === 'ui' ? <Layout size={12} className="text-accent-cyan" /> : <Database size={12} className="text-accent-orange" />}
      <span className="text-light-muted dark:text-dark-muted">{complete}/{relevant.length}</span>
    </div>
  );
}

function PhaseCard({ phase }: { phase: RoadmapPhase }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-cyan mb-1">
            Phase {phase.number}
          </p>
          <h3 className="text-base font-semibold text-light-text dark:text-dark-text">
            {phase.title}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <PhaseBadge status={phase.status} />
          <div className="flex items-center gap-3">
            <ProgressBar items={phase.items} type="ui" />
            <ProgressBar items={phase.items} type="data" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {phase.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-light-elevated/50 dark:bg-dark-elevated/50">
            <div className="flex items-center gap-3">
              <StatusIcon status={item.uiStatus} />
              <span className="text-xs font-mono text-light-muted dark:text-dark-muted">{item.id}</span>
              <span className="text-sm text-light-text dark:text-dark-text">{item.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5" title="UI Status">
                <Layout size={12} className="text-light-muted dark:text-dark-muted" />
                <StatusIcon status={item.uiStatus} />
              </div>
              <div className="flex items-center gap-1.5" title="Data Status">
                <Database size={12} className="text-light-muted dark:text-dark-muted" />
                <StatusIcon status={item.dataStatus} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RoadmapPage() {
  const totalItems = roadmapPhases.reduce((acc, p) => acc + p.items.length, 0);
  const uiComplete = roadmapPhases.reduce(
    (acc, p) => acc + p.items.filter(i => i.uiStatus === 'complete').length, 0
  );
  const dataRelevant = roadmapPhases.reduce(
    (acc, p) => acc + p.items.filter(i => i.dataStatus !== 'n/a').length, 0
  );
  const dataComplete = roadmapPhases.reduce(
    (acc, p) => acc + p.items.filter(i => i.dataStatus === 'complete').length, 0
  );
  const uiPct = totalItems > 0 ? Math.round((uiComplete / totalItems) * 100) : 0;
  const dataPct = dataRelevant > 0 ? Math.round((dataComplete / dataRelevant) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
          Build Roadmap
        </h1>
        <p className="text-light-secondary dark:text-dark-secondary">
          Tracking the build of ianmclayton.com — page by page, data set by data set.
        </p>
      </div>

      <div className="card p-6 mb-8 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Layout size={16} className="text-accent-cyan" />
              <span className="text-sm font-medium text-light-text dark:text-dark-text">UI / Code Built</span>
            </div>
            <span className="text-sm font-semibold text-accent-cyan">{uiPct}% complete</span>
          </div>
          <div className="h-2 bg-light-elevated dark:bg-dark-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-cyan rounded-full transition-all duration-500"
              style={{ width: `${uiPct}%` }}
            />
          </div>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-1">{uiComplete} of {totalItems} items</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-accent-orange" />
              <span className="text-sm font-medium text-light-text dark:text-dark-text">Data / Supabase</span>
            </div>
            <span className="text-sm font-semibold text-accent-orange">{dataPct}% complete</span>
          </div>
          <div className="h-2 bg-light-elevated dark:bg-dark-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-orange rounded-full transition-all duration-500"
              style={{ width: `${dataPct}%` }}
            />
          </div>
          <p className="text-xs text-light-muted dark:text-dark-muted mt-1">{dataComplete} of {dataRelevant} items</p>
        </div>

        <p className="text-xs text-light-muted dark:text-dark-muted pt-2 border-t border-light-border dark:border-dark-border">
          Each item has two indicators: <Layout size={10} className="inline" /> UI (screen built in code) and <Database size={10} className="inline" /> Data (rows/schema in Supabase).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roadmapPhases.map((phase) => (
          <PhaseCard key={phase.id} phase={phase} />
        ))}
      </div>
    </div>
  );
}
