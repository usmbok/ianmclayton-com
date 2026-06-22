
-- Work history seed
INSERT INTO public.work_history (organisation, role_title, employment_type, date_start, date_end, is_current, location, summary, key_achievements, client_type, domains, skills, sort_order) VALUES
(
  'Ian M. Clayton & Associates',
  'Principal Consultant & Advisor',
  'consulting',
  '2005-01-01', NULL, true,
  'Sarasota, Florida, USA',
  'Independent practice providing strategic advisory, consulting, and thought leadership services across service management modernisation, intelligent automation strategy, and organisational transformation to enterprises globally.',
  ARRAY[
    'Author of the Universal Service Management Body of Knowledge (USMBOK), adopted by practitioners worldwide',
    'Recipient of ITSM industry lifetime achievement award recognising sustained contribution to the profession',
    'Delivered keynote presentations and advisory engagements across North America, Europe, Asia-Pacific, and the Middle East',
    'Developed and delivered executive education programmes for CIOs, IT leaders, and service management practitioners'
  ],
  'enterprise', ARRAY['service management', 'intelligent automation', 'transformation', 'advisory'], ARRAY['strategy', 'advisory', 'thought leadership', 'authoring', 'facilitation'], 1
),
(
  'Pink Elephant',
  'Vice President of Solutions',
  'full-time',
  '2000-01-01', '2005-01-01', false,
  'Burlington, Ontario, Canada',
  'Led the development and delivery of service management consulting solutions and intellectual property for one of the world''s leading ITSM training and consulting firms.',
  ARRAY[
    'Built and led a global team of ITSM consultants delivering assessments, implementations, and transformations',
    'Developed proprietary assessment frameworks and methodology adopted across client engagements worldwide',
    'Contributed to ITIL guidance and early thought leadership around service management best practice'
  ],
  'enterprise', ARRAY['service management', 'consulting', 'ITIL', 'training'], ARRAY['consulting', 'practice development', 'ITIL', 'team leadership'], 2
),
(
  'ServiceNow Partner Ecosystem',
  'Strategic Advisor',
  'advisory',
  '2015-01-01', '2020-01-01', false,
  'Remote / Global',
  'Advisory engagement supporting ServiceNow implementation partners on service management strategy, operating model alignment, and intelligent automation roadmaps for enterprise clients.',
  ARRAY[
    'Advised on enterprise ITSM platform strategies across healthcare, financial services, and government sectors',
    'Shaped automation-first service desk designs that reduced resolution times by 30-50% at multiple organisations'
  ],
  'enterprise', ARRAY['ServiceNow', 'ITSM platforms', 'automation'], ARRAY['platform strategy', 'automation design', 'advisory'], 3
),
(
  'HDI (Help Desk Institute)',
  'Faculty Member & Conference Speaker',
  'part-time',
  '1998-01-01', '2012-01-01', false,
  'Colorado Springs, Colorado, USA',
  'Faculty member and frequent keynote speaker at HDI annual conferences, contributing to curriculum development and professional development for IT support and service management professionals.',
  ARRAY[
    'Delivered keynotes and workshops at annual HDI conferences attended by thousands of IT support professionals',
    'Contributed to HDI certification curriculum and standards development'
  ],
  'association', ARRAY['IT support', 'service desk', 'professional development'], ARRAY['speaking', 'facilitation', 'curriculum design'], 4
);
