
-- Expertise areas seed
INSERT INTO public.expertise_areas (title, description, detail_html, tags, sort_order, featured) VALUES
(
  'Service Management Strategy',
  'Enterprise service strategy, operating model design, and organisational alignment for IT and business services.',
  '<p>Designing service strategies that align IT capability with organisational purpose. This includes enterprise service architecture, demand management, and value stream identification across complex, multi-tier service environments.</p>',
  ARRAY['strategy', 'operating model', 'enterprise IT', 'value management'],
  1, true
),
(
  'Operating Model Design',
  'Designing scalable and sustainable operating models for IT and business service delivery.',
  '<p>Building operating models that are fit for purpose, durable under change, and aligned to real business outcomes. Covers roles, accountabilities, tooling choices, service catalogues, and measurement frameworks.</p>',
  ARRAY['operating model', 'organisational design', 'service catalogue', 'measurement'],
  2, true
),
(
  'ITIL, USM & Service Architecture',
  'Deep expertise in ITIL, USMBOK, and architectural approaches for service excellence and continual improvement.',
  '<p>Author of the Universal Service Management Body of Knowledge (USMBOK). Practitioner and educator across ITIL v2, v3, 4, and the USM framework. Focused on practical application over certification compliance.</p>',
  ARRAY['ITIL', 'USM', 'USMBOK', 'service architecture', 'frameworks'],
  3, true
),
(
  'Intelligent Automation',
  'Applying automation, orchestration, and AI where it creates measurable operational value without displacing human judgement.',
  '<p>Pragmatic automation strategy — identifying high-value candidates, avoiding automation-for-automation''s-sake, and building durable automation governance. Covers RPA, workflow orchestration, AI-augmented operations, and hyperautomation patterns.</p>',
  ARRAY['automation', 'RPA', 'orchestration', 'hyperautomation', 'AI'],
  4, true
),
(
  'AI in Service Operations',
  'Practical AI adoption for service desks, IT operations, knowledge management, and employee experience.',
  '<p>Helping organisations move from AI pilots to AI-in-production across service operations. Covers conversational AI, predictive analytics, AI-augmented ITSM, and the governance required to sustain AI value over time.</p>',
  ARRAY['AI', 'AIOps', 'ITSM', 'knowledge management', 'employee experience'],
  5, true
),
(
  'Governance & Value Realisation',
  'Ensuring governance structures and measurement frameworks that prove and sustain business value from service investments.',
  '<p>Designing governance frameworks that are light enough to enable and robust enough to protect. Includes value realisation planning, benefit tracking, service review cadences, and executive reporting.</p>',
  ARRAY['governance', 'value realisation', 'benefit management', 'measurement'],
  6, false
),
(
  'Human-Centred Service Design',
  'Putting people — employees and customers — at the centre of service design, delivery, and improvement.',
  '<p>Service design through the lens of human experience. Covers employee experience (EX), customer experience (CX), journey mapping, design thinking applied to IT service contexts, and the organisational behaviours that enable or undermine good service.</p>',
  ARRAY['human-centred', 'employee experience', 'CX', 'design thinking', 'service design'],
  7, false
),
(
  'Knowledge & Experience Design',
  'Designing knowledge systems and experience journeys that reduce friction and amplify organisational capability.',
  '<p>Knowledge management as a strategic discipline — not a documentation exercise. Covers knowledge-centred service (KCS), knowledge architectures, self-service enablement, and the role of AI in surfacing the right knowledge at the right moment.</p>',
  ARRAY['knowledge management', 'KCS', 'self-service', 'experience design'],
  8, false
);

-- Site settings seed
INSERT INTO public.site_settings (key, value, label) VALUES
('bio_short', 'Service management thought leader, intelligent automation advocate, author, and industry lifetime award recipient.', 'Short biography'),
('bio_full', 'Ian M. Clayton is a globally recognised authority in service management and intelligent automation with over three decades of practitioner, advisory, and thought leadership experience. He is the author of the Universal Service Management Body of Knowledge (USMBOK) and a recipient of the ITSM industry lifetime achievement award. Ian advises organisations navigating the intersection of service management modernisation and intelligent automation adoption.', 'Full biography'),
('tagline', 'Service Management. Intelligent Automation. Human Value.', 'Site tagline'),
('email', 'ian@ianmclayton.com', 'Contact email'),
('linkedin_url', '', 'LinkedIn URL'),
('calendly_url', '', 'Calendly booking URL'),
('location', 'Sarasota, Florida, USA', 'Location'),
('meta_description', 'Ian M. Clayton — service management thought leader, intelligent automation advocate, USMBOK author, and ITSM lifetime award recipient. Consulting, speaking, and advisory.', 'Default meta description'),
('meta_keywords', 'Ian Clayton, service management, intelligent automation, ITSM, ITIL, USM, USMBOK, digital transformation, AI operations, service desk', 'Default meta keywords');
