import { createMetaSchema, updateMetaSchema } from "../src/schemas/meta.schema";

describe("createMetaSchema", () => {
  it("accepts a valid body with titulo only", () => {
    const result = createMetaSchema.safeParse({ titulo: "Caminhar 30 min" });
    expect(result.success).toBe(true);
  });

  it("accepts a valid body with titulo and descricao", () => {
    const result = createMetaSchema.safeParse({
      titulo: "Caminhar 30 min",
      descricao: "Todos os dias antes do café",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a body missing titulo and returns fieldErrors", () => {
    const result = createMetaSchema.safeParse({ descricao: "Sem título" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors).toHaveProperty("titulo");
    }
  });

  it("rejects a body with an empty titulo string", () => {
    const result = createMetaSchema.safeParse({ titulo: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      expect(fieldErrors).toHaveProperty("titulo");
    }
  });

  it("strips unknown fields (concluida is not in create schema)", () => {
    const result = createMetaSchema.safeParse({
      titulo: "Meta válida",
      concluida: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as Record<string, unknown>).concluida).toBeUndefined();
    }
  });
});

describe("updateMetaSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    const result = updateMetaSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a body with only titulo", () => {
    const result = updateMetaSchema.safeParse({ titulo: "Nova meta" });
    expect(result.success).toBe(true);
  });

  it("accepts a boolean concluida", () => {
    const result = updateMetaSchema.safeParse({ concluida: true });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.concluida).toBe(true);
    }
  });

  it("accepts a body with all fields", () => {
    const result = updateMetaSchema.safeParse({
      titulo: "Meta atualizada",
      descricao: "Descrição nova",
      concluida: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-boolean concluida", () => {
    const result = updateMetaSchema.safeParse({ concluida: "yes" });
    expect(result.success).toBe(false);
  });
});
