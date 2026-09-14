# Product Requirements Document
## AI Drama Studio

## 1. Product Summary

AI Drama Studio adalah aplikasi lokal untuk membantu seorang creator membuat serial video AI pendek yang konsisten.

Sistem mengelola struktur cerita, karakter, state dunia, objek, plot aktif, dan prompt video sebelum creator menggunakan Gemini untuk menghasilkan video.

Produk tidak menghasilkan video secara langsung pada V1.

---

## 2. Problem Statement

Video AI pendek mudah dibuat satu per satu, tetapi ketika dijadikan serial muncul masalah:

- karakter berubah tampilan,
- posisi karakter berubah,
- objek muncul atau hilang tanpa alasan,
- cerita lupa kejadian sebelumnya,
- lokasi berubah,
- dialog tidak sesuai karakter,
- plot terlalu cepat selesai,
- prompt antar-scene tidak konsisten.

Creator harus mengingat semuanya secara manual.

---

## 3. Product Goal

Membuat proses produksi serial video AI pendek menjadi:

- konsisten,
- terstruktur,
- cepat,
- mudah dilanjutkan,
- tidak bergantung pada ingatan manual creator.

---

## 4. Non-Goals V1

V1 tidak mencakup:

- generate video langsung,
- Gemini API integration,
- TikTok auto-scraping,
- social media posting,
- team collaboration,
- cloud sync,
- payment system,
- public SaaS,
- user authentication.

---

## 5. Target User

### Primary User

Single creator yang:

- membuat video AI pendek,
- menggunakan Gemini,
- ingin membuat serial atau drama episodik,
- ingin menjaga continuity antar-klip.

---

## 6. Core User Journey

### Create Series

User membuat project baru.

User mengisi:

- title,
- premise,
- genre,
- tone,
- visual style,
- aspect ratio,
- world rules.

### Define Characters

User membuat character bible.

Setiap karakter memiliki:

- name,
- role,
- visual description,
- personality,
- voice,
- relationships,
- locked traits.

### Plan Story

User mendefinisikan:

- season goal,
- episode goal,
- active plots,
- mysteries,
- planned reveals.

### Generate Scene

Sistem membaca:

- current state,
- previous scene,
- active characters,
- recent events,
- active plot threads.

Sistem membuat paket prompt yang siap digunakan di Gemini.

### Log Result

Setelah video dibuat, user mencatat hasil aktual.

Jika hasil berbeda dari prompt, current state mengikuti hasil aktual.

---

## 7. Functional Requirements

### FR-01 Project Management

User dapat:

- membuat project,
- melihat daftar project,
- membuka project,
- mengubah metadata project.

### FR-02 World Bible

Sistem menyimpan:

- setting,
- visual style,
- tone,
- world rules,
- forbidden changes.

### FR-03 Character Bible

Setiap karakter wajib memiliki:

- immutable identity fields,
- visual lock,
- personality,
- relationships,
- voice style.

### FR-04 Story Threads

Story thread memiliki:

- title,
- description,
- status,
- type,
- introduced episode,
- planned reveal,
- involved characters.

Status:

- planned,
- active,
- hidden,
- resolved,
- abandoned.

### FR-05 Episode Planner

Episode memiliki:

- title,
- objective,
- beginning,
- middle,
- ending,
- cliffhanger,
- target duration.

### FR-06 Scene Planner

Scene memiliki:

- order,
- duration,
- objective,
- location,
- characters,
- action,
- dialogue,
- start state,
- expected end state.

### FR-07 Continuity Checker

Sistem harus dapat mendeteksi:

- karakter berada di dua tempat,
- objek dipegang dua karakter,
- karakter tahu informasi yang belum pernah diketahui,
- benda muncul tanpa sumber,
- relationship berubah tanpa event,
- status karakter tidak valid,
- scene melanggar world rule.

### FR-08 Prompt Compiler

Prompt final harus mengandung:

1. visual style
2. character locks
3. location
4. starting state
5. action
6. dialogue
7. emotion
8. camera direction
9. lighting
10. continuity constraints
11. negative constraints
12. ending frame

### FR-09 Result Logger

User dapat menandai hasil:

- matched,
- partial,
- failed.

Jika partial, user dapat mengubah resulting state.

### FR-10 Story State Update

Setelah scene selesai:

- state diperbarui,
- event baru dapat dibuat,
- object ownership diperbarui,
- plot thread dapat berubah,
- next scene membaca state terbaru.

---

## 8. Quality Requirements

Sebelum prompt dianggap ready:

- semua karakter valid,
- lokasi valid,
- object state valid,
- timeline valid,
- plot tidak melanggar planned reveal,
- ending frame jelas.

---

## 9. Success Metrics

V1 dianggap berhasil jika:

- creator dapat menghasilkan minimal 10 scene berurutan tanpa kehilangan continuity utama,
- perubahan state tersimpan jelas,
- scene berikutnya dapat dibuat tanpa membaca ulang seluruh episode,
- prompt dapat di-copy ke Gemini dalam satu klik,
- user dapat memperbaiki actual result tanpa merusak timeline.

---

## 10. Future Scope

Setelah V1 stabil:

- Trend Inbox
- Trend Scoring
- Concept Recommendation
- Automatic Structured Gemini Integration
- Video Result Analysis
- Frame Reference Management
- Voice / Subtitle Script Export
- Multi-model support
