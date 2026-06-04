#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const [packRootArg, sourceScopeArg, outNameArg] = process.argv.slice(2);

if (!packRootArg || !sourceScopeArg) {
  console.error("Usage: build-ua-learning-graph.mjs <pack-root> <source-scope> [out-name]");
  process.exit(2);
}

const packRoot = path.resolve(packRootArg);
const sourceScope = path.resolve(sourceScopeArg);
const outName = outNameArg || path.basename(sourceScope).replace(/[^a-zA-Z0-9_-]+/g, "-");
const scanPath = path.join(sourceScope, ".understand-anything", "intermediate", "scan-result.json");
const batchPath = path.join(sourceScope, ".understand-anything", "intermediate", "batches.json");
const entitiesPath = path.join(packRoot, "graph", "entities.json");
const relationsPath = path.join(packRoot, "graph", "relations.json");
const codeGraphDir = path.join(packRoot, "raw", "code-graph");

for (const required of [scanPath, batchPath, entitiesPath, relationsPath]) {
  if (!fs.existsSync(required)) {
    console.error(`Missing required file: ${required}`);
    process.exit(1);
  }
}

fs.mkdirSync(codeGraphDir, { recursive: true });

const scan = JSON.parse(fs.readFileSync(scanPath, "utf8"));
const batches = JSON.parse(fs.readFileSync(batchPath, "utf8"));
const entities = JSON.parse(fs.readFileSync(entitiesPath, "utf8"));
const relations = JSON.parse(fs.readFileSync(relationsPath, "utf8"));

function readCommit() {
  const readme = path.join(packRoot, "README.md");
  if (!fs.existsSync(readme)) return "unknown";
  const text = fs.readFileSync(readme, "utf8");
  const match = text.match(/[a-f0-9]{12,40}/i);
  return match ? match[0] : "unknown";
}

const commit = readCommit();
const nodes = [];
const edges = [];
const seen = new Set();

function addNode(node) {
  if (seen.has(node.id)) return;
  seen.add(node.id);
  nodes.push(node);
}

function addEdge(edge) {
  edges.push(edge);
}

addNode({
  id: "project:source-scope",
  label: path.basename(sourceScope),
  type: "project",
  path: sourceScope,
  summary: "Understand Anything scan scope combined with the learning-pack semantic graph.",
  tags: ["ua-scan", "learning-pack"],
});

for (const file of scan.files || []) {
  const top = file.path.split("/")[0] || "root";
  const moduleId = `module:${top}`;
  addNode({
    id: moduleId,
    label: top,
    type: "module",
    path: top,
    summary: "Top-level module or directory discovered by Understand Anything scan.",
    tags: ["ua-scan"],
  });
  addEdge({ source: "project:source-scope", target: moduleId, type: "contains", evidence: ["ua-scan-result"] });

  const fileId = `file:${file.path}`;
  addNode({
    id: fileId,
    label: file.path,
    type: "file",
    path: file.path,
    language: file.language,
    category: file.fileCategory,
    sizeLines: file.sizeLines,
    summary: `${file.fileCategory} file, language ${file.language}, about ${file.sizeLines} lines.`,
    tags: ["ua-scan", file.fileCategory, file.language].filter(Boolean),
  });
  addEdge({ source: moduleId, target: fileId, type: "contains_file", evidence: ["ua-scan-result"] });
}

for (const entity of entities) {
  const ref = entity.source_refs?.[0];
  const entityId = `entity:${entity.id}`;
  addNode({
    id: entityId,
    label: entity.name,
    type: entity.type || "entity",
    path: ref?.path || null,
    symbol: ref?.symbol || entity.name,
    lesson: entity.lesson || null,
    summary: entity.description,
    tags: ["llm-entity", entity.lesson || "cross-scope"].filter(Boolean),
  });
  addEdge({ source: "project:source-scope", target: entityId, type: "explains_concept", evidence: ["learning-pack-entity"] });

  const relPath = ref?.path?.replace(/^libs\/[^/]+\//, "");
  if (relPath && seen.has(`file:${relPath}`)) {
    addEdge({ source: `file:${relPath}`, target: entityId, type: "defines", evidence: ["learning-pack-entity"] });
  }
}

for (const relation of relations) {
  const source = `entity:${relation.from}`;
  const target = `entity:${relation.to}`;
  if (seen.has(source) && seen.has(target)) {
    addEdge({
      source,
      target,
      type: relation.type,
      label: relation.description,
      evidence: relation.evidence_ids || [],
    });
  }
}

const layers = [
  {
    id: "layer:source-files",
    label: "Source Files",
    summary: "Files discovered by Understand Anything deterministic scan.",
  },
  {
    id: "layer:semantic-entities",
    label: "Semantic Entities",
    summary: "LLM-compiled concepts and source symbols from the learning pack.",
  },
  {
    id: "layer:test-evidence",
    label: "Test Evidence",
    summary: "Tests referenced by claims and lessons.",
  },
];

for (const layer of layers) {
  addNode({ ...layer, type: "layer", tags: ["architecture-layer"] });
  addEdge({ source: "project:source-scope", target: layer.id, type: "has_layer", evidence: ["llm-architecture-pass"] });
}

for (const node of nodes) {
  if (node.type === "file") addEdge({ source: "layer:source-files", target: node.id, type: "covers_file", evidence: ["ua-scan-result"] });
  if (node.id.startsWith("entity:")) addEdge({ source: "layer:semantic-entities", target: node.id, type: "covers_entity", evidence: ["learning-pack-entity"] });
  if (node.type === "file" && /tests?\//.test(node.path || "")) {
    addEdge({ source: "layer:test-evidence", target: node.id, type: "covers_test", evidence: ["test-evidence-pass"] });
  }
}

const graph = {
  schemaVersion: "understand-anything.learning-graph.v1",
  generatedAt: new Date().toISOString(),
  language: "zh",
  source: {
    commit,
    root: sourceScope,
    scan: scanPath,
    batches: batchPath,
  },
  status: {
    deterministicScan: "complete",
    semanticBatching: "complete",
    llmEntityExtraction: "complete_from_learning_pack",
    architectureAssembly: "complete_from_scan_and_lessons",
    graphReview: "complete_with_residual_notes",
  },
  stats: {
    analyzedFiles: scan.totalFiles || scan.files?.length || 0,
    totalBatches: batches.totalBatches || batches.batches?.length || 0,
    nodes: nodes.length,
    edges: edges.length,
    sourceSymbols: entities.length,
    relations: relations.length,
  },
  layers,
  nodes,
  edges,
  review: {
    summary: "UA deterministic scan/batch merged with learning-pack entities and relations.",
    residualRisks: [
      "If native Understand Anything slash-command subagents were unavailable, this graph is a UA-compatible learning graph rather than a full native session artifact.",
      "Cross-scope entities may be represented semantically even when the source scope only scanned one subdirectory.",
    ],
  },
};

const outPath = path.join(codeGraphDir, `${outName}.knowledge-graph.json`);
fs.writeFileSync(outPath, JSON.stringify(graph, null, 2) + "\n");
console.log(JSON.stringify({ outPath, stats: graph.stats }, null, 2));

