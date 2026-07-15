import Link from "next/link";
import { CopyCode } from "./copy-code";
import { Brand } from "./brand";

const INSTALL = "uv add lumis-sdk";

export function Hero() {
  return (
    <section className="hero dark-zone">
      <div className="hero-grid" aria-hidden="true" />
      <div className="shell hero-layout">
        <div className="hero-copy">
          <div className="status-line"><span>OPEN SOURCE</span><span>APACHE-2.0</span><span>PYTHON 3.11+</span></div>
          <h1>Build guarded recovery for <em>self-healing pipelines.</em></h1>
          <p>
            Lumis SDK is a vendor-agnostic Python framework for building agentic
            recovery workflows across data, ML, and software-delivery systems—
            deterministic first, evidence grounded, model optional, and under
            explicit human and policy control.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/docs/getting-started/quickstart">Get started <span>→</span></Link>
            <a className="button secondary" href="https://github.com/soloshun/lumis-sdk" target="_blank" rel="noreferrer">View on GitHub ↗</a>
          </div>
          <div className="install-line"><code><b>$</b> {INSTALL}</code><CopyCode code={INSTALL} /></div>
        </div>

        <div className="hero-instrument recovery-instrument" aria-label="Guarded recovery lifecycle">
          <div className="instrument-head"><span>FIG. 01 / GUARDED RECOVERY FRAMEWORK</span><span className="live-dot">LOCAL READY</span></div>
          <div className="signal-source">
            <span>INCIDENT CONTEXT</span><code>logs · metrics · lineage · schema · code</code>
          </div>
          <div className="recovery-flow">
            <FlowStep index="01" name="TRIAGE" detail="deterministic" state="live" />
            <i aria-hidden="true" />
            <FlowStep index="02" name="DIAGNOSE" detail="evidence + memory" state="live" />
            <i aria-hidden="true" />
            <FlowStep index="03" name="PLAN" detail="recommendation" state="contract" />
            <i aria-hidden="true" />
            <FlowStep index="04" name="APPROVE" detail="policy boundary" state="guard" />
          </div>
          <div className="instrument-layers">
            <div><span>DETERMINISTIC PATH</span><strong>Known signatures remain explainable and reproducible.</strong><small>current foundation</small></div>
            <div><span>OPTIONAL MODEL PATH</span><strong>Unknown cases may route through a bounded gateway.</strong><small>explicit opt-in</small></div>
          </div>
          <div className="recovery-outcome">
            <div><span>VERIFY</span><b>explicit result</b></div>
            <div><span>LEARN</span><b>confirmed memory only</b></div>
            <small>NO CORE ACTION EXECUTOR</small>
          </div>
        </div>
      </div>
      <div className="hero-facts shell">
        <span>NO REQUIRED CLOUD</span><span>NO REQUIRED MODEL</span><span>NO DEFAULT TELEMETRY</span><span>NO UNRESTRICTED ACTUATION</span>
      </div>
    </section>
  );
}

function FlowStep({ index, name, detail, state }: { index: string; name: string; detail: string; state: string }) {
  return <div className={`flow-step ${state}`}><small>{index}</small><span /><strong>{name}</strong><em>{detail}</em></div>;
}

const principles = [
  ["Deterministic first", "Known signatures and project-owned rules run before optional model reasoning."],
  ["Evidence grounded", "Facts, evidence, hypotheses, contradictions, confidence, and gaps stay distinct."],
  ["Model optional", "The core runs offline. Providers implement a narrow, explicitly enabled gateway."],
  ["Local first", "SQLite and Markdown provide inspectable defaults without a hosted dependency."],
  ["Vendor agnostic", "Core contracts remain independent of observability, cloud, orchestration, and agent vendors."],
  ["Guarded by design", "Plans, approvals, verification, audit, and truth state remain explicit boundaries."],
];

export function Principles() {
  return (
    <section className="paper-section" id="principles">
      <div className="shell section-grid">
        <div className="section-intro">
          <p className="eyebrow">A SMALL CORE / EXPLICIT BOUNDARIES</p>
          <h2>Framework primitives.<br />Your operating stack.</h2>
          <p>Lumis SDK supplies reusable semantics and safety controls while teams keep their monitoring, storage, model, workflow, and deployment choices.</p>
        </div>
        <div className="principle-grid">
          {principles.map(([title, copy], index) => (
            <article className="principle" key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Architecture() {
  return (
    <section className="architecture dark-zone" id="architecture">
      <div className="shell">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">PORTS & ADAPTERS</p><h2>Compose recovery without vendor lock-in.</h2></div>
          <p>A strict domain holds incident and recovery meaning. Application services coordinate it through replaceable ports; adapters connect the local or hosted infrastructure you choose.</p>
        </div>
        <div className="architecture-board">
          <div className="arch-column"><span className="arch-label">ENTRY & CONTEXT</span><ArchNode name="CLI / Python" detail="project entry points" /><ArchNode name="Context providers" detail="logs · metrics · lineage" /><ArchNode name="Configuration" detail="strict v1alpha1" /></div>
          <div className="arch-arrow" aria-hidden="true">→</div>
          <div className="arch-column core"><span className="arch-label">VENDOR-NEUTRAL CORE</span><ArchNode name="Application" detail="diagnosis · lifecycle" active /><ArchNode name="Domain" detail="evidence · plans · truth" active /><ArchNode name="Ports" detail="policy · approval · verify" /></div>
          <div className="arch-arrow" aria-hidden="true">←</div>
          <div className="arch-column"><span className="arch-label">REPLACEABLE ADAPTERS</span><ArchNode name="Deterministic" detail="ordered rule engine" /><ArchNode name="Memory" detail="SQLite reference" /><ArchNode name="Model gateway" detail="optional · bounded" /></div>
        </div>
        <div className="architecture-note"><span className="blue-pixel" />Domain and application packages import no observability, orchestration, cloud, model-provider, or agent SDK.</div>
      </div>
    </section>
  );
}

function ArchNode({ name, detail, active = false }: { name: string; detail: string; active?: boolean }) {
  return <div className={`arch-node ${active ? "active" : ""}`}><i /><div><strong>{name}</strong><span>{detail}</span></div><b>→</b></div>;
}

const stages = [
  ["Detect", "external / local input", "current"], ["Triage", "deterministic classification", "current"],
  ["Diagnose", "rules + optional model", "current"], ["Plan", "recommendation contract", "contract"],
  ["Approve", "explicit decision", "contract"], ["Remediate", "future RFC-gated work", "guard"],
  ["Verify", "bounded result contract", "contract"], ["Learn", "confirmed memory", "current"],
];

export function Lifecycle() {
  return (
    <section className="paper-section lifecycle-section" id="lifecycle">
      <div className="shell">
        <div className="section-heading split-heading light">
          <div><p className="eyebrow">DIAGNOSIS TODAY / HEALING OVER TIME</p><h2>A lifecycle designed for guarded autonomy.</h2></div>
          <p>Lumis SDK begins with reproducible diagnosis and already defines transport-neutral contracts for context, planning, approval, verification, audit, and learning. Execution is intentionally absent from core.</p>
        </div>
        <div className="lifecycle-track">
          {stages.map(([name, detail, state], index) => (
            <div className={`stage ${state}`} key={name}><span>0{index + 1}</span><i /><strong>{name}</strong><small>{detail}</small></div>
          ))}
        </div>
        <div className="guard-note"><b>IMPLEMENTATION BOUNDARY</b><span>Blue stages ship today. Neutral stages are typed contracts. Amber remediation remains future, RFC-governed work requiring allowlists, policy, approval, audit, limits, idempotency, and verification.</span></div>
      </div>
    </section>
  );
}

const surfaces = [
  ["01", "Domain contracts", "Vendor-neutral incidents, context, evidence, diagnoses, plans, approvals, verification, audit events, and truth states.", "STABLE SHAPE"],
  ["02", "Application services", "Deterministic-first diagnosis and a recommendation-only lifecycle orchestrator composed without infrastructure dependencies.", "USE-CASE LAYER"],
  ["03", "Replaceable ports", "Interfaces for models, memory, reports, context, policy, approval, verification, and audit—ready for independent adapters.", "EXTENSION SURFACE"],
  ["04", "Local references", "Strict configuration, ordered rules, conservative redaction, Markdown reports, SQLite memory, CLI, and deterministic test doubles.", "WORKS OFFLINE"],
];

export function Framework() {
  return (
    <section className="framework dark-zone" id="framework">
      <div className="shell">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">THE OPEN FOUNDATION</p><h2>Small enough to understand. Open enough to extend.</h2></div>
          <p>Lumis SDK is the reusable framework layer—not a monitoring system, orchestrator, hosted control plane, or mandatory agent runtime.</p>
        </div>
        <div className="framework-grid">
          {surfaces.map(([id, name, copy, tag]) => (
            <article className="framework-card" key={id}><div><span>{id}</span><small>{tag}</small></div><h3>{name}</h3><p>{copy}</p><Link href="/docs/architecture/overview">Explore the architecture <span>→</span></Link></article>
          ))}
        </div>

        <div className="sdk-lumis">
          <div className="sdk-lumis-intro"><p className="eyebrow">OPEN SOURCE & MANAGED</p><h2>Lumis SDK stays useful on its own.</h2><p>Use the framework locally or self-host it. Move to Lumis by Qadim Labs when teams need a managed operating layer.</p></div>
          <div className="compare-panel"><span>LUMIS SDK</span><ul><li>Open-source framework</li><li>Local and self-hosted</li><li>Community adapters</li><li>Your infrastructure and policies</li></ul><Link href="/docs/project/lumis-and-sdk">Understand the boundary →</Link></div>
          <div className="compare-panel managed"><span>LUMIS</span><ul><li>Hosted team workflows</li><li>Managed integrations and memory</li><li>Approvals, audit, and runners</li><li>Enterprise deployment and support</li></ul><a href="https://lumis.qadimlabs.com">Explore Lumis ↗</a></div>
        </div>

        <div className="closing-cta">
          <div><p className="eyebrow">PRE-ALPHA / CONTRIBUTORS WELCOME</p><h2>Build the open foundation for trustworthy self-healing systems.</h2></div>
          <div><p>Apache-2.0 licensed, typed, local-first, and built in public.</p><div className="hero-actions"><Link className="button primary" href="/docs">Read the docs →</Link><a className="button secondary" href="https://github.com/soloshun/lumis-sdk" target="_blank" rel="noreferrer">Contribute ↗</a></div></div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return <footer className="site-footer dark-zone"><div className="shell footer-inner"><Brand /><p>Open-source primitives for guarded, agentic pipeline recovery.</p><div><Link href="/docs">Docs</Link><a href="https://github.com/soloshun/lumis-sdk">GitHub</a><a href="https://github.com/soloshun/lumis-sdk/blob/main/LICENSE">Apache-2.0</a></div></div></footer>;
}
