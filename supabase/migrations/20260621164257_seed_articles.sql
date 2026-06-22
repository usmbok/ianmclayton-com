
-- Articles seed
INSERT INTO public.articles (
  title, subtitle, slug, excerpt, content_html, category, tags,
  status, featured, published_at, reading_time_minutes,
  meta_title, meta_description, meta_keywords
) VALUES
(
  'Why Your Automation Strategy Is Probably Wrong',
  'The case for automation maturity before automation scale',
  'why-your-automation-strategy-is-probably-wrong',
  'Most organisations approach automation the wrong way — starting with volume and scale before establishing maturity and governance. Here is what a better sequencing looks like.',
  '<h2>The Volume Trap</h2><p>When organisations begin their automation journey, the first question they usually ask is: "What can we automate?" It is the wrong question. The right question is: "What should we automate, and are we ready to do so sustainably?"</p><p>The volume trap is seductive. Vendors quote impressive ROI figures. Case studies show headcount reductions of 30-40%. Leadership sees cost savings on a spreadsheet and approves a programme. Twelve months later, half the automations are broken, maintenance costs have eaten the savings, and the team is demoralised.</p><h2>What Automation Maturity Actually Means</h2><p>Automation maturity is not about how many bots you have deployed. It is about how reliably your automations work, how quickly you can respond when they break, and whether your governance keeps pace with your scale.</p><p>A mature automation programme has: stable, well-documented processes as inputs; monitoring that catches failures before customers do; a clear ownership model for each automation; and a change management process that keeps automations current as the underlying systems and processes evolve.</p><h2>The Sequencing That Works</h2><p>Start with a maturity assessment, not a candidate pipeline. Understand your process stability, data quality, change frequency, and exception rates before you decide what to automate. The best automation candidates are: stable processes that change infrequently, high-volume with low variability, well-documented with clear decision rules, and already producing consistent outcomes manually.</p><p>Automate those first. Prove the model. Build governance. Then scale.</p><h2>The Human Dimension</h2><p>The programmes I have seen fail most dramatically are those that treated automation as a headcount exercise. When people believe automation is coming for their jobs, they become the single greatest risk to programme success — either through passive resistance or active sabotage.</p><p>The programmes that succeed treat automation as a redistribution of human effort: from low-value repetitive tasks to higher-value work that requires judgement, relationship, and creativity. That framing is not spin — it is operationally accurate. And making it explicit, early and often, is the difference between a transformation and a trauma.</p>',
  'Automation & AI',
  ARRAY['automation', 'strategy', 'RPA', 'maturity', 'governance', 'change management'],
  'published', true, '2023-09-15 00:00:00+00', 7,
  'Why Your Automation Strategy Is Probably Wrong | Ian M. Clayton',
  'Most automation programmes fail for the same reason: they optimise for volume before maturity. A different sequencing — maturity assessment before scale — is what makes automation sustainable.',
  ARRAY['automation strategy', 'RPA', 'intelligent automation', 'automation maturity', 'service management', 'Ian Clayton']
),
(
  'The ITIL Problem Nobody Talks About',
  'On the gap between certification and capability',
  'the-itil-problem-nobody-talks-about',
  'ITIL certification is not the same as ITIL capability. The industry has confused the map for the territory — and organisations are paying for it in failed implementations and frustrated practitioners.',
  '<h2>The Certification Economy</h2><p>There are now more ITIL-certified individuals in the world than there are people who can credibly implement ITIL well. That gap — between the certificate on the wall and the capability in the room — is the most underacknowledged problem in service management.</p><p>I am not anti-ITIL. I have spent my career working with and contributing to service management frameworks. But the industry has built a certification economy that rewards knowing the right answer on an exam while doing relatively little to build the judgement required to apply that knowledge in messy, real-world contexts.</p><h2>What Capability Actually Requires</h2><p>ITIL capability — genuine capability, not certification — requires three things that no exam tests: contextual judgment (knowing which practices to apply, how heavily, and in what sequence for this organisation); stakeholder fluency (the ability to translate service management concepts into language that resonates with executives, engineers, and end users simultaneously); and change resilience (the ability to sustain improvement momentum through the inevitable organisational resistance to change).</p><p>These are not knowledge domains. They are professional competencies developed through practice, coaching, and reflection over years.</p><h2>What To Do About It</h2><p>For practitioners: treat certification as a vocabulary exercise, not a capability milestone. The real learning begins after the exam, in the application. Find a mentor who has done the work in contexts similar to yours. Build a reflective practice — not just doing, but studying what you are doing and why it worked or did not.</p><p>For organisations: stop using ITIL certification as a hiring filter for service management roles. Use it as a baseline vocabulary check and nothing more. Hire for judgment and communication ability. Invest in ongoing coaching and peer learning rather than one-time certification events.</p>',
  'Service Management',
  ARRAY['ITIL', 'service management', 'certification', 'capability', 'professional development'],
  'published', true, '2023-06-08 00:00:00+00', 6,
  'The ITIL Problem Nobody Talks About | Ian M. Clayton',
  'ITIL certification is not the same as ITIL capability. The gap between the certificate and the competency is the most underacknowledged problem in service management.',
  ARRAY['ITIL', 'service management', 'certification', 'professional development', 'Ian Clayton']
),
(
  'AI in the Service Desk: What Works, What Doesn''t, What''s Next',
  'A practitioner''s view of AI adoption in IT support operations',
  'ai-in-the-service-desk-what-works',
  'AI adoption in service desk operations has accelerated dramatically. Here is an honest assessment of where it is genuinely delivering value, where it is falling short, and what the next 18 months look like.',
  '<h2>What Is Actually Working</h2><p>After a decade of inflated promises and underwhelming pilots, AI in service desk operations is finally delivering real value in specific, well-defined areas. The areas where I consistently see genuine ROI in client engagements:</p><ul><li><strong>Intelligent triage and categorisation:</strong> AI classification of incoming tickets has improved first-contact routing accuracy by 25-45% in well-implemented cases, reducing mis-routes and the re-work they generate.</li><li><strong>Knowledge recommendation:</strong> AI-assisted article surfacing in the agent interface reduces resolution time for known issues. The caveat is significant: the AI is only as good as the underlying knowledge. Poor-quality knowledge bases amplified by AI produce faster wrong answers, not faster resolutions.</li><li><strong>Anomaly detection and proactive alerting:</strong> AIOps tools that identify behavioural anomalies in infrastructure monitoring — before they cause service impact — are delivering measurable MTTR improvements in mature deployments.</li></ul><h2>What Is Not Working</h2><p>Conversational AI (chatbots and virtual agents) remains the most overpromised and underdelivered category. The fundamental problem is not the AI technology — it is that most organisations deploy conversational AI on top of processes and knowledge structures that were not designed for it. The result is a self-service experience that frustrates users and erodes trust in self-service as a channel.</p><p>AI-generated service reports and insights are also struggling in practice. The tools exist. The data quality to feed them often does not.</p><h2>What''s Next</h2><p>The most interesting near-term development is agentic AI in service operations — AI that does not just recommend or classify but acts: creating tickets, triggering workflows, updating knowledge, escalating to humans at the right moment. The early deployments I have seen are promising but fragile. Governance frameworks for agentic AI in service contexts do not yet exist at the maturity the technology requires.</p>',
  'AI & Automation',
  ARRAY['AI', 'service desk', 'AIOps', 'conversational AI', 'ITSM', 'chatbot'],
  'published', false, '2024-02-20 00:00:00+00', 9,
  'AI in the Service Desk: What Works, What Doesn''t | Ian M. Clayton',
  'An honest practitioner assessment of where AI is delivering real value in service desk operations, where it is falling short, and what the next 18 months will bring.',
  ARRAY['AI service desk', 'AIOps', 'ITSM AI', 'conversational AI', 'service management', 'Ian Clayton']
),
(
  'The Service Management Practitioner''s Reading List',
  'The books, papers, and frameworks I return to again and again',
  'service-management-practitioners-reading-list',
  'After three decades in service management, these are the sources I continue to return to — not because they have all the answers, but because they ask the right questions.',
  '<h2>On Service Management Foundations</h2><p><strong>USMBOK (Universal Service Management Body of Knowledge)</strong> — I am the author, so I am biased. But the reason I wrote it is precisely because I found the existing frameworks incomplete. The USMBOK provides a technology-agnostic, outcome-focused reference that complements rather than replaces ITIL.</p><p><strong>ITIL 4 Foundation</strong> — Despite my earlier essay on certification culture, the ITIL 4 Foundation text is genuinely well-written and the shift to a value-chain perspective is a meaningful improvement over v3.</p><h2>On Organisations and Change</h2><p><strong>The Fifth Discipline by Peter Senge</strong> — Still the best book on systems thinking in organisational contexts. Essential reading for anyone trying to understand why service improvement programmes fail despite good intentions and adequate resources.</p><p><strong>Switch: How to Change Things When Change Is Hard by Chip and Dan Heath</strong> — Practically useful in a way that most change management theory is not. The Rider/Elephant/Path framework is something I use in client engagements regularly.</p><h2>On AI and Automation</h2><p><strong>The Age of Surveillance Capitalism by Shoshana Zuboff</strong> — Not specifically about enterprise AI, but essential context for anyone thinking seriously about the implications of AI-mediated operations. Understanding what AI optimises for — and in whose interests — is not optional for practitioners governing AI in service contexts.</p>',
  'Professional Development',
  ARRAY['reading list', 'books', 'service management', 'professional development', 'resources'],
  'published', false, '2023-03-12 00:00:00+00', 5,
  'The Service Management Practitioner''s Reading List | Ian M. Clayton',
  'After three decades in service management, these are the books, frameworks, and sources Ian M. Clayton returns to most — focused on what asks the right questions.',
  ARRAY['service management books', 'ITSM reading list', 'professional development', 'Ian Clayton']
);
