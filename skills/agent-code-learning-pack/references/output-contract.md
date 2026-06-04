# Output Contract

Use this contract when checking whether an Agent Code Learning Pack is complete.

## Human-Readable Files

- `README.md`: entry point, source repo, commit, how to start.
- `learning-path.md`: course order and dependencies.
- `learning.html`: static reader at the same level as README.
- `lessons/*.md`: complete course pages.
- `quizzes/*.quiz.md`: self-check questions.
- `mastery/*.mastery.md`: mastery tasks.
- `labs/*/README.md`: minimal reproduction lab specs.
- `review/weak-evidence.md`: unresolved evidence gaps and honest limitations.
- `review/test-evidence-matrix.md`: per-lesson test evidence coverage.
- `progress/learning-progress.md`: learner state and suggested next steps.

## Machine-Readable Files

- `graph/entities.json`
- `graph/relations.json`
- `graph/claims.json`
- `graph/evidence.json`
- `graph/learning-map.json`
- `raw/code-graph/*.scan-result.json`
- `raw/code-graph/*.batches.json`
- `raw/code-graph/*.knowledge-graph.json`
- `wiki/wiki/graph-data.json`

## Completion Checks

- Every lesson has complete course sections, not a short draft.
- Every lesson has quiz, mastery, and lab companions.
- Every non-intro lesson has at least two test evidence entries.
- Every claim references existing evidence IDs.
- Weak evidence report does not list already-fixed items as unresolved.
- The static HTML page embeds the latest markdown.
- The llm-wiki graph is regenerated after source or research-pack changes.
- Agent Loop or workflow lessons include one concrete execution trace from tests or local runtime.

