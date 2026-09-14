# AI Drama Studio

AI Drama Studio adalah tool pribadi untuk membantu produksi serial video AI pendek yang tetap konsisten antar-scene dan antar-episode.

Fokus utama sistem bukan sekadar membuat prompt, tetapi mengelola:

- **Story continuity**
- **Character consistency**
- **World state**
- **Episode planning**
- **Scene segmentation**
- **Prompt compilation**
- **Result logging**
- **Plot thread tracking**

Target awal sistem adalah workflow pribadi menggunakan **Gemini melalui browser/manual copy-paste**, tanpa ketergantungan pada Gemini API berbayar.

---

## Core Problem

Generator video AI bekerja baik untuk klip pendek, tetapi sulit menjaga:

- karakter tetap sama,
- benda tetap berada di tempat yang benar,
- emosi dan posisi karakter tetap konsisten,
- cerita antar-klip tetap nyambung,
- misteri atau plot tidak selesai terlalu cepat,
- kejadian lama tetap diingat.

AI Drama Studio bertindak sebagai **showrunner + continuity engine**.

---

## Core Workflow

```text
Create Project
    ↓
Define World Bible
    ↓
Define Characters
    ↓
Plan Season / Episode
    ↓
Generate Scene Blueprint
    ↓
Validate Continuity
    ↓
Compile Gemini Prompt
    ↓
Copy Prompt to Gemini
    ↓
Generate Video
    ↓
Log Actual Result
    ↓
Update Story State
    ↓
Generate Next Scene
```

---

## V1 Scope

V1 hanya perlu:

1. Project management
2. World Bible
3. Character Bible
4. Story Threads
5. Episode Planner
6. Scene Planner
7. Current Story State
8. Continuity Checker
9. Prompt Compiler
10. Result Logger

Trend intelligence dan automasi eksternal masuk setelah fondasi cerita terbukti stabil.

---

## Suggested Stack

- Next.js
- TypeScript
- Tailwind CSS
- SQLite
- Drizzle ORM atau Prisma
- Local filesystem
- Gemini via browser/manual workflow

Tidak diperlukan pada V1:

- authentication,
- payment,
- Supabase,
- Firebase,
- Redis,
- VPS,
- multi-user,
- Gemini API.

---

## Product Principle

> Gemini digunakan sebagai creative reasoning engine.  
> Aplikasi lokal digunakan sebagai source of truth.

Chat history bukan database.

State cerita harus tersimpan secara eksplisit.
