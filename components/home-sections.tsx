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
          <h1>Diagnosis-as-Code for <em>engineering systems.</em></h1>
          <p>
            Lumis SDK turns bounded incident evidence into structured diagnosis,
            reviewable reports, and inspectable operational memory—deterministic
            first, model optional, and local by default.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/docs/getting-started/quickstart">Get started <span>→</span></Link>
            <a className="button secondary" href="https://github.com/soloshun/lumis-sdk" target="_blank" rel="noreferrer">View on GitHub ↗</a>
          </div>
          <div className="install-line"><code><b>$</b> {INSTALL}</code><CopyCode code={INSTALL} /></div>
        </div>

        <div className="hero-instrument" aria-label="Lumis deterministic diagnosis flow">
          <div className="instrument-head"><span>FIG. 01 / LOCAL DIAGNOSIS</span><span className="live-dot">READY</span></div>
          <div className="event-card">
            <div className="event-meta"><span>INCIDENT / LOCAL-LOG</span><span className="severity">MEDIUM</span></div>
            <code>ERROR KeyError: customer_id</code>
          </div>
          <div className="flow-rail" aria-hidden="true"><span /><i /><span /><i /><span /></div>
          <div className="engine-row">
            <div><small>01</small><strong>NORMALIZE</strong><span>bounded evidence</span></div>
            <div className="active"><small>02</small><strong>MATCH RULE</strong><span>schema-change@1</span></div>
            <div><small>03</small><strong>REPORT</strong><span>review required</span></div>
          </div>
          <div className="result-card">
            <div><span className="result-kicker">DETERMINISTIC RESULT</span><span className="confidence">0.65 / authored</span></div>
            <strong>Upstream schema or normalization mapping may have changed.</strong>
            <p>Missing evidence: current schema · previous successful schema</p>
            <div className="truth"><span>TRUTH STATE</span><b>UNCONFIRMED_HYPOTHESIS</b></div>
          </div>
        </div>
      </div>
      <div className="hero-facts shell">
        <span>NO REQUIRED CLOUD</span><span>NO REQUIRED MODEL</span><span>NO DEFAULT TELEMETRY</span><span>NO CORE ACTION EXECUTOR</span>
      </div>
    </section>
  );
}

const principles = [
  ["Deterministic first", "Known signatures and project-owned rules run before any optional model reasoning."],
  ["Evidence grounded", "Facts, evidence, hypotheses, contradictions, confidence, and gaps remain distinguishable."],
  ["Model optional", "The core runs offline. Providers implement a narrow, explicit gateway contract."],
  ["Guarded recovery", "Plans are recommendations. Approval and verification remain explicit boundaries."],
];

export function Principles() {
  return (
    <section className="paper-section" id="principles">
      <div className="shell section-grid">
        <div className="section-intro">
          <p className="eyebrow">A SMALL CORE / EXPLICIT BOUNDARIES</p>
          <h2>Useful locally.<br />Replaceable by design.</h2>
          <p>Lumis SDK keeps incident semantics independent of your model provider, database, observability stack, cloud, or agent framework.</p>
        </div>
        <div className="principle-grid">
          {principles.map(([title, copy], index) => (
            <article className="principle" key={title}>
              <span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p>
            </article>
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
          <div><p className="eyebrow">PORTS & ADAPTERS</p><h2>The domain stays clean.</h2></div>
          <p>Entry points compose application services. Application services coordinate vendor-neutral domain contracts through replaceable ports.</p>
        </div>
        <div className="architecture-board">
          <div className="arch-column"><span className="arch-label">ENTRY POINTS</span><ArchNode name="CLI" detail="Typer composition" /><ArchNode name="Python API" detail="typed application" /></div>
          <div className="arch-arrow" aria-hidden="true">→</div>
          <div className="arch-column core"><span className="arch-label">FRAMEWORK CORE</span><ArchNode name="Application" detail="diagnosis · lifecycle" active /><ArchNode name="Domain" detail="incidents · evidence · truth" active /><ArchNode name="Ports" detail="replaceable interfaces" /></div>
          <div className="arch-arrow" aria-hidden="true">←</div>
          <div className="arch-column"><span className="arch-label">REFERENCE ADAPTERS</span><ArchNode name="Deterministic" detail="ordered rule engine" /><ArchNode name="SQLite" detail="local memory" /><ArchNode name="Markdown" detail="reviewable reports" /></div>
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
  ["Approve", "explicit decision", "contract"], ["Remediate", "no core executor", "guard"],
  ["Verify", "result contract", "contract"], ["Learn", "human-confirmed memory", "current"],
];

export function Lifecycle() {
  return (
    <section className="paper-section lifecycle-section">
      <div className="shell">
        <div className="section-heading split-heading light">
          <div><p className="eyebrow">GUARDED LIFECYCLE</p><h2>Autonomy has boundaries.</h2></div>
          <p>The roadmap follows the recovery lifecycle without overstating what ships. Today’s core is diagnosis-centered; action remains outside the framework.</p>
        </div>
        <div className="lifecycle-track">
          {stages.map(([name, detail, state], index) => (
            <div className={`stage ${state}`} key={name}><span>0{index + 1}</span><i /><strong>{name}</strong><small>{detail}</small></div>
          ))}
        </div>
        <div className="guard-note"><b>POLICY BOUNDARY</b><span>Any future executor requires an RFC, typed allowlists, approval, audit, limits, idempotency, and verification.</span></div>
      </div>
    </section>
  );
}

const cookbooks = [
  ["01", "Simple log diagnosis", "Run a complete local deterministic path from a synthetic failure log to Markdown report and SQLite memory.", "LOCAL · OFFLINE"],
  ["02", "Data pipeline investigation", "Investigate schema drift with bounded telemetry, lineage, code, and project-owned knowledge context.", "DATA · AGENT OPTIONAL"],
  ["03", "ML regression monitoring", "Review feature drift and model-performance evidence without granting production authority.", "ML · SYNTHETIC"],
  ["04", "Software-delivery CI", "Trace dependency, permission, and infrastructure-reference failures through an evidence-led workflow.", "CI · SYNTHETIC"],
];

export function Cookbooks() {
  return (
    <section className="cookbooks dark-zone" id="cookbooks">
      <div className="shell">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">EXECUTABLE LEARNING</p><h2>Start with a bounded incident.</h2></div>
          <p>Cookbooks are separate runnable projects: real Lumis SDK contracts, synthetic inputs, deterministic fallbacks, and explicit safety boundaries.</p>
        </div>
        <div className="cookbook-grid">
          {cookbooks.map(([id, name, copy, tag]) => (
            <article className="cookbook-card" key={id}>
              <div><span>{id}</span><small>{tag}</small></div><h3>{name}</h3><p>{copy}</p>
              <Link href="/docs/cookbooks/overview">Open cookbook guide <span>→</span></Link>
            </article>
          ))}
        </div>
        <div className="closing-cta">
          <div><p className="eyebrow">PRE-ALPHA / CONTRIBUTORS WELCOME</p><h2>Build recovery systems you can explain.</h2></div>
          <div><p>Apache-2.0 licensed, typed, local-first, and built in public.</p><div className="hero-actions"><Link className="button primary" href="/docs/getting-started/quickstart">Read the docs →</Link><a className="button secondary" href="https://github.com/soloshun/lumis-sdk" target="_blank" rel="noreferrer">Contribute ↗</a></div></div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer dark-zone"><div className="shell footer-inner"><Brand /><p>Open-source infrastructure for guarded incident recovery.</p><div><Link href="/docs">Docs</Link><a href="https://github.com/soloshun/lumis-sdk">GitHub</a><a href="https://github.com/soloshun/lumis-sdk/blob/main/LICENSE">Apache-2.0</a></div></div></footer>
  );
}
