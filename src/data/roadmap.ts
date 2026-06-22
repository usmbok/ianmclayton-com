export interface RoadmapItem {
  id: string;
  label: string;
  uiStatus: 'not-started' | 'in-progress' | 'complete';
  dataStatus: 'not-started' | 'in-progress' | 'complete' | 'n/a';
}

export interface RoadmapPhase {
  id: string;
  number: number;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Complete';
  items: RoadmapItem[];
}

export const roadmapPhases: RoadmapPhase[] = [
  {
    id: 'phase-0',
    number: 0,
    title: 'Roadmap & Foundation',
    status: 'Complete',
    items: [
      { id: '0.1', label: 'Build Status / Roadmap page',         uiStatus: 'complete', dataStatus: 'n/a' },
      { id: '0.2', label: 'Theme system (light / dark / system)', uiStatus: 'complete', dataStatus: 'n/a' },
      { id: '0.3', label: 'Navigation & layout shell',            uiStatus: 'complete', dataStatus: 'n/a' },
      { id: '0.4', label: 'Starter Home page',                    uiStatus: 'complete', dataStatus: 'n/a' },
    ],
  },
  {
    id: 'phase-1',
    number: 1,
    title: 'Authentication & Database',
    status: 'Complete',
    items: [
      { id: '1.1', label: 'Supabase auth setup (email/password)', uiStatus: 'complete', dataStatus: 'complete' },
      { id: '1.2', label: 'Register page',                        uiStatus: 'complete', dataStatus: 'complete' },
      { id: '1.3', label: 'Login page',                           uiStatus: 'complete', dataStatus: 'complete' },
      { id: '1.4', label: 'Developer bypass user seed',           uiStatus: 'complete', dataStatus: 'complete' },
      { id: '1.5', label: 'Profiles table & RLS',                 uiStatus: 'complete', dataStatus: 'complete' },
      { id: '1.6', label: 'Auth context & route protection',      uiStatus: 'complete', dataStatus: 'complete' },
    ],
  },
  {
    id: 'phase-2',
    number: 2,
    title: 'Database Schema',
    status: 'Complete',
    items: [
      { id: '2.1', label: 'Projects table + RLS',            uiStatus: 'complete', dataStatus: 'complete' },
      { id: '2.2', label: 'Timeline entries table + RLS',    uiStatus: 'complete', dataStatus: 'complete' },
      { id: '2.3', label: 'Articles table + RLS',            uiStatus: 'complete', dataStatus: 'complete' },
      { id: '2.4', label: 'Testimonials table + RLS',        uiStatus: 'complete', dataStatus: 'complete' },
      { id: '2.5', label: 'Work history table + RLS',        uiStatus: 'complete', dataStatus: 'complete' },
      { id: '2.6', label: 'Expertise areas table + RLS',     uiStatus: 'complete', dataStatus: 'complete' },
      { id: '2.7', label: 'Contact submissions table + RLS', uiStatus: 'complete', dataStatus: 'complete' },
      { id: '2.8', label: 'Site settings table + RLS',       uiStatus: 'complete', dataStatus: 'complete' },
      { id: '2.9', label: 'Seed realistic content data',     uiStatus: 'complete', dataStatus: 'complete' },
    ],
  },
  {
    id: 'phase-3',
    number: 3,
    title: 'Public Pages: Home, About, Contact',
    status: 'Complete',
    items: [
      { id: '3.1', label: 'Home hero with headshot banner',     uiStatus: 'complete', dataStatus: 'complete' },
      { id: '3.2', label: 'Credibility strip',                   uiStatus: 'complete', dataStatus: 'n/a' },
      { id: '3.3', label: 'Expertise / focus area cards',        uiStatus: 'complete', dataStatus: 'complete' },
      { id: '3.4', label: 'Featured projects preview',           uiStatus: 'complete', dataStatus: 'complete' },
      { id: '3.5', label: 'Timeline preview',                    uiStatus: 'complete', dataStatus: 'complete' },
      { id: '3.6', label: 'Featured articles preview',           uiStatus: 'complete', dataStatus: 'complete' },
      { id: '3.7', label: 'Testimonials preview',                uiStatus: 'complete', dataStatus: 'complete' },
      { id: '3.8', label: 'About page (5 sections)',             uiStatus: 'complete', dataStatus: 'complete' },
      { id: '3.9', label: 'Contact page & form submission',      uiStatus: 'complete', dataStatus: 'complete' },
    ],
  },
  {
    id: 'phase-4',
    number: 4,
    title: 'Projects / Case Studies',
    status: 'Complete',
    items: [
      { id: '4.1', label: 'Project archive page with card grid',      uiStatus: 'complete', dataStatus: 'complete' },
      { id: '4.2', label: 'Collapsible filter panel (all filters)',    uiStatus: 'complete', dataStatus: 'n/a' },
      { id: '4.3', label: 'Right-hand detail panel (expand/collapse)', uiStatus: 'complete', dataStatus: 'n/a' },
      { id: '4.4', label: 'Full case-study content rendering',         uiStatus: 'complete', dataStatus: 'complete' },
      { id: '4.5', label: 'Confidentiality badges & client naming',    uiStatus: 'complete', dataStatus: 'complete' },
      { id: '4.6', label: 'Pagination / load more',                    uiStatus: 'complete', dataStatus: 'n/a' },
      { id: '4.7', label: 'Timeline view toggle',                      uiStatus: 'complete', dataStatus: 'n/a' },
    ],
  },
  {
    id: 'phase-5',
    number: 5,
    title: 'Timeline',
    status: 'Complete',
    items: [
      { id: '5.1', label: 'Interactive vertical timeline',   uiStatus: 'complete', dataStatus: 'complete' },
      { id: '5.2', label: 'Color-coded nodes by entry type', uiStatus: 'complete', dataStatus: 'n/a' },
      { id: '5.3', label: 'Collapsible filter panel',        uiStatus: 'complete', dataStatus: 'n/a' },
      { id: '5.4', label: 'Context-sensitive search',        uiStatus: 'complete', dataStatus: 'n/a' },
      { id: '5.5', label: 'Right-hand detail panel',         uiStatus: 'complete', dataStatus: 'n/a' },
      { id: '5.6', label: 'Sticky year markers',             uiStatus: 'complete', dataStatus: 'n/a' },
      { id: '5.7', label: 'Related project/article linking', uiStatus: 'complete', dataStatus: 'n/a' },
    ],
  },
  {
    id: 'phase-6',
    number: 6,
    title: 'Work History & Articles',
    status: 'Complete',
    items: [
      { id: '6.1', label: 'Work History page with role cards',      uiStatus: 'complete', dataStatus: 'complete' },
      { id: '6.2', label: 'Work History filters',                    uiStatus: 'complete', dataStatus: 'n/a' },
      { id: '6.3', label: 'Articles list page',                      uiStatus: 'complete', dataStatus: 'complete' },
      { id: '6.4', label: 'Article detail page (rich text render)',  uiStatus: 'complete', dataStatus: 'complete' },
      { id: '6.5', label: 'Article search & category filters',       uiStatus: 'complete', dataStatus: 'n/a' },
      { id: '6.6', label: 'Related content sections',                uiStatus: 'complete', dataStatus: 'n/a' },
    ],
  },
  {
    id: 'phase-7',
    number: 7,
    title: 'Testimonials',
    status: 'Complete',
    items: [
      { id: '7.1', label: 'Testimonials page with card grid',   uiStatus: 'complete', dataStatus: 'complete' },
      { id: '7.2', label: 'Filter by tag / featured first',      uiStatus: 'complete', dataStatus: 'n/a' },
      { id: '7.3', label: 'Responsive layout (3/2/1 columns)',   uiStatus: 'complete', dataStatus: 'n/a' },
    ],
  },
  {
    id: 'phase-8',
    number: 8,
    title: 'Admin Dashboard & CRUD',
    status: 'In Progress',
    items: [
      { id: '8.1', label: 'Admin layout with sidebar',                uiStatus: 'complete',     dataStatus: 'n/a' },
      { id: '8.2', label: 'Admin dashboard (stats, recent, actions)', uiStatus: 'complete',     dataStatus: 'complete' },
      { id: '8.3', label: 'Admin social media settings',              uiStatus: 'complete',     dataStatus: 'complete' },
      { id: '8.4', label: 'Admin MFA setup page',                     uiStatus: 'complete',     dataStatus: 'n/a' },
      { id: '8.5', label: 'Manage Projects (CRUD + HTML fields)',      uiStatus: 'complete',     dataStatus: 'complete' },
      { id: '8.6', label: 'Manage Timeline entries',                   uiStatus: 'complete',     dataStatus: 'complete' },
      { id: '8.7', label: 'Manage Articles (CRUD + HTML editor)',      uiStatus: 'complete',     dataStatus: 'complete' },
      { id: '8.8', label: 'Manage Testimonials',                       uiStatus: 'complete',     dataStatus: 'complete' },
      { id: '8.9', label: 'Site settings (bio, tagline, SEO)',         uiStatus: 'complete',     dataStatus: 'complete' },
    ],
  },
  {
    id: 'phase-9',
    number: 9,
    title: 'SEO, Polish & Responsiveness',
    status: 'In Progress',
    items: [
      { id: '9.1', label: 'Dynamic meta tags per page',                           uiStatus: 'not-started',  dataStatus: 'not-started' },
      { id: '9.2', label: 'Open Graph / Twitter Card meta',                        uiStatus: 'not-started',  dataStatus: 'n/a' },
      { id: '9.3', label: 'Accessibility pass (ARIA, focus, contrast)',            uiStatus: 'not-started',  dataStatus: 'n/a' },
      { id: '9.4', label: 'Entrance animations & micro-interactions',              uiStatus: 'not-started',  dataStatus: 'n/a' },
      { id: '9.5', label: 'Mobile / tablet responsive polish',                     uiStatus: 'not-started',  dataStatus: 'n/a' },
      { id: '9.6', label: 'Performance (lazy load, code splitting)',               uiStatus: 'not-started',  dataStatus: 'n/a' },
      { id: '9.7', label: 'Admin MFA two-factor login flow (TOTP)',                uiStatus: 'in-progress',  dataStatus: 'n/a' },
    ],
  },
];
