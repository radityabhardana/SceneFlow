import { describe, expect, it } from "vitest";

import { closeDatabase } from "@/db/client";
import {
  createProject,
  getProject,
  listProjects,
  updateProject,
  validateProjectInput,
} from "@/domain/project";
import { ProjectNotFoundError } from "@/domain/project";
import type { ProjectInput } from "@/domain/project";

const projectInput: ProjectInput = {
  title: "  The Last Signal  ",
  premise: "  A radio operator hears a message from tomorrow.  ",
  genre: "  Sci-fi drama  ",
  tone: "  Suspenseful  ",
  aspectRatio: " 16:9 " as ProjectInput["aspectRatio"],
  visualStyle: "  Moody practical lighting  ",
};

describe("project validation", () => {
  const requiredFields: readonly (keyof ProjectInput)[] = [
    "title",
    "premise",
    "genre",
    "tone",
    "aspectRatio",
    "visualStyle",
  ];

  for (const field of requiredFields) {
    it(`rejects an empty ${field}`, async () => {
      const errors = await validateProjectInput({ ...projectInput, [field]: "" } as ProjectInput);

      expect(errors[field]).toBe(`${field} must not be empty.`);
    });

    it(`rejects a whitespace-only ${field}`, async () => {
      const errors = await validateProjectInput({ ...projectInput, [field]: " \t\n " } as ProjectInput);

      expect(errors[field]).toBe(`${field} must not be empty.`);
    });
  }

  it("accepts only the documented aspect-ratio union", async () => {
    const errors = await validateProjectInput({
      ...projectInput,
      aspectRatio: "4:3" as ProjectInput["aspectRatio"],
    });

    expect(errors.aspectRatio).toContain("16:9");
  });
});

describe("project persistence", () => {
  it("raises a typed error when updating a missing project", async () => {
    await expect(updateProject("missing-project", projectInput)).rejects.toBeInstanceOf(ProjectNotFoundError);
  });

  it("creates, reads, lists, updates, and survives a database reopen", async () => {
    const created = await createProject(projectInput);

    expect(created.title).toBe("The Last Signal");
    expect(created.premise).toBe("A radio operator hears a message from tomorrow.");
    expect(created.genre).toBe("Sci-fi drama");
    expect(created.tone).toBe("Suspenseful");
    expect(created.aspectRatio).toBe("16:9");
    expect(created.visualStyle).toBe("Moody practical lighting");
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
