import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";

import { registerPosturalRoutes } from "./routes/postural.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
});

await app.register(multipart, {
  limits: {
    files: 3,
    fileSize: 10 * 1024 * 1024,
  },
});

await registerPosturalRoutes(app);

app.get("/", async () => ({
  mensagem: "Postural Check API Node em preparação",
}));

app.get("/health", async () => ({
  status: "ok",
  runtime: "node",
}));

const port = Number(process.env.PORT ?? 8000);

try {
  await app.listen({ host: "0.0.0.0", port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
