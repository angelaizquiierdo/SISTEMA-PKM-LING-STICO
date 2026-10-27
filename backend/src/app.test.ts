import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "./app.js"; // Asegúrate de que la ruta sea correcta según tu estructura de proyecto

describe("GET /", () => {
  it("responde con el mensaje de la API", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("PKM Lingüístico API funcionando");
  });
});