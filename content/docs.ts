export type DocBlock =
  | { type: "p"; text: string }
  | { type: "note"; tone?: "blue" | "amber" | "green"; title: string; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "diagram"; code: string; caption?: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

export type DocSection = { id: string; title: string; blocks: DocBlock[] };
export type DocPage = {
  slug: string;
  group: string;
  label: string;
  title: string;
  description: string;
  nested?: boolean;
  sections: DocSection[];
};

export const SDK_VERSION = "0.1.0-dev";
export const RELEASED_VERSION = "0.0.8";
export const GITHUB_REPO = "https://github.com/soloshun/lumis-sdk";
export const PAPER_PDF = "/research/agentic-self-healing-for-data-and-ai-pipelines.pdf";
export const PAPER_TITLE = "Agentic Self-Healing for Data & AI Pipelines: An Affordable Vendor-Agnostic Architecture using Open-Source Software";

const architectureDiagram = `flowchart LR
    subgraph USERS[Project entry points]
        CLI[Lumis SDK CLI]
        PY[Python application]
    end
    subgraph CORE[Lumis SDK framework]
        CFG[Strict project and rule configuration]
        APP[Application services]
        DOMAIN[Domain contracts]
        PORTS[Provider ports]
    end
    subgraph LOCAL[Local reference adapters]
        DET[Deterministic diagnosis]
        MEM[SQLite incident memory]
        EVIDENCE[Bounded local JSON evidence]
        REPORT[Markdown and JSON reports]
        REDACT[Evidence redaction]
    end

    CLI --> CFG
    CLI --> DET
    CLI --> EVIDENCE
    CLI --> MEM
    CLI --> REPORT
    PY --> APP
    APP --> DOMAIN
    APP --> PORTS
    APP --> DET
    CFG --> DET
    EVIDENCE --> PORTS
    REDACT --> PORTS`;

const workflowDiagram = `flowchart TD
    A[IncidentInput] --> B[Bounded evidence collection]
    B --> C{Deterministic rules}
    C -- known signature --> D[Structured DiagnosisResult<br/>with explanation]
    C -- unknown --> E{Policy enabled and<br/>gateway injected?}
    E -- yes --> F[Bounded ModelGateway<br/>schema-validated hypothesis]
    E -- no --> G[Honest unknown result]
    D --> H[Markdown or JSON report]
    F --> H
    G --> H
    H --> I[(Operational memory<br/>unconfirmed_hypothesis)]`;

const lifecycleDiagram = `flowchart LR
    D[Detect] --> T[Triage] --> DG[Diagnose] --> P[Plan] --> A[Approve] --> R[Remediate] --> V[Verify] --> L[Learn]
    classDef shipped fill:#2962ff26,stroke:#2962ff;
    classDef contract fill:transparent,stroke:#8a93a2;
    classDef gated fill:#ffb02022,stroke:#ffb020;
    class D,T,DG,L shipped
    class P,A,V contract
    class R gated`;

const portsDiagram = `flowchart TD
    ENTRY[CLI and Python entry points] -- compose --> APP[Application services]
    APP --> DOMAIN[Domain contracts]
    APP -- call --> PORTS[Ports]
    ADAPTERS[Adapters<br/>deterministic · SQLite · evidence · reports · plugins] -. implement .-> PORTS`;

const orchestrationDiagram = `sequenceDiagram
    participant L as run_guarded_lifecycle
    participant C as ContextProvider
    participant D as DiagnosisService
    participant P as PolicyEvaluator
    participant A as ApprovalProvider
    participant V as RecoveryVerifier
    participant T as AuditTrail
    L->>C: get_context
    L->>D: diagnose
    L->>P: propose recommendation-only plan
    L->>A: request approval
    L->>V: record verification state
    L->>T: write audit events
    Note over L: no executor call exists`;

const install = `uv add "lumis-sdk>=0.0.8,<0.1.0"

# or, with pip
pip install "lumis-sdk==0.0.8"`;

const installSource = `git clone https://github.com/soloshun/lumis-sdk.git
cd lumis-sdk
uv sync --all-groups
uv run lumis --help`;

const projectConfig = `apiVersion: lumis.dev/v1
kind: Project
metadata:
  name: customer-pipeline
spec:
  environment: local
  memory:
    provider: sqlite
    path: .lumis/incidents.db
  reports:
    provider: markdown
    outputDir: .lumis/reports
  incidentSources:
    - provider: local-log
      path: logs/latest-failure.log
  evidenceProviders:
    - provider: local-json
      path: evidence/schema-diff.json
      kinds: [schema-diff]
      maxItems: 20
      maxTotalCharacters: 50000
      maxItemCharacters: 10000
      timeoutSeconds: 5
      redact: true
  rules:
    files: [rules.yml]
  model:
    enabled: false`;

const legacyRuleConfig = `apiVersion: lumis.dev/v1
kind: DiagnosisRuleSet
metadata:
  name: customer-pipeline-rules
spec:
  rules:
    - id: missing-customer-id
      name: missing-customer-id
      version: "1"
      priority: 100
      all_contains: ["KeyError", "customer_id"]
      classification: schema_change
      severity: medium
      summary: A required customer identifier was unavailable.
      root_cause_hypothesis: The upstream schema may have changed.
      confidence: 0.65
      missing_evidence: [current input schema, previous successful schema]
      recommended_next_steps:
        - Compare the current and previous successful schemas.
      suggested_playbook: investigate_schema_contract`;

const structuredRuleConfig = `apiVersion: lumis.dev/v1
kind: DiagnosisRule
metadata:
  name: missing-required-column
  version: "1"
spec:
  priority: 100
  match:
    all:
      - field: log.text
        contains: KeyError
      - field: schema.diff.removed_count
        greaterThan: 0
      - field: components.references
        anyElement:
          prefix: dbt.model.
    any:
      - field: component.type
        equals: transformation
      - field: labels.pipeline_domain
        equals: data
    not:
      - field: incident.status
        equals: resolved
  diagnosis:
    classification: schema_change
    severity: high
    summary: A required field was unavailable.
    hypothesis: The upstream schema or normalization mapping changed.
    confidence: 0.8
    confirmedFacts:
      - The current schema contains at least one removed field.
    missingEvidence:
      - Previous successful schema
      - Upstream change record
  evidence:
    required: [schema_diff]
  recommendedNextSteps:
    - Compare the current and previous successful schemas.
  suggestedPlaybook: investigate_schema_contract`;

const structuredRulePython = `from pathlib import Path

from lumis_sdk.adapters.deterministic import diagnose_structured
from lumis_sdk.config import load_diagnosis_rule
from lumis_sdk.domain import EvidenceItem

rule = load_diagnosis_rule(Path("rules/missing-required-column.yml"))
result = diagnose_structured(
    fields={
        "log": {"text": "ERROR KeyError: customer_id"},
        "schema": {"diff": {"removed_count": 1}},
        "component": {"type": "transformation"},
        "incident": {"status": "open"},
    },
    rules=[rule],
    evidence=[
        EvidenceItem(
            id="schema-diff-1",
            source="schema-registry",
            kind="schema_diff",
            detail="customer_id was removed",
            confidence=1.0,
            reference="schema://orders/current-vs-previous",
        )
    ],
)

if result.winner:
    print(result.winner.rule_id, result.selection_reason)
    print(result.winner.matched_conditions)
else:
    print(result.candidates[0].failed_conditions)`;

const pythonExample = `import asyncio
from pathlib import Path

from lumis_sdk.application import DiagnosisService
from lumis_sdk.config import load_config
from lumis_sdk.domain import IncidentInput

config = load_config(Path("lumis.yml"))
service = DiagnosisService(rules=config.rules)
incident = IncidentInput(
    source_tool="local-log",
    pipeline_name=config.project,
    raw_payload={"log": "ERROR KeyError: customer_id"},
)
diagnosis = asyncio.run(service.diagnose(incident))`;

const evidenceServiceExample = `import asyncio

from lumis_sdk.application import EvidenceService
from lumis_sdk.domain import EvidenceCollection, EvidenceRequest
from lumis_sdk.testkit import (
    FakeEvidenceProvider,
    make_test_evidence,
    make_test_incident,
)

request = EvidenceRequest(
    incident=make_test_incident(),
    kinds=["log_window", "schema_diff"],
    max_items=20,
    max_total_characters=100_000,
    max_item_characters=8_000,
    redact=True,
)
provider = FakeEvidenceProvider(
    EvidenceCollection(provider="fixture", items=[make_test_evidence()])
)
collection = asyncio.run(EvidenceService(provider).collect(request))`;

const evidenceProviderPort = `from typing import Protocol

from lumis_sdk.domain import EvidenceCollection, EvidenceRequest


class EvidenceProvider(Protocol):
    name: str

    async def collect(self, request: EvidenceRequest) -> EvidenceCollection: ...`;

const memoryExample = `from pathlib import Path

from lumis_sdk.adapters.sqlite import SQLiteMemoryStore
from lumis_sdk.testkit import assert_memory_store_contract

store = SQLiteMemoryStore(Path(".lumis/portable-memory.db"))
await assert_memory_store_contract(store)`;

const postgresExample = `from lumis_postgres_memory import PostgresMemoryPlugin
from lumis_sdk.config import PostgresMemoryConfig

config = PostgresMemoryConfig(
    provider="postgres",
    connectionUrlEnv="LUMIS_MEMORY_DATABASE_URL",
    schema="lumis_memory",
)
store = PostgresMemoryPlugin().create(config)`;

const proposalExample = `from datetime import UTC, datetime, timedelta

from lumis_sdk.application import ProposalService
from lumis_sdk.domain import (
    DocumentMetadata,
    EvidenceReference,
    ParameterDefinition,
    ParameterType,
    PlaybookAction,
    PlaybookDocument,
    PolicyDocument,
    PolicyRule,
    RiskLevel,
)

playbook = PlaybookDocument(
    metadata=DocumentMetadata(name="worker-recovery", version="1"),
    actions=[
        PlaybookAction(
            name="restart",
            summary="Recommend a bounded worker restart.",
            risk=RiskLevel.HIGH,
            parameters=[
                ParameterDefinition(
                    name="replicas",
                    type=ParameterType.INTEGER,
                    minimum=1,
                    maximum=5,
                )
            ],
        )
    ],
)
policy = PolicyDocument(
    metadata=DocumentMetadata(name="production-policy", version="4"),
    rules=[
        PolicyRule(
            playbook_name="worker-recovery",
            action_name="restart",
            approval_required=True,
        )
    ],
)

now = datetime.now(UTC)
proposal = ProposalService(playbook, policy).propose(
    proposal_id="proposal-123",
    diagnosis_id="diagnosis-123",
    diagnosis_digest="a" * 64,
    evidence=[EvidenceReference(id="log-1", source="collector", digest="b" * 64)],
    action_name="restart",
    parameters={"replicas": 2},
    created_at=now,
    expires_at=now + timedelta(minutes=15),
)
assert proposal.execution_allowed is False`;

const webhookExample = `from lumis_sdk.adapters.incidents import (
    InMemoryReplayGuard,
    WebhookConfig,
    normalize_webhook,
)

incident = normalize_webhook(
    body,
    headers,
    WebhookConfig(
        source_tool="pipeline-events",
        secret_env="PIPELINE_WEBHOOK_SECRET",
    ),
    InMemoryReplayGuard(),
)`;

const pluginManifest = `{
  "apiVersion": "lumis.dev/v1",
  "kind": "PluginManifest",
  "metadata": { "name": "acme-evidence", "version": "1.2.0" },
  "spec": {
    "entryPoint": "acme-evidence",
    "capabilities": ["evidence_provider"],
    "supportStatus": "community",
    "sdk": { "minimum": "0.0.4", "maximumExclusive": "0.1.0" },
    "requiredAuthorities": ["network", "secrets"],
    "summary": "Collect bounded evidence from the Acme service."
  }
}`;

const pluginLoad = `from lumis_sdk.adapters.plugins import ImportlibPluginCatalog
from lumis_sdk.domain import PluginAuthority, PluginLoadPolicy

catalog = ImportlibPluginCatalog()
descriptors = catalog.discover()  # metadata only; imports no plugin module

loaded = catalog.load(
    "acme-evidence",
    policy=PluginLoadPolicy(
        allowed_authorities=[PluginAuthority.NETWORK, PluginAuthority.SECRETS]
    ),
)
provider = loaded.instance`;

export const docs: DocPage[] = [
  // ─── Start here ────────────────────────────────────────────────────────────
  {
    slug: "overview", group: "Start here", label: "Overview", title: "Lumis SDK documentation",
    description: "Build deterministic-first, evidence-grounded incident diagnosis and guarded recovery workflows with a small, vendor-neutral Python core.",
    sections: [
      { id: "what-is-lumis", title: "What is Lumis SDK?", blocks: [
        { type: "p", text: "Lumis SDK is the Apache-2.0 open-source implementation companion to the agentic recovery and incident response reference architecture proposed in the accompanying research. It turns bounded incident evidence—logs, schema diffs, metrics extracts, lineage context—into a structured, reviewable diagnosis, a Markdown or versioned JSON report, and an inspectable operational-memory record. Every step is designed so that facts, evidence, hypotheses, confidence, contradictions, and missing evidence remain distinguishable from each other." },
        { type: "p", text: "The project starts with Diagnosis-as-Code: failure signatures, hypotheses, calibration, and safe investigation steps live in versioned configuration that teams review like application code. Its direction is Healing-as-Code: a guarded lifecycle for detect, triage, diagnose, plan, approve, remediate, verify, and learn—where consequential actions stay behind explicit policy, approval, and verification boundaries. The reference architecture itself comes from published research led by the project's maintainer—see [the research behind Lumis SDK](/docs/project/research)." },
        { type: "note", tone: "amber", title: "Pre-alpha boundary", text: "Lumis SDK does not perform unrestricted or default production remediation. Execution-related models are recommendation and verification contracts—not authority granted to a model. A future core executor requires an RFC, typed allowlists, policy, approval, audit, limits, and verification." },
      ]},
      { id: "current-capabilities", title: "What ships today", blocks: [
        { type: "p", text: "Phase 1 of the roadmap — the trustworthy Python foundation — is complete on the main branch and heading into the 0.1.0 release. The latest published package is 0.0.8; the stable v1 configuration surface below ships with 0.1.0." },
        { type: "table", headers: ["Capability", "Current behavior"], rows: [
          ["Incident input", "Local log normalization, typed vendor-neutral incident contracts, and a framework-neutral webhook normalizer."],
          ["Evidence collection", "Async provider port, bounded collection service with timeouts and budgets, redaction, structured failures, and a local JSON reference adapter."],
          ["Deterministic diagnosis", "Legacy ordered text rules plus structured all/any/not rules with typed comparisons, required evidence, ranking, and per-candidate explanations."],
          ["Configuration", "Stable lumis.dev/v1 project, rule, report, manifest, playbook, and policy documents with checked JSON Schemas; released v1alpha1 documents migrate via lumis config migrate."],
          ["Reports", "Deterministic Markdown or versioned JSON with facts, evidence, hypotheses, truth state, confidence, and review requirement."],
          ["Operational memory", "SQLite reference store, human resolutions, visible truth state, transparent lexical search, and an independent PostgreSQL plugin."],
          ["Model boundary", "Explicit opt-in policy, budgets, schema-validated output, deterministic fallback, and a fake gateway for CI."],
          ["Guarded lifecycle", "Typed playbooks, default-deny policy, evidence-linked proposals, idempotent approvals, verification records, and conservative learning—no core action executor."],
          ["Plugin SDK", "Static strict manifests, metadata-only discovery, explicit policy-checked loading, and reusable factory contract tests."],
          ["CLI", "init, doctor, diagnose, report, resolve, memory search, rules validate, rules test, plugins list, plugins doctor, and config migrate."],
          ["Stability", "A public API inventory and compatibility policy define exactly what stays compatible across the 1.x line."],
          ["Supply chain", "SPDX SBOMs, signed provenance attestations, reproducible-build comparison, artifact content validation, and PyPI Trusted Publishing."],
        ]},
      ]},
      { id: "design-principles", title: "Design principles", blocks: [
        { type: "table", headers: ["Principle", "Meaning"], rows: [
          ["Deterministic first", "Known signatures and project-owned rules run before optional model reasoning."],
          ["Evidence grounded", "Facts, evidence, hypotheses, contradictions, confidence, and gaps stay separate."],
          ["Model optional", "The core works offline; providers implement a narrow, explicitly enabled gateway port."],
          ["Local first", "SQLite and Markdown are inspectable defaults, not mandatory hosted services."],
          ["Guarded recovery", "Plans are allowlisted recommendations; approval and verification are explicit boundaries."],
          ["Confirmed memory", "Model output is never silently promoted into confirmed operational truth."],
          ["Vendor agnostic", "Domain and application packages import no observability, orchestration, cloud, or agent SDK."],
        ]},
      ]},
      { id: "choose-a-path", title: "Choose a path", blocks: [
        { type: "list", items: [
          "New to Lumis SDK: complete the five-minute quickstart, then read the framework workflow.",
          "Embedding diagnosis in a Python application: start with the Python API overview.",
          "Defining project behavior: read the project configuration and rule references.",
          "Evaluating the architecture: review the architecture overview, ports and adapters, and the threat model.",
          "Extending the framework: read the plugin SDK and connector guides.",
          "Learning through runnable examples: open the cookbooks—every one is synthetic and offline by default.",
        ]},
      ]},
    ],
  },

  // ─── Getting started ───────────────────────────────────────────────────────
  {
    slug: "getting-started/quickstart", group: "Getting started", label: "Quickstart", title: "Quickstart",
    description: "Run a complete deterministic diagnosis locally—without a cloud account, model key, or network call.",
    sections: [
      { id: "requirements", title: "Requirements", blocks: [
        { type: "list", items: ["Python 3.11 or newer.", "uv for environment and dependency management (pip also works).", "No credentials, model keys, or network access—the entire quickstart runs offline."] },
      ]},
      { id: "install", title: "Install", blocks: [
        { type: "p", text: "Lumis SDK is published to PyPI as lumis-sdk. Reviewed releases are published through GitHub Actions with PyPI Trusted Publishing, so every package is traceable to a reviewed commit." },
        { type: "code", language: "shell", code: install },
        { type: "p", text: "To explore the repository, cookbooks, and tests directly, clone and sync instead:" },
        { type: "code", language: "shell", code: installSource },
      ]},
      { id: "run", title: "Run the local example", blocks: [
        { type: "p", text: "The simple-log-diagnosis cookbook contains a synthetic failure log, a project document, and a small rule set. First validate the setup, then diagnose:" },
        { type: "code", language: "shell", code: `uv run lumis doctor \\
  --config cookbook/simple-log-diagnosis/lumis/lumis.yml

uv run lumis diagnose \\
  --config cookbook/simple-log-diagnosis/lumis/lumis.yml` },
        { type: "p", text: "diagnose reads the bounded local log, evaluates the configured rules in deterministic order, writes a Markdown report to the configured output directory, stores an unconfirmed incident episode in local SQLite, and prints the incident ID. doctor validates configuration and paths without writing any state; neither command makes a network or model call." },
      ]},
      { id: "confirm", title: "Inspect, confirm, and search", blocks: [
        { type: "code", language: "shell", code: `uv run lumis report <incident-id> --config path/to/lumis.yml

uv run lumis resolve <incident-id> \\
  --resolution "Human-confirmed cause, action, and outcome." \\
  --config path/to/lumis.yml

uv run lumis memory search "KeyError customer_id" --config path/to/lumis.yml` },
        { type: "p", text: "report prints the stored diagnosis and any confirmed resolution. resolve records what a person actually confirmed—the cause, the action taken, and the outcome. memory search retrieves past episodes with transparent keyword scoring, so you can see exactly why a record matched." },
        { type: "note", tone: "green", title: "Truth transition", text: "A human resolution changes local memory from unconfirmed_hypothesis to human_confirmed. Model text never performs this transition—only explicit human or verifier confirmation does." },
      ]},
      { id: "next", title: "Next steps", blocks: [
        { type: "list", items: [
          "Create your own project with lumis init—it writes a minimal Project and rule set without overwriting existing files.",
          "Read the project configuration reference before adapting a real log source.",
          "Read the framework workflow to see how the pieces compose end to end.",
          "Learn the Python API if you are embedding diagnosis into another application.",
        ]},
      ]},
    ],
  },
  {
    slug: "getting-started/framework-workflow", group: "Getting started", label: "Framework workflow", title: "The framework workflow",
    description: "See how incident context moves through bounded evidence, deterministic diagnosis, optional reasoning, guarded proposals, verification, and confirmed learning.",
    sections: [
      { id: "inputs", title: "1. Normalize bounded context", blocks: [
        { type: "p", text: "A consuming application creates an IncidentInput from whatever detected the failure—a local log, a webhook payload, or its own monitoring. Evidence providers then contribute typed, bounded context: EvidenceService enforces timeouts, kind filtering, duplicate handling, item and character budgets, and optional redaction before anything reaches diagnosis. Provider errors become structured failures, never silent empty successes." },
        { type: "note", title: "Authority stays outside the payload", text: "Logs, tickets, runbooks, source code, and model output are untrusted data. Supplying content to the framework does not grant it filesystem, network, cloud, or execution authority." },
      ]},
      { id: "reasoning", title: "2. Diagnose deterministically first", blocks: [
        { type: "p", text: "DiagnosisService evaluates ordered project rules first. A known match returns evidence references and explanation metadata—rule ID, version, priority, matched conditions. An unknown result can route to a ModelGateway only when both an enabled ModelUsePolicy and a gateway implementation are supplied; otherwise the honest unknown result is returned unchanged." },
        { type: "diagram", code: workflowDiagram, caption: "One incident's path from input to unconfirmed memory" },
      ]},
      { id: "governance", title: "3. Propose and govern", blocks: [
        { type: "p", text: "ProposalService selects an action from a versioned, typed playbook, evaluates it against a default-deny policy document, links it to the diagnosis and evidence by digest, and bounds its parameters. The result is an ActionProposal with execution_allowed=false and an explicit expiry. ApprovalDecision records who approved or rejected it and why; high-risk actions can never auto-approve. The guarded lifecycle orchestrator ties context, diagnosis, proposal, approval, verification, and audit together—and intentionally has no action executor." },
      ]},
      { id: "learning", title: "4. Learn only from confirmation", blocks: [
        { type: "p", text: "Operational memory starts as unconfirmed_hypothesis. A human resolution moves it to human_confirmed. A passed verification with an explicit ConfirmedResolution moves it to verification_confirmed through learn_from_verification. Failed verification becomes rejected memory; unknown and timed-out results stay unconfirmed and escalate. Retrieval can be restricted to reusable (confirmed) records only." },
        { type: "note", tone: "green", title: "Expected outcome", text: "A complete workflow produces inspectable diagnosis, reporting, memory, proposal, approval, verification, and audit state—without ever making a false claim that production remediation occurred." },
      ]},
    ],
  },

  // ─── Concepts ──────────────────────────────────────────────────────────────
  {
    slug: "concepts/diagnosis-as-code", group: "Concepts", label: "Diagnosis-as-Code", title: "Diagnosis-as-Code",
    description: "Represent incident diagnosis as versioned, reviewable configuration and typed evidence—not opaque model output.",
    sections: [
      { id: "model", title: "The operating model", blocks: [
        { type: "p", text: "Diagnosis-as-Code makes failure signatures, hypotheses, calibration, missing evidence, and investigation steps explicit. Project teams own these rules, keep them next to the systems they describe, and review changes to them like application code. Because evaluation is deterministic, the same incident and the same rules always produce the same diagnosis—which makes diagnoses testable in CI with fixtures." },
        { type: "list", items: [
          "Normalize a bounded incident into a vendor-neutral contract.",
          "Collect typed evidence through bounded, redacted, failure-aware providers.",
          "Evaluate stable, versioned rules in deterministic priority order.",
          "Keep observed facts separate from causal hypotheses.",
          "Expose missing evidence and human-review requirements explicitly.",
          "Persist the report and truth state in inspectable local storage.",
        ]},
      ]},
      { id: "confidence", title: "Confidence is not authority", blocks: [
        { type: "p", text: "Rule confidence is authored calibration: how strongly a known signature supports the configured hypothesis. A specific error plus a verified schema diff may justify higher confidence than a generic timeout string. Lumis SDK does not compute confidence, and confidence cannot authorize remediation. Start conservatively, list missing evidence, review confirmed outcomes, and bump the rule version when calibration changes." },
        { type: "note", title: "Keep the boundaries separate", text: "Confidence, risk, approval, execution, and verification are different contracts. A high-confidence diagnosis can still require human review, and a low-risk plan can still be rejected." },
      ]},
      { id: "unknown", title: "Unknown stays honest", blocks: [
        { type: "p", text: "When no deterministic rule matches, the result remains unknown rather than fabricating a cause. Optional model reasoning runs only when policy is enabled and a gateway is explicitly injected—and its output is still an unconfirmed hypothesis that requires review. This is deliberate: a wrong-but-confident diagnosis is more dangerous than an honest unknown." },
      ]},
      { id: "two-engines", title: "Two rule engines, one contract", blocks: [
        { type: "p", text: "The SDK ships a legacy text engine (ordered all_contains rules over a log string) and a structured engine (all/any/not conditions over typed incident fields with required evidence and ranked candidates). Both produce the same DiagnosisResult contract. A project migrates its complete rule collection from one engine to the other in a single step—mixing both formats in one project is rejected to avoid ambiguous cross-engine ordering." },
      ]},
    ],
  },
  {
    slug: "concepts/healing-as-code", group: "Concepts", label: "Healing-as-Code", title: "Healing-as-Code",
    description: "Understand the long-term direction: a versioned, policy-controlled recovery lifecycle whose decisions and outcomes can be inspected.",
    sections: [
      { id: "direction", title: "A direction, not a shipped executor", blocks: [
        { type: "p", text: "Healing-as-Code is the project's direction from diagnosis toward the full lifecycle: detect, triage, diagnose, plan, approve, remediate, verify, and learn. As of 0.0.8, Lumis SDK ships diagnosis-centered behavior plus typed, tested contracts for planning (versioned playbooks and evidence-linked proposals), approval (idempotent, attributable decisions), verification (explicit passed/failed/unknown/timed-out records), and learning (conservative truth promotion)—but no core action executor." },
        { type: "note", tone: "amber", title: "Do not overread the name", text: "An ActionProposal is a recommendation with execution_allowed=false. Approval is recorded state. Verification records a bounded result. None of these contracts grants production authority or proves that an action ran." },
      ]},
      { id: "properties", title: "Required properties", blocks: [
        { type: "list", items: [
          "Every executable action must come from a typed, versioned allowlist (a playbook).",
          "Policy must evaluate risk before approval, and unknown actions must fail closed.",
          "High-risk and irreversible work cannot auto-approve.",
          "Proposals must be linked to their diagnosis and evidence by digest, and must expire.",
          "Audit events must make every transition inspectable.",
          "Execution must be idempotent and bounded.",
          "Verification must follow execution before recovery is confirmed.",
          "Learning must use confirmed outcomes, not model confidence.",
        ]},
      ]},
      { id: "roadmap", title: "How the roadmap approaches it", blocks: [
        { type: "table", headers: ["Phase", "Direction", "Status"], rows: [
          ["Phase 1 — trustworthy Python foundation", "Stable contracts, deterministic diagnosis, guarded proposals, verification learning, and supply-chain hardening.", "Complete; releasing as 0.1.0"],
          ["Phase 2 — model, prompt, and bounded agents", "Provider-neutral model routing, prompt packages, read-only evidence planning, loop guards, and evaluation gates.", "Next"],
          ["Phase 3 — intelligence, memory, and integrations", "Correlation, lineage, rule analytics, memory quality, semantic retrieval, and demand-led integrations.", "Planned"],
          ["Phase 4 — guarded recovery and ecosystem", "Side-effect-aware plugin contracts, executor/verifier protocols, signing, and policy conformance.", "Planned; RFC-gated"],
        ]},
      ]},
    ],
  },
  {
    slug: "concepts/deterministic-first", group: "Concepts", label: "Deterministic first", title: "Deterministic-first reasoning",
    description: "Make known incident behavior reproducible and explainable before introducing probabilistic reasoning.",
    sections: [
      { id: "why", title: "Why deterministic first", blocks: [
        { type: "p", text: "Known signatures should not require a remote model, variable output, or an opaque prompt. Most operational failures a team sees are ones it has seen before; those deserve an answer that is versioned, ordered, testable, and owned alongside the systems it describes. Deterministic rules also give the optional model path a clean boundary: models only see the cases the rules could not explain." },
      ]},
      { id: "ordering", title: "Evaluation contract", blocks: [
        { type: "list", items: [
          "Rules sort by descending priority; equal priorities retain declared configuration order.",
          "Legacy rules match when every all_contains term occurs case-insensitively in the supplied log text.",
          "Structured rules combine all, any, and not condition groups over typed incident fields.",
          "Structured candidates rank by priority, then specificity, then stable input order—ties never resolve randomly.",
          "Every match exposes rule ID, rule version, priority, matched conditions or terms, and evidence IDs.",
          "No match returns an honest unknown diagnosis rather than fabricating a cause.",
        ]},
      ]},
      { id: "explanation", title: "Explanations you can test", blocks: [
        { type: "p", text: "The structured engine returns an explanation for every candidate—matched conditions, failed conditions, missing required evidence, and the selection reason for the winner. The CLI's rules test command evaluates a rule against a JSON fixture and emits machine-readable output, so rule behavior can be asserted in CI exactly like any other code." },
      ]},
      { id: "model-fallback", title: "Where models fit", blocks: [
        { type: "p", text: "A model is an optional escalation path for unknown cases. ModelUsePolicy bounds input characters, output tokens, tool calls, timeout, and prompt version. The gateway returns a schema-validated DiagnosisResult plus invocation metadata—provider, model, prompt version, and sizes—so model use stays auditable. Malformed output falls back to the deterministic unknown result." },
      ]},
    ],
  },
  {
    slug: "concepts/evidence-grounded", group: "Concepts", label: "Evidence grounded", title: "Evidence-grounded recovery",
    description: "Keep observation, hypothesis, uncertainty, contradiction, and missing context visible throughout the recovery lifecycle.",
    sections: [
      { id: "vocabulary", title: "The evidence vocabulary", blocks: [
        { type: "table", headers: ["Contract", "Meaning"], rows: [
          ["EvidenceItem", "A bounded observation with source, kind, detail, confidence, optional reference, time, and attributes."],
          ["EvidenceRequest / EvidenceCollection", "The bounded ask (kinds, budgets, redaction flag) and the typed answer (items, structured failures, truncation signal)."],
          ["confirmed_facts", "Statements directly supported by supplied context."],
          ["root_cause_hypothesis", "A causal possibility that remains explicitly uncertain."],
          ["missing_evidence", "Context required to strengthen, contradict, or reject the hypothesis."],
          ["requires_human_review", "An explicit review boundary, true by default."],
        ]},
      ]},
      { id: "bounded", title: "Collection stays bounded and failure-aware", blocks: [
        { type: "p", text: "EvidenceService enforces a timeout, an evidence-kind allowlist, duplicate-ID handling, per-item and total character budgets, and optional conservative redaction on every provider. Oversized details are marked and truncated rather than silently dropped. Provider exceptions and timeouts become EvidenceFailure values in the collection—unavailable context can never be mistaken for a confirmed observation." },
      ]},
      { id: "confidence", title: "Confidence does not authorize action", blocks: [
        { type: "p", text: "Deterministic-rule confidence is authored calibration, not a computed probability. Model confidence is also an unconfirmed claim. Risk, policy, approval, execution, verification, and truth state remain separate decisions with separate contracts." },
      ]},
      { id: "required-vs-missing", title: "Required evidence versus missing evidence", blocks: [
        { type: "p", text: "Structured rules distinguish two roles. spec.evidence.required is a hard match precondition: the rule cannot win until every required kind is supplied. spec.diagnosis.missingEvidence records follow-up context that would strengthen or contradict an already-matched hypothesis. A value cannot appear in both lists—ambiguous duplication fails validation." },
      ]},
    ],
  },
  {
    slug: "concepts/guarded-recovery", group: "Concepts", label: "Guarded recovery", title: "Guarded recovery",
    description: "Follow a full recovery lifecycle while keeping policy, approval, actuation, verification, and learning explicit.",
    sections: [
      { id: "lifecycle", title: "Lifecycle and current status", blocks: [
        { type: "diagram", code: lifecycleDiagram, caption: "Blue stages ship today, neutral stages are typed contracts, amber remediation is RFC-gated" },
        { type: "table", headers: ["Stage", "Current status"], rows: [
          ["Detect", "Local-log input, webhook normalization, and incident-source contracts; production detection stays external."],
          ["Triage", "Deterministic classification, severity, and missing context."],
          ["Diagnose", "Explainable legacy and structured rules; optional model gateway behind explicit policy."],
          ["Plan", "Versioned playbooks and evidence-linked, bounded, expiring proposals selected through default-deny policy."],
          ["Approve", "Revision-pinned, attributable, idempotent decisions; high risk never auto-approves."],
          ["Remediate", "No core executor. Future work requires an RFC, allowlists, policy, audit, limits, and sandbox tests."],
          ["Verify", "Explicit passed, failed, unknown, and timed-out records; non-passing outcomes escalate."],
          ["Learn", "Conservative truth transitions, reusable-only retrieval, and deterministic replay evaluation."],
        ]},
      ]},
      { id: "orchestrator", title: "Recommendation-only orchestration", blocks: [
        { type: "p", text: "run_guarded_lifecycle retrieves context, diagnoses, proposes a plan, requests approval, records a verification result, and writes audit events. It intentionally has no action executor and composes no infrastructure adapter—persistence and reporting attach separately through their own ports." },
        { type: "note", tone: "amber", title: "Execution requires an RFC", text: "Any future executor must define typed allowlists, policy, approval, audit, limits, signatures, idempotency, sandbox tests, and verification before it can enter core." },
      ]},
      { id: "failure-honesty", title: "Failure stays honest", blocks: [
        { type: "p", text: "Verification results are first-class: failed results become rejected memory, and unknown or timed-out results remain unconfirmed and require escalation. The framework never reports recovery it cannot support with an explicit confirmed resolution. This property—no false recovery claims—is a core invariant, not a convention." },
      ]},
    ],
  },
  {
    slug: "concepts/operational-memory", group: "Concepts", label: "Operational memory", title: "Operational memory",
    description: "Retain incident knowledge with visible truth state and transparent retrieval rather than silently promoting generated text into fact.",
    sections: [
      { id: "episode", title: "Incident episodes", blocks: [
        { type: "p", text: "IncidentEpisode combines a portable incident, its DiagnosisResult, and a TruthState. The provider-neutral MemoryStore port keeps storage replaceable: the SQLite reference adapter covers local use, and the independently packaged lumis-sdk-postgres-memory plugin provides durable shared memory for teams. incident_id is an idempotency key—repeating identical content is safe, while different content for the same key raises a conflict rather than silently overwriting history." },
      ]},
      { id: "truth", title: "Truth states", blocks: [
        { type: "table", headers: ["State", "Meaning"], rows: [
          ["unconfirmed_hypothesis", "Diagnosis retained without a confirmed resolution. Never reusable."],
          ["human_confirmed", "A person recorded the cause, action, and outcome."],
          ["verification_confirmed", "An explicit verified resolution tied to a passed verification record."],
          ["rejected", "The retained hypothesis was contradicted—by a person or a failed verification."],
          ["superseded", "Newer confirmed knowledge replaced the record."],
        ]},
      ]},
      { id: "retrieval", title: "Transparent retrieval", blocks: [
        { type: "p", text: "MemoryQuery supports text plus optional classification and pipeline filters, and reusable_only=True restricts results to human- or verification-confirmed records. Every MemoryMatch carries a non-negative score, human-readable reasons (matched terms and truth state), and score_components separating the lexical, filter, and truth contributions—so ranking is explainable, not a black box. Semantic retrieval belongs behind an optional adapter, never as a hidden default." },
      ]},
      { id: "evaluation", title: "Replay evaluation", blocks: [
        { type: "p", text: "lumis_sdk.evaluation.evaluate_replay replays a corpus of ReplayCase values through the deterministic engine and returns exact match counts. Keep corpora synthetic or public, version them with the application, and report methodology with results—this is how rule changes are validated against history without touching production data." },
      ]},
    ],
  },

  // ─── Architecture ──────────────────────────────────────────────────────────
  {
    slug: "architecture/overview", group: "Architecture", label: "Overview", title: "Architecture",
    description: "Understand the dependency rule, package map, evidence and plugin boundaries, and the optional model path.",
    sections: [
      { id: "system-map", title: "System map", blocks: [
        { type: "p", text: "The canonical picture: project entry points compose the framework core, and the core reaches infrastructure only through replaceable ports implemented by local reference adapters or independent plugins." },
        { type: "diagram", code: architectureDiagram, caption: "Entry points, framework core, and local reference adapters" },
      ]},
      { id: "dependency-rule", title: "Dependency rule", blocks: [
        { type: "list", items: [
          "domain depends only on Python, Pydantic, and standard-library types.",
          "application coordinates use cases through domain models and ports.",
          "ports describe replaceable capabilities.",
          "adapters implement local or provider-specific behavior.",
          "cli selects and composes adapters.",
        ]},
      ]},
      { id: "packages", title: "Package map", blocks: [
        { type: "table", headers: ["Package", "Responsibility", "Stability"], rows: [
          ["lumis_sdk.domain", "Incidents, evidence, diagnoses, truth states, playbooks, policies, proposals, approvals, verification, audit", "Canonical pre-1.0"],
          ["lumis_sdk.application", "Diagnosis, evidence collection, proposals, verification learning, and lifecycle orchestration", "Canonical pre-1.0"],
          ["lumis_sdk.ports", "Evidence, model, memory, reporting, context, policy, approval, verification, and audit boundaries", "Experimental"],
          ["lumis_sdk.adapters", "Deterministic rules, SQLite memory, local JSON evidence, Markdown/JSON reports, webhook, plugins", "Reference"],
          ["lumis_sdk.config", "Stable v1 documents, migration APIs, bounded loading, checked schemas", "Stable API"],
          ["lumis_sdk.security", "Conservative redaction and evidence-safety utilities", "Reference"],
          ["lumis_sdk.testkit", "Deterministic fakes, fixtures, and reusable contract assertions", "Experimental"],
          ["lumis_sdk.cli", "Local composition and user commands", "Pre-alpha interface"],
        ]},
      ]},
      { id: "evidence-boundary", title: "Evidence boundary", blocks: [
        { type: "p", text: "EvidenceService requests typed evidence through the async EvidenceProvider port. It enforces timeouts, kind filtering, stable duplicate handling, item and character budgets, and optional redaction before evidence reaches diagnosis. Provider errors return as structured failures, so unavailable context cannot be mistaken for a confirmed observation. The local-json adapter is the offline reference; independent packages implement the same port without introducing vendor types into core." },
      ]},
      { id: "plugin-boundary", title: "Plugin boundary", blocks: [
        { type: "p", text: "Plugin distributions register the lumis_sdk.plugins entry-point group and ship a strict static manifest. Discovery validates identity, SDK compatibility, support status, capabilities, and authority requests without importing any plugin module. Loading is explicit, policy-checked, and denied sensitive authorities by default. Core remains fully usable with no plugins installed." },
      ]},
      { id: "model-routing", title: "Optional model routing", blocks: [
        { type: "p", text: "DiagnosisService invokes a ModelGateway only when deterministic classification is unknown, ModelUsePolicy.enabled is true, and a gateway has been injected. The gateway receives bounded, redacted domain data and returns a schema-validated diagnosis plus provider, model, and prompt metadata. Provider SDK types never appear in domain or application contracts." },
      ]},
    ],
  },
  {
    slug: "architecture/ports-and-adapters", group: "Architecture", label: "Ports and adapters", title: "Ports and adapters",
    description: "Trace the dependency direction that keeps incident and recovery semantics independent of infrastructure vendors.",
    sections: [
      { id: "rule", title: "Dependency direction", blocks: [
        { type: "diagram", code: portsDiagram, caption: "Dependencies point inward; adapters implement ports, never the reverse" },
        { type: "p", text: "Domain depends only on Python, Pydantic, and standard-library types. Application coordinates domain and ports. Adapters implement local or provider-specific behavior. The CLI selects concrete adapters. Nothing in domain or application knows which database, model provider, or observability vendor is in play." },
      ]},
      { id: "boundaries", title: "What belongs where", blocks: [
        { type: "table", headers: ["Layer", "Owns", "Must not own"], rows: [
          ["Domain", "Incidents, evidence, diagnoses, playbooks, proposals, approvals, verification, truth", "Database, HTTP, CLI, cloud, agent SDK"],
          ["Application", "Use-case orchestration, collection budgets, lifecycle order", "SQLite, hosted products, provider SDKs"],
          ["Ports", "Provider-neutral capability protocols", "Concrete credentials or clients"],
          ["Adapters", "Deterministic rules, SQLite, Markdown/JSON, webhook, plugin catalog", "Core business semantics"],
          ["CLI", "Composition and user commands", "Reusable domain policy"],
        ]},
      ]},
      { id: "extension", title: "Extension rule", blocks: [
        { type: "p", text: "Substantial vendor connectors ship as independent packages when practical—the repository already proves this with lumis-sdk-postgres-memory and lumis-sdk-http-json-evidence, neither of which adds its driver to core. This keeps core installation small and makes permissions, trust, maintenance, and compatibility visible per connector." },
      ]},
    ],
  },
  {
    slug: "architecture/lifecycle-contracts", group: "Architecture", label: "Lifecycle contracts", title: "Guarded lifecycle contracts",
    description: "Inspect the transport-neutral contracts for context, playbooks, proposals, approval, verification, audit, and lifecycle results.",
    sections: [
      { id: "domain", title: "Domain state", blocks: [
        { type: "list", items: [
          "IncidentContext groups bounded ContextItem evidence for one incident.",
          "PlaybookDocument declares versioned, typed actions with risk levels and bounded parameter definitions.",
          "PolicyDocument maps playbook actions to approval requirements; unknown actions and missing rules fail closed.",
          "ActionProposal links a playbook action to a diagnosis and evidence by SHA-256 digest, bounds parameters, expires, and carries execution_allowed=false.",
          "ApprovalDecision records approved, rejected, or pending status plus approver, reason, and revision pins.",
          "VerificationRequest, VerificationCheck, and VerificationRecord capture explicit passed, failed, unknown, or timed-out outcomes.",
          "AuditEvent records inspectable transition detail; LifecycleResult returns the complete non-executing run.",
        ]},
      ]},
      { id: "orchestration", title: "Current orchestration", blocks: [
        { type: "diagram", code: orchestrationDiagram, caption: "run_guarded_lifecycle coordinates ports — and never executes" },
        { type: "p", text: "Evidence collection, persistence, and report writing compose separately through their own ports and adapters, so applications choose exactly which capabilities to wire in." },
      ]},
      { id: "invariants", title: "Recovery invariants", blocks: [
        { type: "note", tone: "amber", title: "Future execution boundary", text: "Execution must require an approved, allowlisted, unexpired proposal. Verification must follow execution. High-risk actions cannot auto-approve. Failed verification must escalate. Learning must use confirmed outcomes." },
      ]},
    ],
  },
  {
    slug: "architecture/model-boundary", group: "Architecture", label: "Model boundary", title: "Optional model boundary",
    description: "Integrate probabilistic reasoning without coupling the core to a provider or granting a model execution authority.",
    sections: [
      { id: "routing", title: "Routing conditions", blocks: [
        { type: "p", text: "DiagnosisService calls a ModelGateway only when three conditions hold at once: the deterministic classification is unknown, model policy is enabled, and a gateway has been injected by the application. If any condition fails, the deterministic result is returned unchanged. There is no ambient model default, no bundled provider, and no billable call in CI—tests use the fake gateway from the testkit." },
      ]},
      { id: "policy", title: "ModelUsePolicy", blocks: [
        { type: "table", headers: ["Field", "Default"], rows: [
          ["enabled", "false"],
          ["max_input_characters", "20,000"],
          ["max_output_tokens", "2,000"],
          ["max_tool_calls", "8"],
          ["timeout", "30 seconds"],
          ["prompt_version", "diagnosis-v1"],
        ]},
      ]},
      { id: "audit", title: "Auditable output", blocks: [
        { type: "p", text: "ModelInvocation pairs a schema-validated diagnosis with provider, model, prompt version, input character count, and optional output token count. Redaction and minimum-necessary context happen before provider invocation. Model output enters memory as an unconfirmed hypothesis, exactly like a deterministic one." },
        { type: "note", title: "Framework-neutral", text: "Plain Python, Pydantic AI, LangGraph, Agno, or another runtime may implement or consume the boundary. None is a mandatory Lumis SDK core dependency." },
      ]},
    ],
  },
  {
    slug: "architecture/framework-and-cookbooks", group: "Architecture", label: "Framework boundaries", title: "Framework, applications, and cookbooks",
    description: "Separate reusable SDK capability from consuming applications, agent runtimes, synthetic scenarios, and hosted control planes.",
    sections: [
      { id: "core", title: "What the framework owns", blocks: [
        { type: "list", items: [
          "Vendor-neutral incident and recovery contracts.",
          "Deterministic diagnosis, explanation, and bounded evidence collection.",
          "Provider-neutral evidence, model, memory, reporting, context, policy, approval, verification, and audit ports.",
          "Strict configuration, redaction, local reports, local memory, webhook normalization, plugin discovery, CLI, and test doubles.",
        ]},
      ]},
      { id: "consumer", title: "What consuming applications own", blocks: [
        { type: "list", items: [
          "Monitoring and incident detection.",
          "Provider credentials and concrete connectors.",
          "Project-specific rules, runbooks, prompts, playbooks, and policies.",
          "Agent runtime and model selection.",
          "Production orchestration, deployment, transport security, and access policy.",
        ]},
      ]},
      { id: "cookbooks", title: "Why cookbooks remain separate", blocks: [
        { type: "p", text: "Cookbooks are executable learning and validation artifacts. They use synthetic data, own their optional dependencies (Agno and OpenRouter appear only there), and demonstrate how an application consumes core interfaces. They are examples—not the product boundary and not production control planes." },
      ]},
    ],
  },

  // ─── Configuration ─────────────────────────────────────────────────────────
  {
    slug: "configuration/project", group: "Configuration", label: "Project document", title: "Project configuration",
    description: "Configure local memory, reports, incident sources, evidence providers, rules, and model policy through a strict versioned public API.",
    sections: [
      { id: "project", title: "Project document", blocks: [
        { type: "code", language: "yaml", code: projectConfig },
        { type: "note", title: "Strict by default", text: "Unknown fields and unversioned configuration fail validation—a misspelled field is an error, never a silent no-op. Relative paths resolve from the project YAML location." },
      ]},
      { id: "fields", title: "Field reference", blocks: [
        { type: "table", headers: ["Field", "Meaning"], rows: [
          ["apiVersion", "lumis.dev/v1 for new documents. Released v1alpha1 project and rule documents still load with a deprecation warning through 1.x."],
          ["metadata.name", "Stable project or pipeline identifier used in incidents and reports."],
          ["metadata.labels", "Optional project-owned string labels for future adapters and policy."],
          ["spec.environment", "Environment label; defaults to local."],
          ["spec.memory", "sqlite (reference, with a local path) or postgres (independent plugin, configured via connectionUrlEnv)."],
          ["spec.reports.provider", "markdown or json in the reference package."],
          ["spec.reports.outputDir", "Report directory, relative to the project YAML."],
          ["spec.incidentSources", "Bounded source declarations; v1 includes local-log."],
          ["spec.evidenceProviders", "Ordered bounded evidence declarations; v1 includes local-json, and the optional http-json plugin adds a validated HTTPS connector."],
          ["spec.rules.files", "Ordered rule documents—either legacy DiagnosisRuleSet files or structured DiagnosisRule files, never mixed."],
          ["spec.model.enabled", "Explicit opt-in flag; it does not install or select a provider."],
        ]},
      ]},
      { id: "evidence-fields", title: "Evidence provider fields", blocks: [
        { type: "table", headers: ["Field", "Meaning"], rows: [
          ["provider", "Reference provider name; v1 supports local-json."],
          ["path", "Local JSON file containing an item list or an object with an items array."],
          ["kinds", "Optional evidence-kind allowlist; empty means all supplied kinds."],
          ["maxItems", "Maximum accepted items after filtering and duplicate removal."],
          ["maxTotalCharacters", "Maximum combined detail size accepted from the provider."],
          ["maxItemCharacters", "Maximum detail size per item; longer details are marked and truncated."],
          ["timeoutSeconds", "Collection deadline enforced by EvidenceService."],
          ["redact", "Conservatively redact likely secrets before evidence enters diagnosis or reports."],
        ]},
        { type: "p", text: "Provider errors, malformed files, timeouts, and unreadable paths become structured collection failures. They do not silently become facts, and they do not grant network, execution, or broader filesystem authority." },
      ]},
      { id: "postgres", title: "PostgreSQL memory (plugin)", blocks: [
        { type: "code", language: "yaml", code: `spec:
  memory:
    provider: postgres
    connectionUrlEnv: LUMIS_MEMORY_DATABASE_URL
    schema: lumis_memory
    connectTimeoutSeconds: 10
    maxSearchCandidates: 1000` },
        { type: "p", text: "connectionUrlEnv names an environment variable—never the URL itself, so credentials stay out of YAML. PostgreSQL requires the independently packaged lumis-sdk-postgres-memory plugin; the reference CLI store remains SQLite-only, and applications compose the async PostgreSQL MemoryStore through the Python and plugin API." },
      ]},
      { id: "limits", title: "Limits and secrets", blocks: [
        { type: "list", items: [
          "Project and rule documents are limited to one MiB each.",
          "The reference CLI reads local logs up to ten MiB.",
          "The local JSON evidence adapter reads files up to one MiB, then applies configured item, character, timeout, kind, duplicate, and redaction limits.",
          "Do not put plaintext credentials in project YAML—providers accept only environment-variable references.",
          "The v1 configuration intentionally has no generic secret string and no undocumented provider selector.",
        ]},
        { type: "p", text: "Checked JSON Schemas for the project, rule set, structured rule, and JSON report documents live in the repository's schemas directory and are verified in CI to match the Pydantic contracts, so editors and tooling can validate configuration as you type." },
      ]},
    ],
  },
  {
    slug: "configuration/rules", group: "Configuration", label: "Text rules (legacy)", title: "Deterministic text rules",
    description: "Encode stable log-signature rules, evidence gaps, and safe investigation steps in a versioned rule set.",
    sections: [
      { id: "example", title: "Rule-set document", blocks: [
        { type: "code", language: "yaml", code: legacyRuleConfig },
        { type: "p", text: "A DiagnosisRuleSet holds ordered text rules for the common case where the incident signal is one log string. Each rule carries its own identity, calibration, and safe next steps." },
      ]},
      { id: "fields", title: "Rule fields", blocks: [
        { type: "table", headers: ["Field", "Meaning"], rows: [
          ["id", "Required stable machine-readable identity used in explanations and evidence references."],
          ["name", "Human-readable rule name retained in reports."],
          ["version", "Project-controlled rule revision; change it when the rule's meaning changes."],
          ["priority", "Higher values run first; equal priorities retain configured order."],
          ["all_contains", "Every text fragment must occur case-insensitively in the supplied log."],
          ["classification / severity", "Project-defined failure category and low/medium/high/critical severity."],
          ["summary / root_cause_hypothesis", "Observed failure class and its explicitly uncertain possible cause."],
          ["confidence", "Human-authored calibration of the hypothesis given this signature."],
          ["missing_evidence", "Context needed to strengthen, contradict, or reject the hypothesis."],
          ["recommended_next_steps", "Safe investigation work; never automatically executed."],
          ["suggested_playbook", "Candidate playbook name; never execution authority."],
        ]},
      ]},
      { id: "ordering", title: "Ordering and explanation", blocks: [
        { type: "p", text: "Rules run by descending priority and then file order. A successful match exposes rule ID, version, priority, matched terms, and evidence IDs through diagnose_text_with_explanation, so every result can be explained and reproduced." },
      ]},
      { id: "when-to-migrate", title: "When to use structured rules instead", blocks: [
        { type: "p", text: "all_contains matching is deliberately simple. When your incidents carry structured fields—schema diff counts, component types, labels, numeric thresholds—or when a rule should only win with certain evidence present, migrate the project to structured DiagnosisRule documents. A project uses one engine at a time; the structured-rules page includes the migration checklist." },
      ]},
    ],
  },
  {
    slug: "configuration/structured-rules", group: "Configuration", label: "Structured rules", title: "Structured rules",
    description: "Match typed incident fields with all/any/not conditions, comparisons, quantifiers, and required evidence—deterministically ranked and fully explainable.",
    sections: [
      { id: "document", title: "Rule document", blocks: [
        { type: "p", text: "Each file contains one strict kind: DiagnosisRule. Evaluation is local, deterministic, and model-free. all requires every condition, any requires at least one when present, and not requires every listed condition to be false." },
        { type: "code", language: "yaml", code: structuredRuleConfig },
      ]},
      { id: "operators", title: "Operators and quantifiers", blocks: [
        { type: "table", headers: ["Operator", "Behavior"], rows: [
          ["contains", "Case-insensitive substring comparison."],
          ["equals", "Exact string, number, or boolean comparison."],
          ["prefix", "Case-sensitive string prefix."],
          ["matchesRegex", "Python regular-expression search, validated when the rule loads."],
          ["greaterThan / greaterThanOrEqual / lessThan / lessThanOrEqual", "Numeric comparison."],
          ["anyElement / allElements", "Explicit quantifiers wrapping one scalar operator for list-valued fields."],
        ]},
        { type: "p", text: "Fields use dot paths (log.text, schema.diff.removed_count); callers may supply nested mappings or literal dotted keys. Empty lists fail both quantifiers, lists are limited to 100 scalar elements, and nested collections or oversized lists fail closed rather than being flattened or coerced to strings. Every condition defines exactly one operator—ambiguity fails validation." },
      ]},
      { id: "evidence", title: "Required evidence", blocks: [
        { type: "p", text: "spec.evidence.required is a hard match precondition: the rule cannot win until every required kind is supplied. spec.diagnosis.missingEvidence is different—it records follow-up context that would strengthen, contradict, or confirm an already-matched hypothesis. A value cannot appear in both lists." },
      ]},
      { id: "ranking", title: "Ranking and explanation", blocks: [
        { type: "p", text: "Matching candidates rank by descending priority, then descending specificity, then stable input order. Specificity weights all conditions twice, then counts any, not, and required-evidence entries. Every candidate—winner or not—exposes rule ID and version, priority, specificity, matched and failed conditions, missing required evidence, and evidence references. Quantified condition explanations include bounded actual values and matched element indexes." },
        { type: "code", language: "python", code: structuredRulePython },
      ]},
      { id: "testing", title: "Validation and fixture testing", blocks: [
        { type: "code", language: "shell", code: `lumis rules validate --config lumis.yml
lumis rules test --rule rules/schema-change.yml --input fixtures/schema-change.json` },
        { type: "p", text: "Fixture input contains a fields object and an optional evidence array of EvidenceItem objects. The command emits JSON suitable for CI assertions and editor integrations; input is bounded to one MiB and no network or model call is made." },
      ]},
      { id: "migration", title: "Migrating from all_contains", blocks: [
        { type: "list", items: [
          "Create one DiagnosisRule file per legacy rule; use metadata.name as the old id and metadata.version as the old version.",
          "Replace every all_contains term with an all condition on log.text.",
          "Move diagnosis fields under spec.diagnosis.",
          "Replace adopter-side list flattening with explicit anyElement or allElements conditions.",
          "Add required evidence and structured conditions where reliable signals exist.",
          "Test matching, non-matching, empty and oversized lists, missing evidence, and tie fixtures.",
          "Swap the project rule file list only after the complete collection passes—mixing engines is rejected.",
        ]},
      ]},
    ],
  },

  {
    slug: "configuration/migrate-to-v1", group: "Configuration", label: "Migrate to v1", title: "Migrate to lumis.dev/v1",
    description: "Upgrade released v1alpha1 documents to the stable v1 envelopes with a validated, deterministic, idempotent migration.",
    sections: [
      { id: "why", title: "What changed", blocks: [
        { type: "p", text: "The stable v1 envelopes preserve the released alpha field shapes and change the version marker. Migration validates the complete document before producing output—unknown fields and invalid values fail closed. Released v1alpha1 project and rule documents keep loading with a LumisV1Alpha1DeprecationWarning through the 1.x line and are planned for removal in 2.0, so treat the warning as scheduled upgrade work, not a failure." },
        { type: "p", text: "Supported kinds: Project, DiagnosisRuleSet, DiagnosisRule, DiagnosisReport, PluginManifest, Playbook, and RecoveryPolicy." },
      ]},
      { id: "cli", title: "Migrate with the CLI", blocks: [
        { type: "code", language: "shell", code: `# preview stable YAML on standard output
lumis config migrate lumis.yml

# write to a new path (existing output is never replaced without --force)
lumis config migrate lumis.yml --output lumis.v1.yml` },
        { type: "p", text: "JSON input is accepted and the canonical migration output is YAML. Running migration on an already-v1 file validates it and is idempotent." },
      ]},
      { id: "collection", title: "Migrate a project collection", blocks: [
        { type: "code", language: "shell", code: `lumis config migrate lumis.yml -o lumis.v1.yml
lumis config migrate rules.yml -o rules.v1.yml
lumis doctor --config lumis.v1.yml
lumis rules validate --config lumis.v1.yml` },
        { type: "p", text: "Update spec.rules.files if output filenames change. The loader rejects a v1 project that references v1alpha1 rules, preventing a partially migrated collection from appearing valid." },
      ]},
      { id: "python", title: "Python API", blocks: [
        { type: "code", language: "python", code: `from pathlib import Path

from lumis_sdk.config import migrate_config_file, render_migrated_yaml

result = migrate_config_file(Path("lumis.yml"))
print(result.kind, result.changed, result.target_api_version)
print(render_migrated_yaml(result))` },
        { type: "p", text: "migrate_config_document accepts an in-memory mapping. Both APIs return a frozen ConfigMigrationResult and never write files themselves." },
        { type: "note", tone: "green", title: "Safe by construction", text: "Migration is deterministic and idempotent, output never overwrites existing files by default, and YAML parsing rejects aliases and nesting deeper than 64 nodes before model validation." },
      ]},
    ],
  },

  // ─── Python API ────────────────────────────────────────────────────────────
  {
    slug: "python-api/overview", group: "Python API", label: "Overview", title: "Python API",
    description: "Use the public domain contracts, application services, and reference adapters from your own Python application.",
    sections: [
      { id: "surface", title: "The public surface", blocks: [
        { type: "table", headers: ["Import from", "What you get"], rows: [
          ["lumis_sdk.domain", "Strict vendor-neutral contracts: incidents, evidence, diagnoses, truth states, playbooks, policies, proposals, approvals, verification, audit."],
          ["lumis_sdk.application", "DiagnosisService, EvidenceService, ProposalService, learn_from_verification, and run_guarded_lifecycle."],
          ["lumis_sdk.ports", "Replaceable capability protocols for evidence, model, memory, reporting, context, policy, approval, verification, and audit."],
          ["lumis_sdk.adapters", "Reference implementations: deterministic rules, SQLite memory, local JSON evidence, Markdown/JSON reports, webhook normalization, plugin catalog."],
          ["lumis_sdk.config", "load_config, load_diagnosis_rule, migrate_config_file, and the strict v1 document models."],
          ["lumis_sdk.testkit", "Deterministic fakes, fixture builders, and reusable contract assertions for CI."],
          ["lumis_sdk.evaluation", "Deterministic replay evaluation over versioned corpora."],
        ]},
      ]},
      { id: "first-diagnosis", title: "A first diagnosis", blocks: [
        { type: "code", language: "python", code: pythonExample },
        { type: "p", text: "DiagnosisService always runs the deterministic adapter first. Unknown results may route through a ModelGateway only when policy and dependency injection both allow it—there is nothing to disable, because nothing is enabled by default." },
      ]},
      { id: "strictness", title: "Strict contracts", blocks: [
        { type: "p", text: "Public domain models reject unknown fields. This makes integration mistakes visible immediately and prevents provider-specific data from silently leaking into core contracts. Everything is typed; mypy runs over the SDK source in CI." },
        { type: "note", title: "Stability posture", text: "Domain and application are the canonical pre-1.0 API. Ports are experimental and changes carry compatibility notes. Adding a new core port requires an RFC because it expands the framework's dependency and authority surface." },
      ]},
    ],
  },
  {
    slug: "python-api/evidence-and-reports", group: "Python API", label: "Evidence & reports", title: "Evidence collection and JSON reports", nested: true,
    description: "Collect bounded, typed, failure-aware evidence through the provider port, and emit versioned machine-readable reports.",
    sections: [
      { id: "port", title: "The evidence-provider contract", blocks: [
        { type: "p", text: "An evidence provider implements one asynchronous method. EvidenceRequest carries the incident, requested kinds, item and character budgets, and an explicit redaction flag; EvidenceCollection carries evidence, safe structured failures, and a truncation signal." },
        { type: "code", language: "python", code: evidenceProviderPort },
      ]},
      { id: "service", title: "Collect through EvidenceService", blocks: [
        { type: "p", text: "Always collect at an application boundary through EvidenceService, so provider output receives consistent timeout, kind filtering, duplicate-ID handling, redaction, per-item limits, and total-size limits regardless of which provider is behind the port:" },
        { type: "code", language: "python", code: evidenceServiceExample },
        { type: "p", text: "Provider exceptions and timeouts are represented as EvidenceFailure values—they are never silently treated as empty successful evidence." },
      ]},
      { id: "json-reports", title: "Versioned JSON reports", blocks: [
        { type: "p", text: "Set spec.reports.provider to json and lumis diagnose writes a stable lumis.dev/v1 DiagnosisReport: normalized incident input, structured diagnosis and triage, facts, evidence, hypothesis, confidence, missing evidence, recommended next steps, suggested playbook, explicit truth state, and an optional human-confirmed resolution. The checked schema ships in the repository for downstream consumers." },
        { type: "code", language: "python", code: `from lumis_sdk.adapters.reports import (
    JsonReportWriter,
    parse_json_report,
    render_json_report,
)` },
      ]},
      { id: "testkit", title: "Reusable testkit", blocks: [
        { type: "code", language: "python", code: `from lumis_sdk.testkit import (
    FakeEvidenceProvider,
    assert_evidence_collection_contract,
    assert_json_report_round_trip,
    make_test_evidence,
    make_test_incident,
)` },
        { type: "p", text: "These helpers depend only on Lumis SDK and Python—no live service, credentials, model call, or pytest runtime dependency—so third-party adapters can prove the same collection and round-trip behavior the reference adapters do." },
      ]},
      { id: "safety", title: "Safety boundary", blocks: [
        { type: "p", text: "Evidence remains untrusted data even after collection. Redaction is a conservative baseline, not a substitute for provider-side minimization and access control. Evidence providers do not gain execution authority, and JSON reports do not authorize a suggested playbook." },
      ]},
    ],
  },
  {
    slug: "python-api/memory", group: "Python API", label: "Memory", title: "Operational memory API", nested: true,
    description: "Persist incident episodes and confirmed resolutions through the provider-neutral MemoryStore port—locally in SQLite or shared in PostgreSQL.",
    sections: [
      { id: "contract", title: "The MemoryStore contract", blocks: [
        { type: "p", text: "lumis_sdk.ports.MemoryStore is the asynchronous contract for retained incident episodes, explicit confirmed resolutions, and transparent bounded retrieval. incident_id is an idempotency key: repeating identical content is safe, while different content for the same key raises MemoryConflictError. A resolution must target a saved episode, and model text never changes truth state." },
        { type: "code", language: "python", code: memoryExample },
        { type: "p", text: "assert_memory_store_contract runs the full behavioral contract against any implementation, so an independent adapter can prove it behaves exactly like the reference stores." },
      ]},
      { id: "postgres", title: "PostgreSQL plugin", blocks: [
        { type: "p", text: "For durable shared memory across a team, install the independently packaged plugin alongside a compatible core release:" },
        { type: "code", language: "shell", code: `pip install "lumis-sdk==0.0.8" "lumis-sdk-postgres-memory==0.1.1"` },
        { type: "code", language: "python", code: postgresExample },
        { type: "p", text: "The plugin declares network and secret authority in its manifest and reads only the named environment variable. Migrations are serialized, schema identifiers are validated, candidate reads are bounded, and search reasons use the same deterministic ranking contract as SQLite." },
      ]},
      { id: "retrieval", title: "Queries and scoring", blocks: [
        { type: "p", text: "MemoryQuery combines text with optional classification and pipeline filters; reusable_only=True returns only human- or verification-confirmed records. Every MemoryMatch exposes a score, human-readable reasons, and score_components (lexical, filters, truth), keeping ranking fully explainable." },
      ]},
    ],
  },
  {
    slug: "python-api/policy-verification-learning", group: "Python API", label: "Policy & verification", title: "Policy, verification, and learning", nested: true,
    description: "Propose allowlisted actions under default-deny policy, record explicit verification outcomes, and promote only confirmed truth into memory.",
    sections: [
      { id: "proposals", title: "Proposal-only governance", blocks: [
        { type: "p", text: "Build PlaybookDocument and PolicyDocument values from lumis_sdk.domain, then compose them with ProposalService. The service validates the requested action against the playbook, evaluates the policy (unknown actions and missing rules fail closed), checks evidence provenance, and bounds typed parameters. The proposal pins document revisions, links to the diagnosis by digest, and expires:" },
        { type: "code", language: "python", code: proposalExample },
        { type: "p", text: "ApprovalLedger is a small reference implementation of decision idempotency. Production applications should persist ApprovalDecisionRecord values in their own auditable store. Checked schemas exist for playbook, policy, and proposal documents." },
      ]},
      { id: "verification", title: "Verification-aware learning", blocks: [
        { type: "p", text: "Use VerificationRequest, VerificationRecord, and VerificationCheck for exchange and persistence. learn_from_verification applies conservative promotion rules to a MemoryStore: a passed result requires an explicit ConfirmedResolution with verified=True, truth_state=VERIFICATION_CONFIRMED, and the matching verification_id. Failed results become rejected memory. Unknown and timed-out results remain unconfirmed and require escalation—they never report recovery and never become reusable." },
        { type: "note", tone: "amber", title: "No optimistic promotion", text: "There is no code path that converts an unverified or ambiguous outcome into confirmed truth. If verification did not explicitly pass, memory does not say the system recovered." },
      ]},
      { id: "replay", title: "Replay evaluation", blocks: [
        { type: "p", text: "lumis_sdk.evaluation.evaluate_replay accepts ReplayCase values and returns exact deterministic counts, so rule and policy changes can be validated against a versioned corpus before they ship. Keep corpora synthetic or public, version them with the application, and report the methodology with the results." },
      ]},
    ],
  },
  {
    slug: "python-api/connectors", group: "Python API", label: "Connectors", title: "Webhook and evidence connectors", nested: true,
    description: "Normalize authenticated webhook deliveries into incidents, and collect remote evidence through the hardened HTTP JSON plugin.",
    sections: [
      { id: "webhook", title: "Generic webhook normalization", blocks: [
        { type: "p", text: "Lumis SDK does not embed a web server. Your application receives the request however it likes, then passes the exact body bytes and headers to normalize_webhook along with explicit security configuration and a replay guard:" },
        { type: "code", language: "python", code: webhookExample },
        { type: "p", text: "The adapter verifies an HMAC signature (sha256=<hex> over \"<unix timestamp>.<body bytes>\") in constant time, enforces clock-skew and payload limits, parses unique-key UTF-8 JSON with depth and node bounds, requires strict delivery IDs, and fails closed on replay claims. The in-memory guard suits local tools and tests; multi-process deployments must supply a durable atomic ReplayGuard." },
        { type: "note", title: "Transport stays yours", text: "TLS termination, HTTP method and content-type enforcement, source IP policy, rate limiting, queueing, request logging, and response status selection remain outside core—on purpose." },
      ]},
      { id: "http-evidence", title: "HTTP JSON evidence plugin", blocks: [
        { type: "p", text: "The independently packaged lumis-sdk-http-json-evidence plugin implements EvidenceProvider without adding httpx to core:" },
        { type: "code", language: "yaml", code: `spec:
  evidenceProviders:
    - provider: http-json
      url: https://evidence.example.test/v1/evidence
      allowedOrigins: [https://evidence.example.test]
      tokenEnv: LUMIS_EVIDENCE_TOKEN
      maxResponseBytes: 1000000
      timeoutSeconds: 5
      retries: 1` },
        { type: "p", text: "The connector requires HTTPS with an exact origin allowlist, never follows redirects, loads only the named token reference, sends minimized incident metadata rather than raw payloads, bounds response bytes before JSON parsing, and returns structured failures. EvidenceService still enforces kinds, item counts, character budgets, duplicate IDs, timeouts, and redaction on top." },
      ]},
    ],
  },
  {
    slug: "python-api/plugins", group: "Python API", label: "Plugin SDK", title: "Plugin SDK", nested: true,
    description: "Package adapters as independent distributions with static manifests, metadata-only discovery, and explicit policy-checked loading.",
    sections: [
      { id: "layout", title: "Package layout", blocks: [
        { type: "p", text: "A plugin registers one factory in the lumis_sdk.plugins entry-point group and ships a strict static manifest, lumis-plugin.json, at distribution root (limited to 64 KiB). The manifest version must equal the installed distribution version, and entryPoint must equal the registered entry-point name:" },
        { type: "code", language: "json", code: pluginManifest },
      ]},
      { id: "factory", title: "Factory contract", blocks: [
        { type: "p", text: "The entry point resolves to a zero-argument callable with a lumis_manifest attribute. Applications should normally wrap this shape in a typed callable class, as demonstrated by lumis_sdk.testkit.FakePluginFactory." },
        { type: "code", language: "python", code: `from lumis_sdk.domain import PluginManifest

MANIFEST = PluginManifest.model_validate_json(...)


def create_plugin() -> object:
    return AcmeEvidenceProvider(...)


create_plugin.lumis_manifest = MANIFEST` },
      ]},
      { id: "discovery", title: "Discovery and loading", blocks: [
        { type: "code", language: "python", code: pluginLoad },
        { type: "p", text: "Discovery validates distribution identity, SDK compatibility, support status, capabilities, and authority requests without importing plugin modules. The default load policy allows declared capability surfaces but denies every sensitive authority—network, secrets, and the rest must be granted explicitly. Loading fails for missing or invalid manifests, incompatible SDK versions, archived plugins, duplicates, entry-point mismatches, manifest mismatches, and import or factory failures." },
      ]},
      { id: "cli", title: "CLI inspection", blocks: [
        { type: "code", language: "shell", code: `lumis plugins list
lumis plugins list --json
lumis plugins doctor
lumis plugins doctor --json` },
        { type: "p", text: "Both commands inspect static metadata only; they never load or activate plugins." },
      ]},
      { id: "contract-testing", title: "Contract testing", blocks: [
        { type: "code", language: "python", code: `from lumis_sdk.testkit import assert_plugin_factory_contract

instance = assert_plugin_factory_contract(create_plugin, MANIFEST)` },
        { type: "p", text: "Capability-specific packages should additionally run the contract tests for the public port they implement—the evidence, report, and memory contracts all ship reusable assertions. The factory check does not prove network safety, credential handling, semantic correctness, or provider quality." },
      ]},
    ],
  },

  // ─── Reference ─────────────────────────────────────────────────────────────
  {
    slug: "reference/cli", group: "Reference", label: "CLI", title: "CLI reference",
    description: "Initialize projects, validate configuration and rules, diagnose local logs, inspect reports, confirm resolutions, search memory, and inspect plugins.",
    sections: [
      { id: "commands", title: "Commands", blocks: [
        { type: "table", headers: ["Command", "Purpose"], rows: [
          ["lumis init", "Create a minimal Project and rule set without overwriting existing files."],
          ["lumis doctor", "Validate config, rules, paths, and safe defaults without writing state."],
          ["lumis diagnose", "Diagnose a bounded local log; write a report and incident memory."],
          ["lumis report", "Print a stored report and any human-confirmed resolution."],
          ["lumis resolve", "Store a human-confirmed resolution and change truth state."],
          ["lumis memory search", "Search local incident memory with transparent keyword scoring."],
          ["lumis rules validate", "Validate rules and show stable IDs, versions, and priorities (supports --json)."],
          ["lumis rules test", "Evaluate one rule against a JSON fixture and emit CI-friendly JSON."],
          ["lumis plugins list", "Show discovered plugin metadata without importing plugin code (supports --json)."],
          ["lumis plugins doctor", "Check plugin manifests and compatibility without loading anything (supports --json)."],
          ["lumis config migrate", "Validate an alpha document and emit its stable lumis.dev/v1 equivalent, never overwriting output by default."],
        ]},
      ]},
      { id: "safety", title: "Command safety and stability", blocks: [
        { type: "p", text: "doctor, rules validate, rules test, config migrate, and the plugins commands make no network calls and write no incident state. diagnose writes only to explicitly configured local report and memory paths. Model assistance remains inactive unless application code supplies both an enabled policy and a gateway adapter—no CLI flag can turn a model on." },
        { type: "p", text: "Command names, exit-code classes, and the documented machine-readable JSON output of rules validate, rules test, plugins list, and plugins doctor are part of the stable 1.x surface; human-oriented prose may improve without a major release." },
      ]},
    ],
  },
  {
    slug: "reference/domain-models", group: "Reference", label: "Domain models", title: "Domain model reference",
    description: "Review the strict, vendor-neutral Pydantic contracts exported from lumis_sdk.domain.",
    sections: [
      { id: "diagnosis", title: "Incident and diagnosis", blocks: [
        { type: "table", headers: ["Type", "Purpose"], rows: [
          ["IncidentInput", "Source tool, optional pipeline, environment, and raw payload."],
          ["EvidenceItem / EvidenceRequest / EvidenceCollection / EvidenceFailure", "Bounded observations, the collection ask, the typed answer, and structured collection errors."],
          ["TriageResult", "Classification, severity, summary, and missing context."],
          ["DiagnosisResult", "Facts, hypothesis, confidence, evidence, gaps, next steps, method, and review flag."],
          ["ConfirmedResolution", "Human- or verification-confirmed cause, action, outcome, and truth state."],
          ["Severity / DiagnosisMethod / TruthState", "The shared enums used across diagnosis and memory."],
        ]},
      ]},
      { id: "governance", title: "Planning and governance", blocks: [
        { type: "table", headers: ["Type", "Purpose"], rows: [
          ["PlaybookDocument / PlaybookAction / ParameterDefinition", "Versioned allowlist of typed, bounded, risk-labeled actions."],
          ["PolicyDocument / PolicyRule", "Default-deny mapping from actions to approval requirements."],
          ["ActionProposal / EvidenceReference", "Recommendation-only, digest-linked, expiring proposal with bounded parameters."],
          ["ApprovalDecision / ApprovalDecisionRecord", "Explicit attributable approval state with idempotency support."],
          ["VerificationRequest / VerificationCheck / VerificationRecord", "Explicit passed, failed, unknown, or timed-out verification outcomes."],
          ["AuditEvent / LifecycleResult", "Inspectable transitions and the complete output of one non-executing lifecycle run."],
          ["PluginManifest / PluginLoadPolicy / PluginAuthority", "Static plugin identity, explicit load policy, and named sensitive authorities."],
        ]},
      ]},
      { id: "strictness", title: "Strict contracts", blocks: [
        { type: "p", text: "Public domain models reject unknown fields. This makes integration mistakes visible and prevents provider-specific data from silently leaking into core contracts. Proposal and approval documents additionally use canonical JSON with SHA-256 digests, so revisions can be pinned and tampering is detectable." },
      ]},
    ],
  },
  {
    slug: "reference/ports", group: "Reference", label: "Ports", title: "Port reference",
    description: "Implement replaceable capabilities without changing the Lumis SDK domain or application layer.",
    sections: [
      { id: "ports", title: "Current public ports", blocks: [
        { type: "table", headers: ["Port", "Responsibility"], rows: [
          ["EvidenceProvider", "Return bounded typed evidence and structured failures for one incident."],
          ["ModelGateway", "Return structured diagnosis and auditable invocation metadata."],
          ["MemoryStore", "Save incidents, record confirmed resolutions, and search with transparent reasons."],
          ["ReportWriter", "Persist a human-readable or machine-readable diagnosis report."],
          ["ContextProvider", "Retrieve bounded evidence without mutation."],
          ["PolicyEvaluator", "Propose a recommendation-only action plan."],
          ["ApprovalProvider", "Record an explicit decision."],
          ["RecoveryVerifier", "Return verification state without remediation."],
          ["AuditTrail", "Record lifecycle transitions."],
        ]},
      ]},
      { id: "compatibility", title: "Compatibility posture", blocks: [
        { type: "p", text: "Ports are experimental pre-1.0 interfaces; changes require compatibility notes. New core ports require an RFC because they expand the framework's dependency and authority surface. The testkit ships reusable contract assertions—evidence collection, JSON report round-trip, async memory store, plugin factory—so independent implementations can prove conformance in their own CI." },
      ]},
    ],
  },

  // ─── Learn ─────────────────────────────────────────────────────────────────
  {
    slug: "cookbooks/overview", group: "Learn", label: "Cookbooks", title: "Cookbooks",
    description: "Learn the framework through reproducible, synthetic incident investigations with explicit safety boundaries.",
    sections: [
      { id: "available", title: "Available cookbooks", blocks: [
        { type: "p", text: "Every cookbook name links to its directory on GitHub, where the README walks through setup and each step. All of them include an offline smoke path—no credentials or network required." },
        { type: "table", headers: ["Cookbook", "What it demonstrates"], rows: [
          [`[Simple log diagnosis](${GITHUB_REPO}/tree/main/cookbook/simple-log-diagnosis)`, "Complete offline CLI flow from a local failure log to report and memory."],
          [`[Structured rule evaluation](${GITHUB_REPO}/tree/main/cookbook/structured-rule-evaluation)`, "Typed fields, quantifiers, required evidence, ranking, and fixture testing."],
          [`[Evidence and JSON reporting](${GITHUB_REPO}/tree/main/cookbook/evidence-json-reporting)`, "Bounded evidence collection and the versioned machine-readable report."],
          [`[Prometheus / Alertmanager](${GITHUB_REPO}/tree/main/cookbook/prometheus-alertmanager)`, "Diagnosing a real-world-shaped alert webhook with rules and bounded evidence."],
          [`[Data pipeline investigation](${GITHUB_REPO}/tree/main/cookbook/data-pipeline-investigation)`, "Schema, lineage, telemetry, code, and knowledge context."],
          [`[ML regression monitoring](${GITHUB_REPO}/tree/main/cookbook/ml-regression-monitoring)`, "Feature drift and model-performance investigation."],
          [`[Software-delivery CI investigation](${GITHUB_REPO}/tree/main/cookbook/software-delivery-ci-investigation)`, "Dependency, permission, and infrastructure-reference investigation."],
          [`[Recording a resolution](${GITHUB_REPO}/tree/main/cookbook/recording-resolution)`, "Human-confirmed resolution and the local truth transition."],
          [`[Guarded proposal](${GITHUB_REPO}/tree/main/cookbook/guarded-proposal)`, "Playbooks, default-deny policy, evidence-linked proposals, and approvals."],
          [`[Verification and replay](${GITHUB_REPO}/tree/main/cookbook/verification-replay)`, "Explicit verification records, conservative learning, and replay evaluation."],
          [`[Webhook and HTTP evidence](${GITHUB_REPO}/tree/main/cookbook/webhook-http-evidence)`, "Authenticated webhook normalization and the hardened HTTP evidence connector."],
          [`[PostgreSQL memory](${GITHUB_REPO}/tree/main/cookbook/postgres-memory)`, "Shared durable memory and custom schemas through the independent plugin."],
          [`[Plugin package](${GITHUB_REPO}/tree/main/cookbook/plugin-package)`, "A complete independently packaged plugin with manifest and contract tests."],
        ]},
      ]},
      { id: "boundary", title: "Framework versus cookbook", blocks: [
        { type: "p", text: "The core owns typed interfaces and safe defaults. Each cookbook owns its synthetic fixtures, scenario rules, knowledge, service composition, prompts, and any optional Agno or OpenRouter integration. Start with a cookbook for a runnable demonstration, then use the architecture and reference pages to examine the framework contracts behind it." },
        { type: "note", tone: "amber", title: "Demonstration, not a control plane", text: "Cookbooks use synthetic inputs and bounded tools. They demonstrate investigation and governance without claiming autonomous production remediation." },
      ]},
    ],
  },

  {
    slug: "learn/videos", group: "Learn", label: "Videos & blog", title: "Videos, tutorials, and posts",
    description: "Watch and read your way into the framework—recorded sessions, walkthroughs, and community builds.",
    sections: [
      { id: "sessions", title: "Sessions", blocks: [
        { type: "p", text: "This page collects video sessions and written walkthroughs about building with Lumis SDK. It will grow gradually—new sessions land here first, and community-made videos and posts are welcome additions." },
        { type: "table", headers: ["Session", "Format", "Status"], rows: [
          ["Intro to Lumis SDK — your first deterministic diagnosis, end to end with the simple-log-diagnosis cookbook", "Video", "Coming soon"],
          ["Structured rules in practice — matching typed incident fields with required evidence", "Video / post", "Planned"],
          ["From alert to diagnosis — the Prometheus / Alertmanager walkthrough", "Post", "Planned"],
        ]},
        { type: "note", title: "Want yours here?", text: "Made a video or wrote a post about building with Lumis SDK? Open an issue or pull request on GitHub with the link and a one-line summary, and it can be listed here." },
      ]},
      { id: "start-reading", title: "Start with the written guides", blocks: [
        { type: "list", items: [
          "The quickstart runs a complete diagnosis locally in about five minutes.",
          "The framework workflow explains how the pieces compose end to end.",
          "Every cookbook is a self-contained, offline, runnable walkthrough with its own README.",
        ]},
      ]},
    ],
  },

  // ─── Safety ────────────────────────────────────────────────────────────────
  {
    slug: "safety/threat-model", group: "Safety", label: "Threat model", title: "Safety and threat model",
    description: "Treat operational evidence and model output as untrusted data while preserving local control and honest truth state.",
    sections: [
      { id: "invariants", title: "Security invariants", blocks: [
        { type: "list", items: [
          "Deterministic local use requires no credential or network call.",
          "A model response is never a confirmed resolution or an executable action.",
          "High-risk or irreversible actions cannot enter core without human approval policy.",
          "Verification must follow any future execution before recovery is confirmed.",
          "No telemetry is exported by default.",
        ]},
      ]},
      { id: "controls", title: "Current controls", blocks: [
        { type: "table", headers: ["Threat", "Current control"], rows: [
          ["Prompt injection", "Evidence is data; models receive no core execution tools."],
          ["Secret leakage", "Conservative recursive redaction, environment-variable secret references, and explicit model opt-in."],
          ["Hostile YAML", "safe_load, strict schemas, and a one-MiB limit."],
          ["Oversized inputs", "Ten-MiB CLI log limit; bounded evidence items, characters, and response bytes."],
          ["Model hallucination", "Schema validation, evidence separation, deterministic fallback, unconfirmed truth."],
          ["Forged webhooks", "Constant-time HMAC, timestamp skew limits, strict delivery IDs, fail-closed replay guard."],
          ["Malicious plugins", "Metadata-only discovery, manifest validation, default-denied sensitive authorities, explicit load policy."],
          ["Unapproved actuation", "No core executor; proposals expire and carry execution_allowed=false."],
          ["Silent telemetry", "No remote telemetry adapter or default export."],
          ["Hostile YAML structure", "Aliases rejected; nesting depth capped at 64 nodes before model validation."],
          ["Supply-chain tampering", "SPDX SBOMs, signed provenance attestations, reproducible-build comparison, artifact content validation, secret scanning, and Trusted Publishing."],
        ]},
        { type: "p", text: "A recorded security and authority review accompanies the Phase 1 release, and dependency and license review runs on every pull request." },
      ]},
      { id: "reporting", title: "Report vulnerabilities", blocks: [
        { type: "p", text: "Do not disclose active vulnerabilities in a public issue. Follow the repository SECURITY.md process and provide impact, affected versions, reproduction details, and mitigation ideas privately." },
      ]},
    ],
  },

  // ─── Project ───────────────────────────────────────────────────────────────
  {
    slug: "project/roadmap", group: "Project", label: "Roadmap", title: "Roadmap",
    description: "A four-phase path from a trustworthy Python foundation to a guarded recovery ecosystem—without ever granting ambient production authority.",
    sections: [
      { id: "phases", title: "The phase model", blocks: [
        { type: "p", text: "The roadmap develops reusable contracts, reference adapters, optional packages, test utilities, and relatable examples in four phases. Phase numbers describe capability maturity—they do not imply separate services, a hosted account, or a commitment to implement every named integration in core." },
        { type: "table", headers: ["Phase", "Sprints", "Outcome", "Status"], rows: [
          ["Phase 1 — trustworthy Python foundation", "0–6", "Stable, secure, documented Python contracts and independently usable reference paths.", "Complete; releasing as 0.1.0"],
          ["Phase 2 — model, prompt, and bounded agents", "7–11", "Replayable provider-neutral reasoning and read-only evidence planning with hard budgets.", "Next"],
          ["Phase 3 — intelligence, memory, and integrations", "12–17", "Explainable cross-system context, quality-aware memory, and optional integration packages.", "Planned"],
          ["Phase 4 — guarded recovery and ecosystem", "18–23", "Portable recovery protocols and a mature, multi-language-friendly ecosystem with no default executor.", "Planned"],
        ]},
      ]},
      { id: "phase-1", title: "Phase 1 — what shipped", blocks: [
        { type: "list", items: [
          "Strict domain, application, port, adapter, config, CLI, security, and testkit boundaries.",
          "Legacy text rules and structured all/any/not rules with explanations and fixture testing.",
          "Bounded evidence collection, Markdown and versioned JSON reports, and local SQLite memory.",
          "Plugin SDK with static manifests, metadata-only discovery, and explicit load policy; independent PostgreSQL memory and HTTP JSON evidence packages.",
          "Typed playbooks, default-deny policy, evidence-linked proposals, idempotent approvals, verification records, conservative learning, and replay evaluation.",
          "Stable lumis.dev/v1 configuration with a deterministic migration CLI, a public API stability inventory, and a compatibility policy.",
          "Supply-chain hardening: SBOMs, signed attestations, reproducible builds, secret scanning, and a recorded security review.",
        ]},
      ]},
      { id: "working-agreement", title: "The working agreement", blocks: [
        { type: "list", items: [
          "Core remains deterministic-first, local-first, model-optional, vendor-neutral, and useful with no plugins installed.",
          "A provider, framework, protocol, database extension, cloud, or heavy dependency belongs in an optional package behind a stable port.",
          "Models may classify, rank, plan evidence, and suggest allowlisted playbooks—they may not verify their own work or gain execution authority.",
          "SaaS tenancy, hosted secrets, billing, UI ownership, and enterprise administration remain in Lumis, the managed product—never in the SDK.",
        ]},
      ]},
      { id: "gated", title: "Explicitly gated", blocks: [
        { type: "note", tone: "amber", title: "No execution shortcut", text: "Core remediation, default model behavior, remote telemetry, new core ports, and breaking configuration changes all require an RFC and security review. Phase 4's executor and verifier protocols remain provisional until separately promoted." },
      ]},
    ],
  },
  {
    slug: "project/contributing", group: "Project", label: "Contributing", title: "Contributing",
    description: "Contribute focused code, documentation, tests, and cookbooks while preserving the project's clean-room and safety boundaries.",
    sections: [
      { id: "workflow", title: "Contribution workflow", blocks: [
        { type: "list", items: [
          "Open an issue before a large change; use an RFC for new ports, config versions, execution capability, model defaults, telemetry, or governance changes.",
          "Branch from dev and return to dev through review; reviewed release changes are promoted to main.",
          "Keep pull requests focused and include tests, documentation, changelog notes, security impact, and compatibility notes.",
          "Sign off every commit with git commit -s — the Signed-off-by trailer is a provenance declaration that you have the right to submit the work under Apache-2.0.",
          "Never contribute private logs, credentials, employer or client code, confidential runbooks, or copied vendor implementations.",
        ]},
      ]},
      { id: "ai-assisted", title: "AI-assisted contributions", blocks: [
        { type: "p", text: "AI-assisted contributions are welcome. You may use coding assistants, language models, or other AI tools for code, tests, documentation, examples, and review. The human contributor remains fully responsible for the submitted result: you must understand it, verify it, follow the architecture and safety boundaries, run the required checks, remove secrets and private data, and have the legal right to contribute every part under Apache-2.0." },
        { type: "list", items: [
          "AI output is not evidence that a change is correct, secure, original, or compatible—your review and the project checks are.",
          "Follow the repository's structure, patterns, and documented boundaries exactly as you would when writing by hand.",
          "Briefly disclose material AI assistance in the pull-request description so reviewers understand provenance and review context.",
          "Do not submit generated, copied, employer-owned, or model-assisted material that you cannot explain and defend.",
        ]},
        { type: "note", tone: "amber", title: "Provenance can be asked for", text: "Maintainers may ask for the origin of substantial code, fixtures, documentation, or data—and may close a contribution when provenance or human understanding cannot be established." },
      ]},
      { id: "checks", title: "Local checks", blocks: [
        { type: "code", language: "shell", code: `uv sync --all-groups
uv run ruff format --check .
uv run ruff check .
uv run mypy src
uv run python scripts/generate_config_schema.py --check
uv run pytest
uv build` },
        { type: "p", text: "CI runs the same checks, verifies that generated JSON Schemas match the Pydantic contracts, and never makes a live model call. Releases are manually dispatched through GitHub Actions and published with PyPI Trusted Publishing." },
      ]},
      { id: "good-first", title: "Good first contributions", blocks: [
        { type: "p", text: "Documentation, error messages, synthetic fixtures, validator tests, CLI polish, and cookbook improvements are good first areas. Sensitive execution and policy work requires deeper design review—start a discussion before writing code there." },
      ]},
    ],
  },
  {
    slug: "project/stability", group: "Project", label: "Stability", title: "Stability and compatibility",
    description: "Know exactly what stays compatible across the 1.x line—and what is provisional or internal.",
    sections: [
      { id: "levels", title: "Stability levels", blocks: [
        { type: "p", text: "A public import is not automatically stable. The public API inventory in the repository defines three levels, and only the surfaces it lists as stable carry the 1.x compatibility promise." },
        { type: "table", headers: ["Level", "Meaning"], rows: [
          ["Stable", "Changes follow semantic versioning; backward-incompatible changes wait for a major release."],
          ["Provisional", "Publicly usable and documented, but feedback may still require a breaking change before promotion."],
          ["Internal", "No compatibility promise; importing it couples you to implementation details."],
        ]},
      ]},
      { id: "stable-surface", title: "The stable 1.x surface", blocks: [
        { type: "table", headers: ["Surface", "Stable contract"], rows: [
          ["Domain and application", "Public models and services exported by lumis_sdk.domain and lumis_sdk.application."],
          ["Ports", "Protocols exported by lumis_sdk.ports; new optional methods require a new protocol or a major release."],
          ["Configuration and documents", "lumis.dev/v1 Project, rule, DiagnosisReport, PluginManifest, Playbook, and RecoveryPolicy envelopes with their checked schemas."],
          ["Plugin discovery", "Static manifest semantics, the entry-point group, compatibility intervals, support statuses, and default-deny authority checks."],
          ["Memory port", "Asynchronous MemoryStore behavior and the reusable contract suite—not database tables or SQL."],
          ["CLI", "Command names, exit-code classes, and documented JSON output of rules validate, rules test, plugins list, and plugins doctor."],
          ["Testkit", "Documented fixtures and contract assertions exported by lumis_sdk.testkit."],
        ]},
        { type: "p", text: "Additive optional fields may appear in a minor release; required fields, field meaning, enum removal, and default behavior do not change incompatibly within 1.x." },
      ]},
      { id: "provisional", title: "Provisional and internal", blocks: [
        { type: "list", items: [
          "Future executor and verifier protocols are intentionally absent and require an accepted RFC.",
          "ActionProposal is a stable Python model, but its standalone schema remains provisional as a cross-language wire format.",
          "Concrete adapters are reference implementations—documented constructor behavior is supported; private helpers and storage layout are internal.",
          "Replay metric breadth, lexical ranking weights, and benchmark numbers are provisional; truth semantics and score-component visibility are stable.",
          "Anything starting with an underscore, storage layouts, SQL statements, and repository automation are internal.",
        ]},
        { type: "note", title: "Change process", text: "Stable changes require tests, documentation, changelog entries, and compatibility review. Breaking proposals require an RFC, a migration path, and a deprecation period where practical." },
      ]},
    ],
  },
  {
    slug: "project/research", group: "Project", label: "Research paper", title: "The research behind Lumis SDK",
    description: "Lumis SDK is the open-source implementation companion to a peer-oriented research paper on agentic self-healing pipelines.",
    sections: [
      { id: "paper", title: "The paper", blocks: [
        { type: "p", text: `Much of this framework is the direct implementation of "${PAPER_TITLE}" — research led by Solomon Eshun as lead author, with co-authors at ishango.ai and EnBW.` },
        { type: "p", text: "The paper compares existing ZeroOps, observability, and AIOps platforms for pipeline monitoring, root-cause analysis, and automated remediation, and finds the main gap is architectural rather than technological: the ingredients for self-healing pipelines already exist but are fragmented across vendor-specific platforms. It proposes an affordable, vendor-agnostic reference architecture — agentic recovery and incident response — combining monitoring, pipeline metadata, incident history, deterministic policy checks, AI-assisted diagnosis, approval workflows, and controlled remediation." },
        { type: "p", text: `[Read the paper (PDF)](${PAPER_PDF})` },
        { type: "note", tone: "amber", title: "Preprint status", text: "This manuscript has been submitted for preprint publication. Once it is live, this page will link to the published preprint and the PDF will be replaced with the final version." },
      ]},
      { id: "paper-to-framework", title: "From paper to framework", blocks: [
        { type: "table", headers: ["Paper concept", "Where it lives in the SDK"], rows: [
          ["Detect / triage / diagnose / plan / approve / remediate / verify / learn lifecycle", "The guarded lifecycle contracts and run_guarded_lifecycle orchestrator."],
          ["Deterministic policy checks before AI", "The legacy text and structured deterministic rule engines."],
          ["Bounded, provenance-carrying context", "EvidenceService, the EvidenceProvider port, and redaction."],
          ["AI-assisted diagnosis under budgets", "The optional ModelGateway behind an explicit ModelUsePolicy."],
          ["Approval workflows and controlled remediation", "Playbooks, default-deny policy, evidence-linked proposals, and idempotent approvals—no core executor."],
          ["Incident history and organizational learning", "Operational memory with explicit truth states and verification-aware learning."],
        ]},
      ]},
      { id: "maintainer", title: "Authorship and maintenance", blocks: [
        { type: "p", text: "Lumis SDK is maintained by Solomon Eshun — the paper's lead author — together with the open-source contributors who join the project. The paper describes the technology-flexible reference architecture; the SDK is its Apache-2.0 Python implementation companion, and the two evolve together." },
      ]},
    ],
  },
  {
    slug: "project/lumis-and-sdk", group: "Project", label: "Lumis SDK and Lumis", title: "Lumis SDK and Lumis",
    description: "Understand the open-source framework boundary and the managed operating layer provided by Lumis at Qadim Labs.",
    sections: [
      { id: "comparison", title: "Two complementary layers", blocks: [
        { type: "table", headers: ["Lumis SDK", "Lumis"], rows: [
          ["Apache-2.0 Python framework", "Managed hosted platform"],
          ["Local and self-hosted workflows", "Multi-tenant team workflows"],
          ["Project-owned adapters and policies", "Managed connector fleet and approvals"],
          ["Local inspectable memory", "Hosted multi-user memory and audit"],
          ["Community support and extension", "Enterprise RBAC, SSO, runners, deployment, and support"],
        ]},
      ]},
      { id: "independence", title: "Independence rule", blocks: [
        { type: "p", text: "Lumis SDK must remain useful without a Lumis key. It must not make remote calls by default, hide essential local capability, emit telemetry without opt-in, include proprietary product code, or require a commercial database or model provider. These commitments are part of the project's governance, not marketing." },
      ]},
      { id: "flow", title: "Open-core contribution flow", blocks: [
        { type: "p", text: "Generally useful primitives are proposed and implemented publicly, released from Lumis SDK, and then consumed by Lumis—the same way any other application consumes the framework. Product-specific UI, hosting, multi-tenancy, billing, and enterprise operations remain in the managed product." },
      ]},
    ],
  },
];

export const groups = Array.from(new Set(docs.map((page) => page.group))).map((group) => ({
  group,
  pages: docs.filter((page) => page.group === group),
}));

// Reading order follows the grouped sidebar order, so previous/next never jumps between groups unexpectedly.
const orderedDocs = groups.flatMap(({ pages }) => pages);

export function getDoc(slug?: string[]) {
  const key = slug?.join("/") || "overview";
  return docs.find((page) => page.slug === key);
}

export function toMarkdown(page: DocPage): string {
  const lines: string[] = [`# ${page.title}`, "", page.description, ""];
  for (const section of page.sections) {
    lines.push(`## ${section.title}`, "");
    for (const block of section.blocks) {
      if (block.type === "p") lines.push(block.text, "");
      else if (block.type === "note") lines.push(`> **${block.title}.** ${block.text}`, "");
      else if (block.type === "list") { block.items.forEach((item) => lines.push(`- ${item}`)); lines.push(""); }
      else if (block.type === "code") lines.push("```" + block.language, block.code, "```", "");
      else if (block.type === "diagram") lines.push("```mermaid", block.code, "```", "");
      else {
        lines.push(`| ${block.headers.join(" | ")} |`);
        lines.push(`| ${block.headers.map(() => "---").join(" | ")} |`);
        block.rows.forEach((row) => lines.push(`| ${row.join(" | ")} |`));
        lines.push("");
      }
    }
  }
  lines.push("---", "", `Lumis SDK ${SDK_VERSION} documentation · https://github.com/soloshun/lumis-sdk · page: docs/${page.slug}`);
  return lines.join("\n");
}

export function getAdjacentDoc(slug: string) {
  const index = orderedDocs.findIndex((page) => page.slug === slug);
  return {
    previous: index > 0 ? orderedDocs[index - 1] : undefined,
    next: index >= 0 && index < orderedDocs.length - 1 ? orderedDocs[index + 1] : undefined,
  };
}
