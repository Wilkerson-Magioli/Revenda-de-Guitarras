import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import guitarraRoutes from "./routes/guitarra";
import marcaRoutes from "./routes/marca";
import clienteRoutes from "./routes/cliente";
import propostaRoutes from "./routes/proposta";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import dashboardRoutes from "./routes/dashboard"; // se já criou o dashboard.ts

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// rotas
app.use("/guitarras", guitarraRoutes);
app.use("/marcas", marcaRoutes);
app.use("/clientes", clienteRoutes);
app.use("/propostas", propostaRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/dashboard", dashboardRoutes); // gráficos/contadores

app.get("/", (_req, res) => res.json({ ok: true }));

app.use((_req, res) => res.status(404).json({ error: "Rota não encontrada" }));

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno" });
});

app.listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT}`);
});
