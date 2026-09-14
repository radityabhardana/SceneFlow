# Production Workflow
## AI Drama Studio

## 1. Create Project

User membuat project.

Required:

- title
- premise
- genre
- visual style
- tone
- aspect ratio

---

## 2. Define World Bible

Tambahkan:

- world description,
- visual rules,
- physics / logic rules,
- forbidden changes.

Contoh:

```text
Humans never appear.
All hardware characters retain recognizable component shapes.
```

---

## 3. Define Character Bible

Untuk setiap karakter:

- visual identity,
- personality,
- voice,
- relationships,
- locked traits.

Character lock harus reusable.

---

## 4. Define Season Direction

Minimal tentukan:

- main conflict,
- season objective,
- major reveal,
- important character arcs.

Tidak perlu menulis semua episode dari awal.

---

## 5. Create Episode

Episode perlu:

- objective,
- setup,
- escalation,
- turning point,
- ending,
- cliffhanger.

---

## 6. Split Into Scenes

Scene harus cukup sederhana untuk satu generation.

Scene ideal hanya memiliki:

- satu objective utama,
- satu perubahan penting,
- jumlah karakter terbatas.

Contoh:

```text
Scene 1 — RTX enters room.
Scene 2 — Ryzen confronts RTX.
Scene 3 — Rammy finds key.
Scene 4 — RTX reacts to key.
```

Lebih baik daripada satu scene dengan terlalu banyak aksi.

---

## 7. Validate Starting State

Sebelum prompt dibuat, sistem cek:

- semua karakter punya lokasi,
- object ownership valid,
- character knowledge valid,
- scene tidak melanggar active plot,
- scene tidak membocorkan planned reveal.

---

## 8. Compile Prompt

Prompt harus mengikuti `PROMPT_SPEC.md`.

---

## 9. Generate Outside App

V1 menggunakan Gemini secara manual.

User:

1. klik Copy Prompt,
2. buka Gemini,
3. generate,
4. review hasil.

---

## 10. Log Actual Result

User memilih:

### Matched

Video sesuai.

Expected state langsung diterapkan.

### Partial

Sebagian berbeda.

User edit actual state.

### Failed

Video tidak dipakai.

State tidak berubah.

---

## 11. Apply State

Setelah result disetujui:

```text
expected / edited actual result
        ↓
apply state delta
        ↓
append event
        ↓
update threads
        ↓
next scene
```

---

## 12. Continue

Scene berikutnya menggunakan actual state terbaru.

Tidak menggunakan asumsi dari prompt sebelumnya.

---

# Production Rule

> Never plan Scene N+1 from what Scene N was supposed to do.  
> Plan Scene N+1 from what Scene N actually established.
