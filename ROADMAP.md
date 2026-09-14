# Roadmap
## SceneFlow

## Phase 0 — Documentation

Deliverables:

- PRD
- architecture
- data model
- workflow
- prompt spec
- coding agent instructions

Status: initial.

---

## Phase 1 — Core Project Setup

Build:

- Next.js project
- Tailwind
- SQLite
- Drizzle
- base layout
- project list

Done when:

- app starts locally,
- project can be created,
- project persists after restart.

---

## Phase 2 — Story Bible

Build:

- project settings,
- world rules,
- character management,
- location management,
- relationship management.

Done when:

- user can define full reusable world and character bible.

---

## Phase 3 — Story State

Build:

- character current location,
- emotion/state,
- object registry,
- object holder/location,
- event ledger.

Done when:

- app can answer:
  - where each character is,
  - what each character holds,
  - what happened recently.

---

## Phase 4 — Episode and Scene Planning

Build:

- episodes,
- scene ordering,
- scene duration,
- scene objective,
- expected end state.

Done when:

- episode can be broken into structured scenes.

---

## Phase 5 — Continuity Engine

First validations:

1. character location conflict
2. object ownership conflict
3. missing object origin
4. invalid knowledge
5. planned reveal violation
6. locked trait violation

Done when:

- invalid scene cannot become READY.

---

## Phase 6 — Prompt Compiler

Build:

- structured context selector,
- reusable character locks,
- ending frame generation,
- copy prompt action.

Done when:

- one button produces a clean prompt package.

---

## Phase 7 — Result Logger

Build:

- matched,
- partial,
- failed,
- actual result editor,
- apply state delta.

Done when:

- actual output can safely update canon state.

---

## Phase 8 — Production UX

Build:

```text
CONTINUE STORY
      ↓
NEXT SCENE
      ↓
VALIDATE
      ↓
COPY PROMPT
      ↓
LOG RESULT
```

Goal:

reduce repetitive manual work.

---

## Phase 9 — Trend Inbox

Only after core production is usable.

Build:

- save trend reference,
- notes,
- trend category,
- manual scoring,
- concept suggestion storage.

Avoid scraping at first.

---

## Phase 10 — Future Automation

Possible later:

- Gemini API adapter,
- structured AI output,
- automatic trend research,
- video result analysis,
- image/reference management,
- export subtitle,
- export voice script.

Do not start this phase before V1 production loop is reliable.
