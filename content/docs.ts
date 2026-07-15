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
    slug: "architecture/overview", group: "Build", label: "Architecture", title: "Architecture",
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
    slug: "configuration/project", group: "Build", label: "Configuration", title: "Project configuration",
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
    slug: "configuration/rules", group: "Build", label: "Deterministic rules", title: "Deterministic rules",
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
    slug: "safety/threat-model", group: "Project", label: "Safety", title: "Safety and threat model",
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
