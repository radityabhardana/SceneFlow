# Architecture
## SceneFlow

## 1. Architecture Style

Local-first monolithic web application.

```text
Browser
   ↓
Next.js Application
   ↓
Domain Services
   ↓
SQLite
```

Tidak ada kebutuhan microservice pada V1.

---

## 2. Major Modules

```text
src/
├── app/
│   ├── projects/
│   ├── characters/
│   ├── episodes/
│   ├── scenes/
│   └── settings/
│
├── domain/
│   ├── project/
│   ├── character/
│   ├── story/
│   ├── continuity/
│   ├── prompt/
│   └── result/
│
├── db/
│   ├── schema/
│   ├── queries/
│   └── migrations/
│
├── components/
│
└── lib/
```

---

## 3. Domain Boundaries

### Project Domain

Menangani:

- project metadata,
- series settings,
- visual configuration.

### Character Domain

Menangani:

- character bible,
- character locks,
- relationships.

### Story Domain

Menangani:

- season,
- episode,
- scene,
- story thread,
- event ledger.

### State Domain

Menangani:

- current character state,
- object state,
- location state,
- knowledge state.

### Continuity Domain

Menangani:

- validation,
- conflict detection,
- illegal transitions.

### Prompt Domain

Menangani:

- context selection,
- prompt compilation,
- output formatting.

### Result Domain

Menangani:

- expected result,
- actual result,
- state reconciliation.

---

## 4. State Flow

```text
Scene Draft
   ↓
Continuity Validation
   ↓
Ready Scene
   ↓
Prompt Compile
   ↓
External Video Generation
   ↓
Result Logging
   ↓
State Reconciliation
   ↓
Event Append
   ↓
Next Scene
```

---

## 5. Important Design Rule

`Scene` tidak boleh langsung mengubah current world state saat dibuat.

State hanya berubah setelah result scene dikonfirmasi.

Alasannya:

prompt bisa berbeda dengan output aktual.

---

## 6. Expected vs Actual

Setiap scene memiliki:

```text
expected_end_state
actual_end_state
```

Sebelum video selesai:

```text
actual_end_state = null
```

Setelah user konfirmasi:

```text
current_state = actual_end_state
```

Jika matched:

```text
actual_end_state = expected_end_state
```

---

## 7. Prompt Assembly

Prompt tidak disimpan sebagai satu blob permanen saja.

Sistem menyimpan komponennya:

```text
visual style
character locks
location
starting state
action
dialogue
camera
lighting
constraints
ending frame
```

Prompt final dapat direbuild.

---

## 8. Context Selection

Untuk satu scene, gunakan hanya data relevan.

```text
Project visual style
Relevant world rules
Characters in scene
Current location
Objects involved
Recent relevant events
Active relevant story threads
Previous scene ending
```

Jangan inject seluruh database.

---

## 9. Error Philosophy

Error continuity bukan exception teknis.

Contoh:

```text
RTX cannot hold red_key because Rammy currently owns red_key.
```

Ini domain validation result.

Return format:

```ts
type ContinuityIssue = {
  severity: "warning" | "error";
  code: string;
  message: string;
  entityIds: string[];
};
```

---

## 10. Future AI Integration

Jika nanti Gemini API dipakai, API berada di belakang interface.

```ts
interface CreativeEngine {
  generateEpisode(input: EpisodeGenerationInput): Promise<EpisodeDraft>;
  generateScene(input: SceneGenerationInput): Promise<SceneDraft>;
}
```

V1 dapat menggunakan manual export/import.

Dengan begitu arsitektur tidak perlu dibongkar ketika automation ditambahkan.
