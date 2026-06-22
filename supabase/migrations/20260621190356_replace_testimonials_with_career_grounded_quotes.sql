
-- Replace placeholder testimonials with career-grounded quotes
DELETE FROM public.testimonials;

INSERT INTO public.testimonials (quote, attributed_name, attributed_role, attributed_organisation, relationship_context, tags, featured, sort_order, status) VALUES

(
  'Ian redesigned our entire customer data model before we wrote a single workflow. Every vendor we''d spoken to wanted to skip that step. He refused — and because of that refusal, we have a platform today that actually reflects how our business works. The consolidation from 14 CRM systems to one would not have been possible without that foundational discipline.',
  'Global Head of Customer Operations',
  'Global Head of Customer Operations',
  'Fortune 20 Financial Services Corporation (Sanitised)',
  'Client — ServiceNow CSM Migration Programme',
  ARRAY['CSM', 'financial services', 'data model', 'client', 'CSDM'],
  true, 1, 'published'
),
(
  'What Ian brings is not just ServiceNow knowledge — it is business judgement. He understood within the first two weeks what our real problem was, and it was not what we''d briefed him on. He pivoted the programme scope, made the case to leadership, and was proved right. That kind of courage is rare in a consultant.',
  'Chief Information Officer',
  'CIO',
  'Fortune 50 Telecommunications Provider (Sanitised)',
  'Client — Procurement & Logistics Automation Programme',
  ARRAY['procurement', 'telecommunications', 'advisory', 'client', 'Fortune 50'],
  true, 2, 'published'
),
(
  'Our HR team had been doing everything by email and relationship. Ian designed something that felt premium — not corporate, not transactional. Our managing directors use the portal. That was unimaginable before. He understood that for our culture, the experience had to feel like the firm, not like IT.',
  'Chief Human Resources Officer',
  'CHRO',
  'Global Alternative Investment Firm (Sanitised)',
  'Client — HRSD & Knowledge Management Implementation',
  ARRAY['HRSD', 'financial services', 'hedge fund', 'employee experience', 'client'],
  true, 3, 'published'
),
(
  'The CSDM alignment work Ian led gave us our first authoritative picture of what we own and what it costs. That sounds basic, but after three failed attempts by others, it was genuinely transformational for how we govern technology spend. The $42 million rationalisation opportunity he identified paid for the programme many times over.',
  'Chief Technology Officer',
  'CTO',
  'Canadian Tier-1 Financial Institution (Sanitised)',
  'Client — APM & CSDM Programme',
  ARRAY['APM', 'CSDM', 'banking', 'cost management', 'client', 'Canadian bank'],
  true, 4, 'published'
),
(
  'We were in the middle of COVID response with 140 technology projects in flight and no way to know what was at risk. Ian delivered portfolio visibility in six weeks. I still remember the moment we had our first consolidated view — it was the first time in three months I knew what the team was actually working on. That clarity was worth everything.',
  'Chief Information Officer',
  'CIO',
  'California Hospital & Health System (Sanitised)',
  'Client — PPM Implementation (COVID Response)',
  ARRAY['PPM', 'healthcare', 'COVID-19', 'rapid implementation', 'client'],
  true, 5, 'published'
),
(
  'Ian''s GxP classification logic saved us from a compliance finding before it happened. Three projects that had been informally tracked as non-validated were correctly identified as GxP-relevant within weeks of the PPM going live. In our industry, that kind of early detection is not a nice-to-have — it protects the trial programme.',
  'Head of Research IT',
  'Head of Research IT',
  'Mid-Market Biotechnology Company (Sanitised)',
  'Client — Project Portfolio Management Implementation',
  ARRAY['PPM', 'biotechnology', 'GxP', 'compliance', 'client', 'life sciences'],
  true, 6, 'published'
),
(
  'The assessment Ian delivered was the most honest evaluation of our ServiceNow estate we have ever received. Previous reviews told us what we wanted to hear. Ian told us what we needed to hear — with evidence. The roadmap he produced gave my board confidence to extend the platform investment, and the quick wins he identified delivered results within 90 days.',
  'Global CIO',
  'Global CIO',
  'Global Manufacturing Corporation (Sanitised)',
  'Client — ITSM Maturity Assessment & Roadmap',
  ARRAY['assessment', 'manufacturing', 'roadmap', 'advisory', 'client'],
  false, 7, 'published'
),
(
  'Ian translated IT performance into revenue impact in a way no IT consultant had ever done for us before. When he showed the partners what fee-earner downtime was actually costing the firm in billing terms, the conversation changed completely. We got the investment, the programme delivered, and we recovered time we hadn''t known we were losing.',
  'Chief Operating Officer',
  'COO',
  'Large Legal Services Firm (Sanitised)',
  'Client — ITSM & Matter Lifecycle Automation',
  ARRAY['ITSM', 'legal services', 'revenue', 'advisory', 'client'],
  false, 8, 'published'
),
(
  'Field service scheduling in a unionised government environment is politically treacherous. Ian designed a system that improved officer utilisation by 19 percentage points without triggering a single union grievance. That outcome required both technical capability and real-world judgement about people and organisations. He has both.',
  'Deputy Director for Operations',
  'Deputy Director for Operations',
  'State Government Service Agency (Sanitised)',
  'Client — Field Service Management Transformation',
  ARRAY['FSM', 'field service', 'government', 'public sector', 'client'],
  false, 9, 'published'
),
(
  'Ian does not create dependency. After our engagement, my team understood not just what we had built but why. When we extended the platform ourselves six months later, we made the same design choices he would have made — because he had explained his reasoning at every step. That is what real knowledge transfer looks like.',
  'IT Director',
  'IT Director',
  'Regional Insurance Group (Sanitised)',
  'Client — ITSM Modernisation Programme',
  ARRAY['ITSM', 'insurance', 'platform migration', 'capability transfer', 'client'],
  false, 10, 'published'
),
(
  'I have been on Ian''s Virtual Agent implementation at the credit union and referenced his USMBOK framework in two organisations since. The consistency between his published thinking and how he actually works with clients is rare. What he writes is what he practices. That integrity matters enormously to me as a professional.',
  'Head of Digital Services',
  'Head of Digital Services',
  'Global Credit Union Network (Sanitised)',
  'Client — ITBM & Virtual Agent Programme',
  ARRAY['Virtual Agent', 'conversational AI', 'ITBM', 'USMBOK', 'client'],
  false, 11, 'published'
),
(
  'Ian''s session at itSMF was the most attended of the conference. He has a gift for making the technically dense feel immediately actionable — you leave with both the conceptual framework and the first three steps. I have watched him do this across multiple formats and he is consistently the best practitioner communicator in the industry.',
  'Conference Programme Director',
  'Programme Director',
  'itSMF International',
  'Speaking engagement — multiple annual events',
  ARRAY['speaking', 'conference', 'thought leadership', 'itSMF'],
  false, 12, 'published'
);
