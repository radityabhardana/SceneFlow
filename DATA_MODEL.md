# Data Model
## SceneFlow

Model ini adalah baseline. Nama field dapat berubah saat implementasi, tetapi konsep domain jangan dihilangkan.

---

## Project

```ts
type Project = {
  id: string;
  title: string;
  premise: string;
  genre: string;
  tone: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  visualStyle: string;
  createdAt: Date;
  updatedAt: Date;
};
```

---

## WorldRule

```ts
type WorldRule = {
  id: string;
  projectId: string;
  rule: string;
  locked: boolean;
};
```

---

## Character

```ts
type Character = {
  id: string;
  projectId: string;
  name: string;
  role: string;
  visualDescription: string;
  personality: string[];
  voiceStyle: string;
  lockedTraits: string[];
  status: "active" | "inactive" | "missing" | "removed";
};
```

---

## CharacterRelationship

```ts
type CharacterRelationship = {
  id: string;
  projectId: string;
  fromCharacterId: string;
  toCharacterId: string;
  type: string;
  description: string;
  strength?: number;
};
```

---

## Location

```ts
type Location = {
  id: string;
  projectId: string;
  name: string;
  description: string;
  visualLock?: string;
};
```

---

## StoryThread

```ts
type StoryThreadStatus =
  | "planned"
  | "active"
  | "hidden"
  | "resolved"
  | "abandoned";

type StoryThread = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: StoryThreadStatus;
  introducedEpisodeId?: string;
  plannedRevealEpisodeNumber?: number;
  resolution?: string;
};
```

---

## Episode

```ts
type Episode = {
  id: string;
  projectId: string;
  number: number;
  title: string;
  objective: string;
  beginning: string;
  middle: string;
  ending: string;
  cliffhanger: string;
  targetDurationSeconds: number;
  status: "planned" | "active" | "completed";
};
```

---

## Scene

```ts
type SceneStatus =
  | "draft"
  | "ready"
  | "generated"
  | "matched"
  | "partial"
  | "failed";

type Scene = {
  id: string;
  episodeId: string;
  order: number;
  durationSeconds: number;
  locationId: string;
  objective: string;
  action: string;
  dialogue?: string;
  camera?: string;
  lighting?: string;
  endingFrame: string;
  status: SceneStatus;
};
```

---

## SceneCharacter

```ts
type SceneCharacter = {
  sceneId: string;
  characterId: string;
};
```

---

## CharacterState

```ts
type CharacterState = {
  characterId: string;
  projectId: string;
  locationId?: string;
  emotion?: string;
  pose?: string;
  status: string;
};
```

---

## ObjectEntity

```ts
type ObjectEntity = {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: string;
};
```

---

## ObjectState

```ts
type ObjectState = {
  objectId: string;
  projectId: string;
  locationId?: string;
  holderCharacterId?: string;
  condition?: string;
};
```

Constraint:

```text
Object tidak boleh memiliki locationId dan holderCharacterId
yang konflik secara logika.
```

---

## Event

```ts
type Event = {
  id: string;
  projectId: string;
  episodeId?: string;
  sceneId?: string;
  sequence: number;
  summary: string;
  importance: "minor" | "normal" | "major";
  createdAt: Date;
};
```

---

## KnowledgeState

Digunakan untuk melacak siapa tahu apa.

```ts
type KnowledgeState = {
  id: string;
  projectId: string;
  characterId: string;
  factKey: string;
  learnedAtEventId: string;
};
```

Contoh:

```text
factKey = "psu_is_missing"
```

---

## SceneResult

```ts
type SceneResult = {
  id: string;
  sceneId: string;
  resultType: "matched" | "partial" | "failed";
  notes?: string;
  confirmedAt: Date;
};
```

---

## StateDelta

Scene menyimpan perubahan state yang diharapkan dan aktual.

```ts
type StateDelta = {
  characters?: CharacterStateChange[];
  objects?: ObjectStateChange[];
  knowledge?: KnowledgeChange[];
  threads?: StoryThreadChange[];
};
```

---

## Important Invariant

Current state dibentuk dari state yang sudah dikonfirmasi.

Draft scene tidak boleh dianggap canon.
