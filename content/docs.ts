export type DocBlock =
  | { type: "p"; text: string }
  | { type: "note"; tone?: "blue" | "amber" | "green"; title: string; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "diagram"; code: string; caption?: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };
export type DocSection = { id: string; title: string; blocks: DocBlock[] };
export type DocPage = { slug: string; group: string; label: string; title: string; description: string; nested?: boolean; sections: DocSection[] };

export const SDK_VERSION = "dev · pre-1.0";
export const GITHUB_REPO = "https://github.com/soloshun/lumis-sdk";
export const SOURCE_DOCS = `${GITHUB_REPO}/blob/dev/docs`;
export const PAPER_URL = "https://arxiv.org/abs/2608.01955";
export const PAPER_PDF = "/research/agentic-self-healing-for-data-and-ai-pipelines.pdf";

const p = (text: string): DocBlock => ({type: "p", text});
const code = (language: string, value: string): DocBlock => ({type: "code", language, code: value});
const list = (...items: string[]): DocBlock => ({type: "list", items});
const note = (title: string, text: string, tone: "blue" | "amber" | "green" = "blue"): DocBlock => ({type: "note", title, text, tone});
const table = (headers: string[], rows: string[][]): DocBlock => ({type: "table", headers, rows});
const source = (filename: string) => p(`[Full SDK source reference](${SOURCE_DOCS}/${filename}) — this website summarizes the development interface. Pin a reviewed SDK commit for reproducible work.`);

export const docs: DocPage[] = [
  {
    slug: "overview", group: "Start here", label: "Overview", title: "Lumis SDK documentation",
    description: "Build evidence-grounded operational investigations with a vendor-neutral Python SDK: scoped context, falsifiable explanations, bounded tools, and human review.",
    sections: [
      {id: "purpose", title: "Understand the system before acting", blocks: [
        p("Lumis SDK turns an operational incident into a bounded investigation. It combines a prepared graph, registered observations, deterministic diagnostic signatures, and—when explicitly enabled—one tool-using investigator. Explanations are tested against evidence, not accepted because a model sounds confident."),
        note("Experimental development architecture", "The operational-intelligence reset is on the SDK dev branch. Source metadata currently says 0.1.0rc1, but this does not establish that the new architecture is published on a package index. Install a reviewed development checkout; interfaces may change.", "amber"),
        p("The public SDK stops at a structured human-review report. It does not repair production, apply generated patches, automatically ingest incidents, or promote learned rules. Supported means evidence support—not confirmed causality."),
      ]},
      {id: "reading-order", title: "A short reading path", blocks: [
        list("[Quickstart](/docs/quickstart): install the development checkout and run the offline scaffold.", "[Architecture and graph](/docs/architecture): understand contracts, identity, topology, and bounded preparation.", "[Incident investigation](/docs/investigation): review triage, investigator tools, evidence semantics, and reports.", "[Configuration](/docs/configuration) and [connectors](/docs/connectors): declare the estate and approve observations.", "[Python API and CLI](/docs/api): compose investigations, exports, and local audit storage.", "[Safety and evaluation](/docs/safety): qualify optional models, code inspection, and sandbox experiments.", "[Project and migration](/docs/project): contribute, understand the reset, and separate SDK capability from platform plans."),
      ]},
      {id: "principles", title: "Design principles", blocks: [
        table(["Principle", "Implementation"], [["Evidence first", "Operator-owned query catalog, typed observations, provenance, time-window validation."], ["Deterministic first", "Known signatures run before optional uncertain investigation."], ["Bounded investigation", "Graph, context, query, request, tool, probe, token, and time limits."], ["Model optional", "Local replay needs no API key. Explicit opt-in is required for paid model calls."], ["Inspectable outputs", "Findings, candidate assessments, redacted receipts, usage, stop reasons, and unresolved questions."], ["Human authority", "Reports remain unconfirmed; separate manual resolution records do not execute or certify changes."]]),
        p("Applications remain external. Your telemetry stack owns collection, your workflow engine owns execution, and Lumis uses approved read-only observations. GridCast and other cookbooks are external testbeds, not required SDK imports."),
      ]},
      {id: "source-of-truth", title: "Use the current source contracts", blocks: [p(`[SDK README](${GITHUB_REPO}/blob/dev/README.md), [review guide](${SOURCE_DOCS}/review-guide.md), and [schemas](${GITHUB_REPO}/tree/dev/schemas) are the detailed source references. This site covers the current operational interface rather than the retired self-healing modules. Use [llms.txt](/llms.txt) for a compact documentation index or [llms-full.txt](/llms-full.txt) for the complete site text.`)]},
    ],
  },
  {
    slug: "quickstart", group: "Start here", label: "Quickstart", title: "Run your first offline investigation",
    description: "Install Lumis SDK from dev, initialize a synthetic project, inspect its graph, and produce a human-review incident report without a model key or cluster.",
    sections: [
      {id: "install", title: "1. Install the development checkout", blocks: [
        p("Use Python 3.11–3.13 and uv. Clone the operational development branch; record the exact commit if you are evaluating or integrating it. An earlier PyPI artifact may contain a different architecture."),
        code("bash", `git clone --branch dev ${GITHUB_REPO}.git\ncd lumis-sdk\ngit rev-parse HEAD\nuv sync --all-groups\nuv run lumis --version\nuv run lumis --help`),
        note("No external system required", "This first run uses synthetic local contracts. It needs no consuming application, Kubernetes cluster, HTTP connector, model credential, or Docker daemon."),
      ]},
      {id: "initialize", title: "2. Create and inspect a project", blocks: [
        code("bash", "uv run lumis init --directory /tmp/lumis-demo\nuv run lumis doctor --project /tmp/lumis-demo/lumis.yaml\nuv run lumis discover --project /tmp/lumis-demo/lumis.yaml --report\nuv run lumis graph --project /tmp/lumis-demo/lumis.yaml --format terminal"),
        p("Choose an unused directory. Init creates lumis.yaml, incident.json, and observations.json without overwriting existing files. The project file uses JSON syntax, a valid YAML subset. Doctor validates local configuration and reports readiness warnings; it does not query a backend or validate live permissions."),
        p("The scaffold declares one service, a registered health query, a falsifiable candidate, and a nonterminal diagnostic check. Discovery is local for this project. With external sources enabled, a complete discovery report and valid canonical entity bindings are required before investigation."),
      ]},
      {id: "run", title: "3. Produce a human-review report", blocks: [
        code("bash", "uv run lumis incident \\\n  --project /tmp/lumis-demo/lumis.yaml \\\n  --incident /tmp/lumis-demo/incident.json \\\n  --observations /tmp/lumis-demo/observations.json"),
        table(["Expected field", "Meaning"], [["finding: match, terminal: false", "The synthetic health observation matches, but does not fully explain the incident."], ["route: human", "No optional agent is enabled; the report goes directly to an engineer."], ["conclusion: requires_human_expert", "More investigation is needed, not automatic recovery."], ["truth_state: unconfirmed_hypothesis", "An observation or candidate is not confirmed root cause."], ["requires_human_review: true", "Review is retained even on the deterministic path."]]),
        p("Omit --observations to test missing evidence. Missing data remains unknown rather than becoming a false measurement. The lower-level investigate command is a separate candidate/evaluation baseline; it is not the tool-agent workflow."),
      ]},
      {id: "audit", title: "4. Inspect and retain the artifacts", blocks: [
        code("bash", "uv run lumis incident \\\n  --project /tmp/lumis-demo/lumis.yaml \\\n  --incident /tmp/lumis-demo/incident.json \\\n  --observations /tmp/lumis-demo/observations.json \\\n  --store /tmp/lumis-demo/incidents.sqlite\nuv run lumis graph --project /tmp/lumis-demo/lumis.yaml \\\n  --format svg --output /tmp/lumis-demo/graph.svg\nuv run lumis console --project /tmp/lumis-demo/lumis.yaml"),
        p("SQLite writes are explicit. Duplicate incident IDs are refused instead of overwriting audit history; use a new ID for another stored run. SVG export refuses overwrite. The console is a small interactive menu; paid-agent permission defaults to no."),
      ]},
      {id: "next", title: "5. Add capabilities deliberately", blocks: [
        p("Install the http extra for endpoint-backed telemetry; the agent extra for the optional tool-using investigator. Configure a provider and tool-capable model explicitly, then use --use-agent only after reviewing access, privacy, and costs. Probes remain disabled until a dedicated container environment is approved."),
        code("bash", "uv sync --extra http --extra agent --all-groups\n# After configuring approved sources and explicit model settings:\nuv run lumis incident --project lumis.yaml --incident incident.json --use-agent"),
        p(`[Offline agent walkthrough](${GITHUB_REPO}/blob/dev/docs/notebooks/incident-agent.ipynb) and [graph notebook](${GITHUB_REPO}/blob/dev/docs/notebooks/operational-graph.ipynb) demonstrate the contracts with synthetic, deterministic inputs. The agent notebook uses a scripted model—not a measured live-model diagnosis.`), source("cli.md"),
      ]},
    ],
  },
  {
    slug: "architecture", group: "Understand", label: "Architecture & graph", title: "An independent operational investigation kernel",
    description: "Learn the Lumis SDK package structure, Pydantic contracts, NetworkX operational graph, identity conventions, discovery boundaries, and incident-scoped context.",
    sections: [
      {id: "flow", title: "The current investigation flow", blocks: [
        {type: "diagram", code: `flowchart TD\n I[Explicit incident and time window] --> P[Prepare topology and bind identities]\n P --> C[Scope graph and collect registered observations]\n C --> T[Deterministic triage]\n T -->|Sufficient known signature| R[Mechanically assessed report]\n T -->|Unknown or ambiguous| A{Agent explicitly enabled?}\n A -->|No| R\n A -->|Yes| B[One bounded investigator: inspect / probe]\n B --> R\n R --> H[Human review]\n H --> S[Optional separate human resolution record]`, caption: "No remediation executor or automatic rule learning follows this flow."},
        p("Python owns the workflow and authority boundaries. The optional investigator controls only uncertain exploration within the prepared context and approved tool catalog. No consuming application modules or injected fault labels enter the kernel."),
      ]},
      {id: "packages", title: "Package responsibilities", blocks: [
        table(["Package", "Responsibility"], [["core", "Validated incidents, entities, relationships, queries, evidence, hypotheses, assessments, and budgets."], ["graph", "NetworkX MultiDiGraph, identity normalization, bounded traversal, JSON/DOT/SVG/terminal views."], ["connectors", "Read-only topology and observation adapters; optional dependencies stay outside core imports."], ["checks", "Conservative signatures and caller-owned TriageGuard sufficiency."], ["reasoning / models", "Candidate sources, deterministic assessment, and optional single-completion model adapters."], ["investigation", "One reference Pydantic AI investigator, scoped tools, receipts, and typed reports."], ["sandbox", "Opt-in resource-limited Docker experiments against approved copied source."], ["runtime", "YAML preparation, discovery, incident handling, scaffold, and SQLite records."], ["security / cli", "Conservative redaction and explicit public composition."]]),
      ]},
      {id: "graph", title: "A graph for context, not causal proof", blocks: [
        p("Pydantic validates portable GraphSnapshot contracts; NetworkX MultiDiGraph preserves directed parallel relationship kinds. The graph primarily scopes reasoning. Visualization is optional, no graph database is required, and a connected path does not prove a causal explanation."),
        table(["Identity or edge", "Convention"], [["Logical service", "service:<namespace>:<name> from approved app labels, OTLP, or service-graph metrics."], ["Kubernetes resource", "k8s:<namespace>:<kind>:<name>; stays distinct from the logical service."], ["hosts", "Resource → logical service; does not assert a runtime call."], ["serves", "Server/dependency → client/caller. Upstream of frontend includes its database."], ["Declared lineage", "Dataset → job → dataset via feeds/produces with explicit provenance."], ["Aliases", "Explicit raw ID → canonical ID reconciliation; no guessed bare-name joins."]]),
        p("Aliases with cycles, incompatible kinds, or conflicting metadata fail validation. Namespaces prevent accidental cross-estate joins. Business context can enrich declared entities without granting action authority."),
      ]},
      {id: "traversal", title: "Bounded traversal and exports", blocks: [
        code("python", 'from lumis_sdk.runtime import YamlProject\n\nprepared = await YamlProject.from_file("lumis.yaml").prepare()\ngraph = prepared.graph\nupstream = graph.upstream_of("service:demo", hops=3, max_entities=100)\nlocal = graph.dependencies_within("service:demo", hops=2, max_entities=100)\nscoped = graph.scope(["service:demo"], hops=2, max_entities=100)\nnx_copy = graph.to_networkx()\ndot = graph.to_dot()'),
        p("Use top-level await in notebooks; wrap awaited code with asyncio.run(main()) in an ordinary script. Upstream/downstream return sorted ID tuples excluding the seed. Scope includes seeds and traverses both directions; hops=0 retains only seeds. Cycles terminate, and unknown IDs or entity overflow fail instead of truncating. Exports are independent deep copies."),
      ]},
      {id: "discovery", title: "Preparation is a separate bounded step", blocks: [
        p("prepare() merges declared topology and explicitly enabled sources, then strictly binds graph/query references. Discovery has separate estate-size and time limits. An enabled source failure yields a sanitized incomplete report and stops preparation; a partial graph is diagnostic only. Investigation does not silently proceed with it."),
        p("Evidence-query failure during investigation is different: it is audited and may lead to abstention. Retaining a PreparedProject explicitly reuses a snapshot; it does not refresh topology. Live Kubernetes reads current resources, not historical cluster state. Archive normalized inputs externally for reproducible replay."),
        note("Structure and changes are distinct", "Local OTLP exports, scoped Tempo trace topology, Prefect topology, and declared dataset/job relationships are supported. Recent Git commits and Kubernetes rollouts are time-bounded evidence about graph entities, not extra causal-path nodes. A live OTLP receiver, OpenLineage ingestion, temporal graph history, and recent_changes_affecting are not current graph APIs.", "amber"), source("architecture.md"), source("graph.md"),
      ]},
    ],
  },
  {
    slug: "investigation", group: "Understand", label: "Incident investigation", title: "Test competing explanations against evidence",
    description: "Understand deterministic triage, terminal sufficiency, bounded inspect/probe tools, falsifiable hypotheses, mechanical assessments, report semantics, and human resolution.",
    sections: [
      {id: "triage", title: "Known signatures before uncertain reasoning", blocks: [
        p("checks are diagnostic signatures expressed as hypotheses with predictions and falsifiers. Each finding is match, no_match, or unknown. Missing, degraded, conflicting, or failed observations never become a clean match. A failed tool call is not a false measurement."),
        p("A terminal signature must explicitly set terminal: true and explains_entities; predict at least two distinct entity/key observables with independently supplied evidence; be supported with no matching falsifier; cover every affected entity; and leave all other in-scope signatures contradicted. An optional caller-owned TriageGuard can require more."),
        note("Two observations are a minimum, not causal proof", "The SDK's structural sufficiency check does not establish statistical independence. Operators choose discriminating evidence. A symptom such as OOM termination may remain nonterminal because it does not distinguish a leak from a larger batch or a changed memory limit.", "amber"),
        p("A sufficient signature returns a report without creating a provider, reading code, or running a probe. Ambiguous, nonterminal, competing, or unknown findings route to the optional investigator when enabled; otherwise they route to a human."),
      ]},
      {id: "hypotheses", title: "What makes an explanation testable?", blocks: [
        table(["Hypothesis field", "Purpose"], [["id / statement", "Stable candidate identity and a falsifiable explanation."], ["causal_path", "References to entities in the prepared incident graph, not certified causality."], ["evidence_needed", "Registered query IDs whose entity/key observations cover the checks."], ["predictions", "Observations expected if the explanation holds."], ["falsifiers", "Observations that would contradict the explanation."]]),
        code("yaml", 'checks:\n  - id: service-health\n    terminal: false\n    hypothesis:\n      id: unavailable\n      statement: Service unavailability may explain the failure.\n      causal_path: ["service:demo"]\n      evidence_needed: [health]\n      predictions:\n        - {entity_id: "service:demo", key: healthy, operator: eq, value: false}\n      falsifiers:\n        - {entity_id: "service:demo", key: healthy, operator: eq, value: true}'),
        p("Merge this into a complete project containing service:demo and the health query. rule_hypotheses belongs to the lower-level candidate-source baseline; it is not a triage sufficiency gate. Put primary incident signatures in checks."),
      ]},
      {id: "tools", title: "One investigator, two tool families", blocks: [
        table(["Operation", "Authority"], [["inspect / catalog", "Discover scoped query IDs, approved files, and enabled capabilities."], ["inspect / graph", "Read a one-hop neighborhood within the already scoped incident graph."], ["inspect / evidence", "Call a registered query ID; never invent PromQL, LogQL, TraceQL, or SQL."], ["inspect / changes", "List configured recent commits/rollouts touching scoped entities, newest first."], ["inspect / code.read, code.search", "Read or literal-search an explicit allowlist of approved text files."], ["inspect / git.log, git.diff", "Fixed read-only local commands and full-SHA diffs on approved paths."], ["inspect / hypothesis.register", "Validate and bind a candidate before probing; revisions require a new identity."], ["probe", "Test a registered candidate/query in an explicitly enabled resource-limited container."]]),
        p("Tool arguments and final candidates are validated against graph IDs, the query catalog, and known evidence/receipt references. The reference agent can repair rejected arguments/output up to validation_retries; retries still consume budgets. The handler validates again and drops invalid candidates and dependent suggestions while retaining valid results and rejection reasons."),
      ]},
      {id: "assessment", title: "Mechanical support, contradiction, and uncertainty", blocks: [
        p("Every prediction must be supported and every falsifier false for a candidate to be supported. Contradiction takes precedence. Conflicting values, missing checks, degraded facts, or incompatible scalar types leave checks unresolved. A boolean is not treated as the number 1."),
        table(["State", "Interpretation"], [["supported", "Usable observations support predictions and reject falsifiers; not causal confirmation."], ["contradicted", "At least one prediction fails or a falsifier is supported."], ["unresolved", "Evidence is missing, degraded, conflicting, or insufficient to decide."]]),
        p("Model-authored probe output is quality: degraded. It can guide a human or further investigation, but cannot certify independent production evidence or a supported diagnosis. A model could simply print its expected result."),
      ]},
      {id: "reports", title: "Reports keep the uncertainty visible", blocks: [
        p("IncidentReport retains context, triage findings, mechanically assessed candidates, redacted receipts, tentative suggestions, unresolved questions, route, stop reason, and request/token/tool/query/probe usage. It does not retain raw chain-of-thought or the full provider conversation. Caller-side PydanticInvestigator.messages is an in-memory evaluation surface, not report content."),
        table(["Report field", "Values / meaning"], [["route", "deterministic, agent, or human."], ["conclusion", "supported_diagnosis, insufficient_evidence, or requires_human_expert."], ["truth_state", "Always unconfirmed_hypothesis in the current incident contract."], ["requires_human_review", "Always true."], ["stop_reason", "Distinguishes completion, budget exhaustion, invalid output, deadline, or rejected/unavailable investigator."]]),
        p("A supported_diagnosis additionally requires viable candidates to agree on one root cause. A resource that hosts a service is treated as that service for this comparison. Competing supported roots yield insufficient_evidence and remain listed as unresolved questions; the SDK does not invent a ranking. Unresolved viable candidates also prevent a supported diagnosis."),
        p("Provider failures and budget exhaustion preserve collected evidence, receipts, and registered candidates for assessment. Without a final answer there are no final suggestions. Patch text is a tentative suggestion only; it is never applied."),
      ]},
      {id: "resolutions", title: "Human outcomes are separate attestations", blocks: [
        p("IncidentStore saves immutable report/evidence/receipt rows atomically in SQLite. A HumanResolution records id, incident_id, reviewer, timezone-aware recorded_at, summary, applied_change, outcome (resolved / not_resolved / inconclusive), and optional evidence references. Only a human calls record_resolution after the incident is stored."),
        note("Recording is not verification or learning", "A manual attestation does not update diagnostic truth, execute a change, establish causality, or promote a rule. Apply and verify any operational change outside the SDK.", "amber"), source("incident-investigation.md"),
      ]},
    ],
  },
  {
    slug: "configuration", group: "Build", label: "YAML configuration", title: "Configure an explicit, read-only investigation",
    description: "Reference for the lumis.dev/operational-v1alpha1 YAML schema, query catalog, incident observations, discovery bounds, investigator settings, and optional model configuration.",
    sections: [
      {id: "contract", title: "A strict project contract", blocks: [
        p("The active api_version is lumis.dev/operational-v1alpha1. Unknown fields, duplicate mapping keys, aliases, excessive nesting, and documents over 1 MiB are refused. Identifiers and endpoints are explicit strings; checks use native booleans or matching scalar types. Incident and observation timestamps are timezone-aware."),
        code("yaml", 'api_version: lumis.dev/operational-v1alpha1\nproject: {name: demo-estate, environment: local}\npolicies: {default_action_mode: read_only}\nobservations_file: observations.json\ngraph:\n  entities:\n    - {id: "service:demo", kind: service, name: Demo service}\n  relationships: []\nqueries:\n  - id: health\n    provider: snapshot\n    entity_id: service:demo\n    key: healthy\n    description: Was the service healthy during the incident?\ninitial_query_ids: [health]\nchecks:\n  - id: service-health\n    terminal: false\n    hypothesis:\n      id: unavailable\n      statement: Service unavailability may explain the failure.\n      causal_path: ["service:demo"]\n      evidence_needed: [health]\n      predictions:\n        - {entity_id: "service:demo", key: healthy, operator: eq, value: false}\n      falsifiers:\n        - {entity_id: "service:demo", key: healthy, operator: eq, value: true}'),
        p("This is an offline project fragment with one nonterminal signature. Supply a valid incident and observations; use init to generate both. Validate edits with lumis doctor. read_only is the only accepted action mode; approval_required does not enable a hidden executor."),
      ]},
      {id: "fields", title: "Project fields and evidence identity", blocks: [
        table(["Field", "Meaning"], [["sources", "Explicitly enabled topology/observation connectors; disabled by default."], ["identity.aliases", "Raw discovered ID → compatible canonical ID, without chains or cycles."], ["discovery", "Separate estate preparation limits."], ["graph", "Unique entities and relationships with declared direction and provenance."], ["queries", "Unique operator-owned provider/entity/key/description/parameters catalog."], ["initial_query_ids", "Observations collected before generation; share the investigation query budget."], ["checks", "Known diagnostic signatures for incident triage."], ["rule_hypotheses", "Candidate-only baseline source; does not end incident triage."], ["models / investigator", "Explicit optional model and scoped tool-agent settings."], ["observations_file", "Replay facts relative to the project directory; explicit observations override it."]]),
        p("Incident fields are id, affected_entities, symptoms, started_at, ended_at. Evidence fields are id, query_id, entity_id, key, scalar value, observed_at, source, retrieval_method, and quality (observed or degraded). Observation identity must match the registered query, and time must fall within the incident window. Evidence provenance is operator-owned."),
        p("Check operators are eq, ne, gt, ge, lt, le. Ordered comparisons require numeric, nonboolean values. Query/check references must exist; discovered membership is bound during preparation. Doctor success alone is not proof external identities exist."),
      ]},
      {id: "budgets", title: "Preparation and investigation budgets", blocks: [
        code("yaml", 'discovery:\n  timeout_seconds: 30\n  max_entities: 5000\n  max_relationships: 10000\n  max_service_graph_series: 1000\n  max_response_bytes: 2000000\nbudget:\n  graph_hops: 3\n  max_entities: 100\n  max_queries: 8\n  max_hypotheses: 5\n  max_model_output_tokens: 3000\n  max_context_characters: 20000\n  query_timeout_seconds: 10\n  source_timeout_seconds: 30\n  total_timeout_seconds: 120'),
        p("These are example limits, not performance claims. Overflow is refused instead of silently truncating topology. Triage and agent evidence reads share query limits; cached repeated queries reuse evidence, and failed observations are not retried invisibly. Preparation and investigation have independent deadlines."),
      ]},
      {id: "agent", title: "Optional investigator settings", blocks: [
        code("yaml", 'models:\n  provider: openrouter\n  model: your-provider/your-tool-capable-model\n  api_key_env: OPENROUTER_API_KEY\ninvestigator:\n  budget:\n    request_limit: 8\n    tool_calls_limit: 10\n    max_probes: 2\n    output_tokens_limit: 12000\n    max_tool_characters: 8000\n    max_total_tool_characters: 32000\n    validation_retries: 2\n  repositories:\n    - id: application\n      root: ./approved-source\n      entity_ids: ["service:demo"]\n      files: [src/handler.py, pyproject.toml]\n      include_commit_subjects: false\n  sandbox:\n    enabled: false'),
        p("This does not call a model. Install the agent extra and explicitly pass use_agent=True or --use-agent. All mapped repository entities must belong to incident scope. Every tool attempt, including denial or malformed arguments, consumes the broker budget. Keep files reviewed, narrowly scoped, and free of secrets."),
        p("Provider choices are openrouter, openai, anthropic, gemini; default credential names are OPENROUTER_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY. There is no default model ID or cross-provider fallback. Optional reasoning is minimal, low, medium, or high; omission keeps the provider default. Baseline --use-model is distinct from --use-agent."), source("configuration.md"), source("models.md"),
      ]},
    ],
  },
  {
    slug: "connectors", group: "Build", label: "Connectors & telemetry", title: "Connect observations, not unrestricted commands",
    description: "Configure scoped Kubernetes discovery, OTLP exports, Prometheus, Loki, Tempo, Prefect, normalized snapshots, and approved code/Git for Lumis incident investigations.",
    sections: [
      {id: "boundary", title: "Keep the application independent", blocks: [
        p("Instrument your application using standard telemetry. Configure Lumis externally, declare canonical graph identities, register discriminating queries, and provide an explicit incident window. The model requests query IDs; it does not rewrite endpoints, selectors, credentials, limits, or operational commands."),
        table(["Source", "Current capability"], [["Snapshots", "Local normalized GraphSnapshot and Evidence contracts; offline replay."], ["Kubernetes", "Read-only context/namespace-scoped services, deployments, pods, ReplicaSets; resource-to-service identity bridges."], ["OpenTelemetry", "Bounded local resourceSpans JSON export normalization; not a live receiver."], ["Prometheus", "Instant scalar/single-series observations; existing service-graph metrics can add topology."], ["Loki", "Incident-window registered LogQL entries/count queries."], ["Tempo", "Scoped TraceQL search, explicit/searched trace span reads, bounded observed topology."], ["Prefect", "Allowlisted flow/task observations and optional observed workflow/task topology."], ["Code / Git", "Explicit allowlisted text snapshots, literal search, bounded local log and full-SHA diff."]]),
        note("Qualification is separate from implementation", "Connector tests and limited read-only transport checks do not prove representative live diagnosis, complete telemetry, or all cookbook scenarios. Verify scope, identities, permissions, query semantics, privacy, and coverage in your estate.", "amber"),
      ]},
      {id: "topology", title: "Start with scoped topology", blocks: [
        code("yaml", 'sources:\n  kubernetes:\n    enabled: true\n    context: my-approved-context\n    namespace: my-estate\n  opentelemetry:\n    enabled: true\n    export_file: ./telemetry/traces.json'),
        p("Merge source examples into a complete project. Kubernetes requires kubectl and read access; no all-namespace scan, environment/secret extraction, kubeconfig edit, or workload mutation occurs. OTLP export paths are relative to YAML. Port 4317 is ingestion, not an observation retrieval API. Query Tempo for traces or use an export file."),
        p("An enabled topology source failure blocks preparation. Declared metadata enriches what discovery cannot know, but does not grant actions. Prometheus topology needs existing service-graph metrics, explicit estate namespace, and a scoped vector expression; arbitrary up metrics cannot reveal a call graph."),
      ]},
      {id: "metrics", title: "Register discriminating observations", blocks: [
        code("yaml", 'sources:\n  prometheus:\n    enabled: true\n    endpoint: http://localhost:9090\nqueries:\n  - id: service-up\n    provider: prometheus\n    entity_id: service:demo\n    key: up\n    description: Availability at incident end\n    parameters:\n      promql: \'min(up{job="demo"})\''),
        p("The instant query runs at incident end and needs one finite scalar or one vector series; operators aggregate explicitly. A backend outage, malformed response, or empty result supplies no fact. Register queries in initial_query_ids or a check to use them without an agent."),
      ]},
      {id: "logs-traces-workflows", title: "Loki, Tempo, and Prefect", blocks: [
        code("yaml", 'sources:\n  loki:\n    enabled: true\n    endpoint: https://approved-log-gateway.example\n    headers_env:\n      Authorization: LUMIS_LOKI_AUTHORIZATION\n      X-Scope-OrgID: LUMIS_LOKI_TENANT\n    max_results: 50\n  tempo:\n    enabled: true\n    endpoint: http://localhost:3200\n    max_results: 50\n  prefect:\n    enabled: true\n    endpoint: http://localhost:4200/api\n    flow_names: [daily-forecast]\n    max_results: 50'),
        p("Loki/Tempo endpoints must be query frontends, not ingestion distributors. Prefect uses its API base, including /api and any account/workspace prefix. Endpoint credentials, query strings, and fragments are refused. Environment header references resolve only for the configured source and fail closed when absent; never place tokens in YAML."),
        table(["Provider", "Registered parameters / observations"], [["loki", "logql; output entries or count. Require a nonempty exact stream label matcher."], ["tempo", "traceql with exact resource scope; output entries/duration_ms/spans, or trace_id for explicit spans."], ["prefect", "Allowlisted flow_name; flow_runs or task_runs with explicit flow_run_id; entries, failed_count, max_duration_ms."]]),
        p("Log counts are not failure rates, trace matches are not population percentiles, and returned samples are not silently averaged. Prefect queries read current state for runs started within the incident with in-window state timestamps; they cannot reconstruct all historical or preexisting long-running jobs. Filter POST requests are read-only."),
      ]},
      {id: "limits", title: "Bounds and incomplete evidence", blocks: [
        p("Loki/Tempo/Prefect have item, byte, request, and deadline limits; no hidden retries, redirects, or implicit pagination. Empty results produce no invented zero. Capped observations are degraded and cannot certify triage. Narrow a query/window instead of treating a truncated result as complete."),
        p("Tempo topology joins observed cross-service parents within explicit namespace/time scope. Missing parents create no fabricated edge. Prefect can build observed flow/task containment and feeds edges; neither guarantees complete lineage or historical replay."),
        p("The current development SDK also includes read-only PostgreSQL evidence via the sql extra. It is an observation adapter, not an action or arbitrary model SQL tool."),
        code("yaml", 'sources:\n  sql:\n    enabled: true\n    dsn_env: ESTATE_READONLY_DSN\n    statement_timeout_ms: 5000\n    connect_timeout_seconds: 5\nqueries:\n  - id: incident-events\n    provider: sql\n    entity_id: service:demo\n    key: event_count\n    description: Registered event count during the incident\n    parameters:\n      sql: >-\n        SELECT count(*) FROM operational_events\n        WHERE at >= %(started_at)s AND at <= %(ended_at)s'),
        p("Install with uv sync --extra sql. Replace the example table and query with reviewed SELECT-only access. Each query is one SELECT/WITH statement returning exactly one row/column (number, boolean, or redacted text); NULL supplies no observation. Only started_at/ended_at parameters are accepted. Read-only transactions are rolled back and bounded by a timeout, but are not a permission boundary: use a database role that can only SELECT approved tables. The DSN is read from the named environment variable, never inline YAML."),
        p("OpenLineage ingestion, automatic incident subscription, and remediation connectors remain future work. For unsupported observations, provide reviewed normalized facts through the public contract; do not let the model manufacture missing evidence."), source("telemetry-connectors.md"), source("integrations.md"),
      ]},
      {id: "changes", title: "Recent changes as checkable evidence", blocks: [
        p("sources.changes attributes recent Git commits and Kubernetes rollouts to existing graph entities. inspect(changes) lists records in incident scope; a registered provider: changes query makes them usable in predictions/falsifiers. A change is evidence about a service, not a graph node or proof it caused the incident."),
        code("yaml", 'sources:\n  changes:\n    enabled: true\n    lookback_seconds: 3600\n    max_records: 50\n    git:\n      - id: gitops\n        root: ../gitops\n        paths:\n          services/demo/: ["service:demo"]\nqueries:\n  - id: demo-changes\n    provider: changes\n    entity_id: service:demo\n    key: release_changes_30m\n    description: Recent mapped changes before incident end\n    parameters: {output: count, lookback_seconds: "1800"}'),
        p("count returns mapped changes in the lookback; an empty Git history can supply a zero, while expired Kubernetes history is incomplete. seconds_since_latest returns the newest change age; absence supplies no age fact. Capped records degrade count evidence. Repository path mappings are operator-owned, with optional conventional-commit scope mappings."),
        p("Set kubernetes_rollouts: true only with the scoped Kubernetes source enabled. New ReplicaSet creation records a rollout; rollback/reactivation is visible through expiring ScalingReplicaSet events, not old creation timestamps. Scaling a Deployment alone is not a rollout. Git is the durable record; Kubernetes can confirm the change reached the cluster. Any unreadable backend makes change history unavailable rather than silently partial."),
      ]},
    ],
  },
  {
    slug: "api", group: "Build", label: "Python API & CLI", title: "Compose the incident API, CLI, and audit store",
    description: "Use YamlProject.handle_incident, prepared operational graphs, IncidentStore, manual HumanResolution records, CLI exports, and bounded extension protocols.",
    sections: [
      {id: "python", title: "The recommended Python incident API", blocks: [
        code("python", 'import asyncio\nfrom pathlib import Path\nfrom lumis_sdk.core import Incident\nfrom lumis_sdk.runtime import YamlProject, IncidentStore\n\nasync def main():\n    workspace = Path("/tmp/lumis-demo")\n    incident = Incident.model_validate_json(\n        (workspace / "incident.json").read_text()\n    )\n    project = YamlProject.from_file(workspace / "lumis.yaml")\n    report = await project.handle_incident(incident)\n    # Set observations_file in YAML to replay facts automatically.\n    print(report.conclusion, report.truth_state)\n    assert report.requires_human_review\n    IncidentStore(workspace / "incidents.sqlite").save(report)\n\nasyncio.run(main())'),
        p("from_file validates local configuration only. handle_incident prepares enabled sources at incident end, binds references, scopes context, runs triage, and returns a report. Pass observations=tuple_of_Evidence to override replay, or observations=() to force missing evidence. No paid model is called without use_agent=True or an explicitly injected investigator."),
        p("In a notebook use top-level await, not asyncio.run inside the active event loop. Optional investigator, guard, runner, and HTTP client injection are trusted caller-owned extension ports—not permissions a model can reconfigure. The caller owns and closes an injected client."),
      ]},
      {id: "prepared", title: "Prepare a snapshot deliberately", blocks: [
        code("python", 'prepared = await project.prepare(at=incident.ended_at)\nprint(prepared.discovery.complete)\nprint([(s.name, s.status) for s in prepared.discovery.sources])\nprint(prepared.graph.upstream_of(incident.affected_entities[0]))\nreport = await prepared.handle_incident(incident)'),
        p("Reuse PreparedProject only when you intend the same topology snapshot; call prepare again for fresh discovery. DiscoveryError.report retains sanitized per-source acquisition statuses. Unresolved discovered references fail before investigation. No global graph cache or historical Kubernetes reconstruction is implied."),
      ]},
      {id: "commands", title: "CLI reference", blocks: [
        table(["Command", "Effect"], [["init --directory PATH", "Create fresh offline project, incident, and observations files."], ["doctor --project FILE", "Local validation/readiness warnings; no live network or paid request."], ["discover --project FILE --report", "Declared/discovered graph plus source statuses; incomplete discovery is nonzero."], ["graph --project FILE --entity ID --hops N", "Bounded neighborhood; json, dot, svg, or terminal format."], ["incident --project FILE --incident FILE", "Primary triage/investigator/report workflow."], ["incident ... --use-agent", "Explicit paid-model permission after inconclusive triage."], ["incident ... --observations FILE --store FILE", "Replay facts and explicitly save an immutable-ID incident report."], ["console --project FILE", "Interactive doctor, source, graph, and incident menu."], ["record-resolution --store FILE --resolution FILE --confirm", "Explicit human attestation for an existing stored incident."], ["investigate ... --use-model", "Lower-level candidate/evaluation baseline with one optional model completion."]]),
        p("Graph SVG/terminal exports are bounded views; JSON/DOT retain the multigraph. The image renderer needs no Graphviz. Machine-readable commands stay undecorated, and no command applies a patch, restarts a service, or promotes a rule."),
      ]},
      {id: "storage", title: "Immutable audit and manual resolutions", blocks: [
        p("IncidentStore.save(report) commits incident, evidence, and receipt rows atomically. Duplicate incident IDs fail; a fresh run needs a fresh ID. HumanResolution is append-only and separate from diagnosis. Protect files through appropriate access, retention, and backup controls; SQLite storage is not a multi-tenant hosted service."),
        code("json", '{\n  "id": "review-001",\n  "incident_id": "demo-001",\n  "reviewer": "operator",\n  "recorded_at": "2026-10-04T12:00:00Z",\n  "summary": "Reviewed the report and tested the change externally.",\n  "applied_change": "Manual operator change; not executed by Lumis.",\n  "outcome": "inconclusive",\n  "evidence_references": []\n}'),
        p("Replace example IDs with an actually stored incident. Record only what the operator observed. This does not turn supported into confirmed, and does not create automatically retrievable or learned rules."),
      ]},
      {id: "extensions", title: "Lower-level extensions and comparison baseline", blocks: [
        table(["Interface", "Boundary"], [["Investigator", "Caller-provided uncertain investigation; output is still validated by the handler."], ["EvidenceConnector", "async collect(query, incident) → tuple[Evidence, ...]; approved bounded read-only observation."], ["HypothesisSource", "async propose(context) → tuple[Hypothesis, ...]; shared validation and assessment."], ["RuleSource / MemoryHypothesisSource", "Declared or caller-retrieved candidates, not automatic memory retrieval/learning."], ["HypothesisModel / ModelHypothesisSource", "Single-completion candidate generation, no tool-agent or action authority."], ["ProbeRunner / TriageGuard", "Trusted application implementations requiring their own safety review."]]),
        p("YamlProject.investigate returns the baseline Investigation with assessments, trace, outcome (supported / abstained / hypotheses_ready), stop reason, and unconfirmed_hypothesis truth state. Use it for comparisons, not as a synonym for handle_incident. The baseline InvestigationStore and IncidentStore records are distinct; there is no automatic old-schema migration."), source("python-api.md"), source("cli.md"),
      ]},
    ],
  },
  {
    slug: "safety", group: "Understand", label: "Safety & evaluation", title: "Bound access, preserve uncertainty, qualify the result",
    description: "Review model opt-in, source allowlists, redaction, isolated diagnostic sandbox limits, abstention, audit receipts, and independent evaluation of Lumis SDK investigations.",
    sections: [
      {id: "models", title: "Optional models do not own the decision", blocks: [
        p("The recommended investigator is one Pydantic AI agent with explicit provider/model credentials. OpenRouter is the default configured provider; native OpenAI, Anthropic, and Gemini are available. The core works without a model. No default model ID, configuration-time paid request, or cross-provider fallback occurs."),
        p("The baseline generate interface returns structured candidates in one completion. The reference agent instead uses a bounded tool loop. Both paths validate graph/query references and candidate contracts locally; model confidence is never authority. Qualify real tool/schema support, costs, privacy, and quality separately."),
        p("OpenAI response storage is disabled by the implementation, but that does not override provider retention policy. Provider conversations are not written to IncidentReport. Review any caller-retained messages and artifacts. Heuristic redaction is not a guarantee arbitrary data is safe to export."),
      ]},
      {id: "code-access", title: "Allowlisted code and fixed Git reads", blocks: [
        p("Operators approve repository roots, mapped entities, and exact text files. Snapshots are captured once per repository per investigation, redacted, and hashed. Traversal, symlinks, special/binary/oversized files, unapproved extensions, and secret/dot directories are refused. Consumer modules are never imported."),
        p("Git commands are local and read-only; diffs disable external diff/textconv and hooks. Commit subjects are excluded from basic log inspection unless include_commit_subjects is explicitly true, then redacted/truncated and still untrusted. Typed recent-change records use separate configured path/entity mappings. Neither interface grants an unrestricted shell."),
      ]},
      {id: "sandbox", title: "Diagnostic experiments are not production actions", blocks: [
        p("The probe runner uses an explicitly enabled ephemeral Docker container, an approved digest-pinned preloaded Python image, no host mounts, no network, no forwarded environment, read-only root, unprivileged user, dropped capabilities, and no-new-privileges. A small tmpfs and CPU/memory/PID/time/input/output limits bound work. Approved files are copied through stdin; there is no host-execution fallback or package download."),
        note("Use a reviewed dedicated environment", "Containers share a host kernel and are not VM-grade isolation for hostile code. Use a dedicated/rootless development daemon or a reviewed stronger runner, not a production daemon with sensitive workloads. Tests demonstrate constraints, not a security audit.", "amber"),
        p("Register a provider: probe query tied to a candidate and entity/key before use. Generated Python must emit exactly one JSON object containing a finite scalar value. Receipts retain purpose, status, redacted output, code digest, and copied-source digest. Exact experiment source should be retained separately when reproducibility requires it."),
        p("Probe evidence is degraded: it cannot prove production behavior, causal diagnosis, or successful recovery. Its incident-end timestamp is a replay coordinate, not a historical observation. Missing daemon/image, denial, invalid output, timeout, or exhausted budget supplies no trusted measurement. Cancellation triggers bounded cleanup; inspect the dedicated daemon after failures."), source("sandbox.md"),
      ]},
      {id: "evaluation", title: "What to measure in an independent experiment", blocks: [
        list("Pin the SDK commit, Python/dependency versions, project schema, approved container digest, incident window, and input hashes.", "Use independent topology/telemetry provenance. Keep fault labels and expected answers outside agent context.", "Compare deterministic-only and explicitly agent-enabled runs, including known, ambiguous, healthy, missing, conflicting, and degraded evidence.", "Retain candidate support/contradictions, unresolved questions, query/tool receipts, stop reasons, token/request/probe usage, and human outcomes.", "Qualify real backend access, identity mapping, provider schema/tool support, privacy, and representative workload separately from contract tests.", "Apply and verify any fix manually outside the SDK; an experiment receipt is not recovery verification."),
        p("Scripted Pydantic AI models and mocked HTTP transports verify protocol, budgets, and failure behavior—not live diagnosis accuracy. Synthetic notebooks are reproducible contract demonstrations. Developmental GridCast fault-injection runs informed changes to the SDK, including change records, SQL observations, and conflicting-root handling; those lessons are not a generalized production-readiness certificate."),
        p(`[GridCast integration lessons](${SOURCE_DOCS}/design-notes/gridcast-integration-lessons.md) record the versioned experiments and resulting design changes. Reproduce and qualify your own workload rather than extrapolating a headline accuracy claim.`),
      ]},
      {id: "verification", title: "SDK verification is distinct from consumer qualification", blocks: [
        code("bash", "uv sync --locked --all-groups\nuv run ruff format --check .\nuv run ruff check .\nuv run mypy src\nuv run python scripts/generate_config_schema.py --check\nuv run pytest\nuv run bandit --recursive --severity-level medium --confidence-level medium src\nuv audit --locked\nuv build"),
        p("Run checks against your pinned SDK checkout. Real Docker and live-backend tests are explicitly opt-in and need separate approved setup. Do not count skips as live verification, or report contract coverage as model-quality evaluation."), source("verification.md"),
      ]},
    ],
  },
  {
    slug: "project", group: "Project", label: "Status, migration & contribution", title: "Project status, migration, and contribution",
    description: "Understand the experimental Lumis SDK reset, legacy branches, current release boundary, open-source contribution workflow, foundational research, and planned Lumis platform.",
    sections: [
      {id: "status", title: "The public foundation, not the whole platform", blocks: [
        p("Lumis SDK is an Apache-2.0, independent Python framework for evidence-grounded operational intelligence. The current public PoC implements incident context, scoped graphs, conservative checks, a basic optional investigator, diagnostic experiments, and reviewable records. No hosted account or consumer application is needed for the offline foundation."),
        note("Lumis platform · coming soon", "Managed team workflows, advanced reasoning policies, domain products, broader operational memory, reviewed rule promotion, and policy-controlled actions are development/research directions. They are not production-ready features of this SDK.", "amber"),
        p("Data and AI systems are the current product focus; cloud, edge, industrial, and energy systems are broader directions. The contracts can describe external systems without claiming shipped industrial/energy integrations. No customer adoption, calibrated accuracy, production autonomy, or completed GridCast evaluation is implied."),
      ]},
      {id: "migration", title: "A breaking operational-intelligence reset", blocks: [
        p("The SDK deliberately replaces the previous domain/application/ports/adapters framework. Old diagnose, resolve, rules, plugins, memory, config-migrate commands, lifecycle/action schemas, legacy plugins, and embedded cookbooks are removed from the active architecture. There is no compatibility shim suggesting those imports still work."),
        list("Pin an old consumer while creating a separate migration/integration branch.", "Start a fresh lumis.yaml with init. Do not mechanically rename legacy YAML.", "Map incidents, identities, topology, and registered observations to current contracts.", "Re-express diagnostic rules as predictions and falsifiers; put incident triage signatures in checks.", "Use handle_incident / lumis incident for the primary PoC; keep investigate as a comparison baseline.", "Use a fresh store and retain legacy report/memory records under their original schema.", "Validate representative, withheld, conflicting, and missing-evidence cases before changing the consumer pin."),
        p(`[Original SDK history](${GITHUB_REPO}/tree/legacy/pre-operational-intelligence-2026-10-02) and [intermediate reset](${GITHUB_REPO}/tree/legacy/additive-reset-2026-10-03) remain available in separate checkouts. Historical branches are not actively supported parallel APIs. The old website is preserved on [its own legacy branch](https://github.com/soloshun/lumis-sdk-site/tree/legacy/pre-operational-intelligence-2026-10-04).`),
      ]},
      {id: "contribute", title: "Contribute against the development interface", blocks: [
        p("SDK changes branch from dev and return through reviewed PRs with DCO sign-off. Update source, schemas, documentation, tests, changelog, and roadmap together. Generally useful connectors and contracts should preserve independent application boundaries and include synthetic offline reproductions."),
        list("Use bounded read-only connectors with explicit query ownership and least-privilege access.", "Exercise source failure, identity conflicts, missing/degraded facts, time/byte/query limits, and cancellation.", "Keep optional HTTP/agent imports out of core/offline paths.", "Do not substitute model guesses for unavailable evidence or claim tests demonstrate live accuracy.", "Keep application scenarios, deployments, injected faults, and cookbooks in the external cookbook project."),
        p(`[Contributing guide](${GITHUB_REPO}/blob/dev/CONTRIBUTING.md) · [roadmap](${GITHUB_REPO}/blob/dev/ROADMAP.md) · [release runbook](${SOURCE_DOCS}/releasing.md). Promotion from SDK dev to main and package publication are separate reviewed steps. A metadata version or merged PR alone does not establish publication.`),
      ]},
      {id: "research", title: "Foundational research and the current boundary", blocks: [
        p(`[Agentic Self-Healing for Data & AI Pipelines: An Affordable Vendor-Agnostic Architecture using Open-Source Software](${PAPER_URL}) is the foundational arXiv preprint (2608.01955). A [local PDF](${PAPER_PDF}) remains available for reading.`),
        p("The paper's broader guarded-recovery and verified-learning architecture informs the research direction. The current SDK is an investigation-focused PoC, not an implementation of every layer in that earlier architecture. Automatic remediation, learned-rule promotion, advanced orchestration, and a full autonomous lifecycle are not shipped."),
        p("The working principle is models propose; Lumis tests. Evidence support is narrower than formal proof or confirmed cause. Further research should evaluate competing explanations, evidence acquisition cost, abstention, and the quality of human-reviewed outcomes."), source("migration.md"), source("review-guide.md"),
      ]},
    ],
  },
];

export const groups = Array.from(new Set(docs.map(page => page.group))).map(group => ({group, pages: docs.filter(page => page.group === group)}));
const orderedDocs = groups.flatMap(({pages}) => pages);
export function getDoc(slug?: string[]) { return docs.find(page => page.slug === (slug?.join("/") || "overview")); }
export function getAdjacentDoc(slug: string) {
  const index = orderedDocs.findIndex(page => page.slug === slug);
  return {previous: index > 0 ? orderedDocs[index - 1] : undefined, next: index >= 0 && index < orderedDocs.length - 1 ? orderedDocs[index + 1] : undefined};
}
export function toMarkdown(page: DocPage) {
  const lines = [`# ${page.title}`, "", page.description, ""];
  for (const section of page.sections) {
    lines.push(`## ${section.title}`, "");
    for (const block of section.blocks) {
      if (block.type === "p") lines.push(block.text, "");
      else if (block.type === "note") lines.push(`> **${block.title}.** ${block.text}`, "");
      else if (block.type === "list") lines.push(...block.items.map(item => `- ${item}`), "");
      else if (block.type === "code" || block.type === "diagram") lines.push("```" + (block.type === "diagram" ? "mermaid" : block.language), block.code, "```", "");
      else lines.push(`| ${block.headers.join(" | ")} |`, `| ${block.headers.map(() => "---").join(" | ")} |`, ...block.rows.map(row => `| ${row.join(" | ")} |`), "");
    }
  }
  lines.push("---", "", `Lumis SDK ${SDK_VERSION} · development documentation · ${GITHUB_REPO}`);
  return lines.join("\n");
}
