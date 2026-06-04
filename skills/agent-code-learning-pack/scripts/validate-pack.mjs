#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const [packRootArg] = process.argv.slice(2);

if (!packRootArg) {
  console.error("Usage: validate-pack.mjs <pack-root>");
  process.exit(2);
}

const packRoot = path.resolve(packRootArg);
const failures = [];

function exists(relPath) {
  return fs.existsSync(path.join(packRoot, relPath));
}

function read(relPath) {
  return fs.readFileSync(path.join(packRoot, relPath), "utf8");
}

function json(relPath) {
  try {
    return JSON.parse(read(relPath));
  } catch (error) {
    failures.push(`${relPath} is not valid JSON: ${error.message}`);
    return null;
  }
}

function requireFile(relPath) {
  if (!exists(relPath)) failures.push(`Missing file: ${relPath}`);
}

[
  "README.md",
  "learning-path.md",
  "learning.html",
  "graph/entities.json",
  "graph/relations.json",
  "graph/claims.json",
  "graph/evidence.json",
  "graph/learning-map.json",
  "review/weak-evidence.md",
  "review/ai-verification-report.md",
  "review/test-evidence-matrix.md",
  "progress/learning-progress.md",
].forEach(requireFile);

const learningMap = json("graph/learning-map.json");
const claims = json("graph/claims.json") || [];
const evidence = json("graph/evidence.json") || [];
const evidenceById = new Map(evidence.map((item) => [item.id, item]));

if (learningMap?.units) {
  for (const unit of learningMap.units) {
    const files = [
      `lessons/${unit.id}.md`,
      `quizzes/${unit.id}.quiz.md`,
      `mastery/${unit.id}.mastery.md`,
    ];
    files.forEach(requireFile);

    const lessonPath = `lessons/${unit.id}.md`;
    if (exists(lessonPath)) {
      const lesson = read(lessonPath);
      for (const heading of [
        "## 你会学到什么",
        "## AI 概念从零解释",
        "## 源码阅读路径",
        "## 关键 claims 与 evidence",
        "## 真实源码解释",
        "## 自测题",
        "## 掌握度验证",
        "## 最小复刻任务",
        "## 学完标准",
      ]) {
        if (!lesson.includes(heading)) failures.push(`${lessonPath} missing heading: ${heading}`);
      }
      if (unit.id !== "01-runnable" && !lesson.includes("## 相关测试证据")) {
        failures.push(`${lessonPath} missing related test evidence section`);
      }
    }
  }
} else {
  failures.push("graph/learning-map.json missing units");
}

for (const claim of claims) {
  if (!claim.evidence_ids?.length) failures.push(`${claim.id} has no evidence_ids`);
  for (const evidenceId of claim.evidence_ids || []) {
    if (!evidenceById.has(evidenceId)) failures.push(`${claim.id} references missing evidence ${evidenceId}`);
  }
}

const nonIntroClaims = claims.filter((claim) => claim.lesson && claim.lesson !== "01-runnable");
for (const claim of nonIntroClaims) {
  const testCount = (claim.evidence_ids || []).filter((id) => evidenceById.get(id)?.evidence_type === "test").length;
  if (testCount < 2) failures.push(`${claim.id} has only ${testCount} test evidence item(s)`);
}

if (exists("learning.html")) {
  const html = read("learning.html");
  const match = html.match(/<script id="learning-data" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) {
    failures.push("learning.html missing embedded learning-data JSON");
  } else {
    try {
      const data = JSON.parse(match[1]);
      if ((data.units || []).length !== (learningMap?.units || []).length) {
        failures.push("learning.html unit count does not match learning-map");
      }
    } catch (error) {
      failures.push(`learning.html embedded JSON is invalid: ${error.message}`);
    }
  }
  if (!html.includes('id="addNoteBtn"')) failures.push("learning.html missing add note button");
  if (!html.includes('id="viewQaBtn"')) failures.push("learning.html missing QA review button");
  if (!html.includes('id="viewStudyNotesBtn"')) failures.push("learning.html missing study notes view button");
  if (!html.includes('id="exportNotesBtn"')) failures.push("learning.html missing annotated HTML export button");
  if (!html.includes('id="exportStudyNotesBtn"')) failures.push("learning.html missing study notes markdown export button");
  if (!html.includes('id="learning-annotations-data"')) failures.push("learning.html missing learning-annotations-data JSON");
}

const codeGraphDir = path.join(packRoot, "raw", "code-graph");
if (fs.existsSync(codeGraphDir)) {
  const uaGraphs = fs.readdirSync(codeGraphDir).filter((name) => name.endsWith(".knowledge-graph.json"));
  if (!uaGraphs.length) failures.push("raw/code-graph has no *.knowledge-graph.json");
  for (const graphName of uaGraphs) {
    const graph = json(path.join("raw", "code-graph", graphName));
    if (graph && (!graph.stats?.nodes || !graph.stats?.edges)) {
      failures.push(`${graphName} missing graph stats`);
    }
  }
} else {
  failures.push("Missing directory: raw/code-graph");
}

if (exists("wiki/wiki/graph-data.json")) {
  const graphData = json("wiki/wiki/graph-data.json");
  if (graphData && (!graphData.nodes?.length || !graphData.edges?.length)) {
    failures.push("wiki/wiki/graph-data.json has no nodes or edges");
  }
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  units: learningMap?.units?.length || 0,
  claims: claims.length,
  evidence: evidence.length,
}, null, 2));
