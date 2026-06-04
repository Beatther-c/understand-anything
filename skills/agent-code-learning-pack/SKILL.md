---
name: agent-code-learning-pack
description: Generate a complete code-learning knowledge pack from an open-source AI/Agent repository. Use this skill whenever the user wants to study a repo through code, build a Karpathy-style LLM wiki / knowledge graph, generate full engineer-oriented lessons, quizzes, labs, mastery checks, weak-evidence reports, and a static HTML learning page. Especially use it for requests mentioning LangChain, LangGraph, Agent frameworks, Understand Anything, llm-wiki, source-code courses, entity graphs, test evidence, or one-shot complete curriculum generation.
---

# Agent Code Learning Pack

Use this skill to turn a real code repository into a complete learning package:

```text
source repo
  -> Understand Anything scan / graph
  -> research packs
  -> entities / relations / claims / evidence
  -> full lessons
  -> quizzes / mastery / labs
  -> weak-evidence report
  -> static HTML learning page
  -> learner annotations / feedback loop
  -> llm-wiki graph
```

The target reader is an experienced backend engineer who may be new to LLM / Agent concepts. Teach AI concepts from first principles, but keep programming and architecture explanations at an engineer-fast pace.

## Expected Inputs

Extract these from the conversation first. Ask only if missing and truly blocking.

- Target repository, for example `langchain-ai/langchain`.
- Learning domain, for example `ai-agents`.
- Project slug, for example `langchain`.
- Source scope, for example `libs/core`, `libs/langchain_v1`, `libs/partners/openai`.
- Learning units, usually 6-10 units.
- Reader profile.
- Whether the user wants a static HTML page.
- Whether to use Understand Anything and llm-wiki.

For this project, the default output root is:

```text
knowledge/ai-agents/<project-slug>/
```

## Core Principles

Treat the pack as a knowledge compiler, not a note dump.

- Markdown pages are the human-readable artifact.
- JSON graph files are machine-readable artifacts.
- Every major claim should bind to code, tests, docs, or explicit inference.
- Weak evidence should be surfaced, not hidden.
- The learner is not an expert reviewer. Verification should come from source lines, tests, traces, and generated reports.
- Each lesson should be a complete course, not a draft or outline, when the user asks for a one-shot complete curriculum.

## Required Directory Shape

Create or update:

```text
knowledge/ai-agents/<project>/
  README.md
  learning-path.md
  learning.html
  graph/
    entities.json
    relations.json
    claims.json
    evidence.json
    learning-map.json
  lessons/
  quizzes/
  mastery/
  labs/
  raw/
    code-graph/
    research-packs/
    source-notes/
  review/
    weak-evidence.md
    ai-verification-report.md
    open-questions.md
    test-evidence-matrix.md
  progress/
    learning-progress.md
  wiki/
```

## Lesson Standard

Each lesson should include:

- What you will learn.
- AI concept explanation from first principles.
- Why the abstraction is needed in engineering.
- Minimal mental model with pseudocode or compact code.
- Source entry points with repo, commit, path, symbol, and tests.
- Source reading path.
- Core entities and relations.
- Key claims and evidence IDs.
- Related test evidence.
- Real source explanation.
- Design tradeoffs.
- Java/backend analogy where useful.
- Common misunderstandings.
- Quiz link.
- Mastery link.
- Lab link.
- Completion standard.

Do not make later lessons shorter just because they were generated later. If the user explicitly wants a complete course, every lesson should be complete enough to study independently.

## Evidence Model

Use these four JSON files:

- `entities.json`: concepts, source symbols, modules, workflows, lessons, labs.
- `relations.json`: implements, extends, composes, calls, adapts, emits, depends_on, explained_by, tested_by.
- `claims.json`: verifiable statements.
- `evidence.json`: code, test, docs, or inferred evidence.

Evidence object:

```json
{
  "id": "ev-example",
  "repo": "owner/repo",
  "commit": "abc123",
  "path": "libs/core/...",
  "line_range": [10, 30],
  "symbol": "SymbolName",
  "evidence_type": "code",
  "summary": "What this proves."
}
```

Claim object:

```json
{
  "id": "claim-example",
  "text": "A verifiable statement.",
  "lesson": "01-topic",
  "confidence": "high",
  "evidence_level": "code",
  "evidence_ids": ["ev-code", "ev-test"],
  "status": "generated"
}
```

Prefer code and test evidence. Use docs as support. Mark inference clearly.

## Workflow

### 1. Prepare Repo

Clone the target repo under `repos/<repo-name>` if needed. Record the commit hash in `README.md`, `graph/*`, and evidence entries.

For large monorepos, start with focused scopes instead of the entire repo.

### 2. Run Understand Anything Scan

Use installed Understand Anything scripts if available:

```bash
node ~/.understand-anything/repo/understand-anything-plugin/skills/understand/scan-project.mjs <repo-scope>
node ~/.understand-anything/repo/understand-anything-plugin/skills/understand/compute-batches.mjs <repo-scope>
```

Save deterministic outputs into:

```text
raw/code-graph/<scope>.scan-result.json
raw/code-graph/<scope>.batches.json
```

If native slash-command subagents are unavailable, generate a UA-compatible learning graph from scan/batch plus LLM-compiled entities and relations. Be honest in `weak-evidence.md` about the method.

Use `scripts/build-ua-learning-graph.mjs` when this skill directory is available.

### 3. Generate Research Packs

For every lesson, create:

```text
raw/research-packs/<lesson-id>.research.md
```

Each research pack should include:

- Research goal.
- Core entities.
- Source entry points.
- Candidate claims.
- Key relations.
- Test evidence candidates.
- Open questions.

### 4. Generate Full Lessons

Generate all lessons in one pass if the user asks for a complete course. Keep every lesson complete, not “later lessons as draft.”

For Agent frameworks, useful default units are:

1. Runnable / execution abstraction.
2. Message schema.
3. Prompt template.
4. Chat model adapter.
5. Tool interface.
6. Callback / tracing.
7. Agent loop.
8. Provider integration.

Adapt the unit names for other projects.

### 5. Balance Test Evidence

For each lesson, find at least 2 test evidences. Prefer unit tests that prove the lesson’s central behavior.

Create:

```text
review/test-evidence-matrix.md
```

Update:

- `evidence.json`
- `claims.json`
- each lesson’s `相关测试证据` section
- `review/weak-evidence.md`
- `review/ai-verification-report.md`

### 6. Trace a Real Agent / Workflow Execution

For an Agent Loop or workflow lesson, trace one real execution path from tests or a runnable local script.

Expected artifact:

```text
raw/source-notes/<lesson>-compiled-graph-trace.md
```

Trace shape:

```text
input state
  -> model / decision node
  -> tool calls / action
  -> tool execution
  -> observation / ToolMessage
  -> next model call
  -> finish condition
```

If local execution fails because of environment or dependency incompatibility, do not fabricate a transcript. Use repository tests as strong evidence and document the failed local attempt briefly.

### 7. Build Static HTML Learning Page

Generate `learning.html` at the same level as `README.md`.

It should provide:

- left navigation for all lessons
- tabs or sections for course, quiz, mastery, lab
- second-level table of contents for the active markdown
- extra pages for README, learning path, final review, weak evidence, test evidence matrix, progress
- learner annotation support: select text, record a question or a study note, see QA/study-note views for the current page, export an annotated HTML file, and export study notes as Markdown

Use `scripts/build-learning-page.mjs` when available.

### 7.1 Use Learner Annotations to Improve the Course

When the user returns an annotated `learning-annotated-*.html` file:

1. Read the embedded `learning-annotations-data` JSON.
2. Split annotations by `type`:
   - `question`: learner confusion that needs an AI answer and likely course improvement.
   - `note`: learner's own study note that should be preserved for their personal knowledge base.
3. Group questions by `path`, lesson, and section.
4. For each question, identify the selected quote, the learner's confusion, and the likely missing explanation.
5. Update the original Markdown source files, not only the exported HTML.
6. Prefer adding clarifying explanations near the selected quote.
7. Add or update the annotation's `answer` field so the exported page can show a QA card.
8. If a question reveals a broad gap, also update quiz, mastery, lab, graph evidence, or weak-evidence files as needed.
9. Preserve `note` annotations and, when useful, turn them into Markdown notes under the user's chosen knowledge-base location.
10. Rebuild `learning.html` after changes.

This feedback loop matters because the learner may not be able to judge correctness, but they can reliably mark where the course failed to teach them.

### 8. Build llm-wiki Graph

If `llm-wiki` is initialized under `wiki/`, rebuild:

```bash
bash ~/.codex/skills/llm-wiki/scripts/build-graph-data.sh <pack>/wiki
bash ~/.codex/skills/llm-wiki/scripts/build-graph-html.sh <pack>/wiki
```

If the wiki sources are stale, copy updated research packs into `wiki/raw/notes/` and `wiki/wiki/sources/` before rebuilding.

### 9. Verify

Before reporting completion:

- Run `jq empty` on all graph JSON files.
- Parse the `learning.html` embedded JSON.
- Verify every lesson has course, quiz, mastery, and lab content.
- Verify each core claim has evidence.
- Verify each non-intro lesson has at least 2 test evidence IDs.
- Verify `weak-evidence.md` no longer lists solved items as unresolved.
- Verify UA graph stats are present.
- Verify the static HTML page contains annotation controls and `learning-annotations-data`.
- Verify llm-wiki graph data was regenerated if applicable.

Use `scripts/validate-pack.mjs` when available.

## Reporting

Keep the final response short and concrete:

- Mention the skill-generated artifacts.
- Mention verification.
- Mention honest limitations, especially if native `/understand` slash-command subagents were unavailable or local runtime execution failed.
- Provide absolute file links when referencing local files.

Do not claim “complete” unless the current files prove it.
