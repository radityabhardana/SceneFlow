# Prompt Specification
## Gemini Video Prompt Package

Prompt final harus modular dan konsisten.

---

## 1. Prompt Sections

Urutan default:

```text
PROJECT STYLE
WORLD RULES
CHARACTER LOCKS
LOCATION
STARTING STATE
SCENE OBJECTIVE
ACTION
DIALOGUE
EMOTION
CAMERA
LIGHTING
CONTINUITY CONSTRAINTS
NEGATIVE CONSTRAINTS
ENDING FRAME
```

---

## 2. Project Style

Contoh:

```text
Vertical 9:16 cinematic 3D animated drama.
Stylized but physically coherent environment.
Consistent character proportions.
```

---

## 3. Character Lock

Jangan menulis nama saja.

Gunakan visual identity yang stabil.

Contoh:

```text
RTX:
A black dual-fan graphics card character with two large visible fans,
small expressive animated eyes, small arms and legs,
subtle green glowing accents.
Maintain exactly the same body design and proportions.
```

---

## 4. Starting State

Harus eksplisit.

Contoh:

```text
STARTING STATE

RTX:
- standing in hallway
- visibly nervous
- empty hands

Rammy:
- inside server room
- crouching beside desk
- holding nothing

Red key:
- under the desk
```

---

## 5. Scene Objective

Satu kalimat.

Contoh:

```text
Rammy discovers the red key without RTX seeing him.
```

---

## 6. Action

Gunakan aksi sederhana dan berurutan.

Contoh:

```text
Rammy notices a red object under the desk.
He reaches down and picks up the key.
He looks confused.
```

---

## 7. Dialogue

Dialog singkat.

Hindari dialog panjang yang sulit diselesaikan dalam klip pendek.

---

## 8. Camera

Contoh:

```text
Start with a medium shot.
Slowly move toward Rammy.
Cut to a close-up of the key.
```

---

## 9. Continuity Constraints

Contoh:

```text
- RTX must remain outside the room.
- Ryzen does not appear.
- Broken cable is not visible in this shot.
- Red key starts under the desk.
```

---

## 10. Negative Constraints

Gunakan hanya untuk perubahan yang benar-benar harus dicegah.

Contoh:

```text
Do not change Rammy's body design.
Do not introduce new characters.
Do not add extra objects.
Do not change the location.
```

---

## 11. Ending Frame

Wajib.

Contoh:

```text
ENDING FRAME

Rammy is standing beside the desk,
holding the red key in his left hand,
looking toward the doorway with a confused expression.
```

Ending frame menjadi starting reference untuk scene berikutnya.

---

## 12. Prompt Generation Rule

Prompt compiler hanya mengambil data relevan.

Jangan inject:

- seluruh event history,
- karakter yang tidak muncul,
- plot yang tidak relevan,
- semua lokasi.

Tujuannya menjaga prompt padat dan stabil.
