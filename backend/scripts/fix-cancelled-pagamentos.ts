import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and, inArray } from "drizzle-orm";
import * as schema from "../src/db/schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function main() {
  const canceladas = await db
    .select({ id: schema.consultas.id })
    .from(schema.consultas)
    .where(eq(schema.consultas.status, "cancelada"));

  if (canceladas.length === 0) {
    console.log("Nenhuma consulta cancelada encontrada.");
    await pool.end();
    return;
  }

  const ids = canceladas.map((c) => c.id);

  const consultasUpdated = await db
    .update(schema.consultas)
    .set({ statusPagamento: "cancelado" })
    .where(and(eq(schema.consultas.status, "cancelada"), eq(schema.consultas.statusPagamento, "pendente")))
    .returning({ id: schema.consultas.id });

  const pagamentosUpdated = await db
    .update(schema.pagamentos)
    .set({ status: "cancelado" })
    .where(and(inArray(schema.pagamentos.consultaId, ids), eq(schema.pagamentos.status, "pendente")))
    .returning({ id: schema.pagamentos.id });

  console.log(`consultas.statusPagamento corrigidas: ${consultasUpdated.length}`);
  console.log(`pagamentos.status corrigidos: ${pagamentosUpdated.length}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
