import { z } from "zod";

export const IsoDateTimeSchema = z.string().datetime();
export type IsoDateTime = z.infer<typeof IsoDateTimeSchema>;

export const SemverSchema = z.string().regex(/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/);
export type Semver = z.infer<typeof SemverSchema>;

export const UrlSchema = z.string().url();
export type Url = z.infer<typeof UrlSchema>;

export const IdentifierSchema = z.string().min(1);
export type Identifier = z.infer<typeof IdentifierSchema>;

export const LanguageSchema = z.enum(["typescript", "python", "dotnet", "java", "go", "rust", "other"]);
export type Language = z.infer<typeof LanguageSchema>;

export const RuntimeSchema = z.object({
  language: LanguageSchema,
  version: z.string().min(1),
});
export type Runtime = z.infer<typeof RuntimeSchema>;

export const StackConfigSchema = z.object({
  os: z.enum(["windows", "linux", "mac"]),
  containerized: z.boolean(),
  runtimes: z.array(RuntimeSchema).min(1),
  packageManagers: z.array(z.enum(["npm", "pnpm", "yarn", "uv", "pip", "poetry", "dotnet", "maven", "gradle"])),
});
export type StackConfig = z.infer<typeof StackConfigSchema>;

export const QualityGatesSchema = z.object({
  buildMaxSeconds: z.number().int().positive().max(120),
  coverageMinPercent: z.number().min(0).max(100),
  criticalLintMax: z.literal(0),
  blockOnTypeErrors: z.literal(true),
});
export type QualityGates = z.infer<typeof QualityGatesSchema>;

export const RepoDigestSchema = z.object({
  generatedAt: IsoDateTimeSchema,
  summary: z.string().min(1),
  commands: z.object({
    install: z.string().min(1),
    lint: z.string().min(1),
    test: z.string().min(1),
    build: z.string().min(1),
    typecheck: z.string().min(1),
  }),
  entrypoints: z.array(z.string().min(1)),
  architectureNotes: z.array(z.string().min(1)),
  indexingExclusions: z.array(z.string().min(1)),
});
export type RepoDigest = z.infer<typeof RepoDigestSchema>;

export const ProjectSchema = z.object({
  id: IdentifierSchema,
  name: z.string().min(1),
  repoUrl: UrlSchema.optional(),
  defaultBranch: z.string().min(1),
  createdAt: IsoDateTimeSchema,
  stack: StackConfigSchema,
  qualityGates: QualityGatesSchema,
  repoDigest: RepoDigestSchema.optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const CIProviderSchema = z.enum(["github", "gitlab", "azure", "other"]);
export type CIProvider = z.infer<typeof CIProviderSchema>;

export const ArtifactKindSchema = z.enum(["coverage", "junit", "sarif", "build", "logs"]);
export type ArtifactKind = z.infer<typeof ArtifactKindSchema>;

export const ArtifactOutputSchema = z.object({
  kind: ArtifactKindSchema,
  path: z.string().min(1),
  retentionDays: z.number().int().positive(),
});
export type ArtifactOutput = z.infer<typeof ArtifactOutputSchema>;

export const CIJobStageSchema = z.enum(["setup", "lint_typecheck", "test_coverage", "build"]);
export type CIJobStage = z.infer<typeof CIJobStageSchema>;

export const CIJobSchema = z.object({
  id: IdentifierSchema,
  name: z.string().min(1),
  stage: CIJobStageSchema,
  timeoutMinutes: z.number().int().positive(),
  runsOn: z.string().min(1),
  commands: z.array(z.string().min(1)).min(1),
  artifacts: z.array(ArtifactOutputSchema),
});
export type CIJob = z.infer<typeof CIJobSchema>;

export const CIPipelineSchema = z.object({
  id: IdentifierSchema,
  provider: CIProviderSchema,
  targetBranch: z.string().min(1),
  jobs: z.array(CIJobSchema).min(1),
  caching: z.object({
    enabled: z.boolean(),
    strategy: z.enum(["lockfile", "content_hash", "custom"]).optional(),
  }),
});
export type CIPipeline = z.infer<typeof CIPipelineSchema>;

export const BranchTypeSchema = z.enum(["main", "feature", "fix", "chore", "experiment", "release"]);
export type BranchType = z.infer<typeof BranchTypeSchema>;

export const BranchSchema = z.object({
  name: z.string().min(1),
  type: BranchTypeSchema,
  base: z.string().min(1),
  createdAt: IsoDateTimeSchema,
  owner: z.string().min(1).optional(),
});
export type Branch = z.infer<typeof BranchSchema>;

export const PRChecklistSchema = z.object({
  lintPassed: z.boolean(),
  testsPassed: z.boolean(),
  coveragePercent: z.number().min(0).max(100),
  buildUnder2Min: z.boolean(),
  noCriticalLintWarnings: z.boolean(),
  rollbackPlanIncluded: z.boolean(),
  docsUpdated: z.boolean(),
  reviewerApproved: z.boolean(),
});
export type PRChecklist = z.infer<typeof PRChecklistSchema>;

export const AIArtifactsSchema = z.object({
  assistant: z.object({
    provider: z.string().min(1),
    model: z.string().min(1),
  }),
  noSecretsConfirmed: z.literal(true),
  contextSources: z.array(z.string().min(1)),
  promptsUsed: z.array(z.string().min(1)),
  verificationCommands: z.array(z.string().min(1)),
  notes: z.string().min(1).optional(),
});
export type AIArtifacts = z.infer<typeof AIArtifactsSchema>;

export const PullRequestStatusSchema = z.enum(["draft", "open", "merged", "closed"]);
export type PullRequestStatus = z.infer<typeof PullRequestStatusSchema>;

export const PullRequestSchema = z.object({
  id: IdentifierSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  author: z.string().min(1),
  sourceBranch: z.string().min(1),
  targetBranch: z.string().min(1),
  status: PullRequestStatusSchema,
  createdAt: IsoDateTimeSchema,
  mergedAt: IsoDateTimeSchema.optional(),
  checklist: PRChecklistSchema,
  aiArtifacts: AIArtifactsSchema,
  links: z
    .object({
      ciRunUrl: UrlSchema.optional(),
      issueUrl: UrlSchema.optional(),
      docsUrl: UrlSchema.optional(),
    })
    .optional(),
});
export type PullRequest = z.infer<typeof PullRequestSchema>;

export const ADRStatusSchema = z.enum(["proposed", "accepted", "rejected", "deprecated"]);
export type ADRStatus = z.infer<typeof ADRStatusSchema>;

export const ADRSchema = z.object({
  id: IdentifierSchema,
  title: z.string().min(1),
  status: ADRStatusSchema,
  date: IsoDateTimeSchema,
  context: z.string().min(1),
  decision: z.string().min(1),
  consequences: z.string().min(1),
  alternatives: z.array(z.string().min(1)),
  rollback: z.string().min(1),
});
export type ADR = z.infer<typeof ADRSchema>;

export const ExperimentVerdictSchema = z.enum(["pending", "keep", "revert"]);
export type ExperimentVerdict = z.infer<typeof ExperimentVerdictSchema>;

export const ExperimentLogSchema = z.object({
  id: IdentifierSchema,
  hypothesis: z.string().min(1),
  branch: z.string().min(1),
  startedAt: IsoDateTimeSchema,
  endedAt: IsoDateTimeSchema.optional(),
  metrics: z.array(z.string().min(1)),
  resultSummary: z.string().min(1).optional(),
  verdict: ExperimentVerdictSchema,
  promotionPRId: IdentifierSchema.optional(),
});
export type ExperimentLog = z.infer<typeof ExperimentLogSchema>;

export const PromptTemplateSchema = z.object({
  id: IdentifierSchema,
  name: z.string().min(1),
  purpose: z.string().min(1),
  prompt: z.string().min(1),
  tags: z.array(z.string().min(1)),
  noSecretsReminder: z.literal(true),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema.optional(),
});
export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;

export const CredentialStoreKindSchema = z.enum([
  "1password",
  "bitwarden",
  "windowsCredentialManager",
  "ciSecret",
  "other",
]);
export type CredentialStoreKind = z.infer<typeof CredentialStoreKindSchema>;

export const CredentialRefSchema = z.object({
  kind: CredentialStoreKindSchema,
  reference: z.string().min(1),
});
export type CredentialRef = z.infer<typeof CredentialRefSchema>;

export const EnvVarScopeSchema = z.enum(["local", "ci", "dev", "stage", "prod"]);
export type EnvVarScope = z.infer<typeof EnvVarScopeSchema>;

export const SecretEnvironmentVariableSchema = z.object({
  name: z.string().min(1),
  scope: EnvVarScopeSchema,
  required: z.boolean(),
  secret: z.literal(true),
  credentialRef: CredentialRefSchema,
  description: z.string().min(1).optional(),
  example: z.string().min(1).optional(),
});
export type SecretEnvironmentVariable = z.infer<typeof SecretEnvironmentVariableSchema>;

export const PlainEnvironmentVariableSchema = z.object({
  name: z.string().min(1),
  scope: EnvVarScopeSchema,
  required: z.boolean(),
  secret: z.literal(false).optional(),
  defaultValue: z.string().optional(),
  description: z.string().min(1).optional(),
  example: z.string().min(1).optional(),
});
export type PlainEnvironmentVariable = z.infer<typeof PlainEnvironmentVariableSchema>;

export const EnvironmentVariableSchema = z.union([
  SecretEnvironmentVariableSchema,
  PlainEnvironmentVariableSchema,
]);
export type EnvironmentVariable = z.infer<typeof EnvironmentVariableSchema>;

export const WeeklyMetricsSchema = z.object({
  weekOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  buildTimeSecondsP50: z.number().int().nonnegative(),
  buildTimeSecondsP95: z.number().int().nonnegative(),
  coveragePercent: z.number().min(0).max(100),
  criticalLintCount: z.number().int().nonnegative(),
  totalLintWarnings: z.number().int().nonnegative(),
  meanTimeToGreenMinutes: z.number().int().nonnegative(),
  prCycleTimeHoursP50: z.number().nonnegative(),
  rollbackCount: z.number().int().nonnegative(),
});
export type WeeklyMetrics = z.infer<typeof WeeklyMetricsSchema>;

export const FolderEntrySchema = z.object({
  path: z.string().min(1),
  purpose: z.string().min(1),
  excludeFromIndexing: z.boolean(),
});
export type FolderEntry = z.infer<typeof FolderEntrySchema>;

