
WITH emp AS (
  SELECT id FROM employers WHERE name = 'Advance Solutions Corporation' LIMIT 1
)
INSERT INTO public.use_cases (
  title, slug, subtitle,
  client_display_name, client_name, show_client_name,
  industry, servicenow_product, project_type,
  employer_id,
  summary_html, challenge_html, solution_html, outcomes_html,
  outcome_bullets,
  pdf_path,
  tags, status, confidentiality, featured,
  date_delivered
)
SELECT
  'Enabling Post-Acquisition Customer Service Integration',
  'post-acquisition-csm-integration',
  'Global Cybersecurity Leader | ServiceNow CSM',
  'Global Cybersecurity Leader',
  'Thales / Imperva',
  false,
  'Cybersecurity / Technology',
  'Customer Service Management (CSM)',
  'implementation',
  emp.id,
  '<p>Following a major acquisition, a global cybersecurity company needed to migrate over 70,000 customers from the acquired firm''s mature third-party CRM into its own highly customized ServiceNow Customer Service Management (CSM) platform. With less than six months to deliver, the project demanded precision, speed, and zero disruption to global support operations.</p>',
  '<p>A global technology and cybersecurity organization initiated a time-critical project to integrate the customer service operations of a recently acquired U.S.-based security software company. The objective was to transition the acquired company''s support environment into the parent organization''s existing enterprise customer service management platform—under an unmovable <strong>Q1 2025 deadline</strong>, leaving less than six months from contract award to delivery.</p>
<p>At stake was the successful onboarding of over <strong>70,000 active customers</strong> who had relied for years on a mature customer support system built on a different platform. Key challenges included:</p>
<ul>
<li>Migrating all customer service operations, historical cases, routing logic, and support entitlements from the acquired firm''s legacy system into a highly customized CSM platform</li>
<li>Ensuring uninterrupted support for a global customer base exceeding 70,000, with strict SLAs and complex regulatory expectations</li>
<li>Reconciling differences in support models, case workflows, knowledge management practices, and escalation paths across both organizations</li>
<li>Navigating an environment where the receiving platform had already been tailored extensively to global, multi-industry requirements</li>
<li>Delivering the integration on an aggressive, fixed timeline acknowledged by all parties as extremely compressed and high risk</li>
<li>Aligning two separate customer experiences into a single, unified support model without sacrificing service quality or business continuity</li>
</ul>',
  '<p>Advance Solutions, an Elite ServiceNow Partner, led the full lifecycle of this high-priority post-acquisition integration. The approach balanced speed and precision, with every workstream aligned to a fixed Q1 2025 go-live target.</p>
<ul>
<li><strong>Requirements Alignment Across 13 Business Domains</strong> — A rapid, structured discovery phase engaged stakeholders from 13 distinct business units and global support operations. Requirements were prioritized as "must-have" or "should-have" to align delivery scope with the aggressive timeline.</li>
<li><strong>Change Readiness and Communication at Scale</strong> — A comprehensive change readiness program launched early, with coordinated communications across customers, partners, support agents, and internal stakeholders. A centralized communications hub ensured transparency and accessibility of rollout milestones.</li>
<li><strong>Parallel Enablement of the Acquired Support Team</strong> — Training of incoming support staff began while the new environment was still in development. This "train-as-we-build" model reduced go-live risk and improved first-day effectiveness.</li>
<li><strong>Preservation of a Mission-Critical Customer Portal</strong> — The acquiring organization''s highly customized customer service portal was preserved—maintaining UX, functionality, and branding while adding unified flows for both legacy and newly onboarded users.</li>
<li><strong>Targeted Microlearning Content</strong> — Custom-built, role-based microlearning videos were deployed to support both internal support teams and customer audiences during cutover.</li>
<li><strong>Third-Party System Integration</strong> — Full integration with four critical third-party systems used daily by clients and partners, requiring careful handling to maintain data integrity, performance, and compliance.</li>
</ul>',
  '<p>Advance Solutions delivered the engagement through an agile, sprint-based delivery model, supported by fast-cycle decision-making, proactive risk management, and strong executive sponsorship on both sides. The result: a seamless go-live, on time, with no disruption to support continuity for over 70,000 active customers.</p>',
  ARRAY[
    'On-time go-live with zero downtime despite a sub-six-month delivery window',
    '70,000+ customers successfully migrated from a third-party platform without data loss or service disruption',
    'Cross-organization alignment via change readiness program, accelerating adoption and minimizing resistance',
    'Integrated four critical third-party systems to ensure seamless service continuity',
    'Microlearning content enabled faster agent onboarding and reduced support escalations',
    'Foundation established for future service consolidation across additional entities, products, and regions'
  ],
  'case-studies/Case_Study_-_Thales_-_Imperva_CSM_Migration.pdf',
  ARRAY['ServiceNow', 'CSM', 'Post-Acquisition', 'Migration', 'Change Management', 'Cybersecurity', 'Microlearning'],
  'published',
  'sanitised',
  true,
  '2025-03-01'::date
FROM emp;
