import Link from "next/link";
import { Brand } from "./brand";
import { CopyCode } from "./copy-code";

const REPO = "https://github.com/soloshun/lumis-sdk";
const START = `git clone --branch dev ${REPO}.git\ncd lumis-sdk\nuv sync --all-groups`;

export function Hero() {
  return <section className="hero dark-zone">
    <div className="hero-grid" aria-hidden="true" />
    <div className="hero-aurora" aria-hidden="true" />
    <div className="shell hero-layout">
      <div className="hero-copy">
        <div className="status-line"><span>OPEN SOURCE / APACHE-2.0</span><span>EXPERIMENTAL · PYTHON 3.11+</span></div>
        <h1>Operational intelligence.<em>Grounded in evidence.</em></h1>
        <p>A vendor-neutral Python SDK for investigating complex systems. Connect the context, test competing explanations, and give engineers an inspectable account of what the evidence supports.</p>
        <div className="hero-actions"><Link className="button primary" href="/docs/quickstart">Get started <span>→</span></Link><a className="button secondary" href={REPO}>View on GitHub ↗</a><a className="button secondary" href="https://arxiv.org/abs/2608.01955">Read the paper ↗</a></div>
        <div className="source-install"><div><span>DEVELOPMENT CHECKOUT</span><CopyCode code={START} /></div><pre><code>{START}</code></pre></div>
        <small className="release-note">The new architecture is on dev. An older package-index release is not this SDK.</small>
      </div>
      <InvestigationInstrument />
    </div>
    <div className="hero-facts shell"><span>EVIDENCE FIRST</span><span>MODEL OPTIONAL</span><span>BOUNDED BY DESIGN</span><span>HUMAN REVIEW</span></div>
  </section>;
}

function InvestigationInstrument() {
  return <div className="hero-instrument investigation-instrument" aria-label="Illustrative incident investigation, not a live system">
    <div className="instrument-head"><span>INCIDENT / DEMO-001</span><span>SYNTHETIC WALKTHROUGH</span></div>
    <div className="investigation-symptom"><span>01 / SCOPE THE CONTEXT</span><h2>Follow the relationships.<br />Test the explanation.</h2></div>
    <OperationalGraph />
    <div className="evidence-row"><span>02 / DETERMINISTIC TRIAGE</span><strong>Health signature</strong><b>MATCH · NONTERMINAL</b></div>
    <div className="hypothesis-ledger"><div><span>03 / TEST EXPLANATIONS</span><span>EVIDENCE STATE</span></div><p><b>Service unavailability</b><em className="support">SUPPORTED</em></p><p><b>Underlying cause</b><em className="unresolved">UNRESOLVED</em></p><small>An observed symptom is not a complete causal explanation.</small></div>
    <div className="review-result"><span>04 / REPORT, NOT REMEDIATE</span><strong>Human review required <span>↗</span></strong><code>truth_state: unconfirmed_hypothesis</code></div>
    <p className="instrument-caption">Declared graph sample + synthetic health finding. Relationships are context, not proof of cause. No live system or model call.</p>
  </div>;
}

function OperationalGraph() {
  const nodes = [
    {id: "dataset", x: 20, y: 26, name: "Input dataset", kind: "DATASET"},
    {id: "flow", x: 180, y: 26, name: "Pipeline flow", kind: "WORKFLOW"},
    {id: "host", x: 340, y: 26, name: "Worker host", kind: "RESOURCE"},
    {id: "database", x: 20, y: 180, name: "PostgreSQL", kind: "DEPENDENCY"},
    {id: "service", x: 180, y: 180, name: "Demo service", kind: "AFFECTED ENTITY"},
    {id: "cache", x: 340, y: 180, name: "Cache", kind: "DEPENDENCY"},
  ];
  return <figure className="operational-graph"><svg viewBox="0 0 480 272" role="img" aria-labelledby="graph-title graph-desc">
    <title id="graph-title">Sample operational dependency graph</title>
    <desc id="graph-desc">Six declared entities. A pipeline consumes a dataset and depends on the affected service. A host runs the service; the service depends on PostgreSQL and a cache. Edges are relationships, not causal conclusions.</desc>
    <defs><marker id="graph-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10" fill="var(--signal-soft)" /></marker></defs>
    <g className="graph-edges" fill="none" markerEnd="url(#graph-arrow)">
      <path d="M180 57H146" /><path d="M242 90V174" /><path d="M401 90V125H305V180" /><path d="M180 212H146" /><path d="M306 212H334" />
    </g>
    <g className="graph-edge-labels"><text x="162" y="45">consumes</text><text x="234" y="128" textAnchor="end">depends_on</text><text x="356" y="117">hosts</text><text x="163" y="199">depends_on</text><text x="319" y="199">depends_on</text></g>
    {nodes.map(node => <g key={node.id} className={node.id === "service" ? "graph-node affected" : "graph-node"} transform={`translate(${node.x} ${node.y})`}><rect width="124" height="64" rx="3" /><circle cx="15" cy="16" r="3" /><text className="graph-kind" x="62" y="20" textAnchor="middle">{node.kind}</text><text className="graph-name" x="62" y="44" textAnchor="middle">{node.name}</text></g>)}
  </svg><figcaption><span><i />Declared relationship</span><span><i className="incident-node" />Incident scope</span><span>6 entities / 5 edges · illustrative</span></figcaption></figure>;
}

const principles = [
  ["Context before conclusions", "An incident-scoped operational graph connects relevant entities and dependencies without sending an entire estate to a model."],
  ["Known patterns first", "Deterministic signatures produce match, no_match, or unknown. Only a sufficient signature ends triage."],
  ["One bounded investigator", "When explicitly enabled, a tool-using agent explores uncertainty through approved evidence, graph, code, and isolated probes."],
  ["Evidence decides", "Predictions and falsifiers are assessed mechanically. Missing or conflicting observations remain unresolved; contradictions matter."],
  ["Every step inspectable", "Structured reports retain findings, evidence, tool receipts, unresolved questions, and usage—not raw chain-of-thought."],
  ["Engineers keep authority", "The current SDK stops at human review. Suggestions are text; no patch, rollback, remediation, or rule promotion runs automatically."],
];

export function Principles() {
  return <section className="paper-section" id="principles"><div className="shell section-grid"><div className="section-intro"><p className="eyebrow">UNDERSTAND BEFORE YOU ACT</p><h2>Models propose.<br />Lumis tests.</h2><p>Build investigations that can be questioned, reproduced, and revised. An explanation earns evidence support—not automatic authority.</p><Link className="text-link" href="/docs/investigation">Explore the investigation model →</Link></div><div className="principle-grid">{principles.map(([title, copy], i) => <article className="principle" key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>;
}

export function Architecture() {
  return <section className="architecture dark-zone" id="architecture"><div className="shell"><div className="section-heading split-heading"><div><p className="eyebrow">A PORTABLE INVESTIGATION KERNEL</p><h2>Your systems.<br />One evidence model.</h2></div><p>Connect externally through telemetry, topology, and typed observations. The SDK does not import your application, replace your monitoring stack, or require a graph server.</p></div><div className="architecture-board"><div className="arch-column"><span className="arch-label">OPERATOR-OWNED INPUTS</span><ArchNode name="Incidents & topology" detail="time windows · identities · relationships" /><ArchNode name="Read-only observations" detail="snapshots · metrics · logs · traces · workflows" /><ArchNode name="Approved source context" detail="explicit file allowlists · local Git" /></div><span className="arch-arrow" aria-hidden="true">→</span><div className="arch-column core"><span className="arch-label">LUMIS SDK</span><ArchNode name="Operational graph" detail="Pydantic + NetworkX MultiDiGraph" active /><ArchNode name="Checks & investigation" detail="deterministic triage · optional Pydantic AI" active /><ArchNode name="Mechanical assessment" detail="predictions · falsifiers · provenance" active /></div><span className="arch-arrow" aria-hidden="true">→</span><div className="arch-column"><span className="arch-label">INSPECTABLE OUTPUTS</span><ArchNode name="Incident report" detail="support · contradiction · uncertainty" /><ArchNode name="Tool receipts & budgets" detail="queries · requests · tokens · probes" /><ArchNode name="Local audit records" detail="SQLite · separate human resolutions" /></div></div><div className="architecture-note"><span className="blue-pixel" />Core contracts remain independent of the application and optional providers. Discovery and investigation have separate, explicit limits.</div><Link className="text-link" href="/docs/architecture">Read the architecture →</Link></div></section>;
}

function ArchNode({name, detail, active = false}: {name: string; detail: string; active?: boolean}) {
  return <div className={`arch-node ${active ? "active" : ""}`}><i /><div><strong>{name}</strong><span>{detail}</span></div></div>;
}

export function Workflow() {
  const steps = [["Prepare", "Discover and bind a scoped estate."], ["Triage", "Test known signatures against observations."], ["Investigate", "Inspect and probe only when enabled."], ["Assess", "Validate explanations against evidence."], ["Review", "Give engineers findings and open questions."]];
  return <section className="paper-section lifecycle-section" id="workflow"><div className="shell"><div className="section-heading split-heading reverse light"><p>A sufficient known signature can avoid a model call. Ambiguous cases reach one bounded investigator—or a human when no agent is enabled. Both paths end in the same reviewable report.</p><div><p className="eyebrow">DETERMINISTIC OUTSIDE / AGENTIC WHEN NEEDED</p><h2>A small loop.<br />Explicit boundaries.</h2></div></div><div className="lifecycle-track current-investigation">{steps.map(([title, detail], i) => <div className="stage current" key={title}><span>0{i+1}</span><i /><strong>{title}</strong><small>{detail}</small></div>)}</div><div className="guard-note"><b>SUPPORT ≠ CONFIRMATION</b><span>A supported explanation is not causal proof. Probe results are synthetic evidence, and a failed query is not a false measurement.</span></div><EvidenceChart /></div></section>;
}

function EvidenceChart() {
  return <figure className="evidence-chart"><div><p className="eyebrow">SYNTHETIC QUICKSTART / EVIDENCE STATES</p><h3>What is observed. What remains open.</h3><p>The offline scaffold establishes service unavailability. It does not establish why the service failed.</p></div><div className="evidence-state-chart" role="img" aria-label="Categorical evidence chart: service unavailability is supported; underlying root cause remains unresolved; causal confirmation is not established.">{[["Service unavailability", "SUPPORTED", "supported"], ["Underlying cause", "UNRESOLVED", "unknown"], ["Causal confirmation", "NOT ESTABLISHED", "unknown"]].map(([label, status, kind]) => <div className={`evidence-chart-row ${kind}`} key={label}><strong>{label}</strong><span><i /><i /><i /><i /></span><b>{status}</b></div>)}<small>Evidence categories—not confidence scores or performance metrics.</small></div></figure>;
}

export function Start() {
  return <section className="framework dark-zone" id="framework"><div className="shell"><div className="section-heading split-heading"><div><p className="eyebrow">THE OPEN FOUNDATION</p><h2>Small enough to understand. Open enough to extend.</h2></div><p>Lumis SDK is the reusable investigation kernel—not a monitoring system, orchestrator, hosted control plane, or automatic recovery executor.</p></div><div className="sdk-lumis"><div className="sdk-lumis-intro"><p className="eyebrow">OPEN SOURCE / PLATFORM COMING SOON</p><h2>Lumis SDK stays useful on its own.</h2><p>Start locally with a synthetic incident, then connect your own systems through approved read-only observations.</p></div><div className="compare-panel"><span>LUMIS SDK</span><ul><li>Vendor-neutral Python contracts</li><li>Scoped operational graphs</li><li>Deterministic checks, optional model</li><li>Inspectable human-review reports</li></ul><Link href="/docs/architecture">Explore the architecture →</Link></div><div className="compare-panel managed"><span>LUMIS PLATFORM · COMING SOON</span><ul><li>Broader operational intelligence</li><li>Managed team workflows</li><li>Reviewed learning and reasoning</li><li>Policy-controlled action research</li></ul><span className="coming-soon-label">PLATFORM IN DEVELOPMENT</span></div></div><div className="offline-start"><div><p className="eyebrow">OFFLINE FIRST RUN</p><h3>One incident. No cloud account.</h3><p>A nonterminal health finding and an unconfirmed human-review report. No model call. No automatic fix.</p><Link className="text-link" href="/docs/quickstart">Run the quickstart →</Link></div><div className="start-command"><div className="instrument-head"><span>LOCAL / SYNTHETIC</span><CopyCode code={QUICK_RUN} /></div><pre><code>{QUICK_RUN}</code></pre></div></div></div></section>;
}
const QUICK_RUN = `uv run lumis init --directory /tmp/lumis-demo\nuv run lumis doctor --project /tmp/lumis-demo/lumis.yaml\nuv run lumis incident \\\n  --project /tmp/lumis-demo/lumis.yaml \\\n  --incident /tmp/lumis-demo/incident.json \\\n  --observations /tmp/lumis-demo/observations.json`;

export function Project() {
  return <section className="paper-section project-section" id="project"><div className="shell section-grid"><div className="section-intro"><p className="eyebrow">RESEARCH SOFTWARE / INDEPENDENT FOUNDATION</p><h2>Open today.<br />More to understand.</h2><p>Lumis SDK is the experimental, Apache-2.0 foundation for evidence-grounded operational intelligence. Data, AI, and software systems are starting points—not the limit of the underlying contracts.</p><Link className="text-link" href="/docs/project">Project status and contribution →</Link></div><div className="project-boundaries"><article><span>CURRENT SDK</span><h3>Investigation, not automatic recovery.</h3><p>Typed contracts, scoped graphs, read-only connectors, deterministic checks, one optional investigator, isolated experiments, and local audit records.</p></article><article><span>LUMIS PLATFORM · COMING SOON</span><h3>A broader operational intelligence direction.</h3><p>Managed workflows, advanced reasoning, reviewed learning, and policy-controlled action are platform and research work—not shipped SDK capabilities.</p></article><article><span>FOUNDATIONAL RESEARCH / arXiv 2608.01955</span><h3>From guarded recovery to grounded investigation.</h3><p>The earlier self-healing architecture informs the research. The current SDK has a narrower, independently testable investigation boundary.</p><a className="text-link" href="https://arxiv.org/abs/2608.01955">Read the foundational preprint ↗</a></article></div></div></section>;
}

export function Research() {
  return (
    <section className="paper-section research-section" id="research">
      <div className="shell section-grid">
        <div className="section-intro" data-reveal="">
          <p className="eyebrow">FROM RESEARCH TO FRAMEWORK</p>
          <h2>Born in a paper.<br />Built in the open.</h2>
          <p>
            Lumis began with research into vendor-agnostic, guarded self-healing.
            The current SDK focuses that foundation on evidence-grounded investigation:
            understand the incident, test explanations, and keep engineers in control.
          </p>
        </div>
        <article className="paper-card" data-reveal="">
          <div className="paper-card-head"><span>RESEARCH PAPER</span><span className="paper-status">PUBLISHED ON arXiv · 2608.01955</span></div>
          <h3>Agentic Self-Healing for Data &amp; AI Pipelines: An Affordable Vendor-Agnostic Architecture using Open-Source Software</h3>
          <p className="paper-authors">Solomon Eshun et al. · submitted 3 August 2026</p>
          <p className="paper-abstract">
            The paper proposes a seven-layer, vendor-agnostic architecture for guarded
            self-healing. Verified outcomes enrich incident memory, while recurring
            diagnosis-and-remediation patterns can be reviewed, tested, and promoted into
            deterministic rules—a research direction rather than automatic learning in the current SDK.
          </p>
          <div className="paper-actions">
            <a className="paper-cta" href="https://arxiv.org/abs/2608.01955" target="_blank" rel="noreferrer">READ ON arXiv ↗</a>
            <a className="paper-cta secondary" href="/research/agentic-self-healing-for-data-and-ai-pipelines.pdf" target="_blank" rel="noreferrer">DOWNLOAD PDF ↓</a>
          </div>
        </article>
      </div>
    </section>
  );
}

export function Footer() {
  return <footer className="site-footer dark-zone"><div className="shell footer-inner"><Brand /><p>Evidence-grounded operational intelligence.</p><div><Link href="/docs">Docs</Link><a href={REPO}>GitHub</a><a href="/llms.txt">llms.txt</a><a href={`${REPO}/blob/dev/LICENSE`}>Apache-2.0</a></div></div></footer>;
}
