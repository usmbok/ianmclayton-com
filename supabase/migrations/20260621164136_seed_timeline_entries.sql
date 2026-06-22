
-- Timeline entries seed
INSERT INTO public.timeline_entries (
  title, organisation, entry_date, entry_date_end, entry_type, summary,
  role, sm_themes, automation_themes, skills, tags, is_milestone, is_featured, confidentiality, status
) VALUES
(
  'Recipient — ITSM Industry Lifetime Achievement Award',
  'ITSM Industry Recognition Body',
  '2019-10-01', NULL, 'award',
  'Recognised with the ITSM industry lifetime achievement award for sustained and distinguished contribution to the service management profession over more than two decades, including authorship, thought leadership, practitioner education, and advisory work.',
  NULL, ARRAY['service management'], ARRAY[]::text[], ARRAY['thought leadership', 'authoring', 'advisory'],
  ARRAY['award', 'lifetime achievement', 'ITSM', 'recognition'],
  true, true, 'public', 'published'
),
(
  'Published: Universal Service Management Body of Knowledge (USMBOK)',
  'Ian M. Clayton & Associates',
  '2010-01-01', NULL, 'publication',
  'Published the Universal Service Management Body of Knowledge (USMBOK) — a comprehensive reference framework for service management practitioners seeking a technology-agnostic, outcome-focused foundation beyond ITIL.',
  'Author', ARRAY['service management', 'service architecture', 'knowledge management'],
  ARRAY[]::text[], ARRAY['authoring', 'framework design', 'service architecture'],
  ARRAY['USMBOK', 'publication', 'service management', 'framework', 'thought leadership'],
  true, true, 'public', 'published'
),
(
  'Principal Consultant — Ian M. Clayton & Associates (Founded)',
  'Ian M. Clayton & Associates',
  '2005-01-01', NULL, 'career',
  'Founded independent consulting practice focused on service management strategy, operating model design, and intelligent automation advisory. Established as a globally recognised voice in service management through speaking, publishing, and client engagements across four continents.',
  'Principal Consultant & Founder', ARRAY['service management', 'operating model', 'strategy'],
  ARRAY['workflow automation'], ARRAY['consulting', 'advisory', 'practice leadership'],
  ARRAY['independent practice', 'consulting', 'service management', 'career milestone'],
  true, true, 'public', 'published'
),
(
  'Vice President of Solutions — Pink Elephant',
  'Pink Elephant',
  '2000-01-01', '2005-01-01', 'career',
  'Led consulting solutions development and delivery for one of the world''s leading ITSM training and consulting firms, building global teams and proprietary assessment frameworks.',
  'Vice President of Solutions', ARRAY['service management', 'ITIL', 'operating model'],
  ARRAY[]::text[], ARRAY['consulting', 'team leadership', 'practice development', 'ITIL'],
  ARRAY['Pink Elephant', 'ITSM', 'consulting', 'leadership'],
  true, false, 'public', 'published'
),
(
  'Keynote: "The Human Face of Service Management" — itSMF Global Conference',
  'itSMF International',
  '2017-11-01', NULL, 'speaking',
  'Delivered keynote address at the itSMF Global Conference exploring the tension between process discipline and human experience in modern service management.',
  'Keynote Speaker', ARRAY['service management', 'human-centred design'],
  ARRAY[]::text[], ARRAY['speaking', 'thought leadership'],
  ARRAY['speaking', 'conference', 'itSMF', 'keynote', 'human experience'],
  false, true, 'public', 'published'
),
(
  'Keynote: "Automation Without Apology" — Service Desk & IT Support Show',
  'Service Desk & IT Support Show',
  '2018-05-01', NULL, 'speaking',
  'Keynote addressing the ethical and practical dimensions of automation in service operations — making the case that automation done well is a human-centred act, not a headcount reduction exercise.',
  'Keynote Speaker', ARRAY['service operations'],
  ARRAY['intelligent automation', 'RPA', 'conversational AI'],
  ARRAY['speaking', 'thought leadership', 'automation ethics'],
  ARRAY['speaking', 'automation', 'conference', 'keynote', 'ethics'],
  false, true, 'public', 'published'
),
(
  'Enterprise ITSM Operating Model Redesign — Global Financial Services',
  'Global Financial Services Organisation (Sanitised)',
  '2021-03-01', '2022-06-01', 'project',
  'Principal Advisor on a 15-month enterprise ITSM operating model transformation for a 40,000-seat global financial services organisation — consolidating 14 regional models and 9 toolsets.',
  'Principal Advisor', ARRAY['operating model', 'service catalogue', 'service strategy'],
  ARRAY['workflow automation', 'AI-assisted triage'],
  ARRAY['advisory', 'operating model design', 'stakeholder management'],
  ARRAY['operating model', 'financial services', 'transformation', 'ITSM'],
  false, true, 'sanitised', 'published'
),
(
  'Intelligent Automation Programme — Major Healthcare Network',
  'Major Healthcare Network (Sanitised)',
  '2020-09-01', '2021-08-01', 'project',
  'Strategic Advisor and Programme Lead for an intelligent automation programme across a 25-hospital network IT operation — 38% tier-1 volume reduction with zero redundancies.',
  'Strategic Advisor & Programme Lead', ARRAY['service operations', 'knowledge management'],
  ARRAY['RPA', 'conversational AI', 'workflow automation', 'monitoring automation'],
  ARRAY['automation strategy', 'programme governance', 'change management'],
  ARRAY['intelligent automation', 'healthcare', 'RPA', 'AI', 'human-centred'],
  false, true, 'sanitised', 'published'
),
(
  'Advisory Panel — AI in ITSM Working Group',
  'Industry Working Group',
  '2022-01-01', NULL, 'milestone',
  'Invited to serve on an industry advisory panel examining the practical application of AI in ITSM platforms — contributing to published guidance on AI governance, bias risk, and human oversight.',
  'Advisory Panel Member', ARRAY['service management', 'governance'],
  ARRAY['AI-assisted triage', 'ML classification'],
  ARRAY['advisory', 'AI governance', 'thought leadership'],
  ARRAY['AI', 'ITSM', 'advisory', 'governance', 'industry'],
  false, true, 'public', 'published'
),
(
  'Faculty Member — HDI Annual Conference Series',
  'HDI (Help Desk Institute)',
  '1998-01-01', '2012-01-01', 'career',
  'Faculty member and recurring keynote speaker at HDI annual conferences over a 14-year period, contributing to curriculum, certification standards, and professional development for IT support practitioners.',
  'Faculty Member & Speaker', ARRAY['service desk', 'knowledge management'],
  ARRAY[]::text[], ARRAY['speaking', 'curriculum design', 'facilitation'],
  ARRAY['HDI', 'service desk', 'education', 'speaking', 'faculty'],
  false, false, 'public', 'published'
),
(
  'AI-Augmented Knowledge Management — Government Agency',
  'Government Agency (Sanitised)',
  '2022-04-01', '2023-03-01', 'project',
  'Knowledge Strategy Advisor on a programme that increased government agency self-service deflection from 12% to 41% through KCS-aligned governance and AI recommendation.',
  'Knowledge Strategy Advisor', ARRAY['knowledge management', 'self-service'],
  ARRAY['AI recommendation', 'ML classification'],
  ARRAY['knowledge strategy', 'KCS', 'AI governance'],
  ARRAY['knowledge management', 'AI', 'government', 'self-service', 'KCS'],
  false, false, 'sanitised', 'published'
);
