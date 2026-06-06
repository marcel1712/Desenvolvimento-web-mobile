import { createMetaSchema, updateMetaSchema } from "../src/schemas/meta.schema";

// These tests validate the schema + router logic contracts without a live DB.
// Full integration tests (7.3) require a running PostgreSQL instance.

describe("metas router contract — Zod schema coverage", () => {
  describe("POST /api/metas — body validation via createMetaSchema", () => {
    it("passes with valid titulo", () => {
      const result = createMetaSchema.safeParse({ titulo: "Correr 5km" });
      expect(result.success).toBe(true);
    });

    it("returns 400-compatible fieldErrors when titulo is missing", () => {
      const result = createMetaSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        const { fieldErrors } = result.error.flatten();
        expect(fieldErrors).toHaveProperty("titulo");
        expect(Array.isArray(fieldErrors.titulo)).toBe(true);
      }
    });
  });

  describe("PATCH /api/metas/:id — body validation via updateMetaSchema", () => {
    it("passes with only concluida: true", () => {
      const result = updateMetaSchema.safeParse({ concluida: true });
      expect(result.success).toBe(true);
    });

    it("passes with empty body (all fields optional)", () => {
      const result = updateMetaSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("rejects non-boolean concluida", () => {
      const result = updateMetaSchema.safeParse({ concluida: "true" });
      expect(result.success).toBe(false);
    });
  });
});

describe("requirePaciente guard logic", () => {
  const requirePaciente = (tipo: string | undefined): boolean => {
    return tipo === "paciente";
  };

  it("allows paciente users", () => {
    expect(requirePaciente("paciente")).toBe(true);
  });

  it("blocks medico users", () => {
    expect(requirePaciente("medico")).toBe(false);
  });

  it("blocks undefined tipo (unauthenticated)", () => {
    expect(requirePaciente(undefined)).toBe(false);
  });
});
