import Link from "next/link";
import { CopyCode } from "./copy-code";
import { Brand } from "./brand";

const INSTALL = "uv add lumis-sdk";

export function Hero() {
  return (
    <section className="hero dark-zone">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-aurora" aria-hidden="true" />
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
        <div className="section-intro" data-reveal="">
          <p className="eyebrow">A SMALL CORE / EXPLICIT BOUNDARIES</p>
          <h2>Framework primitives.<br />Your operating stack.</h2>
          <p>Lumis SDK supplies reusable semantics and safety controls while teams keep their monitoring, storage, model, workflow, and deployment choices.</p>
        </div>
        <div className="principle-grid" data-reveal="stagger">
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
        <div className="section-heading split-heading" data-reveal="">
          <div><p className="eyebrow">PORTS & ADAPTERS</p><h2>Compose recovery without vendor lock-in.</h2></div>
          <p>A strict domain holds incident and recovery meaning. Application services coordinate it through replaceable ports; local reference adapters—and independent plugins—connect the infrastructure you choose.</p>
        </div>
        <div className="architecture-board" data-reveal="">
          <div className="arch-column">
            <span className="arch-label">PROJECT ENTRY POINTS</span>
            <ArchNode name="Lumis SDK CLI" detail="init · doctor · diagnose · rules · plugins" />
            <ArchNode name="Python application" detail="diagnosis · evidence · lifecycle" />
            <ArchNode name="Strict configuration" detail="lumis.dev/v1 · checked schemas" />
          </div>
          <div className="arch-arrow" aria-hidden="true">→</div>
          <div className="arch-column core">
            <span className="arch-label">VENDOR-NEUTRAL CORE</span>
            <ArchNode name="Application services" detail="diagnose · propose · verify · learn" active />
            <ArchNode name="Domain contracts" detail="evidence · plans · approvals · truth" active />
            <ArchNode name="Provider ports" detail="model · memory · policy · audit" />
          </div>
          <div className="arch-arrow" aria-hidden="true">←</div>
          <div className="arch-column">
            <span className="arch-label">REFERENCE ADAPTERS</span>
            <ArchNode name="Deterministic rules" detail="legacy text + structured engine" />
            <ArchNode name="Evidence & redaction" detail="bounded local JSON · conservative" />
            <ArchNode name="Reports & memory" detail="Markdown · JSON · SQLite" />
            <ArchNode name="Plugin catalog" detail="postgres memory · HTTP evidence" />
          </div>
        </div>
        <div className="architecture-note" data-reveal=""><span className="blue-pixel" />Domain and application packages import no observability, orchestration, cloud, model-provider, or agent SDK. Independent plugins attach through ports—discovery never grants authority.</div>
      </div>
    </section>
  );
}

function ArchNode({ name, detail, active = false }: { name: string; detail: string; active?: boolean }) {
  return <div className={`arch-node ${active ? "active" : ""}`}><i /><div><strong>{name}</strong><span>{detail}</span></div><b>→</b></div>;
}

const stages = [
  ["Detect", "external / local input", "current"], ["Triage", "deterministic classification", "current"],
  ["Diagnose", "rules + optional model", "current"], ["Plan", "playbook proposals", "current"],
  ["Approve", "idempotent decisions", "current"], ["Remediate", "future RFC-gated work", "guard"],
  ["Verify", "explicit truth records", "current"], ["Learn", "confirmed memory", "current"],
];

export function Lifecycle() {
  return (
    <section className="paper-section lifecycle-section" id="lifecycle">
      <div className="shell">
        <div className="section-heading split-heading reverse light" data-reveal="">
          <p>Lumis SDK begins with reproducible diagnosis and ships typed contracts for planning, approval, verification, audit, and learning. Execution is intentionally absent from core.</p>
          <div><p className="eyebrow">DIAGNOSIS TODAY / HEALING OVER TIME</p><h2>A lifecycle designed for guarded autonomy.</h2></div>
        </div>
        <div className="lifecycle-track" data-reveal="stagger">
          {stages.map(([name, detail, state], index) => (
            <div className={`stage ${state}`} key={name}><span>0{index + 1}</span><i /><strong>{name}</strong><small>{detail}</small></div>
          ))}
        </div>
        <div className="guard-note" data-reveal=""><b>IMPLEMENTATION BOUNDARY</b><span>Blue stages ship today as code or typed contracts. Amber remediation remains future, RFC-governed work requiring allowlists, policy, approval, audit, limits, idempotency, and verification.</span></div>
      </div>
    </section>
  );
}

export function Framework() {
  return (
    <section className="framework dark-zone" id="framework">
      <div className="shell">
        <div className="section-heading split-heading" data-reveal="">
          <div><p className="eyebrow">THE OPEN FOUNDATION</p><h2>Small enough to understand. Open enough to extend.</h2></div>
          <p>Lumis SDK is the reusable framework layer—not a monitoring system, orchestrator, hosted control plane, or mandatory agent runtime.</p>
        </div>

        <div className="sdk-lumis" data-reveal="stagger">
          <div className="sdk-lumis-intro"><p className="eyebrow">OPEN SOURCE & MANAGED</p><h2>Lumis SDK stays useful on its own.</h2><p>Use the framework locally or self-host it. Move to Lumis by Qadim Labs when teams need a managed operating layer.</p></div>
          <div className="compare-panel"><span>LUMIS SDK</span><ul><li>Open-source framework</li><li>Local and self-hosted</li><li>Community adapters</li><li>Your infrastructure and policies</li></ul><Link href="/docs/project/lumis-and-sdk">Understand the boundary →</Link></div>
          <div className="compare-panel managed"><span>LUMIS</span><ul><li>Hosted team workflows</li><li>Managed integrations and memory</li><li>Approvals, audit, and runners</li><li>Enterprise deployment and support</li></ul><a href="https://lumis.qadimlabs.com">Explore Lumis ↗</a></div>
        </div>
      </div>
    </section>
  );
}

export function Research() {
  return (
    <section className="paper-section research-section" id="research">
      <div className="shell section-grid">
        <div className="section-intro" data-reveal="">
          <p className="eyebrow">FROM RESEARCH TO FRAMEWORK</p>
          <h2>Born in a paper.<br />Built in the open.</h2>
          <p>
            Lumis SDK implements the agentic recovery and incident response reference
            architecture proposed in research led by Solomon Eshun, the project&apos;s
            maintainer—together with the open-source contributors who join in.
          </p>
        </div>
        <a className="paper-card" data-reveal="" href="/research/agentic-self-healing-for-data-and-ai-pipelines.pdf" target="_blank" rel="noreferrer">
          <div className="paper-card-head"><span>RESEARCH PAPER</span><span className="paper-status">PREPRINT IN SUBMISSION</span></div>
          <h3>Agentic Self-Healing for Data &amp; AI Pipelines: An Affordable Vendor-Agnostic Architecture using Open-Source Software</h3>
          <p className="paper-authors">Solomon Eshun · et al. — ishango.ai / EnBW</p>
          <p className="paper-abstract">
            The paper finds the gap in self-healing pipelines is architectural rather than
            technological, and proposes a vendor-agnostic reference architecture combining
            monitoring, pipeline metadata, incident history, deterministic policy checks,
            AI-assisted diagnosis, approval workflows, and controlled remediation.
          </p>
          <span className="paper-cta">READ THE PAPER (PDF) ↓</span>
        </a>
      </div>
    </section>
  );
}

// Add new sessions here as they are recorded; the strip renders whatever is listed.
const learnSessions = [
  {
    tag: "VIDEO · COMING SOON",
    title: "Intro to Lumis SDK — your first deterministic diagnosis",
    detail: "Walking the simple-log-diagnosis cookbook from install to a confirmed resolution.",
    href: "/docs/learn/videos",
  },
];

export function Learn() {
  return (
    <section className="learn-strip dark-zone" id="learn">
      <div className="shell learn-inner">
        <div className="learn-intro" data-reveal="">
          <p className="eyebrow">LEARN / BUILD WITH LUMIS</p>
          <h2>Sessions, tutorials, and posts.</h2>
          <Link href="/docs/learn/videos">Browse all sessions →</Link>
        </div>
        <div className="learn-cards" data-reveal="stagger">
          {learnSessions.map((session) => (
            <Link className="learn-card" href={session.href} key={session.title}>
              <span>{session.tag}</span>
              <strong>{session.title}</strong>
              <p>{session.detail}</p>
            </Link>
          ))}
          <Link className="learn-card ghost" href="/docs/cookbooks/overview">
            <span>13 RUNNABLE COOKBOOKS</span>
            <strong>Prefer reading? Every cookbook is a self-contained walkthrough.</strong>
            <p>Synthetic, offline, and reproducible—from first diagnosis to guarded proposals.</p>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer dark-zone">
      <div className="shell footer-inner">
        <Brand />
        <p>Open-source primitives for guarded, agentic pipeline recovery.</p>
        <div>
          <Link href="/docs">Docs</Link>
          <a href="https://github.com/soloshun/lumis-sdk">GitHub</a>
          <a href="/llms.txt">llms.txt</a>
          <a href="https://github.com/soloshun/lumis-sdk/blob/main/LICENSE">Apache-2.0</a>
        </div>
      </div>
    </footer>
  );
}
