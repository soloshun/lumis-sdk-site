export type DocBlock =
  | { type: "p"; text: string }
  | { type: "note"; tone?: "blue" | "amber" | "green"; title: string; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "diagram"; code: string; caption?: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };
export type DocSection = { id: string; title: string; blocks: DocBlock[] };
export type DocPage = { slug: string; group: string; label: string; title: string; description: string; nested?: boolean; sections: DocSection[] };

export const SDK_VERSION = "0.1.0";
export const GITHUB_REPO = "https://github.com/soloshun/lumis-sdk";
export const SOURCE_DOCS = `${GITHUB_REPO}/blob/main/docs`;
export const COOKBOOKS = "https://github.com/soloshun/lumis-cookbooks/tree/main/gridcast";
export const RESEARCH_NOTES = "https://github.com/soloshun/lumis-cookbooks/blob/main/gridcast/docs/research-notes.md";
export const PAPER_URL = "https://arxiv.org/abs/2608.01955";
export const PAPER_PDF = "/research/agentic-self-healing-for-data-and-ai-pipelines.pdf";
export const CONTACT_EMAIL = "solomon@qadimlabs.com";

const p = (text: string): DocBlock => ({type: "p", text});
const code = (language: string, value: string): DocBlock => ({type: "code", language, code: value});
const list = (...items: string[]): DocBlock => ({type: "list", items});
const note = (title: string, text: string, tone: "blue" | "amber" | "green" = "blue"): DocBlock => ({type: "note", title, text, tone});
const table = (headers: string[], rows: string[][]): DocBlock => ({type: "table", headers, rows});
const diagram = (value: string, caption?: string): DocBlock => ({type: "diagram", code: value, caption});
const source = (filename: string, label = "SDK reference") => p(`Source: [${label}](${SOURCE_DOCS}/${filename}) in the SDK repository.`);

const SMALL_PROJECT_YAML = `api_version: lumis.dev/operational-v1alpha1
project:
  name: my-api
  environment: local

sources:
  prometheus:
    enabled: true
    endpoint: http://localhost:9090

policies:
  default_action_mode: read_only

graph:
  entities:
    - id: service:api
      kind: service
      name: API
  relationships: []

queries:
  - id: api-up
    provider: prometheus
    entity_id: service:api
    key: up
    description: Was the API scrape target up at the end of the incident?
    parameters:
      promql: 'min(up{job="api"})'
  - id: api-probe
    provider: prometheus
    entity_id: service:api
    key: probe_success
    description: Did the external HTTP health probe succeed?
    parameters:
      promql: 'min(probe_success{job="blackbox-api"})'

checks:
  - id: api-down
    terminal: true
    explains_entities: [service:api]
    hypothesis:
      id: api-unavailable
      statement: The API is down; both its scrape target and an external HTTP probe fail.
      causal_path: [service:api]
      evidence_needed: [api-up, api-probe]
      predictions:
        - {entity_id: "service:api", key: up, operator: eq, value: 0}
        - {entity_id: "service:api", key: probe_success, operator: eq, value: 0}
      falsifiers:
        - {entity_id: "service:api", key: up, operator: eq, value: 1}
        - {entity_id: "service:api", key: probe_success, operator: eq, value: 1}`;

const FLOW_DIAGRAM = `flowchart TD
    CFG["lumis.yaml<br/>sources · graph · registered queries<br/>checks · allowlist · budgets"]
    INC["Incident<br/>affected entities + time window"]
    SRC[("Your telemetry, read-only")]
    PREP["1 · Prepare<br/>discover the operational graph,<br/>scope it to the incident"]
    TRI["2 · Deterministic triage<br/>checks tested against facts<br/>from registered queries"]
    AG["3 · Investigator (optional)<br/>proposes falsifiable hypotheses,<br/>asks for evidence by query ID"]
    AS["4 · Mechanical assessment<br/>predictions and falsifiers<br/>vs. facts Lumis collected"]
    REP["Report<br/>supported_diagnosis · insufficient_evidence ·<br/>requires_human_expert"]
    HUM(("A person reviews<br/>and decides"))
    CFG --> PREP
    INC --> PREP
    SRC -.->|read-only| PREP
    SRC -.->|read-only| TRI
    SRC -.->|read-only| AG
    PREP --> TRI
    TRI -->|"terminal check sufficient"| REP
    TRI -->|"not sufficient, agent enabled"| AG
    TRI -->|"agent not enabled"| REP
    AG --> AS --> REP
    REP --> HUM`;

export const docs: DocPage[] = [
  // ------------------------------------------------------------------ Start here
  {
    slug: "overview", group: "Start here", label: "Introduction", title: "Introduction to Lumis SDK",
    description: "An experimental, open-source Python SDK that investigates operational incidents: deterministic checks first, an optional bounded model, every explanation tested against evidence, and a report for a person to review.",
    sections: [
      {id: "what", title: "What Lumis does", blocks: [
        p("When something breaks in a complex system, the alert tells you where it hurts, rarely what broke. Lumis helps answer the second question. Given an incident (which services are affected and when), it gathers evidence from your existing telemetry, tests explanations against that evidence, and returns a structured report: what is supported, what is contradicted, and what is still unknown."),
        p("It works in a fixed order. Known failure patterns you describe are checked first, with no model involved. Only if they are not enough, and only if you enable it, a tool-using model investigates within strict limits. Whatever the model proposes is then checked mechanically against facts Lumis collected itself. Lumis never acts on your systems; a person reads the report and decides."),
        diagram(FLOW_DIAGRAM, "The incident flow. Every path ends in the same report for human review."),
      ]},
      {id: "status", title: "Where the project is", blocks: [
        note("Experimental, version 0.1.0", "Lumis is research software. The APIs and YAML format may change before 1.0. It has been evaluated on one reference estate with one model family; treat results elsewhere as unknown until you measure them.", "amber"),
        table(["", "Status"], [
          ["Release", "`lumis-sdk` 0.1.0 on PyPI (5 October 2026)"],
          ["Python", "3.11, 3.12 and 3.13"],
          ["License", "Apache-2.0"],
          ["Evaluation", "The [GridCast reference estate](/docs/evaluation): 15 injected failures, one model (DeepSeek v4 pro)"],
          ["Actions on your systems", "None. Lumis reads and reports."],
        ]),
      ]},
      {id: "not", title: "What it is not", blocks: [
        list(
          "Not a monitoring or alerting system. It reads the telemetry you already have.",
          "Not an automatic fixer. There is no remediation executor; suggestions are text for a person.",
          "Not a source of confirmed root causes. A supported explanation is supported by evidence, not proven.",
          "Not a hosted product. It is a library and a CLI you run yourself.",
        ),
      ]},
      {id: "reading", title: "Where to go next", blocks: [
        list(
          "[Quickstart](/docs/quickstart): install and run an offline investigation in a minute.",
          "[Your first real project](/docs/small-project): one service, Prometheus and one check.",
          "[How Lumis works](/docs/how-it-works): the full flow and the vocabulary, in plain language.",
          "[Evaluation](/docs/evaluation): what we measured on GridCast, including what went wrong.",
        ),
        p("For AI assistants: [llms.txt](/llms.txt) is a compact index of these pages and [llms-full.txt](/llms-full.txt) contains all of them as one Markdown file."),
      ]},
    ],
  },
  {
    slug: "quickstart", group: "Start here", label: "Quickstart", title: "Quickstart",
    description: "Install Lumis SDK from PyPI and run a complete, offline incident investigation with no cluster, API key or model call.",
    sections: [
      {id: "install", title: "1. Install", blocks: [
        p("You need Python 3.11 or newer. The core package has no network dependencies; extras add them when you need them."),
        code("bash", 'pip install lumis-sdk                  # core: offline investigation\npip install "lumis-sdk[http]"          # + Prometheus, Loki, Tempo, Prefect connectors\npip install "lumis-sdk[http,agent]"    # + the optional model investigator\npip install "lumis-sdk[sql]"           # + read-only PostgreSQL evidence'),
        p("With uv, use `uv add \"lumis-sdk[http,agent]\"` in a project, or `uvx --from lumis-sdk lumis --help` to try the CLI without installing. Check the install with `lumis --version`."),
        note("Use 0.1.0 or later", "The older `0.1.0rc1` upload on PyPI belongs to a previous architecture and does not match this documentation.", "amber"),
      ]},
      {id: "scaffold", title: "2. Create a starter project", blocks: [
        code("bash", "lumis init --directory ./my-lumis\nlumis doctor --project ./my-lumis/lumis.yaml"),
        p("`init` writes three files and refuses to overwrite existing ones: `lumis.yaml` (the project: one service, one registered query and one check), `incident.json` (an example incident with a time window) and `observations.json` (recorded facts to replay offline). `doctor` validates the project locally; it makes no network calls."),
      ]},
      {id: "run", title: "3. Investigate the incident", blocks: [
        code("bash", "lumis incident \\\n  --project ./my-lumis/lumis.yaml \\\n  --incident ./my-lumis/incident.json \\\n  --observations ./my-lumis/observations.json"),
        p("The command prints a JSON report. In the scaffold, the recorded observation says the service was unhealthy, so the check matches. The check is deliberately not terminal (one symptom is a lead, not a full explanation), and no investigator is enabled, so the incident goes to a person."),
        table(["Report field", "Value", "Meaning"], [
          ["`findings[0].status`", "`match`", "The recorded fact agrees with the check's prediction."],
          ["`route`", "`human`", "No sufficient check and no investigator enabled."],
          ["`conclusion`", "`requires_human_expert`", "More investigation is needed; nothing was concluded."],
          ["`truth_state`", "`unconfirmed_hypothesis`", "Lumis never marks anything as confirmed."],
          ["`requires_human_review`", "`true`", "Always true, on every path."],
        ]),
        p("Run it again without `--observations`: the finding becomes `unknown`. Missing data is never treated as a measurement."),
      ]},
      {id: "keep", title: "4. Keep and inspect the results", blocks: [
        code("bash", "lumis incident --project ./my-lumis/lumis.yaml --incident ./my-lumis/incident.json \\\n  --observations ./my-lumis/observations.json --store ./my-lumis/incidents.sqlite\nlumis graph --project ./my-lumis/lumis.yaml --format svg --output ./my-lumis/graph.svg\nlumis console --project ./my-lumis/lumis.yaml"),
        p("`--store` saves the report in a local SQLite audit file; reusing an incident ID is refused so history is never overwritten. `graph` exports the operational graph (`json`, `dot`, `svg` or `terminal`). `console` is a small interactive menu over the same commands."),
      ]},
      {id: "next", title: "5. Next", blocks: [
        p("Connect Lumis to a real service in [your first real project](/docs/small-project), or read [how Lumis works](/docs/how-it-works) first."),
        source("cli.md", "CLI walkthrough"),
      ]},
    ],
  },
  {
    slug: "small-project", group: "Start here", label: "Your first real project", title: "Your first real project",
    description: "Connect Lumis to one service and a Prometheus server, write a deterministic check with two independent signals, and add the optional investigator.",
    sections: [
      {id: "goal", title: "What you will build", blocks: [
        p("One service (`service:api`), one Prometheus server and one check that answers a single question: is the API down? The example is the SDK's own [small-project example](https://github.com/soloshun/lumis-sdk/tree/main/docs/examples/small-project), which is exercised by its test suite."),
        code("bash", 'pip install "lumis-sdk[http]"'),
      ]},
      {id: "project", title: "The project file", blocks: [
        code("yaml", SMALL_PROJECT_YAML),
        table(["Section", "What it says"], [
          ["`sources.prometheus`", "Where to read metrics. Lumis runs read-only instant queries."],
          ["`graph.entities`", "The one service this project knows about."],
          ["`queries`", "Two operator-owned PromQL queries. Each produces one named fact about the service: `up` and `probe_success`."],
          ["`checks`", "One signature: “the API is down” predicts both facts are 0, and is falsified if either is 1."],
        ]),
        p("The model never writes PromQL. If you later enable the investigator, it can only ask for these queries by ID."),
      ]},
      {id: "run", title: "Run it", blocks: [
        code("json", '{\n  "id": "api-001",\n  "affected_entities": ["service:api"],\n  "symptoms": ["Health check failing"],\n  "started_at": "2026-10-05T05:00:00Z",\n  "ended_at": "2026-10-05T05:10:00Z"\n}'),
        code("bash", "lumis doctor --project lumis.yaml\nlumis incident --project lumis.yaml --incident incident.json"),
        p("Queries are evaluated at the end of the incident window. The check produces one of three findings:"),
        table(["Finding", "When", "What happens"], [
          ["`match`", "Both facts are 0", "The check is terminal, so triage concludes `supported_diagnosis` with no model call."],
          ["`no_match`", "A falsifier holds: the API is up", "The incident goes to a person, or to the investigator if enabled."],
          ["`unknown`", "A query returned no data", "The same. Missing data is never read as “down”."],
        ]),
      ]},
      {id: "why", title: "Why the check looks like this", blocks: [
        p("Lumis will not end triage on weak evidence, and the YAML enforces it. A terminal check must name the entities it explains (`explains_entities`) and predict at least two distinct facts from independent queries. With only one signal, set `terminal: false`: the check becomes a lead instead of a conclusion."),
        p("Both signals here report a real 0 when the API is down: Prometheus writes `up = 0` for a failed scrape, and a blackbox HTTP probe writes `probe_success = 0`. A request rate would not work. When the process is down it stops producing samples, the query returns nothing, and Lumis records `unknown`."),
        note("Avoid false zeros", "Do not add `or vector(0)` to queries. It turns “no data” into a measured zero. In our GridCast evaluation, false zeros from brand-new metric series caused every wrong conclusion in the first run.", "amber"),
        p("Replayed facts (`--observations`) apply only to `provider: snapshot` queries, as in the `lumis init` scaffold. They do not override live Prometheus queries."),
      ]},
      {id: "agent", title: "Add the investigator", blocks: [
        p("When no check matches, a model can look further, still read-only and bounded. Add a model and budget to the project:"),
        code("yaml", "models:\n  provider: openrouter            # or openai, anthropic, gemini\n  model: deepseek/deepseek-v4-pro\n  api_key_env: OPENROUTER_API_KEY\n  reasoning: high\ninvestigator:\n  budget:\n    request_limit: 12"),
        code("bash", 'pip install "lumis-sdk[http,agent]"\nexport OPENROUTER_API_KEY=...\nlumis incident --project lumis.yaml --incident incident.json --use-agent'),
        p("Configuration alone never makes a paid call; only `--use-agent` does. See [the investigator](/docs/investigator) for what it can and cannot do, and [model providers](/docs/models) for choosing a model."),
      ]},
      {id: "grow", title: "Grow it", blocks: [
        list(
          "More signals: logs from Loki, traces from Tempo, workflow runs from Prefect, read-only SQL, and recent Git commits and Kubernetes rollouts. See [connectors](/docs/connectors).",
          "More services: add entities and relationships, or let Kubernetes and the Prometheus service graph discover them. See [the operational graph](/docs/graph).",
          "Code context: allowlist the files and Git history the investigator may read. See [the investigator](/docs/investigator).",
        ),
        p(`For a large worked example with seven sources, 40 queries and ten checks, see the [GridCast cookbook](${COOKBOOKS}). Smaller cookbooks are planned.`),
        source("small-project.md", "Small-project guide"),
      ]},
    ],
  },

  // ------------------------------------------------------------------ Concepts
  {
    slug: "how-it-works", group: "Concepts", label: "How Lumis works", title: "How Lumis works",
    description: "The end-to-end incident flow, who decides what, and the vocabulary used across the SDK, explained in plain language.",
    sections: [
      {id: "flow", title: "The flow, end to end", blocks: [
        diagram(FLOW_DIAGRAM),
        list(
          "**Prepare.** Lumis builds an operational graph from what you declare and what it can discover (Kubernetes, Prometheus service graphs, Tempo, Prefect), then keeps only the part around the affected services.",
          "**Triage.** Your checks are tested against facts from your registered queries. Each check either matches, does not match, or is unknown. A sufficient terminal check ends here, without a model.",
          "**Investigate (optional).** If triage is not sufficient and you enabled it, one tool-using model explores: it reads the graph, asks for evidence by query ID, reads recent changes and allowlisted code, and proposes explanations.",
          "**Assess.** Every explanation, from a check or from the model, states what it predicts and what would prove it wrong. Lumis checks those statements against the facts it collected itself.",
          "**Report.** The result is one structured report for a person. Nothing is executed.",
        ),
      ]},
      {id: "who", title: "Who decides what", blocks: [
        table(["Role", "Decides"], [
          ["You, the operator", "Which sources Lumis may read, which queries exist, which checks to run, which files the investigator may see, and every budget."],
          ["The model (optional)", "Which registered queries to ask for, and which explanations to propose. Nothing else."],
          ["Lumis", "Whether each explanation is supported, contradicted or unresolved, and whether the evidence is enough to conclude."],
          ["A person", "What actually happened, and what to do about it."],
        ]),
        p("The working rule is “the model proposes; Lumis tests”. A model cannot add evidence, mark something as confirmed, or take an action."),
      ]},
      {id: "terms", title: "Vocabulary", blocks: [
        table(["Term", "Meaning"], [
          ["Incident", "The affected entities and a time window. The input to every investigation."],
          ["Entity", "Something in your estate with a stable ID, for example `service:shop:checkout` or `k8s:shop:deployment:checkout`."],
          ["Operational graph", "Entities and their relationships. It scopes what Lumis looks at; it is not proof of cause."],
          ["Registered query", "An operator-written query (PromQL, LogQL, SQL…) with an ID, an entity and a key. The only way facts are collected."],
          ["Observation (fact)", "One value for one entity and key at one time, with its source. For example, `up = 0` for `service:api`."],
          ["Check", "A known failure pattern written as a hypothesis. Tested deterministically during triage."],
          ["Finding", "A check's result: `match`, `no_match` or `unknown`."],
          ["Hypothesis", "A falsifiable explanation: a statement, a causal path through the graph, predictions and falsifiers."],
          ["Prediction / falsifier", "Facts the explanation expects to see, and facts that would contradict it."],
          ["Assessment", "Lumis' mechanical verdict on a hypothesis: `supported`, `contradicted` or `unresolved`."],
          ["Receipt", "A redacted record of every tool call and query, kept in the report."],
          ["Conclusion", "`supported_diagnosis`, `insufficient_evidence` or `requires_human_expert`."],
        ]),
      ]},
      {id: "principles", title: "Design principles", blocks: [
        list(
          "**Deterministic first.** Known failures are handled by checks. A model is used only for what checks cannot explain.",
          "**Evidence first.** Facts come only from operator-registered queries, with provenance and time-window checks.",
          "**Uncertainty stays visible.** Missing, conflicting or degraded facts leave an explanation unresolved; they never become support.",
          "**One cause or no conclusion.** If supported explanations disagree on the root cause, the report says so instead of picking one.",
          "**Bounded.** Graph size, queries, model requests, tool calls, tokens and time all have limits.",
          "**Read-only.** There is no executor. A person keeps every decision.",
        ),
        source("architecture.md", "Architecture"),
      ]},
    ],
  },
  {
    slug: "graph", group: "Concepts", label: "Operational graph", title: "The operational graph",
    description: "How Lumis models your estate as entities and relationships, how identities work, how the graph is discovered and how it is scoped to each incident.",
    sections: [
      {id: "why", title: "Why a graph", blocks: [
        p("An incident rarely starts where the alert fires. A slow pipeline may be caused by a feature service, its database, or a vendor feeding it. The operational graph records what depends on what, so an investigation can look upstream of the symptom without reading the whole estate. It is context for reasoning; a connected path is never treated as proof of cause."),
        p("Under the hood it is a Pydantic-validated snapshot loaded into a NetworkX `MultiDiGraph`, so parallel relationships of different kinds between the same two entities are kept. No graph database is required."),
      ]},
      {id: "build", title: "Where the graph comes from", blocks: [
        diagram(`flowchart TB
    Y["Declared graph<br/>(lumis.yaml)"] --> B
    T["External topology<br/>JSON"] --> B
    K["Kubernetes<br/>resources + app labels"] --> B
    P["Prometheus<br/>service-graph metric"] --> B
    W["Prefect / Tempo<br/>workflow and trace topology"] --> B
    B["Discovery + identity binding<br/>aliases, namespaces, fail closed on conflicts"] --> G["Operational graph"]
    G --> S["Incident scope<br/>neighbourhood of the affected entities<br/>within hop and entity budgets"]
    S --> R["Triage and investigator<br/>see only this scope"]`),
        p("Declared entities carry what discovery cannot know: owners, criticality, external vendors, idle dependencies. Enabled sources add what exists right now. If an enabled source fails, preparation stops with a sanitized report rather than continuing with a partial graph."),
      ]},
      {id: "ids", title: "Identities and directions", blocks: [
        table(["Identity or relationship", "Convention"], [
          ["Logical service", "`service:<namespace>:<name>`, from app labels, OpenTelemetry or service-graph metrics."],
          ["Kubernetes resource", "`k8s:<namespace>:<kind>:<name>`. Kept distinct from the logical service."],
          ["`hosts`", "Resource → logical service. Says where a service runs, not that it was called."],
          ["`serves`", "Server or dependency → client. So “upstream of the frontend” includes its database."],
          ["Declared lineage", "Dataset → job → dataset (`feeds`, `produces`), with explicit provenance."],
          ["Aliases", "Explicit raw ID → canonical ID. Bare names are never guessed or joined."],
        ]),
        p("Namespaces keep two estates from merging by accident. Conflicting kinds or metadata fail validation instead of being silently resolved."),
      ]},
      {id: "scope", title: "Scoping to an incident", blocks: [
        p("For each incident Lumis keeps the neighbourhood of the affected entities, bounded by `budget.graph_hops` and `budget.max_entities`. If the neighbourhood would exceed the entity budget, preparation fails rather than truncating silently. Both triage and the investigator work only inside this scope."),
        code("python", 'from lumis_sdk.runtime import YamlProject\n\nprepared = await YamlProject.from_file("lumis.yaml").prepare()\ngraph = prepared.graph\nupstream = graph.upstream_of("service:shop:checkout", hops=3, max_entities=100)\nlocal = graph.dependencies_within("service:shop:checkout", hops=2, max_entities=100)\nscoped = graph.scope(["service:shop:checkout"], hops=2, max_entities=100)\nnx_copy = graph.to_networkx()\ndot = graph.to_dot()'),
        p("Use top-level `await` in a notebook, or wrap the code in `asyncio.run(main())` in a script. Exports are deep copies, so changing them cannot change an investigation."),
      ]},
      {id: "limits", title: "Limits", blocks: [
        list(
          "Live Kubernetes discovery reads current resources, not historical cluster state. Archive topology snapshots yourself if you need exact replay.",
          "Recent Git commits and rollouts are evidence about entities, not graph nodes. See [evidence and queries](/docs/evidence).",
          "There is no live OpenTelemetry receiver and no OpenLineage ingestion yet.",
        ),
        source("graph.md", "Graph and lineage"),
      ]},
    ],
  },
  {
    slug: "evidence", group: "Concepts", label: "Evidence and queries", title: "Evidence and queries",
    description: "How Lumis collects facts: operator-registered queries, typed observations with provenance, the incident time window, and why missing data is never a zero.",
    sections: [
      {id: "queries", title: "Registered queries", blocks: [
        p("Every fact Lumis uses comes from a query you registered in `lumis.yaml`. A query has an ID, a provider, the entity it describes, the key of the fact it produces, a description, and provider parameters such as PromQL or SQL. Neither a check nor the model can run anything else."),
        code("yaml", "queries:\n  - id: checkout-error-logs\n    provider: loki\n    entity_id: service:shop:checkout\n    key: error_entries\n    description: Checkout error log lines during the incident\n    parameters:\n      logql: '{namespace=\"shop\", app=\"checkout\"} |= \"error\"'\n      output: count"),
        table(["Provider", "Typical use"], [
          ["`prometheus`", "Metrics as one instant scalar at the end of the incident."],
          ["`loki`", "Log entries or counts in the incident window."],
          ["`tempo`", "Trace searches, durations and span reads."],
          ["`prefect`", "Flow and task run states and durations."],
          ["`sql`", "One read-only scalar from PostgreSQL."],
          ["`changes`", "Recent Git commits and Kubernetes rollouts for an entity."],
          ["`snapshot`", "Facts replayed from a file (tests, offline runs)."],
          ["`probe`", "Results of an opt-in sandbox experiment (degraded quality)."],
        ]),
        p("Details for each provider are in [connectors](/docs/connectors)."),
      ]},
      {id: "observations", title: "What an observation contains", blocks: [
        table(["Field", "Meaning"], [
          ["`query_id`, `entity_id`, `key`", "Which registered query produced it, about which entity, for which fact. Must match the registration."],
          ["`value`", "One scalar: number, boolean or short text. Booleans are never treated as 1 or 0."],
          ["`observed_at`", "When it was observed. Must fall inside the incident window."],
          ["`source`, `retrieval_method`", "Provenance: where it came from and how."],
          ["`quality`", "`observed`, or `degraded` when a result was capped, partial or synthetic."],
        ]),
      ]},
      {id: "unknown", title: "Missing data is unknown, never zero", blocks: [
        p("If a query fails, times out or returns nothing, no fact is recorded and any check that needed it stays `unknown`. A failed query is not a false measurement. This sounds obvious, but it is the most common way investigation tools go wrong."),
        note("A lesson from GridCast", "Prometheus `rate()` cannot see the first event of a brand-new series, and `or vector(0)` then turns that blind spot into a confident “zero”. In our first evaluation run, every wrong conclusion rested on a false zero like this. Write queries that return no data when there is no data.", "amber"),
        p("Degraded facts (a capped log result, a sandbox probe) can guide a person or the investigator, but cannot satisfy a terminal check."),
      ]},
      {id: "window", title: "Time window and budgets", blocks: [
        p("Queries run against the incident window, `started_at` to `ended_at`: Prometheus instant queries are evaluated at `ended_at`, and log, trace, workflow and SQL queries are bounded by the window. List queries in `initial_query_ids` to collect them before anything else runs."),
        p("Triage and the investigator share one query budget (`budget.max_queries`). Repeated requests for the same query reuse the first result; failed queries are not retried invisibly."),
        source("configuration.md", "YAML reference"),
      ]},
    ],
  },
  {
    slug: "triage", group: "Concepts", label: "Checks and triage", title: "Checks and triage",
    description: "Write known failure patterns as deterministic checks, understand match, no_match and unknown, and the strict rules for when triage may conclude without a model.",
    sections: [
      {id: "checks", title: "A check is a falsifiable known pattern", blocks: [
        p("A check describes a failure you already know how to recognise, written as a hypothesis: what it explains, which facts it needs, what those facts should look like if it is happening, and what would prove it is not."),
        code("yaml", "checks:\n  - id: pod-oom-killed\n    terminal: false\n    hypothesis:\n      id: oom-killed\n      statement: A container was OOM-killed during the incident.\n      causal_path: [service:shop:checkout]\n      evidence_needed: [checkout-oom-kills]\n      predictions:\n        - {entity_id: \"service:shop:checkout\", key: oom_kills, operator: gt, value: 0}\n      falsifiers:\n        - {entity_id: \"service:shop:checkout\", key: oom_kills, operator: eq, value: 0}"),
        p("Operators are `eq`, `ne`, `gt`, `ge`, `lt` and `le`. Ordered comparisons need numbers."),
      ]},
      {id: "findings", title: "Findings", blocks: [
        table(["Finding", "Meaning"], [
          ["`match`", "Every prediction is supported by a usable fact and no falsifier holds."],
          ["`no_match`", "A prediction fails, or a falsifier holds."],
          ["`unknown`", "A needed fact is missing, degraded or conflicting."],
        ]),
      ]},
      {id: "terminal", title: "When triage may conclude", blocks: [
        p("A matched check ends triage only if all five conditions hold:"),
        list(
          "It is marked `terminal: true` and declares `explains_entities`.",
          "It predicts at least two distinct entity/key facts, supplied by independent queries.",
          "Its predictions are supported and no falsifier holds.",
          "It covers every affected entity, and every other check in scope is contradicted.",
          "An optional caller-supplied `TriageGuard` also accepts it.",
        ),
        diagram(`flowchart TD
    F["Each check → finding:<br/>match · no_match · unknown"] --> T{"Terminal check<br/>sufficient?<br/>(all five rules)"}
    T -->|yes| D["supported_diagnosis<br/>(no model, no code read)"]
    T -->|no| A{"Investigator<br/>enabled?"}
    A -->|yes| I["Investigator runs with findings<br/>and collected evidence as leads"]
    A -->|no| H["requires_human_expert<br/>(findings and evidence attached)"]`, "Triage routing."),
        note("Two facts are a minimum, not proof", "The rule is structural; it does not establish statistical independence or causality. Choose evidence that genuinely discriminates. An OOM kill, for example, is better left nonterminal: it explains the crash, but not whether a leak, a larger batch or a lower memory limit caused it.", "amber"),
      ]},
      {id: "good", title: "Writing good checks", blocks: [
        list(
          "Start nonterminal. A matched nonterminal check is a lead handed to the investigator or to a person.",
          "Make a check terminal only when two independent signals both point the same way, and both report a real value when the failure happens (see [missing data](/docs/evidence#unknown)).",
          "Write falsifiers. A check that cannot be contradicted cannot be tested.",
          "Keep one check per mechanism. Overlapping checks that both match will block a terminal conclusion, by design.",
        ),
        p("In the GridCast evaluation, ten checks covered the ten original scenarios. Only one was terminal: “planning API scaled to zero”, which concluded in about 60 milliseconds and was right every time. The other nine were leads."),
        source("incident-investigation.md", "Incident investigation"),
      ]},
    ],
  },
  {
    slug: "investigator", group: "Concepts", label: "The investigator", title: "The investigator",
    description: "The optional tool-using model: when it runs, the tools it can use, its budgets, how its output is validated, and what it can never do.",
    sections: [
      {id: "when", title: "When it runs", blocks: [
        p("Only when triage is not sufficient and you opted in, with `--use-agent` on the CLI or `use_agent=True` in Python. It is one Pydantic AI agent with typed output, not a multi-agent system. It starts from the triage findings and the evidence already collected."),
      ]},
      {id: "tools", title: "What it can do", blocks: [
        p("The investigator has two tools, `inspect` and `probe`. `inspect` has a fixed set of operations:"),
        table(["Operation", "What it allows"], [
          ["`catalog`", "List the registered query IDs, approved files and enabled capabilities."],
          ["`graph`", "Read a one-hop neighbourhood inside the incident scope."],
          ["`evidence`", "Run a registered query by ID. It cannot write PromQL, LogQL, TraceQL or SQL."],
          ["`changes`", "List recent commits and rollouts that touch scoped entities, newest first."],
          ["`code.read`, `code.search`", "Read or literally search an explicit allowlist of text files."],
          ["`git.log`, `git.diff`", "Fixed, read-only Git commands on approved paths."],
          ["`hypothesis.register`", "Register a falsifiable explanation before testing it."],
        ]),
        p("`probe` runs a generated Python experiment in a disabled-by-default, network-less container. Its results are marked degraded. See [safety and limits](/docs/safety)."),
      ]},
      {id: "code", title: "Giving it code context", blocks: [
        code("yaml", "investigator:\n  repositories:\n    - id: application\n      root: ./approved-source\n      entity_ids: [\"service:shop:checkout\"]\n      files: [src/checkout/handler.py, deploy/releases.yaml]\n      include_commit_subjects: false"),
        p("Each repository is mapped to the entities it belongs to, and only the listed files are readable. Files are snapshotted once per investigation, redacted and hashed. Paths outside the list, symlinks, binary or oversized files, and secret or dot directories are refused."),
      ]},
      {id: "budgets", title: "Budgets", blocks: [
        code("yaml", "investigator:\n  budget:\n    request_limit: 8\n    tool_calls_limit: 10\n    max_probes: 2\n    output_tokens_limit: 12000\n    max_tool_characters: 8000\n    max_total_tool_characters: 32000\n    validation_retries: 2"),
        p("These are example values. Every tool attempt, including a denied or malformed one, counts. When a budget runs out, the evidence and hypotheses collected so far are still assessed and reported."),
      ]},
      {id: "validation", title: "How its output is checked", blocks: [
        p("The model's final answer is checked against the same rules Lumis applies afterwards: graph IDs must exist, `evidence_needed` must name registered queries, a revised hypothesis needs a new ID, and suggestions may cite only evidence Lumis actually issued. Problems are sent back to the model to repair, up to `validation_retries` times. Anything still invalid is dropped, and the reason is listed in the report."),
        table(["Stop reason", "Meaning"], [
          ["`agent_completed`", "The investigator returned a valid answer."],
          ["`agent_budget_exhausted`", "A request, tool or token limit was reached."],
          ["`agent_output_invalid`", "The answer could not be repaired within the retries."],
          ["`deadline_exceeded`", "The total time budget ran out."],
          ["`investigator_rejected_or_unavailable`", "Provider or other failure; the report names the exception type and HTTP status."],
        ]),
      ]},
      {id: "cannot", title: "What it can never do", blocks: [
        list(
          "Write its own queries, read files outside the allowlist, or run shell commands.",
          "Add facts. It can only ask for registered queries; Lumis records what they return.",
          "Mark anything as confirmed, or decide the conclusion. Lumis assesses its hypotheses mechanically.",
          "Change your systems. Suggestions, including patch text, are never applied.",
        ),
        note("Cost and time in practice", "On GridCast, with DeepSeek v4 pro at high reasoning effort, a full Lumis investigation took a median of about four minutes and cost about $0.14 in model fees. Your model, estate and budgets will change both.", "green"),
        source("incident-investigation.md", "Incident investigation"),
      ]},
    ],
  },
  {
    slug: "reports", group: "Concepts", label: "Assessment and reports", title: "Assessment and reports",
    description: "How hypotheses are assessed, how a report reaches its conclusion, what the report contains, and how human resolutions are recorded separately.",
    sections: [
      {id: "hypotheses", title: "What makes an explanation testable", blocks: [
        table(["Field", "Purpose"], [
          ["`id`, `statement`", "A stable identity and a falsifiable explanation."],
          ["`causal_path`", "Entities in the incident graph, starting where the fault originates."],
          ["`evidence_needed`", "Registered query IDs whose facts cover the predictions and falsifiers."],
          ["`predictions`", "Facts expected if the explanation holds."],
          ["`falsifiers`", "Facts that would contradict it."],
        ]),
      ]},
      {id: "assessment", title: "Assessment", blocks: [
        p("A hypothesis is `supported` only if every prediction is supported by a usable fact and no falsifier holds. Contradiction takes precedence. Missing, conflicting or degraded facts leave it `unresolved`."),
        table(["State", "Meaning"], [
          ["`supported`", "The facts agree with it. This is evidence support, not causal proof."],
          ["`contradicted`", "A prediction fails, or a falsifier holds."],
          ["`unresolved`", "The facts are missing, degraded, conflicting or not enough to decide."],
        ]),
      ]},
      {id: "conclusion", title: "How a report reaches its conclusion", blocks: [
        diagram(`flowchart TD
    C["Candidate hypotheses<br/>(checks and investigator)"] --> V{"Valid?<br/>graph IDs, registered queries,<br/>known receipts"}
    V -->|no| U["Dropped; reason listed in<br/>unresolved_questions"]
    V -->|yes| M["Mechanical assessment<br/>against collected facts"]
    M --> S["supported"]
    M --> X["contradicted"]
    M --> R["unresolved"]
    S --> O{"Supported candidates agree<br/>on one root cause?"}
    O -->|yes| SD["supported_diagnosis"]
    O -->|no| IE["insufficient_evidence<br/>competing roots listed"]
    X --> N["no diagnosis from this candidate"]
    R --> N`),
        p("A diagnosis requires the supported explanations to agree on one root cause. A Kubernetes resource that hosts a service counts as that service. If two supported explanations name different roots, the conclusion is `insufficient_evidence` and both are listed: Lumis does not invent a ranking. With no usable evidence, the conclusion is `insufficient_evidence` or `requires_human_expert`."),
      ]},
      {id: "fields", title: "What the report contains", blocks: [
        table(["Field", "Content"], [
          ["`context`", "The incident, scoped graph, queries and evidence."],
          ["`findings`", "Each check's finding with its assessment."],
          ["`assessments`", "Each candidate hypothesis and its state."],
          ["`receipts`", "Redacted records of every query and tool call."],
          ["`suggestions`", "Tentative, text-only next steps for a person."],
          ["`unresolved_questions`", "What the evidence could not settle, and why candidates were dropped."],
          ["`route`", "`deterministic`, `agent` or `human`."],
          ["`conclusion`", "`supported_diagnosis`, `insufficient_evidence` or `requires_human_expert`."],
          ["`stop_reason`", "Why the investigation ended."],
          ["`metrics`", "Model requests, tokens, tool attempts, evidence queries and probes."],
          ["`truth_state`, `requires_human_review`", "Always `unconfirmed_hypothesis` and `true`."],
        ]),
        p("The report does not store the model's raw reasoning or the full provider conversation. Callers that need it for evaluation can read `PydanticInvestigator.messages` in memory."),
      ]},
      {id: "store", title: "Audit records and human resolutions", blocks: [
        p("`IncidentStore.save(report)` writes the report, evidence and receipts to SQLite in one transaction. Saving the same incident ID twice is refused. After a person has dealt with the incident, they can append a separate resolution record:"),
        code("json", '{\n  "id": "review-001",\n  "incident_id": "api-001",\n  "reviewer": "operator",\n  "recorded_at": "2026-10-05T12:00:00Z",\n  "summary": "Restarted the API after the report; health checks recovered.",\n  "applied_change": "Manual restart by the on-call engineer; not executed by Lumis.",\n  "outcome": "resolved",\n  "evidence_references": []\n}'),
        code("bash", "lumis record-resolution --store incidents.sqlite --resolution resolution.json --confirm"),
        p("Outcomes are `resolved`, `not_resolved` or `inconclusive`. A resolution never changes the diagnosis, executes anything or creates a new rule."),
        source("incident-investigation.md", "Incident investigation"),
      ]},
    ],
  },

  // ------------------------------------------------------------------ Build
  {
    slug: "configuration", group: "Build", label: "YAML configuration", title: "YAML configuration",
    description: "Reference for the lumis.dev/operational-v1alpha1 project file: top-level fields, budgets, the incident and observation formats, and validation rules.",
    sections: [
      {id: "contract", title: "A strict project file", blocks: [
        p("The project format is `lumis.dev/operational-v1alpha1`. Unknown fields, duplicate keys, YAML aliases, excessive nesting and files over 1 MiB are rejected. Run `lumis doctor --project lumis.yaml` after every edit; it validates locally and makes no network calls."),
      ]},
      {id: "fields", title: "Top-level fields", blocks: [
        table(["Field", "Purpose"], [
          ["`api_version`", "Always `lumis.dev/operational-v1alpha1`."],
          ["`project`", "`name` and `environment`."],
          ["`sources`", "Read-only connectors. Each is disabled unless `enabled: true`."],
          ["`identity.aliases`", "Map discovered IDs to canonical IDs."],
          ["`discovery`", "Limits for building the graph."],
          ["`graph`", "Declared entities and relationships."],
          ["`queries`", "The registered query catalog."],
          ["`initial_query_ids`", "Queries collected before triage."],
          ["`checks`", "Known failure patterns for triage."],
          ["`models`", "Optional model provider and ID."],
          ["`investigator`", "Optional investigator budgets, repositories and sandbox."],
          ["`budget`", "Investigation limits: hops, entities, queries, hypotheses, context and time."],
          ["`policies`", "`default_action_mode: read_only`, the only accepted mode."],
          ["`observations_file`", "Facts to replay for `snapshot` queries."],
        ]),
        p("`rule_hypotheses` also exists for the lower-level candidate-only baseline (`lumis investigate`); it does not take part in incident triage."),
      ]},
      {id: "example", title: "A complete example", blocks: [
        p("The small-project file is a complete, valid project. Add `models` and `investigator` to enable the investigator."),
        code("yaml", SMALL_PROJECT_YAML),
      ]},
      {id: "budgets", title: "Budgets", blocks: [
        code("yaml", "discovery:\n  timeout_seconds: 30\n  max_entities: 5000\n  max_relationships: 10000\n  max_service_graph_series: 1000\n  max_response_bytes: 2000000\nbudget:\n  graph_hops: 3\n  max_entities: 100\n  max_queries: 8\n  max_hypotheses: 5\n  max_model_output_tokens: 3000\n  max_context_characters: 20000\n  query_timeout_seconds: 10\n  source_timeout_seconds: 30\n  total_timeout_seconds: 120"),
        p("Example values, not recommendations. When a limit would be exceeded, Lumis refuses rather than silently truncating. Preparation and investigation have separate deadlines."),
      ]},
      {id: "files", title: "Incident and observation files", blocks: [
        code("json", '{\n  "id": "checkout-001",\n  "affected_entities": ["service:shop:checkout"],\n  "symptoms": ["Checkout p95 latency above 2s"],\n  "started_at": "2026-10-05T10:00:00Z",\n  "ended_at": "2026-10-05T10:20:00Z"\n}'),
        code("json", '[\n  {\n    "id": "obs-1",\n    "query_id": "checkout-up",\n    "entity_id": "service:shop:checkout",\n    "key": "up",\n    "value": 0,\n    "observed_at": "2026-10-05T10:20:00Z",\n    "source": "replay",\n    "retrieval_method": "snapshot-replay"\n  }\n]'),
        p("Timestamps must include a timezone. Each observation must match a registered query's entity and key and fall inside the incident window."),
        source("configuration.md", "YAML reference"),
      ]},
    ],
  },
  {
    slug: "connectors", group: "Build", label: "Connectors", title: "Connectors",
    description: "Configure the read-only sources: Kubernetes, Prometheus, Loki, Tempo, Prefect, PostgreSQL, recent changes from Git and rollouts, and snapshots.",
    sections: [
      {id: "overview", title: "Sources at a glance", blocks: [
        p("Instrument your application with standard telemetry. Lumis is configured outside it, reads through these connectors, and never imports your code. All connectors are read-only and bounded by item, byte and time limits, with no hidden retries or pagination."),
        table(["Source", "Gives Lumis"], [
          ["Kubernetes", "Services, deployments, pods and ReplicaSets in one context and namespace; links resources to logical services."],
          ["Prometheus", "Instant scalar observations; optional service-graph topology from an existing metric."],
          ["Loki", "Log entries or counts in the incident window, with up to five allowlisted structured-metadata fields."],
          ["Tempo", "Scoped TraceQL searches, span reads and observed topology."],
          ["Prefect", "Allowlisted flow and task runs; optional workflow topology."],
          ["SQL", "One read-only scalar from PostgreSQL (`sql` extra)."],
          ["Changes", "Recent Git commits on mapped paths and Kubernetes rollouts."],
          ["Snapshots and OTLP exports", "Normalized topology, observations and local OpenTelemetry trace exports, for offline replay."],
        ]),
        p("Install `lumis-sdk[http]` for the HTTP connectors. All of these were exercised live on the [GridCast estate](/docs/evaluation); qualify scope, identities, permissions and query meaning on your own."),
      ]},
      {id: "kubernetes", title: "Kubernetes", blocks: [
        code("yaml", "sources:\n  kubernetes:\n    enabled: true\n    context: my-approved-context\n    namespace: my-estate"),
        p("Uses `kubectl` with your read access. No all-namespace scan, no secret or environment extraction, no kubeconfig edits and no workload changes. If the source fails, preparation stops."),
      ]},
      {id: "prometheus", title: "Prometheus", blocks: [
        code("yaml", "sources:\n  prometheus:\n    enabled: true\n    endpoint: http://localhost:9090\nqueries:\n  - id: service-up\n    provider: prometheus\n    entity_id: service:demo\n    key: up\n    description: Availability at the end of the incident\n    parameters:\n      promql: 'min(up{job=\"demo\"})'"),
        p("The query runs at the end of the incident and must return one finite scalar or one vector series; aggregate explicitly. An outage, malformed response or empty result supplies no fact. To add call topology from an existing service-graph metric, set `discover_service_graph: true` with an explicit `service_namespace`."),
      ]},
      {id: "loki-tempo-prefect", title: "Loki, Tempo and Prefect", blocks: [
        code("yaml", "sources:\n  loki:\n    enabled: true\n    endpoint: https://approved-log-gateway.example\n    headers_env:\n      Authorization: LUMIS_LOKI_AUTHORIZATION\n      X-Scope-OrgID: LUMIS_LOKI_TENANT\n    max_results: 50\n  tempo:\n    enabled: true\n    endpoint: http://localhost:3200\n    max_results: 50\n  prefect:\n    enabled: true\n    endpoint: http://localhost:4200/api\n    flow_names: [daily-forecast]\n    max_results: 50"),
        table(["Provider", "Parameters and outputs"], [
          ["`loki`", "`logql` with an exact stream label matcher; output `entries` or `count`; optional `fields` (up to five structured-metadata fields)."],
          ["`tempo`", "`traceql` with exact resource scope; output `entries`, `duration_ms` or `spans`; or `trace_id` for explicit spans."],
          ["`prefect`", "Allowlisted `flow_name`; `flow_runs` or `task_runs`; output `entries`, `failed_count` or `max_duration_ms`."],
        ]),
        p("Point Loki and Tempo at query frontends, and Prefect at its API base (including `/api`). Credentials in URLs are refused; header values come from environment variables and fail closed when missing. Log counts are not failure rates, and capped results are marked degraded."),
      ]},
      {id: "sql", title: "Read-only SQL", blocks: [
        code("yaml", "sources:\n  sql:\n    enabled: true\n    dsn_env: ESTATE_READONLY_DSN\n    statement_timeout_ms: 5000\n    connect_timeout_seconds: 5\nqueries:\n  - id: incident-events\n    provider: sql\n    entity_id: service:demo\n    key: event_count\n    description: Registered event count during the incident\n    parameters:\n      sql: >-\n        SELECT count(*) FROM operational_events\n        WHERE at >= %(started_at)s AND at <= %(ended_at)s"),
        p("Each query is one `SELECT` or `WITH` statement returning exactly one row and column. Only `started_at` and `ended_at` parameters are accepted. Transactions are read-only and rolled back, but that is not a permission boundary: use a database role that can only read the approved tables. `NULL` supplies no fact."),
      ]},
      {id: "changes", title: "Recent changes", blocks: [
        p("Many incidents follow a change. `sources.changes` attributes recent Git commits and Kubernetes rollouts to graph entities, so a check or the investigator can ask “what changed here, and when?”. A change is evidence about an entity, never proof that it caused the incident."),
        code("yaml", "sources:\n  changes:\n    enabled: true\n    lookback_seconds: 3600\n    max_records: 50\n    git:\n      - id: gitops\n        root: ../gitops\n        paths:\n          services/demo/: [\"service:demo\"]\nqueries:\n  - id: demo-changes\n    provider: changes\n    entity_id: service:demo\n    key: release_changes_30m\n    description: Recent mapped changes before incident end\n    parameters: {output: count, lookback_seconds: \"1800\"}"),
        p("`count` returns the number of mapped changes in the lookback; `seconds_since_latest` returns the age of the newest one. Set `kubernetes_rollouts: true` (with the Kubernetes source enabled) to include rollouts, including re-activations seen through `ScalingReplicaSet` events. Git is the durable record; Kubernetes event history expires."),
        source("telemetry-connectors.md", "Connector reference"),
      ]},
    ],
  },
  {
    slug: "api", group: "Build", label: "Python API and CLI", title: "Python API and CLI",
    description: "Use YamlProject.handle_incident from Python, prepare graph snapshots deliberately, store reports, and the full CLI reference.",
    sections: [
      {id: "python", title: "The Python API", blocks: [
        code("python", 'import asyncio\nfrom pathlib import Path\nfrom lumis_sdk.core import Incident\nfrom lumis_sdk.runtime import IncidentStore, YamlProject\n\nasync def main():\n    workspace = Path("./my-lumis")\n    incident = Incident.model_validate_json((workspace / "incident.json").read_text())\n    project = YamlProject.from_file(workspace / "lumis.yaml")\n    report = await project.handle_incident(incident)\n    print(report.conclusion, report.route)\n    assert report.requires_human_review\n    IncidentStore(workspace / "incidents.sqlite").save(report)\n\nasyncio.run(main())'),
        p("`from_file` validates the project locally. `handle_incident` prepares the graph at the incident's end time, runs triage and, if enabled, the investigator, and returns an `IncidentReport`. Pass `observations=` to replay facts, or `observations=()` to force missing evidence. No model is called unless you pass `use_agent=True` or inject an investigator."),
      ]},
      {id: "prepared", title: "Reusing a prepared graph", blocks: [
        code("python", "prepared = await project.prepare(at=incident.ended_at)\nprint(prepared.discovery.complete)\nprint([(s.name, s.status) for s in prepared.discovery.sources])\nreport = await prepared.handle_incident(incident)"),
        p("Reuse a `PreparedProject` only when you want the same topology snapshot; call `prepare` again for fresh discovery. A failed source raises `DiscoveryError`, whose `report` lists each source's status."),
      ]},
      {id: "cli", title: "CLI reference", blocks: [
        table(["Command", "Effect"], [
          ["`lumis init --directory PATH`", "Create an offline starter project, incident and observations."],
          ["`lumis doctor --project FILE`", "Validate locally. No network or paid requests."],
          ["`lumis discover --project FILE [--report]`", "Build the graph from all enabled sources; `--report` shows per-source status."],
          ["`lumis graph --project FILE [--entity ID --hops N] --format json|dot|svg|terminal [--output FILE]`", "Export or view the graph or a neighbourhood."],
          ["`lumis incident --project FILE --incident FILE`", "Triage, optional investigator, report. Add `--observations`, `--store`, `--use-agent`."],
          ["`lumis record-resolution --store FILE --resolution FILE --confirm`", "Append a human resolution to a stored incident."],
          ["`lumis console --project FILE`", "Interactive menu over the same commands."],
          ["`lumis investigate --project FILE --incident FILE`", "Lower-level candidate-only baseline, used for comparisons."],
        ]),
        p("No command restarts a service, applies a patch or changes a rule. Error messages are deliberately sanitized so they do not leak credentials or payloads."),
      ]},
      {id: "extend", title: "Extension points", blocks: [
        table(["Interface", "Use"], [
          ["`Investigator`", "Replace the reference investigator. Its output is still validated by Lumis."],
          ["`EvidenceConnector`", "Add a read-only source: `async collect(query, incident)` returns observations."],
          ["`TriageGuard`", "Add your own extra rule for when triage may conclude."],
          ["`ProbeRunner`", "Provide a different, reviewed sandbox for experiments."],
        ]),
        source("python-api.md", "Python API"),
      ]},
    ],
  },
  {
    slug: "models", group: "Build", label: "Model providers", title: "Model providers",
    description: "Configure OpenRouter, OpenAI, Anthropic or Gemini for the optional investigator, choose a model, and understand what has and has not been tested.",
    sections: [
      {id: "providers", title: "Providers", blocks: [
        table(["Provider", "Default key variable", "Interface"], [
          ["`openrouter` (default)", "`OPENROUTER_API_KEY`", "Chat Completions with structured output"],
          ["`openai`", "`OPENAI_API_KEY`", "Responses API"],
          ["`anthropic`", "`ANTHROPIC_API_KEY`", "Messages API"],
          ["`gemini`", "`GEMINI_API_KEY`", "generateContent"],
        ]),
        code("yaml", "models:\n  provider: anthropic\n  model: your-anthropic-model-id\n  # api_key_env: MY_CUSTOM_KEY   # optional override\n  # reasoning: high              # minimal | low | medium | high"),
        p("There is no default model ID, no cross-provider fallback and no automatic retry. OpenRouter IDs use the `upstream-provider/model` form, and OpenRouter routing fallback is disabled."),
      ]},
      {id: "choose", title: "Choosing a model", blocks: [
        list(
          "It must support tool calling and structured output through the chosen provider interface.",
          "Reasoning models work well but think for a long time; budget for minutes, not seconds.",
          "Start with a small `request_limit` and raise it once you have seen typical runs.",
        ),
        note("What has been tested", "Live evaluation so far used one model: DeepSeek v4 pro through OpenRouter, on GridCast. The OpenAI, Anthropic and Gemini adapters pass contract tests with mocked transports, but their quality on real incidents has not been measured. Do not assume results carry over.", "amber"),
      ]},
      {id: "privacy", title: "Privacy", blocks: [
        p("The investigator sends the scoped incident context, query results and approved file contents to your provider. Lumis redacts common secrets and personal data patterns, but redaction is heuristic: review what your allowlist exposes. OpenAI response storage is disabled; each provider's own retention policy still applies. The provider conversation is not written to the report."),
        source("models.md", "Model providers"),
      ]},
    ],
  },
  {
    slug: "safety", group: "Build", label: "Safety and limits", title: "Safety and limits",
    description: "What Lumis is allowed to touch, how code access and redaction work, the opt-in diagnostic sandbox, and how to verify the SDK yourself.",
    sections: [
      {id: "boundaries", title: "Boundaries", blocks: [
        list(
          "**Read-only.** `read_only` is the only accepted action mode. There is no executor.",
          "**Operator-owned access.** Sources, queries, files and budgets are declared in YAML; the model cannot change them.",
          "**Opt-in model.** No model is called unless you enable the investigator for a run.",
          "**Bounded work.** Graph, query, request, tool, token, probe and time limits apply to every run.",
          "**Visible uncertainty.** Missing or degraded evidence stays unresolved; competing causes are not resolved by guesswork.",
        ),
      ]},
      {id: "code", title: "Code and Git access", blocks: [
        p("Operators approve repository roots, the entities they belong to, and exact files. Traversal, symlinks, special, binary or oversized files, unapproved extensions and secret or dot directories are refused, and your application's modules are never imported. Git access is a fixed set of local read-only commands with external diff tools and hooks disabled. Commit subjects are excluded unless `include_commit_subjects: true`."),
        note("Keep your own labels out of readable code", "In our evaluation, a docstring in an allowlisted file named the fault it described, and the model read it. Review allowlisted files and Git history for anything that gives away an answer you want the investigator to find on its own.", "amber"),
      ]},
      {id: "sandbox", title: "The diagnostic sandbox (opt-in)", blocks: [
        p("`probe` runs model-generated Python in an ephemeral Docker container: a digest-pinned image, no network, no host mounts, no forwarded environment, a read-only root, an unprivileged user, dropped capabilities and CPU, memory, process and time limits. Approved files are copied in; nothing is downloaded. It is disabled unless `investigator.sandbox.enabled: true`."),
        p("Probe results are always degraded evidence: they cannot prove production behaviour or satisfy a terminal check. Containers share the host kernel, so use a dedicated, rootless development daemon, never a production one."),
      ]},
      {id: "redaction", title: "Redaction", blocks: [
        p("Context sent to a model and stored receipts are redacted for common credentials and personal data patterns, without masking ordinary telemetry such as decimals, timestamps or IP addresses. It is a safety net, not a guarantee."),
      ]},
      {id: "verify", title: "Verify the SDK yourself", blocks: [
        code("bash", "git clone https://github.com/soloshun/lumis-sdk.git && cd lumis-sdk\nuv sync --locked --all-groups\nuv run ruff check . && uv run mypy src\nuv run pytest\nuv run bandit --recursive --severity-level medium --confidence-level medium src\nuv audit --locked"),
        p("The test suite uses scripted models and mocked transports. It verifies contracts, budgets and failure behaviour, not diagnosis quality on live systems."),
        source("sandbox.md", "Sandbox threat model"),
      ]},
    ],
  },

  // ------------------------------------------------------------------ Project
  {
    slug: "evaluation", group: "Project", label: "Evaluation: GridCast", title: "Evaluation on the GridCast estate",
    description: "What we measured when we ran Lumis against fifteen injected failures on a live reference estate, how it compares with simpler approaches, and what went wrong.",
    sections: [
      {id: "setup", title: "The estate and the protocol", blocks: [
        p(`GridCast is an open reference estate we built for this purpose: a synthetic electricity-demand forecaster with ten services on Kubernetes (kind), Prometheus, Loki, Tempo, Prefect and PostgreSQL, external weather and telemetry vendors, and changes made through GitOps. We injected fifteen different failures through ordinary channels (releases, configuration, rotated secrets, resource limits, a model promotion, vendor outages and silent data problems). Five of them were added later, specifically to be hard. Everything is public in the [GridCast cookbook](${COOKBOOKS}).`),
        p("For each failure the estate's own alerts opened one incident, which was then frozen: every system answered the same incident with the same evidence window. The ground truth was read only after all reports existed. A run counts as correct only if its top answer names the right component and the right mechanism."),
      ]},
      {id: "systems", title: "What was compared", blocks: [
        table(["System", "What it gets"], [
          ["Rules only", "Lumis' deterministic checks, no model."],
          ["Model, alert only", "The alert, the affected services and the time window. Like pasting an alert into a chat assistant."],
          ["Model + graph", "The same, plus the service graph."],
          ["One model call with evidence", "The graph plus the facts Lumis collected for its checks, in one completion."],
          ["Lumis", "Triage, then the investigator, then mechanical assessment."],
        ]),
        p("Every model-based system used the same model: DeepSeek v4 pro through OpenRouter, reasoning effort high."),
      ]},
      {id: "results", title: "Results", blocks: [
        table(["", "Rules only", "Model, alert only", "Model + graph", "One call with evidence", "Lumis"], [
          ["Correct (component and mechanism)", "0.57", "0.04", "0.18", "0.54", "**0.89**"],
          ["Hard set (silent, partial, decoy faults)", "0 / 20", "0 / 8", "2 / 8", "2 / 8", "**7 / 8**"],
          ["Model cost per run", "$0", "$0.005", "$0.015", "$0.035", "$0.14"],
          ["Median time per run", "0.13 s", "—", "—", "224 s", "225 s"],
        ]),
        p("Figures exclude one scenario (N) after we found a ground-truth leak; with it, Lumis scored 0.90. Lumis concluded 22 times on the remaining scenarios and was right 21 times. When evidence did not settle a question, it said so instead of guessing. The rules score reflects leads: rules concluded only on the one scenario with a sufficient terminal check, and were right every time."),
        list(
          "**Without evidence, the model guesses.** Given only the alert, it named the right cause and mechanism once in 28 runs. It usually found the symptomatic service and invented a plausible mechanism.",
          "**Evidence does most of the work.** One evidence-fed call reached 0.54. The largest single jump is from no evidence to curated evidence.",
          "**Reach matters on hard faults.** The facts that decided the hard scenarios (a timeout commit, a CPU-limit commit, a missing zone) were not in any pre-collected bundle. An investigator that can ask for more found them.",
          "**A capable model with raw tools matched Lumis on the one clean scenario we could compare** (2 / 2 each), but needed about twice the tool calls and model requests, and its answer was unchecked free text.",
        ),
      ]},
      {id: "wrong", title: "What went wrong", blocks: [
        list(
          "**Our estate produced false alerts in the first run.** Two processes shared one telemetry identity and corrupted rate calculations. We fixed the estate and re-ran everything.",
          "**False zeros.** All four wrong conclusions in the first run rested on telemetry that reported a zero that was really missing data (see [evidence](/docs/evidence#unknown)).",
          "**A ground-truth leak**, found after the runs: a docstring in an allowlisted file named one scenario, and the unguided tool agent could read our own development history. That scenario is excluded, and a test now guards against labels in readable files.",
          "**Rubric revisions.** The regex rubric that scores mechanisms was revised twice after we inspected outputs; each revision applied to every system.",
          "**Thirteen SDK defects**, from redaction masking decimals to a routing parameter that broke one provider, were found and fixed during the integration. They are the bulk of what changed before 0.1.0.",
        ),
      ]},
      {id: "limits", title: "Limits", blocks: [
        note("Read these numbers as a proof of concept", "One synthetic estate whose code and scenarios were written by the same team, one model family, two runs per system per scenario. GPT, Claude, Gemini and Grok models were not tested. Stronger models may raise every rung, including the alert-only baseline.", "amber"),
        p(`Every number, transcript and correction is in the [research notes](${RESEARCH_NOTES}). The estate, harness and evaluation were built with AI assistance (Claude Opus 5.5); the research design and most scenarios came from the author. Claude was not one of the systems evaluated.`),
      ]},
    ],
  },
  {
    slug: "project", group: "Project", label: "Status and contributing", title: "Status, roadmap and contributing",
    description: "Where Lumis SDK is, what comes next, how to migrate from earlier versions, how to get in touch, and the research it comes from.",
    sections: [
      {id: "status", title: "Status", blocks: [
        p("Lumis SDK 0.1.0 is the first release of the current architecture. It covers the investigation part of a larger research direction: read-only incident context, deterministic triage, one optional investigator, mechanical assessment and audit records. It is experimental: useful for investigation and research today, not a production-hardened or generally validated tool."),
        table(["Done", "Next"], [
          ["YAML-led graph and discovery; Kubernetes, Prometheus, Loki, Tempo, Prefect, SQL and change sources", "Evaluation with other model families"],
          ["Deterministic triage with strict sufficiency rules", "Smaller cookbooks: a single web service, a single data pipeline"],
          ["One bounded investigator with four provider adapters", "`recent_changes_affecting` semantics and a connector conformance kit"],
          ["Mechanical assessment, competing-root abstention, audit store", "An independent security, performance and usability review"],
          ["Live evaluation on GridCast with one model", "Human verification of the evaluation's mechanism labels"],
        ]),
        p(`Not planned for the SDK at this stage: automatic remediation, automatic rule learning, or a hosted service. See the [roadmap](${GITHUB_REPO}/blob/main/ROADMAP.md) and [changelog](${GITHUB_REPO}/blob/main/CHANGELOG.md).`),
      ]},
      {id: "contact", title: "Get in touch", blocks: [
        p(`Lumis is early and small. Questions, ideas, bug reports and offers to help are welcome by email: [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}). The source is on [GitHub](${GITHUB_REPO}) under Apache-2.0.`),
      ]},
      {id: "migration", title: "Migrating from 0.0.x", blocks: [
        p("0.1.0 replaces the earlier framework entirely. The old `diagnose`, `resolve`, rules, plugins, memory and lifecycle interfaces were removed, with no compatibility layer. To migrate, start a fresh project with `lumis init`, map your incidents, identities, topology and observations to the current contracts, and re-express diagnostic rules as checks with predictions and falsifiers. Use a fresh audit store."),
        p(`The previous implementation is preserved on the [legacy branch](${GITHUB_REPO}/tree/legacy/pre-operational-intelligence-2026-10-02).`),
        source("migration.md", "Migration guide"),
      ]},
      {id: "research", title: "Research", blocks: [
        p(`Lumis grew out of [Agentic Self-Healing for Data & AI Pipelines: An Affordable Vendor-Agnostic Architecture using Open-Source Software](${PAPER_URL}) (arXiv 2608.01955, preprint), also available as a [PDF](${PAPER_PDF}). The paper describes a broader architecture that includes guarded recovery and verified learning. The SDK implements the investigation part only.`),
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
  lines.push("---", "", `Lumis SDK ${SDK_VERSION} · ${GITHUB_REPO}`);
  return lines.join("\n");
}
