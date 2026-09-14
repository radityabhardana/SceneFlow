import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll } from "vitest";

import { closeDatabase } from "@/db/client";

const testDirectory = mkdtempSync(path.join(os.tmpdir(), "sceneflow-project-tests-"));
process.env.SCENEFLOW_DATABASE_PATH = path.join(testDirectory, "test.db");

afterAll(() => {
  closeDatabase();
  rmSync(testDirectory, { recursive: true, force: true });
});
