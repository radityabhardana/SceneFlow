import { describe, expect, it } from "vitest";

import { closeDatabase } from "@/db/client";
import {
  createProject,
  getProject,
  listProjects,
  updateProject,
  validateProjectInput,
} from "@/domain/project";
import type { ProjectInput } from "@/domain/project";

const projectInput: ProjectInput = {
  title: "  The Last Signal  ",
  premise: "A radio operator hears a message from tomorrow.",
  genre: "Sci-fi drama",
  tone: "Suspenseful",
  aspectRatio: "16:9",
  visualStyle: "Moody practical lighting",
};

describe("project validation", () => {
  it("requires a non-empty title and reports actionable field errors", async () => {
    const errors = await validateProjectInput({ ...projectInput, title: "   " });

    expect(errors).toEqual({ title: "title must not be empty." });
  });

  it("accepts only the documented aspect-ratio union", async () => {
    const errors = await validateProjectInput({
      ...projectInput,
      aspectRatio: "4:3" as ProjectInput["aspectRatio"],
    });

    expect(errors.aspectRatio).toContain("16:9");
  });
});

describe("project persistence", () => {
  it("creates, reads, lists, updates, and survives a database reopen", async () => {
    const created = await createProject(projectInput);

    expect(created.title).toBe("The Last Signal");
    expect(created.id).toBeTypeOf("string");
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(created.updatedAt.getTime()).toBe(created.createdAt.getTime());

    closeDatabase();
    const reopened = await getProject(created.id);
    expect(reopened).toMatchObject({ id: created.id, title: "The Last Signal" });

    const updated = await updateProject(created.id, {
      ...projectInput,
      title: "  The Final Signal ",
      premise: "The message changes the operator's next choice.",
    });

    expect(updated.title).toBe("The Final Signal");
    expect(updated.premise).toBe("The message changes the operator's next choice.");
    expect(updated.createdAt.getTime()).toBe(created.createdAt.getTime());
    expect(updated.updatedAt.getTime()).toBeGreaterThan(created.updatedAt.getTime());

    const projects = await listProjects();
    expect(projects).toHaveLength(1);
    expect(projects[0]?.id).toBe(created.id);
  });
});
