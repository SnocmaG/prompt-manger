CREATE OR REPLACE VIEW "LivePrompt" AS
SELECT
  p.id,
  p.name,
  p."clientId",
  v.id AS "versionId",
  v.label AS "versionLabel",
  v."systemPrompt",
  v."userPrompt",
  v."createdAt" AS "deployedAt"
FROM "Prompt" p
JOIN "PromptVersion" v ON p."liveVersionId" = v.id;