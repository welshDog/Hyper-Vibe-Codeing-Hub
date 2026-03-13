import { describe, expect, it } from "vitest";
import {
  AIArtifactsSchema,
  EnvironmentVariableSchema,
  QualityGatesSchema,
  SemverSchema,
  UrlSchema,
} from "./hvc";
import { entityRegistry } from "../schemaRegistry";

describe("hvc model", () => {
  it("parses all registry examples against their schemas", () => {
    for (const e of entityRegistry) {
      const result = e.schema.safeParse(e.example);
      expect(result.success).toBe(true);
    }
  });

  it("locks criticalLintMax to 0", () => {
    const ok = QualityGatesSchema.safeParse({
      buildMaxSeconds: 120,
      coverageMinPercent: 80,
      criticalLintMax: 0,
      blockOnTypeErrors: true,
    });
    expect(ok.success).toBe(true);

    const bad = QualityGatesSchema.safeParse({
      buildMaxSeconds: 120,
      coverageMinPercent: 80,
      criticalLintMax: 1,
      blockOnTypeErrors: true,
    });
    expect(bad.success).toBe(false);
  });

  it("requires noSecretsConfirmed to be true", () => {
    const ok = AIArtifactsSchema.safeParse({
      assistant: { provider: "x", model: "y" },
      noSecretsConfirmed: true,
      contextSources: ["RepoDigest"],
      promptsUsed: ["Bugfix loop"],
      verificationCommands: ["npm run lint"],
    });
    expect(ok.success).toBe(true);

    const bad = AIArtifactsSchema.safeParse({
      assistant: { provider: "x", model: "y" },
      noSecretsConfirmed: false,
      contextSources: ["RepoDigest"],
      promptsUsed: ["Bugfix loop"],
      verificationCommands: ["npm run lint"],
    });
    expect(bad.success).toBe(false);
  });

  it("models secret env vars via credential reference (never values)", () => {
    const ok = EnvironmentVariableSchema.safeParse({
      name: "OPENAI_API_KEY",
      scope: "local",
      required: true,
      secret: true,
      credentialRef: { kind: "windowsCredentialManager", reference: "hyper-vibe/openai" },
      description: "API key for AI pair-programming actions.",
    });
    expect(ok.success).toBe(true);

    const bad = EnvironmentVariableSchema.safeParse({
      name: "OPENAI_API_KEY",
      scope: "local",
      required: true,
      secret: true,
      description: "Missing credential ref.",
    });
    expect(bad.success).toBe(false);
  });

  it("validates shared primitives", () => {
    expect(SemverSchema.safeParse("1.2.3").success).toBe(true);
    expect(SemverSchema.safeParse("1.2").success).toBe(false);
    expect(UrlSchema.safeParse("https://example.com").success).toBe(true);
    expect(UrlSchema.safeParse("not-a-url").success).toBe(false);
  });
});
