import Link from "next/link";
import { Brand } from "./brand";
import { CopyCode } from "./copy-code";

const REPO = "https://github.com/soloshun/lumis-sdk";
const PYPI = "https://pypi.org/project/lumis-sdk/";
const RESEARCH_NOTES = "https://github.com/soloshun/lumis-cookbooks/blob/main/gridcast/docs/research-notes.md";
const PAPER = "https://arxiv.org/abs/2608.01955";
const INSTALL = 'pip install "lumis-sdk[http,agent]"';

// The terminal check from docs/examples/small-project in the SDK repository (tested there).
const CHECK = `checks:
  - id: api-down
    terminal: true
    explains_entities: [service:api]
    hypothesis:
      id: api-unavailable
      statement: The API is down; both its scrape target
        and an external HTTP probe fail.
      causal_path: [service:api]
      evidence_needed: [api-up, api-probe]
      predictions:
        - {entity_id: "service:api", key: up, operator: eq, value: 0}
        - {entity_id: "service:api", key: probe_success, operator: eq, value: 0}
      falsifiers:
        - {entity_id: "service:api", key: up, operator: eq, value: 1}
        - {entity_id: "service:api", key: probe_success, operator: eq, value: 1}`;

export function Hero() {
  return (
    <section className="hero">
      <div className="shell hero-layout">
        <div>
          <p className="eyebrow">Open-source Python SDK · Apache-2.0</p>
          <h1>Incident investigation, <em>grounded in evidence.</em></h1>
          <p className="hero-lede">
            Lumis checks known failure signatures first, lets a bounded model investigate only when they
            are not enough, and tests every explanation against evidence it collected itself. It reads;
            it never acts. A person decides.
          </p>
          <div className="install"><code>{INSTALL}</code><CopyCode code={INSTALL} /></div>
          <div className="hero-actions">
            <Link className="button primary" href="/docs/quickstart">Get started</Link>
            <Link className="button" href="/docs/how-it-works">How it works</Link>
            <a className="button" href={REPO} target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
          <div className="hero-meta"><span>Python 3.11+</span><span>Read-only by design</span><span>Model optional</span></div>
        </div>
        <figure className="panel" style={{ margin: 0 }} aria-label="A deterministic check and the report it produced">
          <div className="panel-head"><span>lumis.yaml — one deterministic check</span><span>from the small-project guide</span></div>
          <pre><code>{CHECK}</code></pre>
          <div className="panel-head"><span>lumis incident … → report</span><span>both signals at 0</span></div>
          <ul className="report-lines">
            <li><b>finding api-down</b><span className="ok">match · terminal</span></li>
            <li><b>route</b><span>deterministic</span></li>
            <li><b>conclusion</b><span className="ok">supported_diagnosis</span></li>
            <li><b>model requests</b><span>0</span></li>
            <li><b>requires_human_review</b><span>true</span></li>
          </ul>
          <figcaption className="panel-foot">If the API is up the check is falsified; if data is missing it stays unknown. Neither is reported as a diagnosis.</figcaption>
        </figure>
      </div>
    </section>
  );
}

const STEPS = [
  ["Prepare", "Build an operational graph of your services from what you declare and what Lumis discovers, then scope it to the incident.", "Kubernetes · Prometheus · Tempo · Prefect"],
  ["Triage", "Test your known failure signatures against facts from operator-registered queries. A sufficient signature concludes with no model call.", "match · no_match · unknown"],
  ["Investigate", "Only if needed and enabled: one bounded model proposes explanations and asks for evidence by query ID. It cannot write queries or change anything.", "OpenRouter · OpenAI · Anthropic · Gemini"],
  ["Assess", "Every explanation's predictions and falsifiers are checked mechanically. A diagnosis needs supported explanations that agree on one cause.", "supported · contradicted · unresolved"],
] as const;

export function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="shell">
        <div className="section-head" data-reveal="">
          <p className="eyebrow">How it works</p>
          <h2>Checks first. A model only when needed. Evidence decides.</h2>
          <p>Every path ends in the same structured report for a person to review: what was found, what supports it, what contradicts it, and what is still unknown.</p>
        </div>
        <div className="steps" data-reveal="">
          {STEPS.map(([title, body, detail], index) => (
            <div className="step" key={title}><b>{index + 1}</b><h3>{title}</h3><p>{body}</p><small>{detail}</small></div>
          ))}
        </div>
        <p className="flow-note">Read-only throughout: there is no remediation executor. <Link className="text-link" href="/docs/how-it-works">Read the full walkthrough →</Link></p>
      </div>
    </section>
  );
}

const BARS = [
  ["A model given only the alert", 0.04, false],
  ["The same model plus the service graph", 0.18, false],
  ["One model call with curated evidence", 0.54, false],
  ["Lumis: triage, investigator, assessment", 0.89, true],
] as const;

export function Results() {
  return (
    <section className="section alt" id="results">
      <div className="shell results">
        <div data-reveal="">
          <p className="eyebrow">First results</p>
          <div className="section-head" style={{ marginBottom: 24 }}>
            <h2>Tested on a live estate with fifteen injected failures.</h2>
            <p>
              GridCast is an open reference estate we built: a demand-forecasting system on Kubernetes with
              Prometheus, Loki, Tempo, Prefect and PostgreSQL. We broke it fifteen ways and asked each system
              to find the cause of the same frozen incident.
            </p>
          </div>
          <div className="stat-row">
            <div className="stat"><strong>15</strong><span>failures injected through releases, config, vendors and data</span></div>
            <div className="stat"><strong>25 / 28</strong><span>runs where Lumis named the right component and mechanism</span></div>
            <div className="stat"><strong>7 / 8</strong><span>on the hard, silent faults, against 2 / 8 for one model call</span></div>
          </div>
          <Link className="text-link" href="/docs/evaluation">How it was measured, and what went wrong →</Link>
        </div>
        <div className="bars" data-reveal="">
          <h3>Correct root cause (component and mechanism)</h3>
          <p>Same model, DeepSeek v4 pro, for every model-based system. 28 runs each.</p>
          {BARS.map(([label, value, lumis]) => (
            <div className={`bar${lumis ? " lumis" : ""}`} key={label}>
              <span>{label}</span><i style={{ width: `${value * 100}%` }} /><b>{value.toFixed(2)}</b>
            </div>
          ))}
          <p className="caveat">
            A proof of concept, not a benchmark: one synthetic estate written by our team, one model, two runs
            per system per scenario. One scenario is excluded after we found a ground-truth leak. <a className="text-link" href={RESEARCH_NOTES} target="_blank" rel="noreferrer">Full research notes ↗</a>
          </p>
        </div>
      </div>
    </section>
  );
}

export function Boundaries() {
  return (
    <section className="section" id="boundaries">
      <div className="shell">
        <div className="section-head" data-reveal="">
          <p className="eyebrow">Scope</p>
          <h2>What the SDK does today, and what it does not.</h2>
          <p>Lumis is research software at version 0.1.0. It is useful for investigation now, and deliberately narrow.</p>
        </div>
        <div className="bounds" data-reveal="">
          <div className="bound yes"><h3>Included</h3><ul>
            <li>YAML-declared, read-only sources: Kubernetes, Prometheus, Loki, Tempo, Prefect, PostgreSQL, Git and rollout history</li>
            <li>An operational graph scoped to each incident</li>
            <li>Deterministic checks with strict rules for concluding</li>
            <li>One optional tool-using investigator with budgets</li>
            <li>Mechanical assessment and a structured, auditable report</li>
            <li>Local SQLite audit records and separate human resolutions</li>
          </ul></div>
          <div className="bound no"><h3>Not included</h3><ul>
            <li>Any action on your systems: no restarts, rollbacks or applied patches</li>
            <li>Automatic learning or promotion of new rules</li>
            <li>A hosted service, dashboard or alert receiver</li>
            <li>Confirmed root cause: &ldquo;supported&rdquo; means supported by evidence, not proven</li>
            <li>Evaluation beyond one estate and one model family</li>
          </ul></div>
        </div>
      </div>
    </section>
  );
}

const QUICK = `pip install "lumis-sdk[http,agent]"
lumis init --directory ./my-lumis
lumis doctor --project ./my-lumis/lumis.yaml
lumis incident --project ./my-lumis/lumis.yaml \\
  --incident ./my-lumis/incident.json \\
  --observations ./my-lumis/observations.json`;

export function Start() {
  return (
    <section className="section alt" id="start">
      <div className="shell start-grid">
        <div data-reveal="">
          <p className="eyebrow">Get started</p>
          <h2>Run your first investigation in a minute.</h2>
          <p>The scaffold is fully offline: no cluster, no API key, no model call. Then point it at one real service with the small-project guide.</p>
          <div className="hero-actions">
            <Link className="button primary" href="/docs/quickstart">Quickstart</Link>
            <Link className="button" href="/docs/small-project">Your first real project</Link>
          </div>
        </div>
        <div className="panel" data-reveal="">
          <div className="panel-head"><span>Terminal</span><CopyCode code={QUICK} /></div>
          <pre><code>{QUICK}</code></pre>
        </div>
      </div>
    </section>
  );
}

export function Research() {
  return (
    <section className="section" id="research">
      <div className="shell">
        <div className="section-head" data-reveal="">
          <p className="eyebrow">Research</p>
          <h2>Where Lumis comes from.</h2>
          <p>Lumis grew out of research into guarded, vendor-neutral self-healing. The SDK narrows that work to the part that can be tested today: investigation.</p>
        </div>
        <article className="paper" data-reveal="">
          <div>
            <span className="eyebrow">arXiv 2608.01955 · preprint</span>
            <h3>Agentic Self-Healing for Data &amp; AI Pipelines: An Affordable Vendor-Agnostic Architecture using Open-Source Software</h3>
            <p>Solomon Eshun et al. · August 2026. The broader architecture includes recovery and learning; the current SDK implements investigation only.</p>
          </div>
          <div className="paper-actions">
            <a className="button" href={PAPER} target="_blank" rel="noreferrer">Read on arXiv ↗</a>
            <a className="button" href="/research/agentic-self-healing-for-data-and-ai-pipelines.pdf" target="_blank" rel="noreferrer">Download PDF</a>
          </div>
        </article>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <Brand />
        <nav aria-label="Footer">
          <Link href="/docs">Docs</Link>
          <a href={REPO}>GitHub</a>
          <a href={PYPI}>PyPI</a>
          <a href={`${REPO}/blob/main/CHANGELOG.md`}>Changelog</a>
          <a href="/llms.txt">llms.txt</a>
          <a href={`${REPO}/blob/main/LICENSE`}>Apache-2.0</a>
        </nav>
      </div>
    </footer>
  );
}
