# AGENTS.md
## AI Drama Studio

Dokumen ini menjadi pedoman untuk AI coding agent yang mengerjakan repository ini.

---

## Product Context

AI Drama Studio adalah aplikasi lokal single-user untuk mengelola produksi serial video AI pendek.

Jangan mengubah produk menjadi SaaS, multi-user platform, atau cloud-first app kecuali ada instruksi eksplisit.

Core value produk:

1. continuity,
2. story state,
3. character consistency,
4. structured scene planning,
5. prompt compilation.

---

## Technical Direction

Default stack:

- Next.js
- TypeScript
- Tailwind CSS
- SQLite
- Drizzle ORM preferred
- Local filesystem when needed

Prefer server-side local persistence where practical.

Avoid unnecessary external infrastructure.

---

## Rules

### 1. Do Not Over-Engineer

Jangan tambahkan:

- authentication,
- billing,
- queues,
- Redis,
- microservices,
- cloud databases,
- websocket infrastructure,
- external AI APIs,

kecuali requirement memang membutuhkannya.

### 2. Database Is Source of Truth

Jangan gunakan:

- browser chat history,
- prompt history,
- temporary UI state,

sebagai sumber kebenaran cerita.

State utama harus tersimpan terstruktur.

### 3. Canon Must Be Protected

Field yang ditandai sebagai locked/canon tidak boleh berubah dari operasi scene biasa.

Perubahan canon harus eksplisit.

### 4. Actual Result Wins

Jika hasil video aktual berbeda dari expected result:

```text
actual result > expected result
```

State berikutnya harus mengikuti hasil aktual yang disetujui user.

### 5. Deterministic Before Generative

Semua validasi yang bisa dilakukan deterministik harus dilakukan tanpa AI.

Contoh:

- ownership conflict,
- impossible location,
- duplicate object holder,
- invalid state transition.

AI hanya digunakan untuk reasoning kreatif yang sulit dibuat deterministic.

### 6. Keep Context Small

Jangan kirim seluruh histori cerita ke prompt.

Gunakan:

- current state,
- recent events,
- active threads,
- relevant character bible,
- relevant world rules.

### 7. No Hidden State

Semua state penting harus dapat dilihat user.

User harus dapat melihat:

- siapa berada di mana,
- siapa memegang apa,
- plot apa yang masih aktif,
- apa yang baru berubah.

---

## Domain Priorities

Urutan prioritas implementasi:

1. project
2. characters
3. world bible
4. story state
5. episode
6. scene
7. event ledger
8. story threads
9. continuity validation
10. prompt compiler
11. result logger

Trend system tidak boleh menghambat domain inti.

---

## Coding Standards

### TypeScript

Gunakan strict typing.

Hindari `any`.

Gunakan domain types yang eksplisit.

Contoh:

```ts
type SceneStatus =
  | "draft"
  | "ready"
  | "generated"
  | "matched"
  | "partial"
  | "failed";
```

### Business Logic

Pisahkan business logic dari UI.

Contoh direktori:

```text
src/
  app/
  components/
  domain/
  lib/
  db/
```

Logic seperti continuity validation tidak boleh ditanam langsung di React component.

### Mutations

Mutation penting harus melalui service/domain function.

Contoh:

```text
applySceneResult()
moveCharacter()
transferObject()
resolveStoryThread()
```

---

## Testing Priorities

Wajib test untuk:

- object ownership,
- character location,
- thread state transition,
- scene result application,
- continuity validation.

UI snapshot test bukan prioritas.

---

## Definition of Done

Feature dianggap selesai jika:

- behavior bekerja,
- type aman,
- data persistent,
- error state ditangani,
- tidak merusak continuity,
- ada test untuk business logic penting.

---

## Agent Behavior

Sebelum membuat perubahan besar:

1. baca PRD,
2. baca ARCHITECTURE.md,
3. baca DATA_MODEL.md,
4. cek apakah perubahan menambah complexity tanpa nilai nyata.

Jika requirement ambigu, pilih implementasi paling sederhana yang masih memenuhi product goal.
