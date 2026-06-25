# MADD Specification: Ian M. Clayton — Professional Portfolio Application

**Version:** 1.0  
**Date:** 2026-06-25  
**Stack:** React 18 + TypeScript · Supabase (PostgreSQL + Auth) · Tailwind CSS · Vite

---

## 1. Purpose & Scope

This document is a Modern Application Design & Development (MADD) specification for a full-stack professional portfolio web application. The application showcases service management expertise, career history, projects, case studies, articles, and testimonials. It includes a full CMS-style admin panel for managing all content, configurable site settings, and two-factor authentication.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
Browser (React SPA)
      │
      ├── Public Routes (unauthenticated)
      └── Admin Routes (authenticated + admin role)
              │
              └── Supabase
                    ├── PostgreSQL (13 tables, public schema)
                    ├── Auth (email/password + TOTP MFA)
                    └── Row Level Security (RLS)
```

### 2.2 Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Routing | React Router DOM |
| Styling | Tailwind CSS (custom design system) |
| Rich Text Editor | TipTap |
| Icons | Lucide React |
| Backend / DB | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (email/password + TOTP MFA) |
| Theme System | CSS class-based dark mode (`dark:`) |

### 2.3 Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous public key |
| `VITE_DEV_ADMIN_BYPASS` | Set `true` to bypass admin auth in development |

---

## 3. Application Routes

### 3.1 Public Routes

| Path | Component | Description |
|---|---|---|
| `/` | `HomePage` | Hero, credibility strip, expertise, featured content, CTA |
| `/about` | `AboutPage` | Bio, expertise areas, philosophy, publications |
| `/contact` | `ContactPage` | Contact form + info (email, LinkedIn, Calendly) |
| `/work-history` | `WorkHistoryPage` | Expandable career timeline |
| `/projects` | `ProjectsPage` | Projects + Case Studies archive with filters/search |
| `/projects/:slug` | `ProjectDetailPage` | Full project detail (HTML sections) |
| `/case-studies/:slug` | `UseCaseDetailPage` | ServiceNow case study detail + PDF download |
| `/timeline` | `TimelinePage` | Interactive vertical timeline with detail panel |
| `/articles` | `ArticlesPage` | Article archive with search and category filters |
| `/articles/:slug` | `ArticleDetailPage` | Full article with rich text rendering |
| `/testimonials` | `TestimonialsPage` | Testimonials grid/list with filters |
| `/testimonials/:id` | `TestimonialDetailPage` | Individual testimonial detail |
| `/roadmap` | `RoadmapPage` | Build status tracker per feature phase |
| `/login` | `LoginPage` | Email/password + MFA challenge flow |
| `/register` | `RegisterPage` | New user registration |

### 3.2 Admin Routes (require `role = 'admin'`)

All admin routes are prefixed `/admin` and wrapped in `RequireAdmin`.

| Path | Component | Description |
|---|---|---|
| `/admin` | `AdminDashboardPage` | Stats, recent activity, quick actions |
| `/admin/home` | `AdminHomePage` | Hero section + banner slider settings |
| `/admin/projects` | `AdminProjectsPage` | Full CRUD for projects |
| `/admin/use-cases` | `AdminUseCasesPage` | Full CRUD for ServiceNow case studies |
| `/admin/employers` | `AdminEmployersPage` | CRUD for employer records |
| `/admin/timeline` | `AdminTimelinePage` | CRUD for timeline entries |
| `/admin/articles` | `AdminArticlesPage` | CRUD for articles (rich text editor) |
| `/admin/testimonials` | `AdminTestimonialsPage` | CRUD for testimonials |
| `/admin/work-history` | `AdminWorkHistoryPage` | CRUD for work history roles |
| `/admin/social` | `AdminSocialPage` | Social media URL settings |
| `/admin/mfa` | `AdminMfaPage` | TOTP MFA enrolment and management |
| `/admin/settings` | `AdminSettingsPage` | Site-wide settings (bio, meta, contact, Calendly) |

---

## 4. Database Schema

### 4.1 Table: `profiles`

Extends Supabase `auth.users`. Created automatically on user signup via trigger.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, FK → `auth.users.id` |
| `email` | text | |
| `full_name` | text | nullable |
| `role` | text | `'admin'` or `'user'` (default `'user'`) |
| `avatar_url` | text | nullable |
| `created_at` | timestamptz | default now() |
| `updated_at` | timestamptz | default now(), auto-updated by trigger |

**RLS:**
- Users can read and update their own row.
- Admins can read all rows.
- Insert via trigger only (not direct).

---

### 4.2 Table: `employers`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, gen_random_uuid() |
| `name` | text | |
| `short_name` | text | nullable |
| `website` | text | nullable |
| `industry` | text | nullable |
| `notes` | text | nullable |
| `sort_order` | integer | default 0 |
| `created_at` | timestamptz | |

**RLS:** Public readable; admin CRUD.

---

### 4.3 Table: `projects`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `slug` | text | unique |
| `title` | text | |
| `status` | text | `'draft'` or `'published'` |
| `featured` | boolean | default false |
| `confidentiality` | text | `'public'` / `'sanitised'` / `'private'` |
| `employer_id` | uuid | FK → `employers.id`, nullable |
| `client_display_name` | text | nullable |
| `client_name` | text | nullable (internal) |
| `show_client_name` | boolean | default false |
| `industry` | text | nullable |
| `project_type` | text | nullable |
| `client_type` | text | nullable |
| `role` | text | nullable |
| `date_start` | date | nullable |
| `date_end` | date | nullable |
| `short_focus` | text | nullable |
| `sm_themes` | text[] | default `{}` |
| `automation_themes` | text[] | default `{}` |
| `tags` | text[] | default `{}` |
| `context_html` | text | nullable |
| `challenge_html` | text | nullable |
| `my_role_html` | text | nullable |
| `approach_html` | text | nullable |
| `contributions_html` | text | nullable |
| `outcomes_html` | text | nullable |
| `lessons_html` | text | nullable |
| `client_comments_html` | text | nullable |
| `related_article_ids` | uuid[] | default `{}` |
| `related_timeline_ids` | uuid[] | default `{}` |
| `meta_title` | text | nullable |
| `meta_description` | text | nullable |
| `meta_keywords` | text[] | default `{}` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | auto-updated |

**RLS:** `status = 'published'` readable by anon + authenticated; admin full CRUD.

---

### 4.4 Table: `use_cases`

ServiceNow-specific case studies.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `slug` | text | unique |
| `title` | text | |
| `subtitle` | text | nullable |
| `status` | text | `'draft'` / `'published'` |
| `featured` | boolean | default false |
| `confidentiality` | text | `'public'` / `'sanitised'` / `'private'` |
| `employer_id` | uuid | FK → `employers.id`, nullable |
| `client_display_name` | text | nullable |
| `client_name` | text | nullable |
| `show_client_name` | boolean | default false |
| `industry` | text | nullable |
| `servicenow_product` | text | nullable |
| `project_type` | text | nullable |
| `date_delivered` | date | nullable |
| `summary_html` | text | nullable |
| `challenge_html` | text | nullable |
| `solution_html` | text | nullable |
| `outcomes_html` | text | nullable |
| `outcome_bullets` | text[] | default `{}` |
| `pdf_path` | text | nullable (relative path to public file) |
| `tags` | text[] | default `{}` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | auto-updated |

**RLS:** `status = 'published'` readable by anon + authenticated; admin full CRUD.

---

### 4.5 Table: `timeline_entries`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `title` | text | |
| `organisation` | text | nullable |
| `entry_date` | date | |
| `entry_date_end` | date | nullable |
| `entry_type` | text | `'career'` / `'project'` / `'publication'` / `'award'` / `'education'` / `'speaking'` / `'milestone'` |
| `project_type` | text | nullable |
| `client_type` | text | nullable |
| `industry` | text | nullable |
| `role` | text | nullable |
| `summary` | text | |
| `detail_html` | text | nullable |
| `is_milestone` | boolean | default false |
| `is_featured` | boolean | default false |
| `status` | text | `'draft'` / `'published'` |
| `confidentiality` | text | `'public'` / `'sanitised'` / `'private'` |
| `sm_themes` | text[] | default `{}` |
| `automation_themes` | text[] | default `{}` |
| `skills` | text[] | default `{}` |
| `technologies` | text[] | default `{}` |
| `tags` | text[] | default `{}` |
| `related_project_id` | uuid | FK → `projects.id`, nullable |
| `related_article_id` | uuid | FK → `articles.id`, nullable |
| `meta_keywords` | text[] | default `{}` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | auto-updated |

**RLS:** `status = 'published'` readable by anon + authenticated; admin full CRUD.

---

### 4.6 Table: `articles`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `slug` | text | unique |
| `title` | text | |
| `subtitle` | text | nullable |
| `status` | text | `'draft'` / `'published'` |
| `featured` | boolean | default false |
| `excerpt` | text | nullable |
| `content_html` | text | nullable |
| `category` | text | nullable |
| `tags` | text[] | default `{}` |
| `reading_time_minutes` | integer | default 5 |
| `published_at` | timestamptz | nullable |
| `related_project_ids` | uuid[] | default `{}` |
| `related_timeline_ids` | uuid[] | default `{}` |
| `related_article_ids` | uuid[] | default `{}` |
| `meta_title` | text | nullable |
| `meta_description` | text | nullable |
| `meta_keywords` | text[] | default `{}` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | auto-updated |

**RLS:** `status = 'published'` readable by anon + authenticated; admin full CRUD.

---

### 4.7 Table: `testimonials`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `quote` | text | HTML allowed |
| `attributed_name` | text | |
| `attributed_role` | text | nullable |
| `attributed_organisation` | text | nullable |
| `relationship_context` | text | nullable |
| `status` | text | `'draft'` / `'published'` |
| `featured` | boolean | default false |
| `active` | boolean | default true |
| `sort_order` | integer | default 0 |
| `related_project_id` | uuid | FK → `projects.id`, nullable |
| `tags` | text[] | default `{}` |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | auto-updated |

**RLS:** `status = 'published' AND active = true` readable by anon + authenticated; admin full CRUD.

---

### 4.8 Table: `work_history`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `organisation` | text | |
| `role_title` | text | |
| `employment_type` | text | `'full-time'` / `'contract'` / `'advisory'` / `'consulting'` / `'part-time'` |
| `date_start` | date | |
| `date_end` | date | nullable |
| `is_current` | boolean | default false |
| `location` | text | nullable |
| `client_type` | text | nullable |
| `summary` | text | nullable |
| `detail_html` | text | nullable |
| `key_achievements` | text[] | default `{}` (legacy plain text array) |
| `key_achievements_html` | text | nullable (rich text, preferred) |
| `domains` | text[] | default `{}` |
| `skills` | text[] | default `{}` |
| `related_project_ids` | uuid[] | default `{}` |
| `sort_order` | integer | default 0 |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | auto-updated |

**RLS:** Public readable by anon + authenticated; admin full CRUD.

---

### 4.9 Table: `expertise_areas`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `title` | text | |
| `description` | text | |
| `detail_html` | text | nullable |
| `tags` | text[] | default `{}` |
| `icon` | text | nullable (Lucide icon name) |
| `sort_order` | integer | default 0 |
| `featured` | boolean | default false |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | auto-updated |

**RLS:** Public readable; admin CRUD.

---

### 4.10 Table: `site_settings`

Key-value store for all configurable site settings.

| Column | Type | Notes |
|---|---|---|
| `key` | text | PK |
| `value` | text | nullable |
| `label` | text | nullable (display label for admin) |
| `updated_at` | timestamptz | auto-updated |

**Known Keys:**

| Key | Description |
|---|---|
| `bio_short` | Short bio for hero/about |
| `bio_full` | Full bio paragraphs |
| `tagline` | Professional tagline |
| `email` | Contact email |
| `location` | Location string |
| `linkedin_url` | LinkedIn profile URL |
| `social_twitter_url` | Twitter/X URL |
| `social_instagram_url` | Instagram URL |
| `social_facebook_url` | Facebook URL |
| `calendly_url` | Calendly booking URL |
| `meta_description` | Site-wide meta description |
| `meta_keywords` | Site-wide meta keywords |
| `hero_eyebrow` | Hero label above heading |
| `hero_heading_html` | Hero main heading HTML |
| `hero_body_html` | Hero body copy HTML |
| `hero_btn1_label` – `hero_btn4_label` | CTA button labels |
| `hero_btn1_url` – `hero_btn4_url` | CTA button URLs |
| `banner_slide_delay_ms` | Credibility strip autoplay delay (ms) |
| `banner_autoplay` | Credibility strip autoplay toggle |
| `testimonials_section_enabled` | Show/hide testimonials section |
| `testimonials_autoplay` | Testimonials carousel autoplay |
| `testimonials_slide_delay_ms` | Testimonials autoplay delay (ms) |

**RLS:** Public readable; admin can update (not insert/delete).

---

### 4.11 Table: `banner_slides`

Credibility strip carousel items.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `label` | text | Display label |
| `content_html` | text | HTML content |
| `icon` | text | nullable (Lucide icon name, e.g., `'Award'`) |
| `active` | boolean | default true |
| `sort_order` | integer | default 10 |
| `created_at` | timestamptz | |

**RLS:** `active = true` readable by anon + authenticated; admin full CRUD.

---

### 4.12 Table: `contact_submissions`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | |
| `email` | text | |
| `organisation` | text | nullable |
| `reason` | text | `'speaking'` / `'advisory'` / `'media'` / `'general'` |
| `message` | text | |
| `is_read` | boolean | default false |
| `created_at` | timestamptz | |

**RLS:** Admin readable; public can insert.

---

### 4.13 Table: `case_studies`

Legacy table (superseded by `use_cases`).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `slug` | text | unique |
| `title`, `subtitle` | text | |
| `client_display_name`, `industry`, `service_area` | text | nullable |
| `role`, `date_start`, `date_end` | mixed | nullable |
| `short_summary` | text | nullable |
| `challenge_html`, `solution_html`, `outcomes_html` | text | nullable |
| `key_results` | text[] | default `{}` |
| `pdf_path` | text | nullable |
| `tags` | text[] | default `{}` |
| `status` | text | default `'draft'` |
| `confidentiality` | text | default `'sanitised'` |
| `featured` | boolean | default false |
| `created_at`, `updated_at` | timestamptz | |

---

## 5. Authentication & Authorisation

### 5.1 Auth Flow

1. User submits email + password to `supabase.auth.signInWithPassword`.
2. If the account has an enrolled TOTP factor, the response returns `mfaRequired: true` with a `factorId`.
3. User is redirected to the MFA step where they enter a 6-digit code.
4. On success, a Supabase session is established and stored.

### 5.2 Session Management

- Session is retrieved on mount via `supabase.auth.getSession()`.
- `supabase.auth.onAuthStateChange` listens for changes.
- Profile is loaded from the `profiles` table after session is confirmed.
- `isAdmin` is derived as `profile?.role === 'admin'`.

### 5.3 MFA (TOTP)

Managed via `AuthContext`:

| Method | Description |
|---|---|
| `enrollMfa()` | Returns QR code image URL, text secret, and factorId |
| `confirmMfaEnrollment(factorId, code)` | Completes enrolment after scanning QR |
| `verifyMfa(factorId, code)` | Verifies TOTP code during login |
| `unenrollMfa(factorId)` | Removes a TOTP factor |
| `listMfaFactors()` | Returns enrolled factors for the current user |

### 5.4 Route Protection

`RequireAdmin` component:
- If `loading` is true → renders null (waiting for session).
- If no session → redirects to `/login`.
- If session but not admin → redirects to `/`.
- If `VITE_DEV_ADMIN_BYPASS=true` → bypasses all checks (development only).

### 5.5 RLS Policy Pattern

```sql
-- Read: any authenticated/anon user for published content
CREATE POLICY "public_read"
ON table_name FOR SELECT USING (status = 'published');

-- Admin write
CREATE POLICY "admin_insert"
ON table_name FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

---

## 6. State Management

### 6.1 AuthContext (`src/context/AuthContext.tsx`)

**Provides:**
- `session`, `user`, `profile`, `loading`, `profileLoading`, `isAdmin`
- `signIn(email, password)` → `{ error, mfaRequired, factorId }`
- `signUp(email, password, fullName)` → `{ error }`
- `signOut()`
- `verifyMfa(factorId, code)` → `{ error }`
- `enrollMfa()` → `{ error, qrCode, secret, factorId }`
- `confirmMfaEnrollment(factorId, code)` → `{ error }`
- `unenrollMfa(factorId)` → `{ error }`
- `listMfaFactors()` → factor array

**Profile type:**
```typescript
{ id: string; email: string; full_name: string | null; role: 'admin' | 'user' }
```

### 6.2 ThemeContext (`src/context/ThemeContext.tsx`)

**Provides:**
- `theme`: `'light'` | `'dark'` | `'system'`
- `resolved`: `'light'` | `'dark'`
- `setTheme(t)`: updates state, localStorage, and `<html>` class

Persisted to `localStorage` as key `theme`. System preference detected via `window.matchMedia('(prefers-color-scheme: dark)')`.

### 6.3 useSiteSettings Hook (`src/hooks/useSiteSettings.ts`)

Fetches all rows from `site_settings` on mount and returns a typed `SiteSettings` object. Provides `reload()` for re-fetching after admin saves.

---

## 7. Components

### 7.1 PublicLayout (`src/components/PublicLayout.tsx`)

- Sticky header: logo/name, desktop nav links, ThemeToggle, admin/login/logout buttons
- Mobile hamburger: collapsible overlay menu with all public nav links
- Footer: social icons, build status link, copyright
- Renders children as main content area

### 7.2 AdminLayout (`src/components/AdminLayout.tsx`)

- Fixed left sidebar (desktop) / hamburger overlay (mobile)
- Nav groups: **Overview** (Dashboard, Home Page), **Content** (Projects, Use Cases, Employers, Timeline, Articles, Testimonials, Work History), **Site** (Social, MFA, Settings)
- Active route highlighted with accent-cyan
- User info + sign-out button in sidebar footer
- `AdminBreadcrumb` sub-component for page-level breadcrumbs

### 7.3 RequireAdmin (`src/components/RequireAdmin.tsx`)

Route guard. See Section 5.4 for logic.

### 7.4 RichTextEditor (`src/components/RichTextEditor.tsx`)

TipTap-based WYSIWYG HTML editor.

**Toolbar:** Undo, Redo, H2, H3, Bold, Italic, Underline, Bullet List, Ordered List, Align Left, Align Centre, Align Right, Link, Horizontal Rule.

**Props:**
| Prop | Type | Default |
|---|---|---|
| `value` | `string` | |
| `onChange` | `(html: string) => void` | |
| `placeholder` | `string` | optional |
| `minHeight` | `number` | 200 |

Output: raw HTML string stored directly in database text fields.

### 7.5 ThemeToggle (`src/components/ThemeToggle.tsx`)

Icon button cycling Light → Dark → System. Uses Sun, Moon, Monitor icons. Stored in localStorage.

### 7.6 SocialIcons (`src/components/SocialIcons.tsx`)

Renders LinkedIn, Twitter/X, Instagram, Facebook icon links from `site_settings`. Configurable `size` and `className`.

---

## 8. Public Page Specifications

### 8.1 HomePage (`src/pages/HomePage.tsx`)

**Data:** `site_settings`, `banner_slides`, `expertise_areas`, `projects` (featured, 3), `timeline_entries` (published, 3), `articles` (published, 2), `testimonials` (published + active)

**Sections:**
1. **Hero** — full-bleed headshot with gradient overlay; eyebrow, heading HTML, body HTML, up to 4 CTA buttons from `site_settings`
2. **Credibility Strip** — horizontally scrolling carousel of `banner_slides` with configurable autoplay
3. **Expertise Areas** — 4-col grid desktop / 2-col mobile from `expertise_areas` ordered by `sort_order`
4. **Featured Projects** — 3 project cards → `/projects/:slug`
5. **Timeline Highlights** — 3 most recent `timeline_entries` reverse-chronological → `/timeline`
6. **Featured Articles** — 2 article cards → `/articles/:slug`
7. **Testimonials Carousel** — 3 visible desktop / 2 tablet / 1 mobile; configurable autoplay
8. **CTA Section** — "Ready to connect?" → `/contact`

---

### 8.2 AboutPage (`src/pages/AboutPage.tsx`)

**Data:** `site_settings`, `expertise_areas`

**Sections:**
1. Left: name, tagline, credential items (Author, Award, Location, Years), CTA buttons
2. Right: `bio_full` paragraphs (split on `\n\n`)
3. Expertise grid (all `expertise_areas` by `sort_order`)
4. Philosophy section (principles + stat boxes)
5. USMBOK publications section
6. Speaking & Advisory CTA blocks

---

### 8.3 ContactPage (`src/pages/ContactPage.tsx`)

**Data:** `site_settings` (email, location, linkedin_url, calendly_url)

**Features:**
- Left: contact details (email, location, LinkedIn, Calendly button)
- Right: form → inserts row into `contact_submissions`
- Fields: name, email, organisation, reason dropdown (`speaking` / `advisory` / `media` / `general`), message
- Success confirmation state after submit

---

### 8.4 ProjectsPage (`src/pages/ProjectsPage.tsx`)

**Data:** `projects` (published), `use_cases` (published), `employers`

**Tab 1 — Projects:**
- Search (title, client, industry, themes, tags)
- Filters: industry, project type, theme dropdowns
- View toggle: grid cards / timeline list
- Pagination: 9 per page + "Load more"
- Confidentiality badges: Anonymised, Confidential

**Tab 2 — Case Studies:**
- Search (title, client, product, industry, tags)
- Filters: product, project type
- 3-column grid
- Badges: Featured, type, product, date

---

### 8.5 ProjectDetailPage (`src/pages/ProjectDetailPage.tsx`)

**Data:** `projects` (by slug) + `employers`

**Sections** (rendered only if column has content):
Context · Challenge · My Role · Approach · Contributions · Outcomes · Lessons Learned · Client Comments

**Footer:** themes, tags, related projects (same industry, up to 3)

---

### 8.6 UseCaseDetailPage (`src/pages/UseCaseDetailPage.tsx`)

**Data:** `use_cases` (by slug) + `employers`

**Features:**
- PDF download banner if `pdf_path` is set (file served from `/public/case-studies/`)
- Key Results grid from `outcome_bullets`
- Sections: Overview · Challenge · Solution · Outcomes
- Related use cases (same `servicenow_product`, up to 3)

---

### 8.7 TimelinePage (`src/pages/TimelinePage.tsx`)

**Data:** `timeline_entries` (published)

**Features:**
- Filter bar: entry type chips, clear button
- Search input
- Vertical timeline with sticky year group headers
- Desktop: sticky detail panel (right column) / Mobile: slide-up drawer
- Entry types with distinct icons; milestone badge; featured star
- Inline `detail_html` expandable per entry

---

### 8.8 WorkHistoryPage (`src/pages/WorkHistoryPage.tsx`)

**Data:** `work_history` ordered by `sort_order`

**Features:**
- Filters: employment type, domains
- Expand/collapse all button
- Vertical timeline (dot + left border line)
- Per role: current badge, employment type badge, title, organisation (accent-cyan), date range + duration, location, client type, summary
- Expandable: `detail_html`, key achievements (`key_achievements_html` if present, else `key_achievements` array), domains, skills tags

---

### 8.9 ArticlesPage (`src/pages/ArticlesPage.tsx`)

**Data:** `articles` (published)

**Features:**
- Search (title, excerpt, category, tags)
- Category filter buttons
- Featured section (2 cards) shown when no filter active
- List view with side metadata (date, read time)

---

### 8.10 ArticleDetailPage (`src/pages/ArticleDetailPage.tsx`)

**Data:** `articles` (by slug)

**Features:**
- Rich HTML content with prose styling
- Tags footer
- Related articles (same category, up to 3)

---

### 8.11 TestimonialsPage (`src/pages/TestimonialsPage.tsx`)

**Data:** `testimonials` (published + active)

**Features:**
- Search (quote, name, organisation, context)
- Tag filter buttons
- Context dropdown
- View toggle: grid (3 cols) / list
- Featured testimonials: accent-cyan border + large quote icon

---

### 8.12 TestimonialDetailPage (`src/pages/TestimonialDetailPage.tsx`)

**Data:** `testimonials` (by id)

**Features:**
- Large quote card
- Attribution: avatar initial, name + featured star, role/org, context
- Tags linking to `/testimonials?tag=...`

---

### 8.13 RoadmapPage (`src/pages/RoadmapPage.tsx`)

**Data:** `src/data/roadmap.ts` (static file)

Displays phase-by-phase build progress with UI vs data completion percentage bars per phase and a summary card at top.

---

### 8.14 LoginPage (`src/pages/LoginPage.tsx`)

**Step 1 — Credentials:** email, password (show/hide toggle), submit.  
**Step 2 — MFA:** 6-digit code input, submit, back link.  
Error display, loading states throughout.

---

### 8.15 RegisterPage (`src/pages/RegisterPage.tsx`)

Fields: full name, email, password, confirm password (show/hide).  
Client-side validation: passwords match, minimum 8 characters.  
Success state or inline error display.

---

## 9. Admin Panel Specifications

All admin pages require authentication via `RequireAdmin`. Common patterns:

- **List view:** table with key fields + edit/delete action buttons
- **Editor:** form fields + `RichTextEditor` for HTML columns + `TagInput` for array fields
- **Save:** validate → upsert to Supabase → reload list
- **Delete:** confirmation modal → delete by id → reload
- **Errors:** inline alert with `AlertCircle` icon

### 9.1 Shared Sub-components (AdminWorkHistoryPage et al.)

**TagInput** — text array field editor:
- Tags rendered as removable chips
- Press Enter or comma to add a new tag
- Removing via × button on chip

**AchievementsInput** — ordered text array:
- One input per achievement with remove button
- "Add achievement" button appends new blank row

### 9.2 AdminDashboardPage (`src/pages/admin/AdminDashboardPage.tsx`)

Overview stats (row counts per table), recent activity list, quick action links to each content section.

### 9.3 AdminHomePage (`src/pages/admin/AdminHomePage.tsx`)

Saves to `site_settings`. Fields:
- `hero_eyebrow` (text)
- `hero_heading_html` (RichTextEditor)
- `hero_body_html` (RichTextEditor)
- 4 × CTA button: label + URL
- `banner_slide_delay_ms` (number input)
- `banner_autoplay` (toggle)
- `testimonials_section_enabled` (toggle)
- `testimonials_autoplay` (toggle)
- `testimonials_slide_delay_ms` (number input)

### 9.4 AdminProjectsPage (`src/pages/admin/AdminProjectsPage.tsx`)

CRUD for `projects`. Editor fields: slug, title, client display name, client name, show client name toggle, employer (FK dropdown), industry, project type, client type, role, dates, confidentiality, featured, short focus, all HTML sections (context, challenge, my_role, approach, contributions, outcomes, lessons, client_comments), sm_themes, automation_themes, tags.

### 9.5 AdminUseCasesPage (`src/pages/admin/AdminUseCasesPage.tsx`)

CRUD for `use_cases`. Fields: slug, title, subtitle, client fields, employer dropdown, industry, servicenow_product, project_type, HTML sections (summary, challenge, solution, outcomes), outcome_bullets (array), pdf_path, tags, confidentiality, featured, date_delivered.

### 9.6 AdminEmployersPage (`src/pages/admin/AdminEmployersPage.tsx`)

CRUD for `employers`. Fields: name, short_name, website, industry, notes, sort_order.

### 9.7 AdminTimelinePage (`src/pages/admin/AdminTimelinePage.tsx`)

CRUD for `timeline_entries`. Fields: title, organisation, entry_date, entry_date_end, entry_type, industry, role, summary, detail_html (RichTextEditor), is_milestone, is_featured, status, sm_themes, automation_themes, skills, tags.

### 9.8 AdminArticlesPage (`src/pages/admin/AdminArticlesPage.tsx`)

CRUD for `articles`. Fields: slug, title, subtitle, excerpt, content_html (RichTextEditor), category, tags, featured, status, reading_time_minutes, published_at.

### 9.9 AdminTestimonialsPage (`src/pages/admin/AdminTestimonialsPage.tsx`)

CRUD for `testimonials`. Fields: quote (HTML allowed), attributed_name, attributed_role, attributed_organisation, relationship_context, tags, featured, active, status, sort_order, related_project_id.

### 9.10 AdminWorkHistoryPage (`src/pages/admin/AdminWorkHistoryPage.tsx`)

Full-page sectioned editor (not a drawer). Sections:
1. Role Details: organisation, role_title, employment_type, location, date_start, date_end, is_current, client_type, sort_order
2. Summary (RichTextEditor)
3. Key Achievements (RichTextEditor)
4. Domains & Skills (two TagInput fields)
5. Extended Detail (RichTextEditor)

### 9.11 AdminSocialPage (`src/pages/admin/AdminSocialPage.tsx`)

Saves to `site_settings`. Fields: linkedin_url, social_twitter_url, social_instagram_url, social_facebook_url.

### 9.12 AdminMfaPage (`src/pages/admin/AdminMfaPage.tsx`)

- Enroll: display QR code + text secret, enter 6-digit code to confirm
- List enrolled TOTP factors
- Unenroll button per factor

### 9.13 AdminSettingsPage (`src/pages/admin/AdminSettingsPage.tsx`)

Saves to `site_settings`. Fields: bio_short, bio_full, tagline, email, location, calendly_url, meta_description, meta_keywords.

---

## 10. Design System

### 10.1 Colour Tokens (Tailwind custom config)

| Token | Light value | Dark value | Usage |
|---|---|---|---|
| `light-bg` / `dark-bg` | white | near-black | Page background |
| `light-card` / `dark-card` | off-white | dark grey | Card surfaces |
| `light-elevated` / `dark-elevated` | light grey | mid grey | Hover / elevated |
| `light-text` / `dark-text` | near-black | near-white | Primary text |
| `light-secondary` / `dark-secondary` | dark grey | light grey | Secondary text |
| `light-muted` / `dark-muted` | medium grey | medium grey | Placeholders / meta |
| `light-border` / `dark-border` | light grey | dark grey | Borders |
| `accent-cyan` | cyan-500 range | same | Links, CTAs, active |
| `accent-blue` | blue | same | Full-time badge |
| `accent-gold` | amber/gold | same | Advisory badge |
| `accent-green` | green | same | Consulting badge |
| `accent-orange` | orange | same | Part-time badge |
| `accent-red` | red | same | Destructive / errors |

### 10.2 Typography Scale

| Use | Classes |
|---|---|
| Page heading | `text-3xl sm:text-4xl font-bold` |
| Section heading | `text-2xl font-bold` |
| Card title | `font-bold` or `font-semibold` |
| Body | `text-sm` or `text-base` |
| Overline / label | `text-xs font-semibold uppercase tracking-widest` |
| Muted meta | `text-xs text-light-muted dark:text-dark-muted` |

### 10.3 Spacing Conventions

- Page padding: `px-4 sm:px-6 lg:px-8 py-12`
- Card padding: `p-5` or `p-6`
- Section gap: `space-y-6` or `gap-6`
- Inner gap: `gap-2` or `gap-3`
- 8px base unit throughout

### 10.4 Dark Mode

Applied via `dark` class on `<html>`. Three-state toggle: `light` → `dark` → `system`. System state defers to `prefers-color-scheme`. Persisted to `localStorage` key `theme`.

---

## 11. Migration File Index

All files in `supabase/migrations/`, named `YYYYMMDDHHMMSS_description.sql`. Run in filename order to recreate schema from scratch.

| Filename | Description |
|---|---|
| `20260621163254_create_profiles_table` | `profiles` table, RLS, handle_new_user trigger, updated_at trigger |
| `20260621163739_create_expertise_areas_and_site_settings` | `expertise_areas` + `site_settings` tables |
| `20260621163754_create_projects_table` | `projects` table (full schema) |
| `20260621163809_create_timeline_entries_table` | `timeline_entries` table |
| `20260621163819_create_articles_table` | `articles` table |
| `20260621163832_create_testimonials_table` | `testimonials` table |
| `20260621163843_create_work_history_and_contact_tables` | `work_history` + `contact_submissions` |
| `20260621163914_seed_expertise_areas_and_site_settings` | Seed expertise areas + base site settings |
| `20260621163932_seed_work_history` | Seed initial work history roles |
| `20260621164039_seed_projects` | Seed initial projects |
| `20260621164136_seed_timeline_entries` | Seed initial timeline entries |
| `20260621164159_seed_testimonials` | Seed initial testimonials |
| `20260621164257_seed_articles` | Seed initial articles |
| `20260621164700_add_social_media_settings` | Add social media keys to `site_settings` |
| `20260621171413_restore_auth_schema_grants` | Restore auth schema grants |
| `20260621190314_replace_projects_with_real_servicenow_data` | Replace projects with ServiceNow project data |
| `20260621190356_replace_testimonials_with_career_grounded_quotes` | Replace testimonials with career-grounded quotes |
| `20260622004228_grant_public_table_access_to_anon` | Grant public table SELECT to anon role |
| `20260622011138_fix_profiles_rls_recursion` | Fix RLS infinite recursion on profiles |
| `20260622140221_add_missing_notable_projects` | Add additional notable projects |
| `20260622153603_add_client_name_to_projects` | Add `client_name` + `show_client_name` to projects |
| `20260622160130_add_client_comments_to_projects` | Add `client_comments_html` to projects |
| `20260622160502_create_employers_table_and_link_projects` | Create `employers` table + FK on `projects` |
| `20260622161139_create_banner_slides_and_hero_settings` | Create `banner_slides` + hero keys in `site_settings` |
| `20260622193000_seed_service_management_101_projects` | Seed Service Management 101 projects |
| `20260622193419_create_use_cases_table` | Create `use_cases` table |
| `20260622193459_seed_thales_imperva_use_case` | Seed Thales/Imperva use case |
| `20260623185235_add_active_column_to_testimonials` | Add `active` boolean column to `testimonials` |

---

## 12. Public Assets

Files served statically from `/public/`:

| Path | Description |
|---|---|
| `public/images/ian_headshot_black_and_white.png` | Primary headshot (hero background) |
| `public/images/Ian_headshot_banner_black_and_white.png` | Banner variant headshot |
| `public/images/image.png` | Additional image asset |
| `public/case-studies/Case_Study_-_Thales_-_Imperva_CSM_Migration.pdf` | Thales/Imperva case study PDF |

---

## 13. Rebuild Checklist

Complete steps to rebuild this application from scratch:

1. Clone GitHub repository
2. Run `npm install`
3. Create a new Supabase project
4. Copy the new project URL and anon key into `.env`:
   ```
   VITE_SUPABASE_URL=https://<project-id>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-key>
   ```
5. Open the Supabase SQL Editor and run each migration file from `supabase/migrations/` **in filename order** (they are timestamped to enforce correct sequence)
6. Restore live data by running your `pg_dump` backup SQL file in the SQL Editor
7. Create admin user via Supabase Dashboard → Authentication → Users
8. In the SQL Editor, set their role:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
   ```
9. Run `npm run dev` to start locally

---

## 14. Data Backup Procedure

### Quick export (Supabase Dashboard)

Run the following in the Supabase SQL Editor to verify row counts before backup:

```sql
SELECT
  'profiles' AS tbl, COUNT(*) FROM profiles
UNION ALL SELECT 'employers', COUNT(*) FROM employers
UNION ALL SELECT 'projects', COUNT(*) FROM projects
UNION ALL SELECT 'use_cases', COUNT(*) FROM use_cases
UNION ALL SELECT 'timeline_entries', COUNT(*) FROM timeline_entries
UNION ALL SELECT 'articles', COUNT(*) FROM articles
UNION ALL SELECT 'testimonials', COUNT(*) FROM testimonials
UNION ALL SELECT 'work_history', COUNT(*) FROM work_history
UNION ALL SELECT 'expertise_areas', COUNT(*) FROM expertise_areas
UNION ALL SELECT 'site_settings', COUNT(*) FROM site_settings
UNION ALL SELECT 'banner_slides', COUNT(*) FROM banner_slides
UNION ALL SELECT 'contact_submissions', COUNT(*) FROM contact_submissions
UNION ALL SELECT 'case_studies', COUNT(*) FROM case_studies;
```

### Full dump (pg_dump)

```bash
pg_dump "postgresql://postgres:[PASSWORD]@db.<project-id>.supabase.co:5432/postgres" \
  --data-only \
  --schema=public \
  -f backup-data-$(date +%Y%m%d).sql
```

Database password is available in Supabase Dashboard → Project Settings → Database.

### Recommended backup schedule

| What | Frequency | Storage |
|---|---|---|
| Code | Every session | Push to GitHub |
| pg_dump data export | Weekly + before major changes | Local + cloud storage |
| `.env` file (credentials) | Once | Password manager (never commit to Git) |

---

*End of MADD Specification — v1.0 — 2026-06-25*
