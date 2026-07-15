export type DocBlock =
  | { type: "p"; text: string }
  | { type: "note"; tone?: "blue" | "amber" | "green"; title: string; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "list"; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] };

export type DocSection = { id: string; title: string; blocks: DocBlock[] };
export type DocPage = {
  slug: string;
  group: string;
  label: string;
  title: string;
  description: string;
  sections: DocSection[];
};

const install = `git clone https://github.com/soloshun/lumis-sdk.git
cd lumis-sdk
uv sync --all-groups
uv run lumis --help`;

const projectConfig = `apiVersion: lumis.dev/v1alpha1
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
  rules:
    files: [rules.yml]
  model:
    enabled: false`;

const ruleConfig = `apiVersion: lumis.dev/v1alpha1
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

export const docs: DocPage[] = [
  {
    slug: "overview", group: "Start here", label: "Overview", title: "Lumis SDK documentation",
    description: "Build deterministic-first, evidence-grounded incident diagnosis and guarded recovery workflows with a small, vendor-neutral Python core.",
    sections: [
      { id: "what-is-lumis", title: "What is Lumis SDK?", blocks: [
        { type: "p", text: "Lumis SDK is the Apache-2.0 implementation companion to the agentic recovery and incident response reference architecture. It turns bounded incident evidence into structured diagnosis, reviewable Markdown reports, and inspectable local memory." },
        { type: "note", tone: "amber", title: "Pre-alpha boundary", text: "Lumis SDK does not perform unrestricted or default production remediation. Current execution-related models are recommendation and verification contracts—not authority granted to a model." },
      ]},
      { id: "design-principles", title: "Design principles", blocks: [
        { type: "table", headers: ["Principle", "Meaning"], rows: [
          ["Deterministic first", "Project-owned rules run before optional model reasoning."],
          ["Evidence grounded", "Facts, evidence, hypotheses, contradictions, and gaps stay separate."],
          ["Model optional", "The core works offline; providers implement a narrow gateway port."],
          ["Local first", "SQLite and Markdown are inspectable reference defaults."],
          ["Guarded recovery", "Approval and verification are explicit lifecycle boundaries."],
          ["Vendor agnostic", "Core packages import no cloud, observability, or agent SDK."],
        ]},
      ]},
      { id: "choose-a-path", title: "Choose a path", blocks: [
        { type: "list", items: ["New to Lumis SDK: complete the five-minute quickstart.", "Integrating a Python application: start with the Python API.", "Defining project behavior: read configuration and deterministic rules.", "Evaluating the architecture: review ports and adapters, then safety.", "Learning through runnable examples: open the cookbook guide."] },
      ]},
    ],
  },
  {
    slug: "getting-started/quickstart", group: "Getting started", label: "Quickstart", title: "Quickstart",
    description: "Run a complete deterministic diagnosis locally—without a cloud account, model key, or network call.",
    sections: [
      { id: "requirements", title: "Requirements", blocks: [
        { type: "list", items: ["Python 3.11 or newer", "uv for environment and dependency management", "Git for the current pre-release installation path"] },
      ]},
      { id: "install", title: "Install from source", blocks: [
        { type: "p", text: "The package is versioned as 0.0.1 and prepared for PyPI. Until the first reviewed release is published, install and run the repository directly." },
        { type: "code", language: "shell", code: install },
      ]},
      { id: "run", title: "Run the local example", blocks: [
        { type: "code", language: "shell", code: `uv run lumis doctor \\
  --config cookbook/simple-log-diagnosis/lumis/lumis.yml

uv run lumis diagnose \\
  --config cookbook/simple-log-diagnosis/lumis/lumis.yml` },
        { type: "p", text: "The diagnose command reads a bounded synthetic log, evaluates configured rules, writes a deterministic Markdown report, and stores an unconfirmed incident episode in local SQLite." },
      ]},
      { id: "confirm", title: "Confirm a resolution", blocks: [
        { type: "code", language: "shell", code: `uv run lumis report <incident-id> --config path/to/lumis.yml
uv run lumis resolve <incident-id> \\
  --resolution "Human-confirmed cause, action, and outcome." \\
  --config path/to/lumis.yml
uv run lumis memory search "KeyError customer_id" --config path/to/lumis.yml` },
        { type: "note", tone: "green", title: "Truth transition", text: "A human resolution changes local memory from unconfirmed_hypothesis to human_confirmed. Model text never performs this transition." },
      ]},
      { id: "next", title: "Next steps", blocks: [
        { type: "list", items: ["Create your own project with lumis init.", "Read Configuration before adapting a real log source.", "Learn the Python API if you are embedding diagnosis into another application."] },
      ]},
    ],
  },
  {
    slug: "concepts/diagnosis-as-code", group: "Concepts", label: "Diagnosis-as-Code", title: "Diagnosis-as-Code",
    description: "Represent incident diagnosis as versioned, reviewable configuration and typed evidence—not opaque model output.",
    sections: [
      { id: "model", title: "The operating model", blocks: [
        { type: "p", text: "Diagnosis-as-Code makes failure signatures, hypotheses, calibration, missing evidence, and investigation steps explicit. Project teams own these rules and can review their changes like application code." },
        { type: "list", items: ["Normalize a bounded incident into a vendor-neutral contract.", "Evaluate stable, versioned rules in deterministic order.", "Keep observed facts separate from causal hypotheses.", "Expose missing evidence and human-review requirements.", "Persist the report and truth state in inspectable local storage."] },
      ]},
      { id: "confidence", title: "Confidence is not authority", blocks: [
        { type: "p", text: "Rule confidence is authored calibration: how strongly a known signature supports the configured hypothesis. Lumis SDK does not compute it, and it cannot authorize remediation." },
        { type: "note", title: "Keep the boundaries separate", text: "Confidence, risk, approval, execution, and verification are different contracts. A high-confidence diagnosis can still require human review and a low-risk plan can still be rejected." },
      ]},
      { id: "unknown", title: "Unknown stays honest", blocks: [
        { type: "p", text: "When no deterministic rule matches, the result remains unknown. Optional model reasoning runs only when policy is enabled and a gateway is explicitly injected. Otherwise the deterministic unknown result is returned unchanged." },
      ]},
    ],
  },
  {
    slug: "concepts/guarded-recovery", group: "Concepts", label: "Guarded recovery", title: "Guarded recovery",
    description: "Follow a full recovery lifecycle while keeping policy, approval, actuation, verification, and learning explicit.",
    sections: [
      { id: "lifecycle", title: "Lifecycle and current status", blocks: [
        { type: "table", headers: ["Stage", "Current SDK status"], rows: [
          ["Detect", "Local-log input and incident-source contracts; production detection is external."],
          ["Triage", "Deterministic classification, severity, and missing context."],
          ["Diagnose", "Explainable rules; optional model gateway behind explicit policy."],
          ["Plan", "Recommendation-only ActionPlan and suggested playbooks."],
          ["Approve", "Explicit approval-state contract."],
          ["Remediate", "No core executor."],
          ["Verify", "Verification-result contract; no false recovery claim."],
          ["Learn", "SQLite memory and human resolution."],
        ]},
      ]},
      { id: "orchestrator", title: "Recommendation-only orchestration", blocks: [
        { type: "p", text: "run_guarded_lifecycle retrieves context, diagnoses, proposes a plan, requests approval, records a verification result, and writes audit events. It intentionally has no action executor." },
        { type: "note", tone: "amber", title: "Execution requires an RFC", text: "Any future executor must define typed allowlists, policy, approval, audit, limits, signatures, idempotency, sandbox tests, and verification before it can enter core." },
      ]},
    ],
  },
  {
    slug: "architecture/overview", group: "Architecture", label: "Overview", title: "Architecture",
    description: "Understand the dependency rule, package map, model boundary, and reference adapters.",
    sections: [
      { id: "dependency-rule", title: "Dependency rule", blocks: [
        { type: "code", language: "text", code: `entry points → application → domain
                         ↘ ports ← adapters` },
        { type: "list", items: ["domain depends only on Python, Pydantic, and standard-library types.", "application coordinates use cases through domain models and ports.", "ports describe replaceable capabilities.", "adapters implement local or provider-specific behavior.", "cli selects and composes adapters."] },
      ]},
      { id: "packages", title: "Package map", blocks: [
        { type: "table", headers: ["Package", "Responsibility", "Status"], rows: [
          ["lumis_sdk.domain", "Incidents, evidence, diagnosis, truth, guarded recovery state", "Canonical pre-1.0"],
          ["lumis_sdk.application", "Diagnosis and recommendation-only lifecycle services", "Canonical pre-1.0"],
          ["lumis_sdk.ports", "Model, memory, reporting, context, policy, approval, verification, audit", "Experimental"],
          ["lumis_sdk.adapters", "Deterministic, SQLite, Markdown, and local adapters", "Reference"],
          ["lumis_sdk.config", "Strict v1alpha1 documents, bounded loading, schemas", "Versioned API"],
          ["lumis_sdk.testkit", "Deterministic test doubles", "Experimental"],
        ]},
      ]},
      { id: "model-routing", title: "Optional model routing", blocks: [
        { type: "p", text: "DiagnosisService invokes ModelGateway only when deterministic classification is unknown, ModelUsePolicy.enabled is true, and a gateway has been injected. Provider SDK types never appear in domain or application contracts." },
      ]},
    ],
  },
  {
    slug: "configuration/project", group: "Configuration", label: "Project document", title: "Project configuration",
    description: "Configure local memory, reports, incident sources, rules, and model policy through a strict versioned public API.",
    sections: [
      { id: "project", title: "Project document", blocks: [
        { type: "code", language: "yaml", code: projectConfig },
        { type: "note", title: "Strict by default", text: "Unknown fields and unversioned configuration fail validation. Relative paths resolve from the project YAML location." },
      ]},
      { id: "fields", title: "Important fields", blocks: [
        { type: "table", headers: ["Field", "Meaning"], rows: [
          ["apiVersion", "Must be lumis.dev/v1alpha1."], ["metadata.name", "Stable project or pipeline identifier."],
          ["spec.memory", "SQLite reference provider and local path."], ["spec.reports", "Markdown reference provider and output directory."],
          ["spec.incidentSources", "Bounded sources; v1alpha1 includes local-log."], ["spec.rules.files", "Ordered DiagnosisRuleSet documents."],
          ["spec.model.enabled", "Explicit opt-in flag; it does not select a provider."],
        ]},
      ]},
      { id: "limits", title: "Limits and secrets", blocks: [
        { type: "list", items: ["Project and rule documents are limited to one MiB each.", "The reference CLI reads local logs up to ten MiB.", "Do not put plaintext credentials in project YAML.", "v1alpha1 intentionally has no generic secret string or undocumented provider selector."] },
      ]},
    ],
  },
  {
    slug: "configuration/rules", group: "Configuration", label: "Deterministic rules", title: "Deterministic rules",
    description: "Encode stable failure signatures, evidence gaps, and safe investigation steps in a versioned rule set.",
    sections: [
      { id: "example", title: "Rule-set document", blocks: [{ type: "code", language: "yaml", code: ruleConfig }] },
      { id: "ordering", title: "Ordering and explanation", blocks: [
        { type: "p", text: "Rules run by descending priority and then declared order. Every match exposes rule ID, version, priority, matched terms, and evidence IDs so the result can be explained and reproduced." },
      ]},
      { id: "current-matcher", title: "Current matcher", blocks: [
        { type: "p", text: "v1alpha1 supports deterministic all_contains matching: every configured fragment must occur case-insensitively in the supplied log. Structured fields, thresholds, regex, conflict analytics, and richer boolean expressions remain roadmap work." },
      ]},
    ],
  },
  {
    slug: "reference/cli", group: "Reference", label: "CLI", title: "CLI reference",
    description: "Initialize projects, validate configuration, diagnose local logs, inspect reports, confirm resolutions, and search memory.",
    sections: [
      { id: "commands", title: "Commands", blocks: [
        { type: "table", headers: ["Command", "Purpose"], rows: [
          ["lumis init", "Create a minimal Project and DiagnosisRuleSet without overwriting files."],
          ["lumis doctor", "Validate config, rules, paths, and safe defaults without writing state."],
          ["lumis diagnose", "Diagnose a bounded local log; write report and incident memory."],
          ["lumis report", "Print a stored report and any human-confirmed resolution."],
          ["lumis resolve", "Store a human-confirmed resolution and change truth state."],
          ["lumis memory search", "Search local incident memory using transparent keyword scoring."],
          ["lumis rules validate", "Validate rules and show stable IDs, versions, and priorities."],
        ]},
      ]},
      { id: "safety", title: "Command safety", blocks: [
        { type: "p", text: "doctor and rules validate make no network calls and write no incident state. diagnose writes only to explicitly configured local report and memory paths. Model assistance remains inactive unless application code supplies both enabled policy and a gateway adapter." },
      ]},
    ],
  },
  {
    slug: "reference/python-api", group: "Reference", label: "Python API", title: "Python API",
    description: "Use the public domain contracts and application services from another Python application.",
    sections: [
      { id: "diagnosis-service", title: "DiagnosisService", blocks: [
        { type: "code", language: "python", code: pythonExample },
        { type: "p", text: "DiagnosisService always runs the deterministic adapter first. Unknown results may route through a ModelGateway only when policy and dependency injection both allow it." },
      ]},
      { id: "domain", title: "Public domain surface", blocks: [
        { type: "list", items: ["IncidentInput, EvidenceItem, Hypothesis, TriageResult, and DiagnosisResult", "Severity, DiagnosisMethod, and TruthState enums", "ConfirmedResolution for human- or verification-confirmed outcomes", "ActionPlan, ApprovalDecision, VerificationResult, AuditEvent, and LifecycleResult"] },
      ]},
      { id: "ports", title: "Ports and adapters", blocks: [
        { type: "p", text: "Independent packages can implement model, memory, reporting, context, policy, approval, verification, and audit ports without changing the Lumis SDK domain. Provider-specific connectors should live outside core when practical." },
      ]},
    ],
  },
  {
    slug: "cookbooks/overview", group: "Learn", label: "Cookbooks", title: "Cookbooks",
    description: "Learn the framework through reproducible, synthetic incident investigations with explicit safety boundaries.",
    sections: [
      { id: "available", title: "Available cookbooks", blocks: [
        { type: "table", headers: ["Cookbook", "What it demonstrates"], rows: [
          ["Simple log diagnosis", "Complete offline CLI flow from local failure log to report and memory."],
          ["Data pipeline investigation", "Schema, lineage, telemetry, code, and knowledge context."],
          ["ML regression monitoring", "Feature drift and model-performance investigation."],
          ["Software-delivery CI", "Dependency, permission, and infrastructure-reference investigation."],
          ["Recording resolution", "Human-confirmed resolution and local truth transition."],
        ]},
      ]},
      { id: "boundary", title: "Framework versus cookbook", blocks: [
        { type: "p", text: "The core owns typed interfaces and safe defaults. Each cookbook owns its synthetic fixtures, scenario rules, knowledge, service, prompts, and any optional Agno or OpenRouter integration." },
        { type: "note", tone: "amber", title: "Demonstration, not a control plane", text: "Cookbooks use synthetic inputs and bounded tools. They demonstrate investigation and governance without claiming autonomous production remediation." },
      ]},
    ],
  },
  {
    slug: "safety/threat-model", group: "Safety", label: "Threat model", title: "Safety and threat model",
    description: "Treat operational evidence and model output as untrusted data while preserving local control and honest truth state.",
    sections: [
      { id: "invariants", title: "Security invariants", blocks: [
        { type: "list", items: ["Deterministic local use requires no credential or network call.", "A model response is never a confirmed resolution or executable action.", "High-risk or irreversible actions cannot enter core without human approval policy.", "Verification must follow any future execution before confirmed recovery."] },
      ]},
      { id: "controls", title: "Current controls", blocks: [
        { type: "table", headers: ["Threat", "Current control"], rows: [
          ["Prompt injection", "Evidence is data; models receive no core execution tools."], ["Secret leakage", "Conservative recursive redaction and explicit model opt-in."],
          ["Hostile YAML", "safe_load, strict schemas, and a one-MiB limit."], ["Oversized logs", "Ten-MiB CLI limit."],
          ["Model hallucination", "Schema validation, evidence separation, deterministic fallback, unconfirmed truth."], ["Unapproved actuation", "No core executor."],
          ["Silent telemetry", "No remote telemetry adapter or default export."],
        ]},
      ]},
      { id: "reporting", title: "Report vulnerabilities", blocks: [
        { type: "p", text: "Do not disclose active vulnerabilities in a public issue. Follow the repository SECURITY.md process and provide impact, affected versions, reproduction details, and mitigation ideas privately." },
      ]},
    ],
  },
  {
    slug: "project/contributing", group: "Project", label: "Contributing", title: "Contributing",
    description: "Contribute focused code, documentation, tests, and cookbooks while preserving the project’s clean-room and safety boundaries.",
    sections: [
      { id: "workflow", title: "Contribution workflow", blocks: [
        { type: "list", items: ["Open an issue before a large change.", "Use an RFC for new ports, config versions, execution capability, model defaults, telemetry, or governance changes.", "Keep pull requests focused and include tests, documentation, changelog notes, security impact, and compatibility notes.", "Never contribute private logs, credentials, employer or client code, confidential runbooks, or copied vendor implementations."] },
      ]},
      { id: "checks", title: "Local checks", blocks: [
        { type: "code", language: "shell", code: `uv sync --all-groups
uv run ruff format --check .
uv run ruff check .
uv run mypy src
uv run python scripts/generate_config_schema.py --check
uv run pytest
uv build` },
      ]},
      { id: "good-first", title: "Good first contributions", blocks: [
        { type: "p", text: "Documentation, error messages, synthetic fixtures, validator tests, CLI completion, and cookbook improvements are good first areas. Sensitive execution and policy work requires deeper design review." },
      ]},
    ],
  },
  {
    slug: "project/roadmap", group: "Project", label: "Roadmap", title: "Roadmap",
    description: "See what is current, what is experimental, and what remains gated behind explicit design work.",
    sections: [
      { id: "now", title: "Current foundation", blocks: [
        { type: "list", items: ["Strict domain, application, port, adapter, config, CLI, security, and testkit boundaries.", "Deterministic ordered rules with explanation metadata.", "Local SQLite memory and Markdown reports.", "Versioned v1alpha1 project and rule-set schemas.", "Recommendation-only lifecycle contracts and synthetic cookbooks."] },
      ]},
      { id: "next", title: "Next milestones", blocks: [
        { type: "list", items: ["Richer deterministic expressions and rule-conflict analytics.", "Expanded reusable contract tests for adapters.", "Truth-state persistence beyond the current human-confirmed transition.", "Citation validation and adversarial replay/evaluation corpora.", "Plugin discovery only after manifest, provenance, compatibility, and trust design."] },
      ]},
      { id: "gated", title: "Explicitly gated", blocks: [
        { type: "note", tone: "amber", title: "No execution shortcut", text: "Core remediation, default model behavior, remote telemetry, new core ports, and breaking configuration changes all require an RFC and security review." },
      ]},
    ],
  },
  {
    slug: "getting-started/framework-workflow", group: "Getting started", label: "Framework workflow", title: "The framework workflow",
    description: "See how incident context moves through deterministic diagnosis, optional reasoning, guarded proposals, verification, and confirmed learning.",
    sections: [
      { id: "inputs", title: "1. Normalize bounded context", blocks: [
        { type: "p", text: "A consuming application creates IncidentInput and retrieves only the context required for the incident. ContextKind covers logs, metrics, lineage, schemas, runbooks, playbooks, code, and verification evidence." },
        { type: "note", title: "Authority stays outside the payload", text: "Logs, tickets, runbooks, source code, and model output are untrusted data. Supplying content to the framework does not grant it filesystem, network, cloud, or execution authority." },
      ]},
      { id: "reasoning", title: "2. Diagnose deterministically first", blocks: [
        { type: "p", text: "DiagnosisService evaluates ordered project rules first. A known match returns evidence references and explanation metadata. An unknown result can route to a ModelGateway only when both an enabled ModelUsePolicy and a gateway implementation are supplied." },
        { type: "code", language: "text", code: `IncidentInput
  → bounded context
  → deterministic rules
      ↳ known: structured DiagnosisResult
      ↳ unknown: optional bounded ModelGateway
  → human-readable report + unconfirmed memory` },
      ]},
      { id: "governance", title: "3. Propose and govern", blocks: [
        { type: "p", text: "The guarded lifecycle can retrieve context, diagnose, request a recommendation-only ActionPlan from policy, record approval, record verification, and emit audit events. It does not execute the plan." },
      ]},
      { id: "learning", title: "4. Learn only from confirmation", blocks: [
        { type: "p", text: "Operational memory starts as unconfirmed_hypothesis. A human resolution moves local memory to human_confirmed. The domain also defines verification_confirmed, rejected, and superseded truth states for future persistence work." },
        { type: "note", tone: "green", title: "Expected outcome", text: "A complete current workflow produces inspectable diagnosis, reporting, memory, approval, verification, and audit state without making a false claim that production remediation occurred." },
      ]},
    ],
  },
  {
    slug: "concepts/healing-as-code", group: "Concepts", label: "Healing-as-Code", title: "Healing-as-Code",
    description: "Understand the long-term direction: a versioned, policy-controlled recovery lifecycle whose decisions and outcomes can be inspected.",
    sections: [
      { id: "direction", title: "A direction, not a shipped executor", blocks: [
        { type: "p", text: "Healing-as-Code is the project’s direction from diagnosis toward detect, triage, diagnose, plan, approve, remediate, verify, and learn. Today Lumis SDK ships diagnosis-centered behavior and typed contracts for most guarded stages, but no core action executor." },
        { type: "note", tone: "amber", title: "Do not overread the name", text: "An ActionPlan is a recommendation. Approval is recorded state. Verification records a bounded result. None of these contracts grants production authority or proves that an action ran." },
      ]},
      { id: "properties", title: "Required properties", blocks: [
        { type: "list", items: ["Every executable action must come from a typed allowlist.", "Policy must evaluate risk before approval.", "High-risk and irreversible work cannot auto-approve.", "Audit events must make transitions inspectable.", "Execution must be idempotent and bounded.", "Verification must follow execution before recovery is confirmed.", "Learning must use confirmed outcomes, not model confidence."] },
      ]},
      { id: "roadmap", title: "How the roadmap approaches it", blocks: [
        { type: "table", headers: ["Milestone", "Direction"], rows: [["v0.3", "RFC-governed plugin SDK and independently packaged evidence connector."], ["v0.4", "Typed playbooks, risk tiers, proposals, approval contracts, and sandbox demonstration."], ["v0.5", "Verifier port, persisted truth states, retrieval scoring, and replay evaluation."], ["v1.0", "Stable contracts, security review, tested ecosystem, and no unresolved lifecycle ambiguity."]] },
      ]},
    ],
  },
  {
    slug: "concepts/deterministic-first", group: "Concepts", label: "Deterministic first", title: "Deterministic-first reasoning",
    description: "Make known incident behavior reproducible and explainable before introducing probabilistic reasoning.",
    sections: [
      { id: "why", title: "Why deterministic first", blocks: [
        { type: "p", text: "Known signatures should not require a remote model, variable output, or opaque prompt. Project rules are versioned, ordered, testable, and owned alongside the systems they describe." },
      ]},
      { id: "ordering", title: "Current evaluation contract", blocks: [
        { type: "list", items: ["Rules sort by descending priority.", "Equal priorities retain declared configuration order.", "all_contains terms match case-insensitively against supplied log text.", "A match exposes rule ID, rule version, priority, matched terms, and evidence IDs.", "No match returns an honest unknown diagnosis rather than fabricating a cause."] },
      ]},
      { id: "model-fallback", title: "Where models fit", blocks: [
        { type: "p", text: "A model is an optional escalation path for unknown cases. ModelUsePolicy bounds input characters, output tokens, tool calls, timeout, and prompt version. The provider returns schema-validated DiagnosisResult plus invocation metadata." },
      ]},
    ],
  },
  {
    slug: "concepts/evidence-grounded", group: "Concepts", label: "Evidence grounded", title: "Evidence-grounded recovery",
    description: "Keep observation, hypothesis, uncertainty, contradiction, and missing context visible throughout the recovery lifecycle.",
    sections: [
      { id: "vocabulary", title: "The evidence vocabulary", blocks: [
        { type: "table", headers: ["Contract", "Meaning"], rows: [["EvidenceItem", "A bounded observation with source, detail, confidence, kind, optional reference, time, and attributes."], ["confirmed_facts", "Statements directly supported by supplied context."], ["root_cause_hypothesis", "A causal possibility that remains uncertain."], ["missing_evidence", "Context required to strengthen, contradict, or reject the hypothesis."], ["requires_human_review", "An explicit review boundary, true by default."]] },
      ]},
      { id: "confidence", title: "Confidence does not authorize action", blocks: [
        { type: "p", text: "Deterministic-rule confidence is authored calibration, not a computed probability. Model confidence is also an unconfirmed claim. Risk, policy, approval, execution, verification, and truth state remain separate decisions." },
      ]},
      { id: "context", title: "Context stays bounded", blocks: [
        { type: "p", text: "ContextProvider returns an IncidentContext containing named ContextItem values. Providers should retrieve only relevant data, enforce size and permission limits, and expose provenance without granting mutation authority." },
      ]},
    ],
  },
  {
    slug: "concepts/operational-memory", group: "Concepts", label: "Operational memory", title: "Operational memory",
    description: "Retain incident knowledge with visible truth state and transparent retrieval rather than silently promoting generated text into fact.",
    sections: [
      { id: "episode", title: "Incident episodes", blocks: [
        { type: "p", text: "IncidentEpisode combines a portable incident, its DiagnosisResult, and TruthState. The SQLite reference adapter stores local reports and human resolutions; the public MemoryStore port keeps storage replaceable." },
      ]},
      { id: "truth", title: "Truth states", blocks: [
        { type: "table", headers: ["State", "Meaning"], rows: [["unconfirmed_hypothesis", "Diagnosis retained without a confirmed resolution."], ["human_confirmed", "A person recorded the cause, action, and outcome."], ["verification_confirmed", "A verifier confirmed the outcome; persistence is roadmap work."], ["rejected", "The retained hypothesis was rejected."], ["superseded", "Newer confirmed knowledge replaced the record."]] },
      ]},
      { id: "retrieval", title: "Transparent retrieval", blocks: [
        { type: "p", text: "MemoryQuery supports text plus optional classification and pipeline filters. MemoryMatch includes a non-negative score and human-readable scoring reasons. The current SQLite path uses transparent lexical search; semantic retrieval belongs behind an optional adapter." },
      ]},
    ],
  },
  {
    slug: "architecture/ports-and-adapters", group: "Architecture", label: "Ports and adapters", title: "Ports and adapters",
    description: "Trace the dependency direction that keeps incident and recovery semantics independent of infrastructure vendors.",
    sections: [
      { id: "rule", title: "Dependency direction", blocks: [
        { type: "code", language: "text", code: `CLI / Python entry points
          ↓ compose
application services → domain contracts
          ↓ call
         ports ← adapters` },
        { type: "p", text: "Domain depends only on Python, Pydantic, and standard-library types. Application coordinates domain and ports. Adapters implement local or provider-specific behavior. The CLI selects concrete adapters." },
      ]},
      { id: "boundaries", title: "What belongs where", blocks: [
        { type: "table", headers: ["Layer", "Owns", "Must not own"], rows: [["Domain", "Incidents, evidence, diagnoses, plans, approvals, verification, truth", "Database, HTTP, CLI, cloud, agent SDK"], ["Application", "Use-case orchestration and lifecycle order", "SQLite, hosted products, provider SDKs"], ["Ports", "Provider-neutral capability protocols", "Concrete credentials or clients"], ["Adapters", "Deterministic rules, SQLite, Markdown, providers", "Core business semantics"], ["CLI", "Composition and user commands", "Reusable domain policy"]] },
      ]},
      { id: "extension", title: "Extension rule", blocks: [
        { type: "p", text: "Substantial vendor connectors should ship as independent packages when practical. This keeps core installation small and makes permissions, trust, maintenance, and compatibility visible." },
      ]},
    ],
  },
  {
    slug: "architecture/lifecycle-contracts", group: "Architecture", label: "Lifecycle contracts", title: "Guarded lifecycle contracts",
    description: "Inspect the transport-neutral contracts for context, plans, approval, verification, audit, and lifecycle results.",
    sections: [
      { id: "domain", title: "Domain state", blocks: [
        { type: "list", items: ["IncidentContext groups bounded ContextItem evidence.", "ActionPlan names an allowlisted playbook, risk, approval requirement, steps, and execution_allowed=false by default.", "ApprovalDecision records approved, rejected, or pending status plus approver and reason.", "VerificationResult records not_run, skipped, passed, or failed state plus checks and notes.", "AuditEvent records inspectable transition detail.", "LifecycleResult returns the complete non-executing run."] },
      ]},
      { id: "orchestration", title: "Current orchestration", blocks: [
        { type: "code", language: "text", code: `get_context
→ diagnose
→ propose recommendation-only plan
→ request approval
→ record verification state
→ return audit events

# no executor call exists` },
      ]},
      { id: "invariants", title: "Recovery invariants", blocks: [
        { type: "note", tone: "amber", title: "Future execution boundary", text: "Execution must require an approved, allowlisted action. Verification must follow execution. High-risk actions cannot auto-approve. Failed verification must escalate. Learning must use confirmed outcomes." },
      ]},
    ],
  },
  {
    slug: "architecture/model-boundary", group: "Architecture", label: "Model boundary", title: "Optional model boundary",
    description: "Integrate probabilistic reasoning without coupling the core to a provider or granting a model execution authority.",
    sections: [
      { id: "routing", title: "Routing conditions", blocks: [
        { type: "p", text: "DiagnosisService calls ModelGateway only when the deterministic classification is unknown, model policy is enabled, and a gateway has been injected. Otherwise the deterministic result is returned." },
      ]},
      { id: "policy", title: "ModelUsePolicy", blocks: [
        { type: "table", headers: ["Field", "Default"], rows: [["enabled", "false"], ["max_input_characters", "20,000"], ["max_output_tokens", "2,000"], ["max_tool_calls", "8"], ["timeout", "30 seconds"], ["prompt_version", "diagnosis-v1"]] },
      ]},
      { id: "audit", title: "Auditable output", blocks: [
        { type: "p", text: "ModelInvocation pairs a schema-validated diagnosis with provider, model, prompt version, input character count, and optional output token count. Redaction and minimum-necessary context belong before provider invocation." },
        { type: "note", title: "Framework-neutral", text: "Plain Python, Pydantic AI, LangGraph, Agno, or another runtime may implement or consume the boundary. None is a mandatory Lumis SDK core dependency." },
      ]},
    ],
  },
  {
    slug: "architecture/framework-and-cookbooks", group: "Architecture", label: "Framework boundaries", title: "Framework, applications, and cookbooks",
    description: "Separate reusable SDK capability from consuming applications, agent runtimes, synthetic scenarios, and hosted control planes.",
    sections: [
      { id: "core", title: "What the framework owns", blocks: [
        { type: "list", items: ["Vendor-neutral incident and recovery contracts.", "Deterministic diagnosis and explanation.", "Provider-neutral model, memory, reporting, context, policy, approval, verification, and audit ports.", "Strict configuration, redaction, local reports, local memory, CLI, and test doubles."] },
      ]},
      { id: "consumer", title: "What consuming applications own", blocks: [
        { type: "list", items: ["Monitoring and incident detection.", "Provider credentials and concrete connectors.", "Project-specific rules, runbooks, prompts, and playbooks.", "Agent runtime and model selection.", "Production orchestration, deployment, and access policy."] },
      ]},
      { id: "cookbooks", title: "Why cookbooks remain separate", blocks: [
        { type: "p", text: "Cookbooks are executable learning and validation artifacts. They use synthetic data, own their optional dependencies, and demonstrate how an application consumes core interfaces. They are examples—not the product boundary and not production control planes." },
      ]},
    ],
  },
  {
    slug: "reference/domain-models", group: "Reference", label: "Domain models", title: "Domain model reference",
    description: "Review the strict, vendor-neutral Pydantic contracts exported from lumis_sdk.domain.",
    sections: [
      { id: "diagnosis", title: "Incident and diagnosis", blocks: [
        { type: "table", headers: ["Type", "Purpose"], rows: [["IncidentInput", "Source tool, optional pipeline, environment, and raw payload."], ["EvidenceItem", "Claim-supported observation with provenance."], ["TriageResult", "Classification, severity, summary, and missing context."], ["DiagnosisResult", "Facts, hypothesis, confidence, evidence, gaps, next steps, method, and review flag."], ["ConfirmedResolution", "Human- or verifier-confirmed cause, action, outcome, and truth state."]] },
      ]},
      { id: "recovery", title: "Recovery state", blocks: [
        { type: "table", headers: ["Type", "Purpose"], rows: [["ContextItem / IncidentContext", "Bounded evidence attached to one incident."], ["ActionPlan", "Recommendation-only allowlisted playbook proposal."], ["ApprovalDecision", "Explicit approval state."], ["VerificationResult", "Bounded verification state and checks."], ["LifecycleResult", "Complete output of one non-executing lifecycle run."]] },
      ]},
      { id: "strictness", title: "Strict contracts", blocks: [
        { type: "p", text: "Public domain models reject unknown fields. This makes integration mistakes visible and prevents provider-specific data from silently leaking into core contracts." },
      ]},
    ],
  },
  {
    slug: "reference/ports", group: "Reference", label: "Ports", title: "Port reference",
    description: "Implement replaceable capabilities without changing the Lumis SDK domain or application layer.",
    sections: [
      { id: "ports", title: "Current public ports", blocks: [
        { type: "table", headers: ["Port", "Responsibility"], rows: [["ModelGateway", "Return structured diagnosis and auditable invocation metadata."], ["MemoryStore", "Save incidents, record confirmed resolutions, and search with reasons."], ["ReportWriter", "Persist a human-readable diagnosis report."], ["ContextProvider", "Retrieve bounded evidence without mutation."], ["PolicyEvaluator", "Propose a recommendation-only action plan."], ["ApprovalProvider", "Record an explicit decision."], ["RecoveryVerifier", "Return verification state without remediation."], ["AuditTrail", "Record lifecycle transitions."]] },
      ]},
      { id: "compatibility", title: "Compatibility posture", blocks: [
        { type: "p", text: "Ports are experimental pre-1.0 interfaces. Changes require compatibility notes. New core ports require an RFC because they expand the framework’s dependency and authority surface." },
      ]},
    ],
  },
  {
    slug: "plugins/overview", group: "Extend", label: "Plugin SDK direction", title: "Plugin and connector direction",
    description: "Understand the planned extension model without mistaking roadmap interfaces for implemented plugin discovery.",
    sections: [
      { id: "status", title: "Current status", blocks: [
        { type: "note", tone: "amber", title: "Not implemented", text: "Python entry-point discovery, plugin manifests, compatibility negotiation, and trust labels are roadmap work. Today, applications inject port implementations directly." },
      ]},
      { id: "types", title: "Planned plugin types", blocks: [
        { type: "list", items: ["Incident sources and evidence providers", "Memory stores and report writers", "Model gateways and redactors", "Policy evaluators and approval providers", "Future action executors and recovery verifiers"] },
      ]},
      { id: "trust", title: "Supply-chain requirements", blocks: [
        { type: "p", text: "Discovery should not ship before manifests, compatibility checks, lazy loading, provenance, declared permissions, reusable contract tests, and official/community/experimental trust labels are designed and tested." },
      ]},
    ],
  },
  {
    slug: "project/lumis-and-sdk", group: "Project", label: "Lumis SDK and Lumis", title: "Lumis SDK and Lumis",
    description: "Understand the open-source framework boundary and the managed operating layer provided by Lumis at Qadim Labs.",
    sections: [
      { id: "comparison", title: "Two complementary layers", blocks: [
        { type: "table", headers: ["Lumis SDK", "Lumis"], rows: [["Apache-2.0 Python framework", "Managed hosted platform"], ["Local and self-hosted workflows", "Multi-tenant team workflows"], ["Project-owned adapters and policies", "Managed connector fleet and approvals"], ["Local inspectable memory", "Hosted multi-user memory and audit"], ["Community support and extension", "Enterprise RBAC, SSO, runners, deployment, and support"]] },
      ]},
      { id: "independence", title: "Independence rule", blocks: [
        { type: "p", text: "Lumis SDK must remain useful without a Lumis key. It must not make remote calls by default, hide essential local capability, emit telemetry without opt-in, include proprietary product code, or require a commercial database or model provider." },
      ]},
      { id: "flow", title: "Open-core contribution flow", blocks: [
        { type: "p", text: "Generally useful primitives should be proposed and implemented publicly, released from Lumis SDK, and then consumed by Lumis. Product-specific UI, hosting, multi-tenancy, billing, and enterprise operations remain in the managed product." },
      ]},
    ],
  },
];

export const groups = Array.from(new Set(docs.map((page) => page.group))).map((group) => ({
  group,
  pages: docs.filter((page) => page.group === group),
}));

export function getDoc(slug?: string[]) {
  const key = slug?.join("/") || "overview";
  return docs.find((page) => page.slug === key);
}

export function getAdjacentDoc(slug: string) {
  const index = docs.findIndex((page) => page.slug === slug);
  return { previous: index > 0 ? docs[index - 1] : undefined, next: index < docs.length - 1 ? docs[index + 1] : undefined };
}
