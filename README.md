# SceneFlow

> **UNDER CONSTRUCTION**
>
> SceneFlow masih dalam pengembangan aktif. Fondasi project dan Story Bible sudah tersedia; fitur perencanaan scene, continuity, dan produksi belum diimplementasikan.

SceneFlow adalah aplikasi lokal single-user untuk mengelola continuity dan persiapan produksi serial video AI pendek. Database SQLite lokal menjadi source of truth untuk cerita, karakter, aturan dunia, relasi, dan lokasi.

## Status saat ini

Tersedia:

- Project dashboard, create, edit, dan persistence lokal
- World rules dengan canon lock
- Character Bible, personality traits, locked traits, dan status roster
- Character relationships dan locations
- AI gateway foundation untuk 9router/OpenAI-compatible gateway melalui `/settings/ai`

Belum tersedia:

- episode atau scene planner
- story state, event ledger, dan continuity checker
- prompt compiler atau video generation
- authentication, cloud services, billing, atau fitur tim

## Teknologi

- Next.js App Router
- TypeScript strict
- Tailwind CSS
- SQLite + Drizzle ORM
- pnpm

## Menjalankan lokal

```powershell
pnpm install
Copy-Item .env.example .env
pnpm dev
```

Aplikasi development berjalan di `http://127.0.0.1:3000` dan data lokal tersimpan di `data/sceneflow.db`.

## AI gateway lokal

SceneFlow menggunakan gateway OpenAI-compatible milik user, bukan endpoint OpenAI atau Gemini langsung. Konfigurasi berada di `.env`:

```env
AI_GATEWAY_BASE_URL=http://localhost:20128/v1
AI_GATEWAY_MODEL=gpt-5.6-luna
AI_GATEWAY_API_KEY=
AI_GATEWAY_TIMEOUT_MS=120000
```

`AI_GATEWAY_MODEL` harus sama persis dengan salah satu ID dari `GET {AI_GATEWAY_BASE_URL}/models`. Jangan commit `.env` atau API key. Gunakan `/settings/ai` untuk memeriksa gateway dan menjalankan test sentinel lokal.

## Perintah

```powershell
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm db:migrate
```

## Prinsip produk

- Local-first dan single-user
- Database adalah source of truth
- Canon yang terkunci tidak berubah secara implisit
- Validasi deterministik didahulukan sebelum AI
- Context AI harus kecil dan relevan

Dokumen produk dan arsitektur lengkap tersedia di `PRD.md`, `ARCHITECTURE.md`, `DATA_MODEL.md`, `WORKFLOW.md`, dan `ROADMAP.md`.
