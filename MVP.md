# MVP Definition

MVP harus memungkinkan satu workflow lengkap:

```text
Create Project
→ Add Characters
→ Create Episode
→ Create Scene
→ Validate Scene
→ Compile Prompt
→ Copy Prompt
→ Mark Result
→ Update State
→ Continue Next Scene
```

MVP tidak dianggap selesai jika hanya bisa menyimpan project dan karakter.

Nilai utama baru muncul ketika:

**hasil satu scene menjadi state scene berikutnya.**

---

## MVP Acceptance Scenario

Project:

```text
PC Kosan
```

Characters:

```text
Ryzen
RTX
Rammy
```

Object:

```text
Red Key
```

Scenario:

1. Red Key berada di bawah meja.
2. Scene 1 membuat Rammy mengambil Red Key.
3. User menandai result sebagai matched.
4. Current state menunjukkan Rammy memegang Red Key.
5. Scene 2 mencoba membuat RTX memegang Red Key.
6. Continuity checker menghasilkan error.
7. User menambahkan scene transfer atau mengubah aksi.
8. Scene berikutnya lolos validasi.

Jika skenario ini bekerja, core MVP dianggap berfungsi.
