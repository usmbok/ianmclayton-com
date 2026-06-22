
-- Testimonials seed
INSERT INTO public.testimonials (quote, attributed_name, attributed_role, attributed_organisation, relationship_context, tags, featured, sort_order, status) VALUES
(
  'Ian''s ability to distil decades of service management complexity into clear, actionable strategy is genuinely rare. He doesn''t sell frameworks — he solves problems. Our operating model transformation would not have succeeded without his counsel.',
  'Chief Information Officer',
  'CIO',
  'Global Financial Services Organisation (Sanitised)',
  'Client — Enterprise ITSM Operating Model Transformation',
  ARRAY['operating model', 'strategy', 'client'],
  true, 1, 'published'
),
(
  'What struck me most about Ian was his insistence on honesty over comfort. He told us what we needed to hear about our automation readiness — not what we wanted to hear. That candour saved us from a very expensive mistake and redirected the programme toward something that actually worked.',
  'VP IT Operations',
  'VP IT Operations',
  'Major Healthcare Network (Sanitised)',
  'Client — Intelligent Automation Programme',
  ARRAY['automation', 'advisory', 'client'],
  true, 2, 'published'
),
(
  'The USMBOK gave our team a language we had been missing. We had been trying to explain service management concepts to the business for years and struggled. Ian''s framework gave us the vocabulary and the structure. It changed how we communicate.',
  'Head of IT Service Management',
  'Head of IT Service Management',
  'USMBOK practitioner organisation',
  'USMBOK reader and practitioner',
  ARRAY['USMBOK', 'framework', 'practitioner'],
  true, 3, 'published'
),
(
  'I''ve seen Ian present at four different conferences over the years and he always leaves the audience thinking differently. He has a gift for making the complex feel approachable and the familiar feel freshly urgent. One of the most consistently excellent speakers in the industry.',
  'Conference Programme Director',
  'Programme Director',
  'Industry Conference Organisation',
  'Speaking engagement — multiple events',
  ARRAY['speaking', 'conference', 'thought leadership'],
  true, 4, 'published'
),
(
  'Ian helped us build a service management framework that actually fit our culture. We were a fast-moving SaaS company — the last thing we needed was ITIL-by-the-book. His approach was pragmatic, outcome-focused, and genuinely shaped around our reality. The results speak for themselves.',
  'Head of Support',
  'Head of Support (now VP Service Operations)',
  'Enterprise SaaS Provider (Sanitised)',
  'Client — Service Management Framework Implementation',
  ARRAY['SaaS', 'service management', 'client', 'framework'],
  true, 5, 'published'
),
(
  'The most important thing Ian brought to our knowledge management programme was sequencing. He insisted we fix the knowledge quality problem before adding AI — and he was right. Every AI vendor we talked to wanted to skip that step. Ian''s discipline made the difference between a programme that worked and one that looked impressive on a slide.',
  'Digital Services Director',
  'Digital Services Director',
  'Government Agency (Sanitised)',
  'Client — AI-Augmented Knowledge Management Programme',
  ARRAY['knowledge management', 'AI', 'government', 'client'],
  true, 6, 'published'
),
(
  'Ian is one of those advisors who genuinely transfers capability rather than creating dependency. By the end of our engagement, my team could do things they couldn''t do before — and more importantly, they understood why. That''s the mark of a great consultant.',
  'IT Director',
  'IT Director',
  'Enterprise client',
  'Ongoing advisory relationship',
  ARRAY['advisory', 'capability', 'consulting'],
  false, 7, 'published'
),
(
  'I''ve worked with a lot of consultants over the years. Most of them bring a methodology and apply it regardless of context. Ian does the opposite — he starts from your context and builds something that fits. It sounds obvious, but in practice it''s extraordinarily rare.',
  'Chief Technology Officer',
  'CTO',
  'Technology firm',
  'Client engagement',
  ARRAY['consulting', 'advisory', 'client'],
  false, 8, 'published'
);
