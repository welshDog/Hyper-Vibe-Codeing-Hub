import { z } from "zod";
import {
  ADRSchema,
  AIArtifactsSchema,
  ArtifactOutputSchema,
  BranchSchema,
  CIPipelineSchema,
  CIJobSchema,
  EnvironmentVariableSchema,
  ExperimentLogSchema,
  FolderEntrySchema,
  PRChecklistSchema,
  ProjectSchema,
  PromptTemplateSchema,
  PullRequestSchema,
  QualityGatesSchema,
  RepoDigestSchema,
  StackConfigSchema,
  WeeklyMetricsSchema,
} from "./model/hvc";

export type EntityCategory = "Core" | "CI / Build" | "Workflow" | "Knowledge" | "Config / Ops";

export type EntityDefinition<TSchema extends z.ZodTypeAny> = {
  name: string;
  category: EntityCategory;
  description: string;
  schema: TSchema;
  example: unknown;
};

const nowIso = new Date().toISOString();

export const entityRegistry = [
  {
    name: "Project",
    category: "Core",
    description: "Root entity that anchors stack configuration, quality gates, and digest context.",
    schema: ProjectSchema,
    example: {
      id: "proj_hvc",
      name: "Hyper Vibe Coding Hub",
      repoUrl: "https://example.com/org/hvc.git",
      defaultBranch: "main",
      createdAt: nowIso,
      stack: {
        os: "windows",
        containerized: false,
        runtimes: [
          { language: "typescript", version: "20.17.0" },
          { language: "python", version: "3.12.3" },
        ],
        packageManagers: ["npm", "pnpm", "uv"],
      },
      qualityGates: {
        buildMaxSeconds: 120,
        coverageMinPercent: 80,
        criticalLintMax: 0,
        blockOnTypeErrors: true,
      },
      repoDigest: {
        generatedAt: nowIso,
        summary: "Polyglot dev workflow system with AI-assisted build and validation loops.",
        commands: {
          install: "npm install",
          lint: "npm run lint",
          test: "npm test",
          build: "npm run build",
          typecheck: "npm run typecheck",
        },
        entrypoints: ["src/main.tsx"],
        architectureNotes: [
          "Schema registry drives explorer UI.",
          "Zod schemas act as validation source of truth.",
        ],
        indexingExclusions: ["node_modules/", "dist/", "coverage/"],
      },
    },
  },
  {
    name: "StackConfig",
    category: "Core",
    description: "Describes runtimes, OS, and package managers for the workspace.",
    schema: StackConfigSchema,
    example: {
      os: "windows",
      containerized: false,
      runtimes: [
        { language: "typescript", version: "20.17.0" },
        { language: "python", version: "3.12.3" },
      ],
      packageManagers: ["npm", "pnpm", "uv"],
    },
  },
  {
    name: "QualityGates",
    category: "Core",
    description: "Policy thresholds enforced locally and in CI for quality and speed.",
    schema: QualityGatesSchema,
    example: {
      buildMaxSeconds: 120,
      coverageMinPercent: 80,
      criticalLintMax: 0,
      blockOnTypeErrors: true,
    },
  },
  {
    name: "RepoDigest",
    category: "Core",
    description: "One-page context window primer for humans and AI assistants.",
    schema: RepoDigestSchema,
    example: {
      generatedAt: nowIso,
      summary: "Commands, entrypoints, exclusions, and architectural notes for fast onboarding.",
      commands: {
        install: "npm install",
        lint: "npm run lint",
        test: "npm test",
        build: "npm run build",
        typecheck: "npm run typecheck",
      },
      entrypoints: ["src/main.tsx"],
      architectureNotes: ["Keep loops fast: lint/typecheck/test before big refactors."],
      indexingExclusions: ["node_modules/", "dist/", "coverage/"],
    },
  },
  {
    name: "CIPipeline",
    category: "CI / Build",
    description: "Models provider, target branch, caching strategy, and the job graph.",
    schema: CIPipelineSchema,
    example: {
      id: "ci_default",
      provider: "github",
      targetBranch: "main",
      jobs: [
        {
          id: "job_setup",
          name: "Setup + Cache",
          stage: "setup",
          timeoutMinutes: 10,
          runsOn: "ubuntu-latest",
          commands: ["npm ci"],
          artifacts: [],
        },
        {
          id: "job_lint",
          name: "Lint + Typecheck",
          stage: "lint_typecheck",
          timeoutMinutes: 10,
          runsOn: "ubuntu-latest",
          commands: ["npm run lint", "npm run typecheck"],
          artifacts: [{ kind: "sarif", path: "reports/eslint.sarif", retentionDays: 14 }],
        },
        {
          id: "job_test",
          name: "Unit Tests + Coverage",
          stage: "test_coverage",
          timeoutMinutes: 15,
          runsOn: "ubuntu-latest",
          commands: ["npm test -- --coverage"],
          artifacts: [
            { kind: "coverage", path: "coverage/", retentionDays: 14 },
            { kind: "junit", path: "reports/junit.xml", retentionDays: 14 },
          ],
        },
        {
          id: "job_build",
          name: "Build",
          stage: "build",
          timeoutMinutes: 10,
          runsOn: "ubuntu-latest",
          commands: ["npm run build"],
          artifacts: [{ kind: "build", path: "dist/", retentionDays: 14 }],
        },
      ],
      caching: { enabled: true, strategy: "lockfile" },
    },
  },
  {
    name: "CIJob",
    category: "CI / Build",
    description: "A single job in the pipeline with commands, timeouts, and artifacts.",
    schema: CIJobSchema,
    example: {
      id: "job_lint",
      name: "Lint + Typecheck",
      stage: "lint_typecheck",
      timeoutMinutes: 10,
      runsOn: "ubuntu-latest",
      commands: ["npm run lint", "npm run typecheck"],
      artifacts: [{ kind: "sarif", path: "reports/eslint.sarif", retentionDays: 14 }],
    },
  },
  {
    name: "ArtifactOutput",
    category: "CI / Build",
    description: "An output artifact produced by CI (coverage, junit, sarif, build, logs).",
    schema: ArtifactOutputSchema,
    example: { kind: "coverage", path: "coverage/", retentionDays: 14 },
  },
  {
    name: "Branch",
    category: "Workflow",
    description: "Branch metadata aligned with trunk-based development and experiments.",
    schema: BranchSchema,
    example: {
      name: "feat/schema-explorer",
      type: "feature",
      base: "main",
      createdAt: nowIso,
      owner: "lyndz",
    },
  },
  {
    name: "PullRequest",
    category: "Workflow",
    description: "Pull request entity enforcing checklist and AI artifact traceability.",
    schema: PullRequestSchema,
    example: {
      id: "pr_1024",
      title: "Add interactive schema explorer",
      description: "Introduce typed model registry and a navigable explorer UI.",
      author: "lyndz",
      sourceBranch: "feat/schema-explorer",
      targetBranch: "main",
      status: "open",
      createdAt: nowIso,
      checklist: {
        lintPassed: true,
        testsPassed: true,
        coveragePercent: 82.4,
        buildUnder2Min: true,
        noCriticalLintWarnings: true,
        rollbackPlanIncluded: true,
        docsUpdated: true,
        reviewerApproved: false,
      },
      aiArtifacts: {
        assistant: { provider: "openai", model: "gpt-5.2" },
        noSecretsConfirmed: true,
        contextSources: ["RepoDigest", "Checklist", "CI policy"],
        promptsUsed: ["Bugfix loop", "Refactor safely"],
        verificationCommands: ["npm run lint", "npm run typecheck", "npm run build"],
      },
    },
  },
  {
    name: "PRChecklist",
    category: "Workflow",
    description: "Merge-blocking checklist capturing quality gates and human review status.",
    schema: PRChecklistSchema,
    example: {
      lintPassed: true,
      testsPassed: true,
      coveragePercent: 81.2,
      buildUnder2Min: true,
      noCriticalLintWarnings: true,
      rollbackPlanIncluded: true,
      docsUpdated: true,
      reviewerApproved: true,
    },
  },
  {
    name: "AIArtifacts",
    category: "Workflow",
    description: "Traceability bundle for AI-assisted changes (prompts, context, verification).",
    schema: AIArtifactsSchema,
    example: {
      assistant: { provider: "openai", model: "gpt-5.2" },
      noSecretsConfirmed: true,
      contextSources: ["RepoDigest", "ADR-001"],
      promptsUsed: ["Add feature loop"],
      verificationCommands: ["npm run lint", "npm run typecheck", "npm run build"],
    },
  },
  {
    name: "ADR",
    category: "Knowledge",
    description: "Architecture Decision Record capturing context, decision, and rollback.",
    schema: ADRSchema,
    example: {
      id: "adr_001",
      title: "Use Zod as validation source of truth",
      status: "accepted",
      date: nowIso,
      context: "Need a single runtime-validated schema for explorer and for config validation.",
      decision: "Adopt Zod schemas and infer types for compile-time safety.",
      consequences: "Schema registry can render shapes directly and validate examples.",
      alternatives: ["io-ts", "JSON Schema"],
      rollback: "Replace Zod schemas with JSON Schema generator and update registry renderer.",
    },
  },
  {
    name: "ExperimentLog",
    category: "Knowledge",
    description: "Tracks hypotheses, results, and keep/revert decisions for experiments.",
    schema: ExperimentLogSchema,
    example: {
      id: "exp_2026_03_13",
      hypothesis: "A schema explorer reduces onboarding time and improves consistency.",
      branch: "exp/schema-explorer",
      startedAt: nowIso,
      metrics: ["PR cycle time", "lint critical count", "onboarding duration"],
      verdict: "pending",
    },
  },
  {
    name: "PromptTemplate",
    category: "Knowledge",
    description:
      "Reusable prompts for AI pair-programming loops with a forced no-secrets reminder.",
    schema: PromptTemplateSchema,
    example: {
      id: "prompt_bugfix",
      name: "Bugfix loop",
      purpose: "Reproduce, test, fix, verify with minimal scope.",
      prompt:
        "Reproduce the bug. Add/adjust tests that fail. Implement the smallest fix. Run lint/typecheck/tests. Summarize changes and rollback.",
      tags: ["bugfix", "safety"],
      noSecretsReminder: true,
      createdAt: nowIso,
    },
  },
  {
    name: "EnvironmentVariable",
    category: "Config / Ops",
    description: "Documented env var with secret-safe modeling (no values stored for secrets).",
    schema: EnvironmentVariableSchema,
    example: {
      name: "OPENAI_API_KEY",
      scope: "local",
      required: true,
      secret: true,
      credentialRef: { kind: "windowsCredentialManager", reference: "hyper-vibe/openai" },
      description: "API key for AI pair-programming actions.",
    },
  },
  {
    name: "WeeklyMetrics",
    category: "Config / Ops",
    description: "Weekly health snapshot for build speed, coverage, lint, and rollback frequency.",
    schema: WeeklyMetricsSchema,
    example: {
      weekOf: "2026-03-09",
      buildTimeSecondsP50: 58,
      buildTimeSecondsP95: 108,
      coveragePercent: 82.4,
      criticalLintCount: 0,
      totalLintWarnings: 3,
      meanTimeToGreenMinutes: 19,
      prCycleTimeHoursP50: 6.4,
      rollbackCount: 0,
    },
  },
  {
    name: "FolderEntry",
    category: "Config / Ops",
    description: "Workspace folder metadata including IDE/AI indexing exclusions.",
    schema: FolderEntrySchema,
    example: { path: "node_modules/", purpose: "Dependencies", excludeFromIndexing: true },
  },
] as const satisfies ReadonlyArray<EntityDefinition<z.ZodTypeAny>>;

export type EntityName = (typeof entityRegistry)[number]["name"];

export const categories: ReadonlyArray<EntityCategory> = [
  "Core",
  "CI / Build",
  "Workflow",
  "Knowledge",
  "Config / Ops",
];

export function getEntityByName(name: string): EntityDefinition<z.ZodTypeAny> | undefined {
  return entityRegistry.find((e) => e.name === name);
}
